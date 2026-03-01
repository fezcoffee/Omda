"use client";

import { WORKFLOW_STEPS } from "@/lib/workflow";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  stepNumber: number;
  status: string;
  completedAt?: string | null;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  activeStep: number;
  onSelectStep: (num: number) => void;
}

const ICONS: Record<string, string> = {
  SALE_AGREED: "🤝",
  CONTRACT_SENT: "📄",
  CONCIERGE_BRIEF_SENT: "📋",
  EVENT_BRIEF_ISSUED: "📖",
  WAREHOUSE_CHECKLIST_SENT: "📦",
  DRIVER_CHECKLIST_SENT: "🚚",
  EVENT_IN_PROGRESS: "☕",
  EVENT_COMPLETE: "✅",
  INVOICE_ISSUED: "🧾",
  REVIEW_REQUESTED: "⭐",
};

export default function WorkflowStepper({ steps, activeStep, onSelectStep }: WorkflowStepperProps) {
  return (
    <div className="bg-white border-b border-espresso-100">
      <div className="overflow-x-auto">
        <div className="flex min-w-max px-6 py-4 gap-1">
          {WORKFLOW_STEPS.map((def, idx) => {
            const step = steps.find((s) => s.stepNumber === def.number);
            const status = step?.status ?? "LOCKED";
            const isActive = def.number === activeStep;
            const isComplete = status === "COMPLETE";
            const isLocked = status === "LOCKED";
            const isClickable = !isLocked;

            return (
              <div key={def.number} className="flex items-center">
                <button
                  disabled={isLocked}
                  onClick={() => isClickable && onSelectStep(def.number)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-center",
                    isActive && "bg-espresso-800 shadow-md",
                    !isActive && isComplete && "bg-emerald-50 hover:bg-emerald-100",
                    !isActive && !isComplete && !isLocked && "bg-espresso-50 hover:bg-espresso-100",
                    isLocked && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
                      isActive && "border-white text-white bg-espresso-600",
                      !isActive && isComplete && "border-emerald-400 text-emerald-700 bg-emerald-100",
                      !isActive && !isComplete && !isLocked && "border-espresso-300 text-espresso-600 bg-white",
                      isLocked && "border-espresso-200 text-espresso-300 bg-white"
                    )}
                  >
                    {isComplete ? "✓" : def.number}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium leading-tight max-w-[64px]",
                      isActive && "text-white",
                      !isActive && isComplete && "text-emerald-700",
                      !isActive && !isComplete && !isLocked && "text-espresso-700",
                      isLocked && "text-espresso-300"
                    )}
                  >
                    {def.shortTitle}
                  </span>
                  <span className="text-sm">{ICONS[def.type]}</span>
                </button>

                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-6 h-0.5 mx-0.5",
                      isComplete ? "bg-emerald-400" : "bg-espresso-100"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
