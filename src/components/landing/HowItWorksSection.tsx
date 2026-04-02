import { MessageSquare, Users, BookOpen } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "01",
    title: "Inquiry",
    description: "Reach out through our contact form or schedule a call. Tell us about your child, your goals, and your preferred curriculum.",
  },
  {
    icon: Users,
    step: "02",
    title: "Personalised Consultation",
    description: "Meet with our education advisor to discuss your child's learning profile, choose the right tutor, and design a tailored plan.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Structured Enrolment",
    description: "Your child is matched with a dedicated tutor. Sessions begin, progress is tracked, and you receive regular reports — all from day one.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-3 lg:px-3">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Process</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-px w-full bg-border md:block" style={{ left: '60%', width: '80%' }} />
              )}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <s.icon className="h-7 w-7 text-primary" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
                Step {s.step}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
