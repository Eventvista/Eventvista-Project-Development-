// frontend/components/ui/Badge.js
const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-600",
  pending: "bg-purple-100 text-purple-600",
  planning: "bg-purple-100 text-purple-600",
  declined: "bg-red-100 text-red-500",
};

export default function Badge({ status = "pending", children }) {
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles}`}>
      {children ?? status}
    </span>
  );
}