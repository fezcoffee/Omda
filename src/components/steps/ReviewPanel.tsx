"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  eventId: string;
  stepNumber: number;
  stepStatus: string;
  completedAt?: string | null;
  event: {
    client: { name: string; phone: string | null; email: string };
  };
  onComplete: () => void;
}

export default function ReviewPanel({ eventId, stepNumber, stepStatus, event, onComplete }: Props) {
  const isComplete = stepStatus === "COMPLETE";
  const [phone, setPhone] = useState(event.client.phone ?? "");
  const [via, setVia] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [reviewLink, setReviewLink] = useState("");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendReview() {
    if (!phone.trim()) { toast.error("Enter a phone number"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          type: via,
          recipient: phone,
          messageType: "REVIEW",
          clientName: event.client.name,
          reviewLink: reviewLink || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast.success(`Review request sent via ${via === "WHATSAPP" ? "WhatsApp" : "SMS"}!`);
      setSent(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  async function complete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/steps/${stepNumber}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("🎉 Event fully complete! Great work.");
      onComplete();
    } catch {
      toast.error("Could not complete step");
    } finally {
      setCompleting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-3">
        <div className="text-5xl">🎉</div>
        <p className="text-emerald-800 font-bold text-lg">Event Complete!</p>
        <p className="text-emerald-600 text-sm">Review requested. The full lifecycle is done.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-espresso-600">
        Send a review request to the client via WhatsApp or SMS. This is the final step — marking it complete will close the event.
      </p>

      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-espresso-800">Send Review Request</h3>

        {sent && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            ✓ Review request sent to {phone}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+447700900000" />
          </div>
          <div>
            <label className="label">Send via</label>
            <select value={via} onChange={(e) => setVia(e.target.value as "WHATSAPP" | "SMS")} className="input">
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Review Link (optional)</label>
            <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} className="input" placeholder="https://g.page/r/your-google-review-link" />
          </div>
        </div>

        <div className="bg-espresso-50 rounded-lg p-4 text-sm text-espresso-600 font-mono text-xs leading-relaxed">
          Hi {event.client.name}! 🌟{"\n\n"}
          Thank you for having us at your event — it was a pleasure!{"\n\n"}
          We'd love to hear your feedback:{"\n"}
          {reviewLink || "https://g.page/r/your-review-link"}{"\n\n"}
          Thanks 😊 — The Omda Coffee Team
        </div>

        <button onClick={sendReview} disabled={sending} className="btn-secondary">
          {sending ? "Sending…" : `Send via ${via === "WHATSAPP" ? "WhatsApp" : "SMS"}`}
        </button>
      </div>

      <button onClick={complete} disabled={completing} className="btn-primary">
        {completing ? "Closing…" : "⭐ Mark Review Requested & Close Event"}
      </button>
    </div>
  );
}
