// frontend/components/molecules/StatCard.js
import Card from "@/components/ui/Card";

export default function StatCard({ label, value, sublabel, trend }) {
  return (
    <Card>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {sublabel && <p className="text-xs text-neutral-400">{sublabel}</p>}
        {trend && <span className="text-xs font-semibold text-green-500">{trend}</span>}
      </div>
    </Card>
  );
}