import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/checklists/[eventId] — upsert checklist + items for an event
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id;
  const body = await req.json();
  const { type, items } = body as {
    type: "WAREHOUSE" | "DRIVER";
    items: { id: string; text: string; quantity: string | null; checked: boolean; sortOrder: number }[];
  };

  // Find or create checklist
  let checklist = await prisma.checklist.findFirst({ where: { eventId, type } });

  if (!checklist) {
    checklist = await prisma.checklist.create({ data: { eventId, type } });
  }

  // Delete existing items and recreate (simple approach for checklist sync)
  await prisma.checklistItem.deleteMany({ where: { checklistId: checklist.id } });

  if (items.length > 0) {
    await prisma.checklistItem.createMany({
      data: items.map((item, idx) => ({
        checklistId: checklist!.id,
        text: item.text,
        quantity: item.quantity ?? null,
        checked: item.checked,
        sortOrder: item.sortOrder ?? idx,
      })),
    });
  }

  const updated = await prisma.checklist.findUnique({
    where: { id: checklist.id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json(updated);
}
