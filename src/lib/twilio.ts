import twilio from "twilio";

let client: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio credentials not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env");
  }
  if (!client) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
}

export async function sendWhatsApp(to: string, body: string): Promise<string> {
  const twilioClient = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";

  const formatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const message = await twilioClient.messages.create({
    from,
    to: formatted,
    body,
  });

  return message.sid;
}

export async function sendSMS(to: string, body: string): Promise<string> {
  const twilioClient = getTwilioClient();
  const from = process.env.TWILIO_SMS_FROM;
  if (!from) throw new Error("TWILIO_SMS_FROM not configured");

  const message = await twilioClient.messages.create({ from, to, body });
  return message.sid;
}

export function formatChecklistMessage(
  title: string,
  items: { text: string; quantity?: string | null }[],
  eventDetails: { venue?: string | null; date?: Date | null; client: string }
): string {
  const dateStr = eventDetails.date
    ? eventDetails.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "TBC";

  const itemLines = items
    .map((item, i) => `${i + 1}. ${item.text}${item.quantity ? ` (${item.quantity})` : ""}`)
    .join("\n");

  return `☕ *${title}*\n\n📅 Date: ${dateStr}\n📍 Venue: ${eventDetails.venue ?? "TBC"}\n👤 Client: ${eventDetails.client}\n\n*Checklist:*\n${itemLines}\n\n_Sent by Omda Coffee_`;
}

export function formatReviewMessage(clientName: string, reviewLink?: string): string {
  return `Hi ${clientName}! 🌟\n\nThank you so much for having us at your event — it was a pleasure serving you!\n\nWe'd love to hear your feedback. Would you mind leaving us a quick review?\n${reviewLink ?? "https://g.page/r/your-review-link"}\n\nThanks again 😊\n_The Omda Coffee Team_`;
}
