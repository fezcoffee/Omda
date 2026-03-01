import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      steps: { orderBy: { stepNumber: "asc" } },
      checklists: { include: { items: { orderBy: { sortOrder: "asc" } } } },
      documents: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { sentAt: "desc" }, take: 20 },
    },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

// PATCH /api/events/[id] — update event + client details
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { client: clientData, ...eventData } = body;

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { clientId: true },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Update client if provided
  if (clientData) {
    await prisma.client.update({
      where: { id: event.clientId },
      data: {
        name: clientData.name,
        company: clientData.company ?? null,
        email: clientData.email,
        phone: clientData.phone ?? null,
        address: clientData.address ?? null,
      },
    });
  }

  // Update event
  const updated = await prisma.event.update({
    where: { id: params.id },
    data: {
      title: eventData.title,
      eventDate: eventData.eventDate ? new Date(eventData.eventDate) : null,
      venue: eventData.venue ?? null,
      guestCount: eventData.guestCount ?? null,
      serviceType: eventData.serviceType ?? null,
      packageInfo: eventData.packageInfo ?? null,
      notes: eventData.notes ?? null,
      status: eventData.status ?? undefined,
    },
    include: {
      client: true,
      steps: { orderBy: { stepNumber: "asc" } },
      checklists: { include: { items: { orderBy: { sortOrder: "asc" } } } },
      documents: true,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/events/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
