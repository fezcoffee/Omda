"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface LineItem {
  description: string;
  quantity: number;
  unitAmount: number;
}

interface Props {
  eventId: string;
  stepNumber: number;
  stepStatus: string;
  completedAt?: string | null;
  event: {
    title: string;
    serviceType: string | null;
    packageInfo: string | null;
    client: { name: string; email: string };
  };
  onComplete: () => void;
  onUpdate: () => void;
}

export default function InvoicePanel({ eventId, stepNumber, stepStatus, event, onComplete }: Props) {
  const isComplete = stepStatus === "COMPLETE";

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      description: `${event.serviceType ?? "Coffee Catering"} — ${event.title}`,
      quantity: 1,
      unitAmount: 0,
    },
  ]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [reference, setReference] = useState(event.title);
  const [xeroConnected] = useState(!!process.env.NEXT_PUBLIC_XERO_CONFIGURED);
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [xeroUrl, setXeroUrl] = useState<string | null>(null);

  const total = lineItems.reduce((sum, li) => sum + li.quantity * li.unitAmount, 0);

  function addLine() {
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unitAmount: 0 }]);
  }

  function updateLine(i: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) => prev.map((li, idx) => (idx === i ? { ...li, [field]: value } : li)));
  }

  function removeLine(i: number) {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createXeroInvoice() {
    setCreating(true);
    try {
      const res = await fetch("/api/xero/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          contactName: event.client.name,
          contactEmail: event.client.email,
          lineItems,
          dueDate,
          reference,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create invoice");
      }
      const data = await res.json();
      setXeroUrl(data.url);
      toast.success("Invoice created in Xero!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Xero invoice failed");
    } finally {
      setCreating(false);
    }
  }

  async function complete() {
    setCompleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/steps/${stepNumber}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xeroUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Invoice marked as sent! Review step now unlocked.");
      onComplete();
    } catch {
      toast.error("Could not complete step");
    } finally {
      setCompleting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🧾</div>
        <p className="text-emerald-800 font-semibold">Invoice Sent</p>
        <p className="text-emerald-600 text-sm mt-1">The client has been invoiced.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-espresso-600">
        Generate the invoice in Xero and mark it as sent. The review request step will unlock after.
      </p>

      {/* Line items */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-espresso-800">Invoice Line Items</h3>
        <div className="space-y-3">
          {lineItems.map((li, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                value={li.description}
                onChange={(e) => updateLine(i, "description", e.target.value)}
                placeholder="Description"
                className="input flex-1"
              />
              <input
                type="number"
                value={li.quantity}
                onChange={(e) => updateLine(i, "quantity", parseFloat(e.target.value))}
                placeholder="Qty"
                className="input w-16"
                min={1}
              />
              <input
                type="number"
                value={li.unitAmount}
                onChange={(e) => updateLine(i, "unitAmount", parseFloat(e.target.value))}
                placeholder="£ Amount"
                className="input w-24"
                step={0.01}
              />
              <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 px-2 py-2.5 text-sm">
                ✕
              </button>
            </div>
          ))}
        </div>
        <button onClick={addLine} className="btn-secondary text-xs">+ Add Line</button>
        <div className="border-t border-espresso-100 pt-3 flex justify-end">
          <p className="text-sm font-semibold text-espresso-800">
            Total: £{total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Invoice details */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-espresso-800">Invoice Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Reference</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Client</label>
            <input value={event.client.name} readOnly className="input bg-espresso-50" />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={event.client.email} readOnly className="input bg-espresso-50" />
          </div>
        </div>
      </div>

      {/* Xero */}
      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-espresso-800">Xero Integration</h3>
        {xeroUrl ? (
          <div className="flex items-center gap-3">
            <span className="text-emerald-600 text-sm">✓ Invoice created in Xero</span>
            <a href={xeroUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">
              Open in Xero
            </a>
          </div>
        ) : (
          <button onClick={createXeroInvoice} disabled={creating} className="btn-secondary">
            {creating ? "Creating…" : "Create Invoice in Xero"}
          </button>
        )}
        <p className="text-xs text-espresso-400">
          Requires Xero OAuth connection — configure in Settings.
        </p>
      </div>

      <button onClick={complete} disabled={completing} className="btn-primary">
        {completing ? "Saving…" : "✓ Mark Invoice Sent →"}
      </button>
    </div>
  );
}
