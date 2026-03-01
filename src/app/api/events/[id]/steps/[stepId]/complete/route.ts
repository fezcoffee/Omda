import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/events/[id]/steps/[stepId]/complete
// Marks a step as COMPLETE and unlocks the next one.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  const eventId = params.id;
  const stepNumber = parseInt(params.stepId, 10);

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 10) {
    return NextResponse.json({ error: "Invalid step number" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  // Find the current step
  const step = await prisma.eventStep.findUnique({
    where: { eventId_stepNumber: { eventId, stepNumber } },
  });

  if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });
  if (step.status === "COMPLETE") return NextResponse.json({ error: "Already complete" }, { status: 400 });
  if (step.status === "LOCKED") return NextResponse.json({ error: "Step is locked" }, { status: 400 });

  // Mark current step complete and unlock next
  await prisma.$transaction(async (tx) => {
    await tx.eventStep.update({
      where: { eventId_stepNumber: { eventId, stepNumber } },
      data: {
        status: "COMPLETE",
        completedAt: new Date(),
        notes: body.notes ?? null,
        metadata: body ? JSON.stringify(body) : null,
      },
    });

    // Unlock next step if it exists
    if (stepNumber < 10) {
      await tx.eventStep.update({
        where: { eventId_stepNumber: { eventId, stepNumber: stepNumber + 1 } },
        data: { status: "ACTIVE" },
      });
    }

    // Update event's currentStep and status
    const isLastStep = stepNumber === 10;
    await tx.event.update({
      where: { id: eventId },
      data: {
        currentStep: isLastStep ? 10 : stepNumber + 1,
        status: isLastStep ? "COMPLETED" : "ACTIVE",
      },
    });
  });

  // Return updated event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      client: true,
      steps: { orderBy: { stepNumber: "asc" } },
      checklists: { include: { items: { orderBy: { sortOrder: "asc" } } } },
      documents: true,
      messages: { orderBy: { sentAt: "desc" }, take: 20 },
    },
  });

  return NextResponse.json(event);
}
