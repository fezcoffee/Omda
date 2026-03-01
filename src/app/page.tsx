import { prisma } from "@/lib/prisma";
import EventCard from "@/components/EventCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [activeEvents, completedEvents] = await Promise.all([
    prisma.event.findMany({
      where: { status: "ACTIVE" },
      orderBy: { eventDate: "asc" },
      include: {
        client: true,
        steps: { select: { stepNumber: true, status: true } },
      },
    }),
    prisma.event.findMany({
      where: { status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        client: true,
        steps: { select: { stepNumber: true, status: true } },
      },
    }),
  ]);

  const totalClients = await prisma.client.count();
  const thisMonthEvents = await prisma.event.count({
    where: {
      eventDate: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
    },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900">Operations Dashboard</h1>
          <p className="text-espresso-500 text-sm mt-0.5">Manage your coffee catering events end to end</p>
        </div>
        <Link href="/events/new" className="btn-primary">
          + New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs text-espresso-500 font-medium uppercase tracking-wide mb-1">Active Events</p>
          <p className="text-3xl font-bold text-espresso-900">{activeEvents.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-espresso-500 font-medium uppercase tracking-wide mb-1">This Month</p>
          <p className="text-3xl font-bold text-espresso-900">{thisMonthEvents}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-espresso-500 font-medium uppercase tracking-wide mb-1">Total Clients</p>
          <p className="text-3xl font-bold text-espresso-900">{totalClients}</p>
        </div>
      </div>

      {/* Active events */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-espresso-700 uppercase tracking-wide mb-4">
          Active Events ({activeEvents.length})
        </h2>
        {activeEvents.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">☕</p>
            <p className="text-espresso-600 font-medium">No active events</p>
            <p className="text-espresso-400 text-sm mt-1">Create your first event to get started</p>
            <Link href="/events/new" className="btn-primary inline-flex mt-4">
              + New Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  eventDate: event.eventDate?.toISOString() ?? null,
                  client: { name: event.client.name, company: event.client.company },
                  steps: event.steps,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recently completed */}
      {completedEvents.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-espresso-700 uppercase tracking-wide mb-4">
            Recently Completed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  ...event,
                  eventDate: event.eventDate?.toISOString() ?? null,
                  client: { name: event.client.name, company: event.client.company },
                  steps: event.steps,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
