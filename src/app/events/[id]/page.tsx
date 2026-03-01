"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import WorkflowStepper from "@/components/WorkflowStepper";
import SaleAgreedPanel from "@/components/steps/SaleAgreedPanel";
import DocumentPanel from "@/components/steps/DocumentPanel";
import ChecklistStepPanel from "@/components/steps/ChecklistStepPanel";
import SimpleConfirmPanel from "@/components/steps/SimpleConfirmPanel";
import InvoicePanel from "@/components/steps/InvoicePanel";
import ReviewPanel from "@/components/steps/ReviewPanel";
import { WORKFLOW_STEPS } from "@/lib/workflow";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface EventStep {
  id: string;
  stepNumber: number;
  stepType: string;
  status: string;
  completedAt: string | null;
  notes: string | null;
  metadata: string | null;
}

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

interface Document {
  id: string;
  type: string;
  fileName: string;
  filePath: string | null;
  sentAt: string | null;
  sentTo: string | null;
}

interface EventData {
  id: string;
  title: string;
  status: string;
  currentStep: number;
  eventDate: string | null;
  venue: string | null;
  guestCount: number | null;
  serviceType: string | null;
  packageInfo: string | null;
  notes: string | null;
  client: {
    id: string;
    name: string;
    company: string | null;
    email: string;
    phone: string | null;
    address: string | null;
  };
  steps: EventStep[];
  checklists: Checklist[];
  documents: Document[];
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setEvent(data);
      // Set active step to current step (first non-locked)
      const currentActive = data.steps.find((s: EventStep) => s.status === "ACTIVE");
      if (currentActive) setActiveStep(currentActive.stepNumber);
    } catch {
      toast.error("Could not load event");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  function handleStepComplete() {
    loadEvent();
    // Move to newly unlocked step
    if (event) {
      const nextStep = activeStep + 1;
      if (nextStep <= 10) setActiveStep(nextStep);
    }
  }

  async function deleteEvent() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      router.push("/");
    } catch {
      toast.error("Could not delete event");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-espresso-400 text-sm animate-pulse">Loading event…</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-espresso-400 text-sm">Event not found.</div>
      </div>
    );
  }

  const activeStepDef = WORKFLOW_STEPS.find((s) => s.number === activeStep);
  const activeStepData = event.steps.find((s) => s.stepNumber === activeStep);
  const completedCount = event.steps.filter((s) => s.status === "COMPLETE").length;

  const warehouseChecklist = event.checklists.find((c) => c.type === "WAREHOUSE") ?? null;
  const driverChecklist = event.checklists.find((c) => c.type === "DRIVER") ?? null;

  function renderStepPanel() {
    if (!activeStepDef || !activeStepData) return null;

    const commonProps = {
      eventId: event!.id,
      stepNumber: activeStep,
      stepStatus: activeStepData.status,
      completedAt: activeStepData.completedAt,
      completionLabel: activeStepDef.completionLabel,
      onComplete: handleStepComplete,
      onUpdate: loadEvent,
    };

    switch (activeStepDef.type) {
      case "SALE_AGREED":
        return (
          <SaleAgreedPanel
            {...commonProps}
            event={{
              title: event!.title,
              eventDate: event!.eventDate,
              venue: event!.venue,
              guestCount: event!.guestCount,
              serviceType: event!.serviceType,
              packageInfo: event!.packageInfo,
              notes: event!.notes,
              client: event!.client,
            }}
          />
        );

      case "CONTRACT_SENT":
        return (
          <DocumentPanel
            {...commonProps}
            docType="CONTRACT"
            title="Contract"
            description={activeStepDef.description}
            documents={event!.documents}
          />
        );

      case "CONCIERGE_BRIEF_SENT":
        return (
          <DocumentPanel
            {...commonProps}
            docType="CONCIERGE_BRIEF"
            title="Concierge Brief"
            description={activeStepDef.description}
            documents={event!.documents}
          />
        );

      case "EVENT_BRIEF_ISSUED":
        return (
          <DocumentPanel
            {...commonProps}
            docType="EVENT_BRIEF"
            title="Event Brief"
            description={activeStepDef.description}
            documents={event!.documents}
          />
        );

      case "WAREHOUSE_CHECKLIST_SENT":
        return (
          <ChecklistStepPanel
            {...commonProps}
            type="WAREHOUSE"
            title="Warehouse Pack List"
            description={activeStepDef.description}
            checklist={warehouseChecklist}
            eventDetails={{
              venue: event!.venue,
              date: event!.eventDate,
              clientName: event!.client.name,
            }}
          />
        );

      case "DRIVER_CHECKLIST_SENT":
        return (
          <ChecklistStepPanel
            {...commonProps}
            type="DRIVER"
            title="Driver Checklist"
            description={activeStepDef.description}
            checklist={driverChecklist}
            eventDetails={{
              venue: event!.venue,
              date: event!.eventDate,
              clientName: event!.client.name,
            }}
          />
        );

      case "EVENT_IN_PROGRESS":
        return (
          <SimpleConfirmPanel
            {...commonProps}
            title="Event In Progress"
            description={activeStepDef.description}
          />
        );

      case "EVENT_COMPLETE":
        return (
          <SimpleConfirmPanel
            {...commonProps}
            title="Event Complete"
            description={activeStepDef.description}
          />
        );

      case "INVOICE_ISSUED":
        return (
          <InvoicePanel
            {...commonProps}
            event={{
              title: event!.title,
              serviceType: event!.serviceType,
              packageInfo: event!.packageInfo,
              client: { name: event!.client.name, email: event!.client.email },
            }}
          />
        );

      case "REVIEW_REQUESTED":
        return (
          <ReviewPanel
            {...commonProps}
            event={{ client: { name: event!.client.name, phone: event!.client.phone, email: event!.client.email } }}
          />
        );

      default:
        return <p className="text-sm text-espresso-400">Panel not implemented.</p>;
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Event header */}
      <div className="bg-white border-b border-espresso-100 px-6 py-4 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-espresso-400 mb-1">
              <a href="/" className="hover:text-espresso-600">Dashboard</a>
              <span>/</span>
              <span className="text-espresso-700">{event.title}</span>
            </div>
            <h1 className="text-xl font-bold text-espresso-900">{event.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-espresso-500">
              <span>👤 {event.client.name}{event.client.company ? ` · ${event.client.company}` : ""}</span>
              {event.eventDate && <span>📅 {formatDate(event.eventDate)}</span>}
              {event.venue && <span>📍 {event.venue}</span>}
              {event.guestCount && <span>👥 {event.guestCount} guests</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              event.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-700"
                : event.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : "bg-espresso-100 text-espresso-700"
            }`}>
              {event.status === "COMPLETED" ? "✓ Complete" : event.status === "CANCELLED" ? "Cancelled" : `Step ${completedCount}/10`}
            </span>
            <button onClick={deleteEvent} disabled={deleting} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Workflow stepper */}
      <WorkflowStepper
        steps={event.steps}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
      />

      {/* Step panel */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Step header */}
          {activeStepDef && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-espresso-800 text-white flex items-center justify-center text-sm font-bold">
                  {activeStepData?.status === "COMPLETE" ? "✓" : activeStep}
                </span>
                <h2 className="text-lg font-bold text-espresso-900">{activeStepDef.title}</h2>
                {activeStepData?.status === "COMPLETE" && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                    Complete
                  </span>
                )}
                {activeStepData?.status === "ACTIVE" && (
                  <span className="text-xs bg-espresso-100 text-espresso-700 px-2.5 py-1 rounded-full font-medium">
                    In Progress
                  </span>
                )}
                {activeStepData?.status === "LOCKED" && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                    🔒 Locked
                  </span>
                )}
              </div>
            </div>
          )}

          {activeStepData?.status === "LOCKED" ? (
            <div className="card p-8 text-center text-espresso-400">
              <p className="text-3xl mb-3">🔒</p>
              <p className="font-medium text-espresso-600">This step is locked</p>
              <p className="text-sm mt-1">Complete the previous step to unlock this one.</p>
            </div>
          ) : (
            renderStepPanel()
          )}
        </div>
      </div>
    </div>
  );
}
