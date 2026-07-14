// frontend/app/(dashboard)/dashboard/page.js
import Link from "next/link";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const STATS = [
  { label: "Total Events", value: "12", sublabel: "All time events" },
  { label: "Upcoming Events", value: "5", sublabel: "Next 30 days" },
  { label: "Total Budget", value: "ksh 4,578,000", sublabel: "All events" },
  { label: "Total Guests", value: "1,248", sublabel: "Across all events" },
];

const UPCOMING = [
  { 
    id: 1, 
    name: "Dream Wedding", 
    date: "24 July", 
    guests: 120, 
    venue: "Nairobi, Kenya", 
    status: "planning", 
    img: "/images/dream wedding photo.jpeg" 
  },
  { 
    id: 2, 
    name: "Corporate Conference", 
    date: "10 July", 
    guests: 300, 
    venue: "KICC Nairobi", 
    status: "confirmed", 
    img: "/images/corporate conferencee.jpeg" 
  },
  { 
    id: 3, 
    name: "Charity Gala Dinner", 
    date: "1 August", 
    guests: 200, 
    venue: "Sarova Panafric", 
    status: "planning", 
    img: "/images/charity galaa photo.jpeg" 
  },
];

const ACTIVITY = [
  { id: 1, title: "Vendor Elegant Decor", detail: "Confirmed for Dream Wedding", time: "2m ago" },
  { id: 2, title: "Payment of ksh 250,000", detail: "Received from Client", time: "1h ago" },
  { id: 3, title: "Guest RSVP Update", detail: "35 guests confirmed", time: "3h ago" },
  { id: 4, title: "New Task Assigned", detail: "Setup sound system", time: "5h ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back, John 👋</h1>
          <p className="text-sm text-neutral-500">Here&apos;s what&apos;s happening with your events.</p>
        </div>
        <Link href="/events/create">
  <Link href="/designer">
  <Button>+ Create New Event</Button>
</Link>
</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">Upcoming Events</h2>
            <Link href="/events" className="text-xs font-semibold text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-neutral-100">
            {UPCOMING.map((event) => (
              <li key={event.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-12 w-16 shrink-0 rounded-lg bg-neutral-200 overflow-hidden">
  <img
    src={event.img}
    alt={event.name}
    className="h-full w-full object-cover"
  />
</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-800">{event.name}</p>
                  <p className="truncate text-xs text-neutral-500">{event.date} · {event.guests} Guests</p>
                  <p className="truncate text-xs text-neutral-400">{event.venue}</p>
                </div>
                <Badge status={event.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">3D Venue Preview</h2>
            <Link href="/designer" className="text-xs font-semibold text-purple-600 hover:underline">
              View in 3D Designer
            </Link>
          </div>
          <div className="flex-1 min-h-48 overflow-hidden rounded-xl bg-neutral-900">
  <img
    src="/images/3d venue stage photo.jpeg"
    alt="3D venue preview"
    className="h-full w-full object-cover opacity-80"
  />
</div>
        </Card>

        <Card className="lg:col-span-1">
          <h2 className="mb-4 text-base font-semibold text-neutral-900">Recent Activity</h2>
          <ul className="space-y-4">
            {ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-800">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.detail}</p>
                  <p className="text-xs text-neutral-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}