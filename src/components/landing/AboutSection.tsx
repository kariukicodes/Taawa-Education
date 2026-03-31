export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About Us</p>
        <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
          A New Standard for Home Education
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Our Philosophy</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Every child learns differently. We believe in personalised, one-on-one education
                that respects each student's pace, interests, and potential. Our approach combines
                academic rigour with the flexibility that homeschooling uniquely offers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Our Approach</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                We pair each family with a dedicated, vetted tutor who builds a structured yet
                flexible learning plan. Weekly progress reports, regular assessments, and open
                communication ensure every stakeholder is aligned.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Tutor Vetting</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Every EduNest tutor undergoes a rigorous selection process: academic verification,
                teaching demonstration, background checks, and ongoing performance reviews. Only
                the top 5% of applicants are accepted.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Our Story</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Founded in Nairobi by parents who experienced the gap between what schools offered
                and what their children needed, EduNest was born from the belief that premium
                education should be accessible outside traditional classroom walls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
