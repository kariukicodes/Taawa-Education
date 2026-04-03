import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "How does EduNest's pricing model work?",
    a: "We offer tiered monthly packages based on the number of subjects, session frequency, and curriculum type. After your free consultation, we'll provide a personalised quote that matches your family's needs.",
  },
  {
    q: "How are your tutors vetted?",
    a: "Every tutor undergoes academic verification, a teaching demonstration, comprehensive background checks, and reference verification. We accept only the top 5% of applicants and conduct ongoing performance reviews.",
  },
  {
    q: "What session formats are available?",
    a: "We offer both in-person sessions (within Nairobi) and virtual sessions via Google Meet. Many families use a hybrid approach, combining in-home tutoring with online sessions for flexibility.",
  },
  {
    q: "Which curricula do you support?",
    a: "We support the CBC (Kenyan national curriculum), British Curriculum (up to IGCSE), Montessori, and fully customised learning plans. We can also design dual-curriculum programmes.",
  },
  {
    q: "How do you report on my child's progress?",
    a: "Your dedicated tutor submits lesson reports after every session, including topics covered, homework set, and performance ratings. You can access these reports anytime through your parent dashboard, along with attendance records and term assessments.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-3 lg:px-3">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Badge variant="secondary" className="border border-primary/30 bg-primary/10 px-4 py-1 text-[11px] tracking-[0.2em] text-primary uppercase hover:bg-primary/10">
            FAQ
          </Badge>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-foreground">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
