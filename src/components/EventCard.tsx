import Link from "next/link";
import { formatDate, daysUntil, initials, cn } from "@/lib/utils";
import { WORKFLOW_STEPS } from "@/lib/workflow";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    eventDate: string | null;
    venue: string | null;
    status: string;
    currentStep: number;
    client: { name: string; company: string | null };
    steps: { stepNumber: number; status: string }[];
  };
}

export default function EventCard({ event }: EventCardProps) {
  const days = daysUntil(event.eventDate);
  const completedSteps = event.steps.filter((s) => s.status === "COMPLETE").length;
  const progress = Math.round((completedSteps / 10) * 100);
  const currentDef = WORKFLOW_STEPS.find((s) => s.number === event.currentStep);
  const isComplete = event.status === "COMPLETED";

  const urgency =
    days !== null && days <= 3 && !isComplete
      ? "border-red-300 bg-red-50"
      : days !== null && days <= 7 && !isComplete
      ? "border-amber-300 bg-amber-50"
      : "border-espresso-100 bg-white";

  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        "block card border p-5 hover:shadow-md transition-all group",
        urgency
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-espresso-200 flex items-center justify-center text-espresso-800 font-semibold text-sm shrink-0">
            {initials(event.client.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-espresso-900 text-sm truncate group-hover:text-espresso-700">
              {event.title}
            </p>
            <p className="text-xs text-espresso-500 truncate">
              {event.client.company ?? event.client.name}
            </p>
          </div>
        </div>

        {days !== null && (
          <span
            className={cn(
              "shrink-0 text-xs font-medium px-2.5 py-1 rounded-full",
              days < 0
                ? "bg-gray-100 text-gray-500"
                : days <= 3
                ? "bg-red-100 text-red-700"
                : days <= 7
                ? "bg-amber-100 text-amber-700"
                : "bg-espresso-100 text-espresso-600"
            )}
          >
            {days < 0
              ? "Past"
              : days === 0
              ? "Today"
              : days === 1
              ? "Tomorrow"
              : `${days}d`}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-espresso-500 mb-4">
        {event.eventDate && <span>📅 {formatDate(event.eventDate)}</span>}
        {event.venue && <span>📍 {event.venue}</span>}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-espresso-600 font-medium">
            {isComplete ? "Completed" : currentDef?.title}
          </span>
          <span className="text-espresso-400">
            {completedSteps}/10 steps
          </span>
        </div>
        <div className="h-1.5 bg-espresso-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isComplete ? "bg-emerald-500" : "bg-espresso-600"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step dots */}
      <div className="flex gap-1">
        {WORKFLOW_STEPS.map((def) => {
          const s = event.steps.find((st) => st.stepNumber === def.number);
          const status = s?.status ?? "LOCKED";
          return (
            <div
              key={def.number}
              title={def.shortTitle}
              className={cn(
                "w-5 h-1.5 rounded-full",
                status === "COMPLETE" && "bg-emerald-400",
                status === "ACTIVE" && "bg-espresso-600",
                status === "LOCKED" && "bg-espresso-100"
              )}
            />
          );
        })}
      </div>
    </Link>
  );
}
