
  import Card from "@/components/ui/Card";

const STATS = [
  { label: "Total Events", value: "8", trend: "+20%" },
  { label: "Total Guests", value: "620", trend: "+13%" },
  { label: "Revenue", value: "ksh 185,500", trend: "+28%" },
];

const CHART = [
  { label: "1 June", value1: 620, value2: 880 },
  { label: "14 June", value1: 580, value2: 650 },
  { label: "18 June", value1: 700, value2: 300 },
  { label: "24 June", value1: 480, value2: 790 },
  { label: "30 June", value1: 400, value2: 880 },
];

export default function ReportsPage() {
  const max = 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
        <select className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-100">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-medium text-neutral-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-green-500">{s.trend}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-6 text-base font-semibold text-neutral-900">
          Event Summary
        </h2>

        <div className="flex h-64 items-end gap-6">
          {CHART.map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-end justify-center gap-1" style={{ height: "220px" }}>
                <div
                  className="w-5 rounded-t-md bg-purple-400 transition-all duration-500"
                  style={{ height: `${(bar.value1 / max) * 100}%` }}
                  title={`${bar.value1}`}
                />
                <div
                  className="w-5 rounded-t-md bg-purple-600 transition-all duration-500"
                  style={{ height: `${(bar.value2 / max) * 100}%` }}
                  title={`${bar.value2}`}
                />
              </div>
              <span className="text-xs text-neutral-400 text-center whitespace-nowrap">
                {bar.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 rounded bg-purple-400 inline-block" />
            Guests
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-4 rounded bg-purple-600 inline-block" />
            Revenue
          </span>
        </div>
      </Card>
    </div>
  );
}