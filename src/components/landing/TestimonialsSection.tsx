import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    quote: "EduNest transformed our homeschooling journey. Zara is thriving in ways we never expected — she's two grades ahead in maths and actually enjoys learning.",
    parent: "Grace K.",
    child: "Daughter, Age 10, Grade 5",
    outcome: "Two grades ahead in Mathematics",
  },
  {
    quote: "The professionalism and warmth of the tutors put us at ease immediately. Our son Ethan went from struggling with science to scoring top marks in his assessments.",
    parent: "David O.",
    child: "Son, Age 13, Grade 8",
    outcome: "Top marks in Science assessments",
  },
  {
    quote: "We moved from a top Nairobi school to EduNest and haven't looked back. The personalised attention is something no classroom of 30 students can offer.",
    parent: "Sarah M.",
    child: "Daughter, Age 11, Grade 6",
    outcome: "Personalised curriculum, remarkable confidence growth",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative py-24 px-3 lg:px-3 bg-[#0A0A08]"
    >
      {/* Divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <Badge
            variant="secondary"
            className="border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-4 py-1 text-[11px] tracking-[0.2em] text-[#C9A84C] uppercase hover:bg-[#C9A84C]/10"
          >
            Testimonials
          </Badge>

          <h2
            className="mt-4 text-3xl font-bold text-[#F5F5F0] md:text-4xl tracking-[-0.02em]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            What families are experiencing
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.parent}
              className="rounded-xl border border-white/[0.08] bg-[#131310] p-6"
            >
              <div className="mb-4 text-xl text-[#C9A84C]">“</div>

              <p className="text-sm leading-relaxed text-[#F5F5F0]/55 italic">
                {t.quote}
              </p>

              <div className="mt-6 border-t border-white/[0.08] pt-4">
                <p className="font-semibold text-[#F5F5F0]">
                  {t.parent}
                </p>

                <p className="text-xs text-[#F5F5F0]/40">
                  {t.child}
                </p>

                <p className="mt-1 text-xs font-medium text-[#C9A84C]">
                  {t.outcome}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}