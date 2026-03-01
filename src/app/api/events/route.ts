import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WORKFLOW_STEPS } from "@/lib/workflow";

// GET /api/events — list all events
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;

  const events = await prisma.event.findMany({
    where: status ? { status } : undefined,
    orderBy: { eventDate: "asc" },
    include: {
      client: true,
      steps: { select: { stepNumber: true, status: true } },
      _count: { select: { steps: true } },
    },
  });

  return NextResponse.json(events);
}

// POST /api/events — create new event with all 10 steps
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { client: clientData, ...eventData } = body;

  // Upsert or create client
  let client = await prisma.client.findFirst({ where: { email: clientData.email } });
  if (!client) {
    client = await prisma.client.create({ data: clientData });
  } else {
    client = await prisma.client.update({ where: { id: client.id }, data: clientData });
  }

  // Create event with all 10 steps (step 1 starts ACTIVE, rest LOCKED)
  const event = await prisma.event.create({
    data: {
      title: eventData.title ?? "New Event",
      clientId: client.id,
      eventDate: eventData.eventDate ? new Date(eventData.eventDate) : null,
      venue: eventData.venue ?? null,
      guestCount: eventData.guestCount ?? null,
      serviceType: eventData.serviceType ?? null,
      packageInfo: eventData.packageInfo ?? null,
      notes: eventData.notes ?? null,
      currentStep: 1,
      steps: {
        create: WORKFLOW_STEPS.map((step) => ({
          stepNumber: step.number,
          stepType: step.type,
          status: step.number === 1 ? "ACTIVE" : "LOCKED",
        })),
      },
    },
    include: {
      client: true,
      steps: true,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
