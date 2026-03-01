"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    eventDate: "",
    venue: "",
    guestCount: "",
    serviceType: "",
    packageInfo: "",
    notes: "",
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
  });
  const [creating, setCreating] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function createEvent() {
    if (!form.clientName || !form.clientEmail || !form.title) {
      toast.error("Please fill in client name, email, and event title");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
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
      if (!res.ok) throw new Error("Failed to create event");
      const event = await res.json();
      toast.success("Event created! Starting with Step 1.");
      router.push(`/events/${event.id}`);
    } catch {
      toast.error("Could not create event");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-espresso-900">New Event</h1>
        <p className="text-espresso-500 text-sm mt-0.5">
          Fill in what you know — you can always update details later.
        </p>
      </div>

      <div className="space-y-8">
        {/* Client */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-espresso-800 flex items-center gap-2">
            <span>👤</span> Client Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input value={form.clientName} onChange={(e) => handleChange("clientName", e.target.value)} className="input" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="label">Company</label>
              <input value={form.clientCompany} onChange={(e) => handleChange("clientCompany", e.target.value)} className="input" placeholder="Acme Ltd" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" value={form.clientEmail} onChange={(e) => handleChange("clientEmail", e.target.value)} className="input" placeholder="jane@acme.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.clientPhone} onChange={(e) => handleChange("clientPhone", e.target.value)} className="input" placeholder="+44..." />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input value={form.clientAddress} onChange={(e) => handleChange("clientAddress", e.target.value)} className="input" placeholder="123 High Street, London" />
            </div>
          </div>
        </section>

        {/* Event */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-espresso-800 flex items-center gap-2">
            <span>☕</span> Event Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Event Title *</label>
              <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} className="input" placeholder="Acme Ltd Summer Party 2024" />
            </div>
            <div>
              <label className="label">Event Date</label>
              <input type="date" value={form.eventDate} onChange={(e) => handleChange("eventDate", e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Guest Count</label>
              <input type="number" value={form.guestCount} onChange={(e) => handleChange("guestCount", e.target.value)} className="input" placeholder="150" />
            </div>
            <div className="col-span-2">
              <label className="label">Venue</label>
              <input value={form.venue} onChange={(e) => handleChange("venue", e.target.value)} className="input" placeholder="The Brewery, Chiswell Street, London EC1Y 4SD" />
            </div>
            <div>
              <label className="label">Service Type</label>
              <input value={form.serviceType} onChange={(e) => handleChange("serviceType", e.target.value)} className="input" placeholder="Espresso bar + cold brew" />
            </div>
            <div>
              <label className="label">Package</label>
              <input value={form.packageInfo} onChange={(e) => handleChange("packageInfo", e.target.value)} className="input" placeholder="Premium Package" />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={3} className="input" placeholder="Any notes from the initial sales conversation..." />
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={createEvent}
            disabled={creating || !form.clientName || !form.clientEmail || !form.title}
            className="btn-primary"
          >
            {creating ? "Creating…" : "Create Event →"}
          </button>
        </div>
      </div>
    </div>
  );
}
