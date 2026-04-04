import { Badge } from "@/components/ui/badge";

const programs = [
  {
    title: "CBC Curriculum",
    badge: "Kenya National",
    who: "Kenyan families following the national education pathway",
    ages: "Ages 6–17",
    structure: "Competency-based learning with project work, formative assessments, and KNEC alignment.",
  },
  {
    title: "British Curriculum",
    badge: "International",
    who: "Families seeking internationally recognised qualifications",
    ages: "Ages 5–18",
    structure: "Key Stages 1–4, IGCSE preparation, structured term-based approach.",
  },
  {
    title: "Montessori",
    badge: "Early Years",
    who: "Younger learners who thrive with hands-on, self-directed exploration",
    ages: "Ages 3–12",
    structure: "Child-led learning, mixed-age grouping, sensorial and practical life activities.",
  },
  {
    title: "Custom Learning Plan",
    badge: "Bespoke",
    who: "Families with specific goals, dual-curriculum needs, or learners with special educational needs",
    ages: "All ages",
    structure: "Fully personalised learning plans designed to support each child’s strengths, pace, and unique needs — including specialised support for learners with additional needs.",
  },
];

export function ProgramsSection() {
  return (
    <section
      id="programs"
      className="relative py-24 px-3 lg:px-3 bg-[#0A0A08]"
    >
      {/* Top divider */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <Badge variant="secondary" className="border border-primary/30 bg-primary/10 px-4 py-1 text-[11px] tracking-[0.2em] text-primary uppercase hover:bg-primary/10">
            Programs
          </Badge>
          <h2 className="font-display mt-3 text-3xl font-bold text-foreground md:text-4xl">
            Curriculum Options
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Choose the learning framework that best fits your family's goals.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programs.map((p) => (
            <div
              key={p.title}
              className="card-hover-glow rounded-xl border border-border bg-card p-6 flex flex-col"
            >
              <span className="mb-4 inline-block w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {p.badge}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.who}</p>
              <p className="mt-1 text-xs text-primary">{p.ages}</p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                {p.structure}
              </p>
              <a
                href="#contact"
                className="mt-6 block rounded-lg border border-primary bg-transparent py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Learn More
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}