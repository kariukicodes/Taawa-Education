export function includesSearchTerm(values: Array<string | number | null | undefined>, search: string) {
  const term = search.trim().toLowerCase();

  if (!term) {
    return true;
  }

  return values.some((value) => String(value ?? "").toLowerCase().includes(term));
}

export function sortByKey<T>(
  items: T[],
  selector: (item: T) => string | number | null | undefined,
  direction: "asc" | "desc" = "asc",
) {
  return [...items].sort((left, right) => {
    const leftValue = selector(left);
    const rightValue = selector(right);

    if (leftValue == null && rightValue == null) return 0;
    if (leftValue == null) return 1;
    if (rightValue == null) return -1;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return direction === "asc" ? leftValue - rightValue : rightValue - leftValue;
    }

    const comparison = String(leftValue).localeCompare(String(rightValue), undefined, {
      sensitivity: "base",
      numeric: true,
    });

    return direction === "asc" ? comparison : -comparison;
  });
}
