import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp, sendSMS, formatChecklistMessage, formatReviewMessage } from "@/lib/twilio";

// POST /api/messages — send WhatsApp or SMS
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    eventId,
    type,              // WHATSAPP | SMS
    recipient,
    checklistType,     // WAREHOUSE | DRIVER (if sending checklist)
    messageType,       // REVIEW (if sending review)
    clientName,
    reviewLink,
  } = body;

  try {
    let messageBody = "";

    if (messageType === "REVIEW") {
      // Review request message
      messageBody = formatReviewMessage(clientName ?? "there", reviewLink);
    } else if (checklistType) {
      // Checklist message
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          client: true,
          checklists: {
            where: { type: checklistType },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      });
      if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

      const checklist = event.checklists[0];
      if (!checklist) return NextResponse.json({ error: "No checklist found" }, { status: 404 });

      const title = checklistType === "WAREHOUSE" ? "Warehouse Pack List" : "Driver Checklist";
      messageBody = formatChecklistMessage(title, checklist.items, {
        venue: event.venue,
        date: event.eventDate,
        client: event.client.name,
      });

      // Mark checklist as sent
      await prisma.checklist.update({
        where: { id: checklist.id },
        data: { sentAt: new Date(), sentTo: recipient, sentVia: type },
      });
    } else {
      return NextResponse.json({ error: "Invalid message type" }, { status: 400 });
    }

    // Send via Twilio
    let twilioSid: string | null = null;
    if (type === "WHATSAPP") {
      twilioSid = await sendWhatsApp(recipient, messageBody);
    } else {
      twilioSid = await sendSMS(recipient, messageBody);
    }

    // Log the message
    await prisma.message.create({
      data: {
        eventId: eventId ?? null,
        type,
        recipient,
        body: messageBody,
        status: "SENT",
        twilioSid,
      },
    });

    return NextResponse.json({ ok: true, twilioSid });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Message send error:", message);

    // Still log the failed attempt
    await prisma.message.create({
      data: {
        eventId: eventId ?? null,
        type: type ?? "WHATSAPP",
        recipient: recipient ?? "",
        body: "",
        status: "FAILED",
      },
    }).catch(() => {});

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
