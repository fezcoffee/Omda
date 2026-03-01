"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/utils";

interface Props {
  eventId: string;
  stepNumber: number;
  title: string;
  description: string;
  stepStatus: string;
  completedAt?: string | null;
  completionLabel: string;
  onComplete: () => void;
  extraFields?: React.ReactNode;
  extraData?: Record<string, string>;
}

export default function SimpleConfirmPanel({
  eventId,
  stepNumber,
  title,
  description,
  stepStatus,
  completedAt,
  completionLabel,
  onComplete,
  extraFields,
  extraData,
}: Props) {
  const isComplete = stepStatus === "COMPLETE";
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  async function complete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/steps/${stepNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, ...extraData }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Step complete! Next step is now unlocked.");
      onComplete();
    } catch {
      toast.error("Could not complete step");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-espresso-600">{description}</p>

      {isComplete ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-emerald-800 font-semibold">{title} Complete</p>
          {completedAt && (
            <p className="text-emerald-600 text-sm mt-1">{formatDateTime(completedAt)}</p>
          )}
        </div>
      ) : (
        <div className="card p-5 space-y-4">
          {extraFields}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input"
              placeholder="Any notes to log..."
            />
          </div>
          <button onClick={complete} disabled={completing} className="btn-primary">
            {completing ? "Saving…" : `✓ ${completionLabel}`}
          </button>
        </div>
      )}
    </div>
  );
}
