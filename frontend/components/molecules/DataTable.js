// frontend/components/molecules/DataTable.js
/**
 * @file frontend/components/molecules/DataTable.js
 * @description Defensive data table component configured with safe unique identity keys
 * to prevent Virtual DOM misalignments under React 19 and Turbopack hot-reloading.
 */

export default function DataTable({ columns, rows, caption }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-100 bg-white shadow-sm">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-neutral-100">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              // Robust fallback key chain: checks for standard id, then MongoDB _id, and falls back to loop index
              key={row.id || row._id || `row-${index}`}
              className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-4 align-middle text-neutral-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-neutral-400">No records found.</p>
      )}
    </div>
  );
}