/** Format a number as KES with thousands separator, e.g. "KES 12,500" */
export function formatKES(amount: number | null | undefined): string {
  return `KES ${(amount ?? 0).toLocaleString("en-KE")}`;
}

/** Format a date string or Date as DD/MM/YYYY */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
