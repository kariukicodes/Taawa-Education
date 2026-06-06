import { describe, expect, it } from "vitest";

import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";

describe("adminFilters", () => {
  it("matches across mixed values", () => {
    expect(
      includesSearchTerm(
        ["Alice Walker", "alice@example.com", 2, null],
        "example",
      ),
    ).toBe(true);
    expect(includesSearchTerm(["Alice Walker", "CBC"], "montessori")).toBe(false);
  });

  it("sorts strings and numbers in both directions", () => {
    const records = [
      { name: "Brian", count: 2 },
      { name: "alice", count: 5 },
      { name: "Chris", count: 1 },
    ];

    expect(sortByKey(records, (item) => item.name, "asc").map((item) => item.name)).toEqual([
      "alice",
      "Brian",
      "Chris",
    ]);

    expect(sortByKey(records, (item) => item.count, "desc").map((item) => item.count)).toEqual([
      5,
      2,
      1,
    ]);
  });
});
