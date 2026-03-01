"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface EventData {
  title: string;
  eventDate: string | null;
  venue: string | null;
  guestCount: number | null;
  serviceType: string | null;
  packageInfo: string | null;
  notes: string | null;
  client: {
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  };
}

interface Props {
  eventId: string;
  event: EventData;
  stepStatus: string;
  onComplete: () => void;
  onUpdate: () => void;
}

export default function SaleAgreedPanel({ eventId, event, stepStatus, onComplete, onUpdate }: Props) {
  const isComplete = stepStatus === "COMPLETE";

  const [form, setForm] = useState({
    title: event.title ?? "",
    eventDate: event.eventDate ? event.eventDate.split("T")[0] : "",
    venue: event.venue ?? "",
    guestCount: event.guestCount?.toString() ?? "",
    serviceType: event.serviceType ?? "",
    packageInfo: event.packageInfo ?? "",
    notes: event.notes ?? "",
    clientName: event.client.name ?? "",
    clientCompany: event.client.company ?? "",
    clientEmail: event.client.email ?? "",
    clientPhone: event.client.phone ?? "",
    clientAddress: event.client.address ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveDetails() {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          eventDate: form.eventDate || null,
          venue: form.venue || null,
          guestCount: form.guestCount ? parseInt(form.guestCount) : null,
          serviceType: form.serviceType || null,
          packageInfo: form.packageInfo || null,
          notes: form.notes || null,
          client: {
            name: form.clientName,
            company: form.clientCompany || null,
            email: form.clientEmail,
            phone: form.clientPhone || null,
            address: form.clientAddress || null,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Details saved");
      onUpdate();
    } catch {
      toast.error("Could not save details");
    } finally {
      setSaving(false);
    }
  }

  async function complete() {
    await saveDetails();
    setCompleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/steps/1/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Sale marked as agreed! Contract step is now unlocked.");
      onComplete();
    } catch {
      toast.error("Could not complete step");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {isComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700">
          ✓ Sale confirmed — all event details are locked in.
        </div>
      )}

      {/* Client details */}
      <section>
        <h3 className="text-sm font-semibold text-espresso-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-espresso-100 rounded-full flex items-center justify-center text-xs">👤</span>
          Client Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Client Name *</label>
            <input value={form.clientName} onChange={(e) => handleChange("clientName", e.target.value)} className="input" placeholder="Jane Smith" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Company</label>
            <input value={form.clientCompany} onChange={(e) => handleChange("clientCompany", e.target.value)} className="input" placeholder="Acme Ltd" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" value={form.clientEmail} onChange={(e) => handleChange("clientEmail", e.target.value)} className="input" placeholder="jane@acme.com" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input value={form.clientPhone} onChange={(e) => handleChange("clientPhone", e.target.value)} className="input" placeholder="+44..." disabled={isComplete} />
          </div>
          <div className="col-span-2">
            <label className="label">Address</label>
            <input value={form.clientAddress} onChange={(e) => handleChange("clientAddress", e.target.value)} className="input" placeholder="123 High Street, London" disabled={isComplete} />
          </div>
        </div>
      </section>

      {/* Event details */}
      <section>
        <h3 className="text-sm font-semibold text-espresso-800 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-espresso-100 rounded-full flex items-center justify-center text-xs">📅</span>
          Event Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Event Title *</label>
            <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} className="input" placeholder="Acme Ltd Summer Party" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Event Date</label>
            <input type="date" value={form.eventDate} onChange={(e) => handleChange("eventDate", e.target.value)} className="input" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Guest Count</label>
            <input type="number" value={form.guestCount} onChange={(e) => handleChange("guestCount", e.target.value)} className="input" placeholder="150" disabled={isComplete} />
          </div>
          <div className="col-span-2">
            <label className="label">Venue</label>
            <input value={form.venue} onChange={(e) => handleChange("venue", e.target.value)} className="input" placeholder="The Brewery, Chiswell Street, London" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Service Type</label>
            <input value={form.serviceType} onChange={(e) => handleChange("serviceType", e.target.value)} className="input" placeholder="Espresso bar + cold brew station" disabled={isComplete} />
          </div>
          <div>
            <label className="label">Package</label>
            <input value={form.packageInfo} onChange={(e) => handleChange("packageInfo", e.target.value)} className="input" placeholder="Premium Package" disabled={isComplete} />
          </div>
          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} className="input" placeholder="Any additional notes about the sale..." disabled={isComplete} />
          </div>
        </div>
      </section>

      {!isComplete && (
        <div className="flex gap-3 pt-2">
          <button onClick={saveDetails} disabled={saving} className="btn-secondary">
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={complete}
            disabled={completing || !form.clientName || !form.clientEmail || !form.title}
            className="btn-primary"
          >
            {completing ? "Confirming…" : "🤝 Confirm Sale Agreed →"}
          </button>
        </div>
      )}
    </div>
  );
}
