"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import ChecklistEditor from "@/components/ChecklistEditor";
import { formatDateTime } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  text: string;
  quantity: string | null;
  checked: boolean;
  sortOrder: number;
}

interface Checklist {
  id: string;
  type: string;
  sentAt: string | null;
  sentTo: string | null;
  sentVia: string | null;
  items: ChecklistItem[];
}

interface Props {
  eventId: string;
  stepNumber: number;
  type: "WAREHOUSE" | "DRIVER";
  title: string;
  description: string;
  stepStatus: string;
  completionLabel: string;
  checklist: Checklist | null;
  eventDetails: { venue?: string | null; date?: string | null; clientName: string };
  onComplete: () => void;
  onUpdate: () => void;
}

export default function ChecklistStepPanel({
  eventId,
  stepNumber,
  type,
  title,
  description,
  stepStatus,
  completionLabel,
  checklist,
  eventDetails,
  onComplete,
  onUpdate,
}: Props) {
  const isComplete = stepStatus === "COMPLETE";
  const [completing, setCompleting] = useState(false);

  async function complete() {
    if (!checklist?.sentAt) {
      toast.error("Please send the checklist first before marking this step complete");
      return;
    }
    setCompleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/steps/${stepNumber}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${title} complete! Next step unlocked.`);
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

      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          ✓ {title} complete
          {checklist?.sentAt ? ` · Sent ${formatDateTime(checklist.sentAt)}` : ""}
          {checklist?.sentTo ? ` to ${checklist.sentTo}` : ""}
        </div>
      )}

      <ChecklistEditor
        checklist={checklist}
        eventId={eventId}
        type={type}
        eventDetails={eventDetails}
        onUpdate={onUpdate}
      />

      {!isComplete && (
        <div className="border-t border-espresso-100 pt-5">
          <button onClick={complete} disabled={completing} className="btn-primary">
            {completing ? "Saving…" : `✓ ${completionLabel}`}
          </button>
          {!checklist?.sentAt && (
            <p className="text-xs text-espresso-400 mt-2">
              Send the checklist via WhatsApp or SMS above before marking complete.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
