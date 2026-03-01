"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/utils";

interface Document {
  id: string;
  type: string;
  fileName: string;
  sentAt: string | null;
  sentTo: string | null;
}

interface Props {
  eventId: string;
  stepNumber: number;
  docType: "CONTRACT" | "CONCIERGE_BRIEF" | "EVENT_BRIEF";
  title: string;
  description: string;
  stepStatus: string;
  completionLabel: string;
  documents: Document[];
  onComplete: () => void;
  onUpdate: () => void;
}

export default function DocumentPanel({
  eventId,
  stepNumber,
  docType,
  title,
  description,
  stepStatus,
  completionLabel,
  documents,
  onComplete,
  onUpdate,
}: Props) {
  const isComplete = stepStatus === "COMPLETE";
  const doc = documents.find((d) => d.type === docType);
  const fileRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [sentTo, setSentTo] = useState(doc?.sentTo ?? "");
  const [notes, setNotes] = useState("");

  async function uploadDocument(file: File, isTemplate = false) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", eventId);
      formData.append("type", docType);
      if (isTemplate) formData.append("isTemplate", "true");

      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      toast.success(isTemplate ? "Template saved" : "Document uploaded");
      onUpdate();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function generateFromTemplate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, type: docType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }
      toast.success("Document generated from template!");
      onUpdate();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function complete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/steps/${stepNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentTo, notes }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Step complete! Next step is now unlocked.`);
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
          ✓ {title} completed{doc?.sentAt ? ` · Sent ${formatDateTime(doc.sentAt)}` : ""}
          {doc?.sentTo ? ` to ${doc.sentTo}` : ""}
        </div>
      )}

      {/* Document management */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-espresso-800">Document</h3>

        {doc ? (
          <div className="flex items-center gap-3 p-3 bg-espresso-50 rounded-lg">
            <span className="text-2xl">📄</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-espresso-800 truncate">{doc.fileName}</p>
              {doc.sentAt && (
                <p className="text-xs text-espresso-500">Sent {formatDateTime(doc.sentAt)}</p>
              )}
            </div>
            <a
              href={`/api/documents/${doc.id}/download`}
              download
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Download
            </a>
          </div>
        ) : (
          <p className="text-sm text-espresso-400 italic">No document yet</p>
        )}

        {!isComplete && (
          <div className="flex flex-wrap gap-3">
            {/* Upload a pre-made document */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".docx,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocument(file, false);
                }}
              />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary">
                {uploading ? "Uploading…" : "Upload .docx / PDF"}
              </button>
            </div>

            {/* Upload a template */}
            <div>
              <input
                ref={templateRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocument(file, true);
                }}
              />
              <button onClick={() => templateRef.current?.click()} disabled={uploading} className="btn-secondary">
                Upload Template (.docx)
              </button>
            </div>

            {/* Generate from template */}
            <button onClick={generateFromTemplate} disabled={generating} className="btn-secondary">
              {generating ? "Generating…" : "Generate from Template"}
            </button>
          </div>
        )}

        {!isComplete && (
          <p className="text-xs text-espresso-400">
            Template tip: Use {"{{client_name}}"}, {"{{event_date}}"}, {"{{venue}}"}, {"{{guest_count}}"}, {"{{service_type}}"} etc. as placeholders in your Word doc.
          </p>
        )}
      </div>

      {/* Mark sent */}
      {!isComplete && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-espresso-800">Mark as Sent</h3>
          <div>
            <label className="label">Sent to (email or name)</label>
            <input value={sentTo} onChange={(e) => setSentTo(e.target.value)} className="input" placeholder="jane@acme.com" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input" placeholder="Any notes about this step..." />
          </div>
          <button onClick={complete} disabled={completing} className="btn-primary">
            {completing ? "Saving…" : `✓ ${completionLabel}`}
          </button>
        </div>
      )}
    </div>
  );
}
