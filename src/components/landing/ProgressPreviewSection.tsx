const features = [
  {
    title: "Track academic progress",
    description:
      "Clear subject-by-subject updates and term insights — no guessing.",
  },
  {
    title: "Read tutor reports",
    description:
      "Lesson feedback, observations, and next-step recommendations in one place.",
  },
  {
    title: "Stay organised",
    description:
      "Upcoming lessons and completed sessions, presented simply.",
  },
];

export function ProgressPreviewSection() {
  return (
    <section className="relative bg-[#0A0A08] py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-3 lg:px-3">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                Parent Dashboard
              </span>
            </div>
          </div>

          <h2
            className="font-display text-3xl font-bold tracking-[-0.03em] text-foreground md:text-5xl"
          >
            See your child’s progress
            <br />
            with clarity
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-muted-foreground">
            Our parent dashboard gives you a simple, organised view of your child’s
            lessons, reports, and academic growth — so you always know how they are doing.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Minimal preview card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131310] p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-primary">
                  Student
                </p>
                <h3 className="mt-2 text-[18px] font-semibold text-foreground">
                  Zara Kamau
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Grade 8 • CBC
                </p>
              </div>

              <div className="text-right">
                <p
                  className="font-display text-[28px] font-bold leading-none text-primary"
                >
                  81%
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Term progress</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { subject: "Mathematics", value: 88 },
                { subject: "English", value: 76 },
                { subject: "Science", value: 84 },
              ].map((item) => (
                <div key={item.subject}>
                  <div className="mb-2 flex items-center justify-between text-[13px]">
                    <span className="text-foreground/80">{item.subject}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/[0.08] pt-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-primary">
                Latest note
              </p>
              <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                Stronger confidence in Mathematics. Next: structured revision tasks.
              </p>
              <a
                href="/parent/reports"
                className="mt-4 inline-flex text-[12px] font-medium text-primary"
              >
                View reports →
              </a>
            </div>
          </div>

          {/* Minimal supporting bullets */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#131310] p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              Why parents love it
            </p>
            <h3
              className="font-display mt-4 text-[26px] font-semibold leading-tight text-foreground md:text-[30px]"
            >
              A calmer way to stay informed.
            </h3>
            <p className="mt-4 text-[15px] leading-8 text-muted-foreground">
              Progress, notes, and schedules — laid out clearly so you can check in
              anytime.
            </p>

            <div className="mt-8 space-y-5 border-t border-white/[0.08] pt-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-[14px] font-medium text-foreground">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
