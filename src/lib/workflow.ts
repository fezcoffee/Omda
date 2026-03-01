export type StepType =
  | "SALE_AGREED"
  | "CONTRACT_SENT"
  | "CONCIERGE_BRIEF_SENT"
  | "EVENT_BRIEF_ISSUED"
  | "WAREHOUSE_CHECKLIST_SENT"
  | "DRIVER_CHECKLIST_SENT"
  | "EVENT_IN_PROGRESS"
  | "EVENT_COMPLETE"
  | "INVOICE_ISSUED"
  | "REVIEW_REQUESTED";

export type StepStatus = "LOCKED" | "ACTIVE" | "COMPLETE";

export interface StepDefinition {
  number: number;
  type: StepType;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  panel: string;
  completionLabel: string;
  files?: string[];
}

export const WORKFLOW_STEPS: StepDefinition[] = [
  {
    number: 1,
    type: "SALE_AGREED",
    title: "Sale Agreed",
    shortTitle: "Sale",
    description: "Client has agreed to proceed. Capture all event details and client information.",
    icon: "Handshake",
    color: "emerald",
    panel: "SaleAgreedPanel",
    completionLabel: "Confirm Sale Agreed",
  },
  {
    number: 2,
    type: "CONTRACT_SENT",
    title: "Contract Sent",
    shortTitle: "Contract",
    description: "Generate and send the client contract for signing. Upload the signed version when received.",
    icon: "FileText",
    color: "blue",
    panel: "ContractPanel",
    completionLabel: "Mark Contract Sent",
    files: ["CONTRACT"],
  },
  {
    number: 3,
    type: "CONCIERGE_BRIEF_SENT",
    title: "Concierge Brief Sent",
    shortTitle: "Brief",
    description: "Send the concierge brief to the client to capture all final preferences and requirements.",
    icon: "ClipboardList",
    color: "violet",
    panel: "ConciergeBriefPanel",
    completionLabel: "Mark Brief Sent",
    files: ["CONCIERGE_BRIEF"],
  },
  {
    number: 4,
    type: "EVENT_BRIEF_ISSUED",
    title: "Event Brief Issued",
    shortTitle: "Event Brief",
    description: "Compile all details from contract and concierge brief into a final event brief for the team.",
    icon: "BookOpen",
    color: "amber",
    panel: "EventBriefPanel",
    completionLabel: "Issue Event Brief",
    files: ["EVENT_BRIEF"],
  },
  {
    number: 5,
    type: "WAREHOUSE_CHECKLIST_SENT",
    title: "Warehouse Pack List Sent",
    shortTitle: "Warehouse",
    description: "Build and send the warehouse pack list so the team knows exactly what to load.",
    icon: "Package",
    color: "orange",
    panel: "WarehouseChecklistPanel",
    completionLabel: "Send to Warehouse",
  },
  {
    number: 6,
    type: "DRIVER_CHECKLIST_SENT",
    title: "Driver Checklist Sent",
    shortTitle: "Drivers",
    description: "Send drivers their checklist with venue address, timings, and equipment to transport.",
    icon: "Truck",
    color: "rose",
    panel: "DriverChecklistPanel",
    completionLabel: "Send to Drivers",
  },
  {
    number: 7,
    type: "EVENT_IN_PROGRESS",
    title: "Event In Progress",
    shortTitle: "Live",
    description: "The event is live. Mark this when the team arrives at the venue.",
    icon: "Coffee",
    color: "sky",
    panel: "EventLivePanel",
    completionLabel: "Mark Event Started",
  },
  {
    number: 8,
    type: "EVENT_COMPLETE",
    title: "Event Complete",
    shortTitle: "Done",
    description: "The event has wrapped. Add any post-event notes before invoicing.",
    icon: "CheckCircle",
    color: "teal",
    panel: "EventCompletePanel",
    completionLabel: "Mark Event Complete",
  },
  {
    number: 9,
    type: "INVOICE_ISSUED",
    title: "Invoice Issued",
    shortTitle: "Invoice",
    description: "Generate and send the invoice to the client via Xero.",
    icon: "Receipt",
    color: "indigo",
    panel: "InvoicePanel",
    completionLabel: "Mark Invoice Sent",
    files: ["INVOICE"],
  },
  {
    number: 10,
    type: "REVIEW_REQUESTED",
    title: "Review Requested",
    shortTitle: "Review",
    description: "Send a review request to the client via WhatsApp or SMS.",
    icon: "Star",
    color: "yellow",
    panel: "ReviewPanel",
    completionLabel: "Mark Review Requested",
  },
];

export function getStepDefinition(stepNumber: number): StepDefinition | undefined {
  return WORKFLOW_STEPS.find((s) => s.number === stepNumber);
}

export function getStepByType(type: StepType): StepDefinition | undefined {
  return WORKFLOW_STEPS.find((s) => s.type === type);
}

export const STEP_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  badge: "bg-violet-100 text-violet-700" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   badge: "bg-amber-100 text-amber-700" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  badge: "bg-orange-100 text-orange-700" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    badge: "bg-rose-100 text-rose-700" },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     badge: "bg-sky-100 text-sky-700" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    badge: "bg-teal-100 text-teal-700" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  badge: "bg-indigo-100 text-indigo-700" },
  yellow:  { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200",  badge: "bg-yellow-100 text-yellow-700" },
};
