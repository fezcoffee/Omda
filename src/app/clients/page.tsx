import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { events: true } },
      events: {
        orderBy: { eventDate: "desc" },
        take: 1,
        select: { id: true, title: true, status: true, eventDate: true },
      },
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900">Clients</h1>
          <p className="text-espresso-500 text-sm mt-0.5">{clients.length} clients on record</p>
        </div>
        <Link href="/events/new" className="btn-primary">+ New Event</Link>
      </div>

      {clients.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-espresso-600 font-medium">No clients yet</p>
          <p className="text-espresso-400 text-sm mt-1">Clients are created when you create a new event</p>
        </div>
      ) : (
        <div className="card divide-y divide-espresso-50">
          {clients.map((client) => {
            const lastEvent = client.events[0];
            return (
              <div key={client.id} className="flex items-center gap-4 px-5 py-4 hover:bg-espresso-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-espresso-200 flex items-center justify-center text-espresso-800 font-semibold text-sm shrink-0">
                  {initials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-espresso-900 text-sm">{client.name}</p>
                  <p className="text-xs text-espresso-500">
                    {client.company && <span>{client.company} · </span>}
                    {client.email}
                    {client.phone && <span> · {client.phone}</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-espresso-500">
                    {client._count.events} event{client._count.events !== 1 ? "s" : ""}
                  </p>
                  {lastEvent && (
                    <Link
                      href={`/events/${lastEvent.id}`}
                      className="text-xs text-espresso-700 hover:text-espresso-900 underline decoration-espresso-300"
                    >
                      {lastEvent.title.length > 30 ? lastEvent.title.slice(0, 30) + "…" : lastEvent.title}
                    </Link>
                  )}
                  {lastEvent?.eventDate && (
                    <p className="text-xs text-espresso-400 mt-0.5">{formatDate(lastEvent.eventDate)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
