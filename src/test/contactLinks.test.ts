import { describe, expect, it } from "vitest";

import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contactLinks";

describe("contactLinks", () => {
  it("builds a whatsapp link from a formatted phone number", () => {
    expect(buildWhatsAppLink("+254 712 345 678", "Hello there")).toBe(
      "https://wa.me/254712345678?text=Hello%20there",
    );
  });

  it("builds a mailto link with subject and body", () => {
    expect(buildMailtoLink("parent@example.com", "Update", "Lesson summary")).toBe(
      "mailto:parent@example.com?subject=Update&body=Lesson+summary",
    );
  });
});
