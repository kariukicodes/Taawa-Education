import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    q: "How does Taawa Education's pricing model work?",
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative bg-[#0A0A08] px-3 py-24 lg:px-3"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Badge
            variant="secondary"
            className="border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-4 py-1 text-[11px] tracking-[0.2em] text-[#C9A84C] uppercase hover:bg-[#C9A84C]/10"
          >
            FAQ
          </Badge>

          <h2
            className="mt-4 text-3xl font-bold tracking-[-0.02em] text-[#F5F5F0] md:text-4xl"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-8 text-[#F5F5F0]/55">
            Everything parents usually want to know before getting started with Taawa Education.
          </p>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#131310]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="pr-4 text-sm font-medium text-[#F5F5F0]">
                  {faq.q}
                </span>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#F5F5F0]/40 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180 text-[#C9A84C]" : ""
                  }`}
                />
              </button>

              {openIndex === i && (
                <div className="border-t border-white/[0.08] px-6 py-4">
                  <p className="text-sm leading-7 text-[#F5F5F0]/52">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}