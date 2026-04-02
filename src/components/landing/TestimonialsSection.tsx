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
    <section id="testimonials" className="py-24 px-3 lg:px-3 bg-card/50">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Testimonials</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            What Our Families Say
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.parent}
              className="card-hover-glow rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 text-2xl text-primary">"</div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                {t.quote}
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <p className="font-semibold text-foreground">{t.parent}</p>
                <p className="text-xs text-muted-foreground">{t.child}</p>
                <p className="mt-1 text-xs font-medium text-primary">{t.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
