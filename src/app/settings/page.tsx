"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SettingsContent() {
  const params = useSearchParams();
  const xeroStatus = params.get("xero");

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-espresso-900">Settings</h1>
        <p className="text-espresso-500 text-sm mt-0.5">Configure integrations and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Xero */}
        <section className="card p-6">
          <h2 className="font-semibold text-espresso-800 mb-1 flex items-center gap-2">
            🧾 Xero Integration
          </h2>
          <p className="text-sm text-espresso-500 mb-4">
            Connect your Xero account to generate and send invoices directly from Omda.
          </p>

          {xeroStatus === "connected" && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              ✓ Xero connected successfully
            </div>
          )}
          {xeroStatus === "error" && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ✕ Xero connection failed. Try again.
            </div>
          )}

          <a href="/api/xero/auth" className="btn-secondary inline-flex">
            {xeroStatus === "connected" ? "Reconnect Xero" : "Connect Xero"}
          </a>
          <p className="text-xs text-espresso-400 mt-3">
            Requires XERO_CLIENT_ID and XERO_CLIENT_SECRET in your .env file.
          </p>
        </section>

        {/* Twilio */}
        <section className="card p-6">
          <h2 className="font-semibold text-espresso-800 mb-1 flex items-center gap-2">
            💬 Twilio (WhatsApp & SMS)
          </h2>
          <p className="text-sm text-espresso-500 mb-4">
            Used to send checklists and review requests to your warehouse team, drivers, and clients.
          </p>
          <div className="bg-espresso-50 rounded-lg p-4 text-sm text-espresso-600 font-mono space-y-1">
            <p>TWILIO_ACCOUNT_SID=ACxxxx...</p>
            <p>TWILIO_AUTH_TOKEN=your_token</p>
            <p>TWILIO_WHATSAPP_FROM=whatsapp:+14155238886</p>
            <p>TWILIO_SMS_FROM=+14155238886</p>
          </div>
          <p className="text-xs text-espresso-400 mt-3">
            Add these to your .env file and restart the server. Get credentials at{" "}
            <span className="text-espresso-600">console.twilio.com</span>.
          </p>
        </section>

        {/* Word templates */}
        <section className="card p-6">
          <h2 className="font-semibold text-espresso-800 mb-1 flex items-center gap-2">
            📄 Document Templates
          </h2>
          <p className="text-sm text-espresso-500 mb-4">
            Upload Word (.docx) templates with placeholders. Omda fills them in with event data when generating documents.
          </p>
          <div className="bg-espresso-50 rounded-lg p-4 text-sm text-espresso-600 space-y-2">
            <p className="font-semibold text-espresso-800 text-xs uppercase tracking-wide mb-2">Available placeholders:</p>
            {[
              ["{{client_name}}", "Client's full name"],
              ["{{client_company}}", "Client's company"],
              ["{{client_email}}", "Client's email address"],
              ["{{client_phone}}", "Client's phone number"],
              ["{{client_address}}", "Client's address"],
              ["{{event_title}}", "Event title"],
              ["{{event_date}}", "Event date (formatted)"],
              ["{{event_venue}}", "Event venue"],
              ["{{guest_count}}", "Number of guests"],
              ["{{service_type}}", "Service type"],
              ["{{package_info}}", "Package info"],
              ["{{notes}}", "Event notes"],
              ["{{today_date}}", "Today's date"],
            ].map(([placeholder, desc]) => (
              <div key={placeholder} className="flex items-center gap-3">
                <code className="text-espresso-700 bg-white rounded px-1.5 py-0.5 text-xs border border-espresso-200 shrink-0">
                  {placeholder}
                </code>
                <span className="text-xs text-espresso-500">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-espresso-400 mt-3">
            Upload templates from within each event step (Contract, Concierge Brief, Event Brief).
          </p>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-espresso-400 text-sm">Loading…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
