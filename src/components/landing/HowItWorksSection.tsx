import { MessageSquare, Users, BookOpen } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Initial Inquiry",
    description:
      "Reach out through our contact form or schedule a consultation. Tell us about your child, your goals, and your preferred curriculum.",
  },
  {
    icon: Users,
    step: "02",
    title: "Personalised Consultation",
    description:
      "Meet with our education advisor to understand your child’s learning profile, select the right tutor, and design a tailored academic plan.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Structured Enrolment",
    description:
      "Your child is matched with a dedicated tutor. Lessons begin, progress is tracked, and you receive regular reports from day one.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#0A0A08] px-3 py-24 lg:px-3"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex w-fit items-center gap-2 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/[0.07] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                How It Works
              </span>
            </div>
          </div>

          <h2 className="font-display mt-4 text-3xl font-bold tracking-[-0.03em] text-foreground md:text-4xl">
            A simple, structured path to academic progress
          </h2>

          <p className="mt-5 text-[15px] leading-8 text-muted-foreground">
            We make homeschooling clear, personalised, and fully supported —
            so your child learns with confidence and you stay informed at every step.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.step}
              className="group rounded-[28px] border border-white/[0.06] bg-[#131310]/85 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A84C]/20"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/10 text-primary ring-1 ring-[#C9A84C]/15">
                  <s.icon className="h-6 w-6" />
                </div>

                <span className="font-display text-[28px] font-bold text-foreground/10">
                  {s.step}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-foreground">
                {s.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {s.description}
              </p>

              <div className="mt-8 h-px w-full bg-gradient-to-r from-[#C9A84C]/25 to-transparent opacity-70" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}