import { useEffect, useRef, useState } from "react";
import { LandingNav } from "@/components/landing/LandingNav";

// ── Scroll visibility hook ─────────────────────────────────────
function useVisible(threshold = 0.1) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── Shared label ───────────────────────────────────────────────
function Label({ text, center = false }: { text: string; center?: boolean }) {
  return (
    <div className={`mb-5 flex items-center gap-3 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-8 bg-[#C9A84C]/40" />
      <span className="text-[11px] font-medium tracking-[0.18em] text-[#C9A84C]">{text}</span>
      <span className="h-px w-8 bg-[#C9A84C]/40" />
    </div>
  );
}

// ── Programs data ──────────────────────────────────────────────
const programs = [
  {
    id: "cbc",
    tag: "CBC",
    name: "Competency Based Curriculum",
    tagline: "Kenya's national curriculum, delivered with precision.",
    description:
      "The CBC curriculum redesigned for homeschooling — structured around the official KICD framework but delivered at your child's pace, with one-on-one attention no classroom can match.",
    ageRange: "Ages 4 – 17",
    grades: "PP1 to Grade 9",
    price: "From KES 12,000",
    period: "per month",
    accent: "#C9A84C",
    darkAccent: "#1C1609",
    subjects: ["Mathematics", "English", "Kiswahili", "Science & Technology", "Social Studies", "CRE / IRE", "Creative Arts"],
    includes: [
      "KICD-aligned lesson plans",
      "Weekly progress reports",
      "Term-end assessments",
      "Homework & marking",
      "Tutor-parent communication",
      "Flexible scheduling",
    ],
    ideal: "Families who want official curriculum coverage with a personalised delivery and the flexibility homeschooling provides.",
    image: "/programs/cbc.jpg",
    popular: true,
  },
  {
    id: "british",
    tag: "British",
    name: "British & IGCSE Curriculum",
    tagline: "International standards. Global pathways.",
    description:
      "Cambridge and Edexcel-aligned homeschooling for families preparing their children for international universities or relocating abroad. Rigorous, globally recognised, and fully personalised.",
    ageRange: "Ages 5 – 18",
    grades: "Year 1 to A-Level",
    price: "From KES 15,000",
    period: "per month",
    accent: "#7A9E7E",
    darkAccent: "#0D150E",
    subjects: ["Mathematics", "Sciences (Bio/Chem/Phys)", "English Language & Literature", "History", "Geography", "Business Studies", "ICT"],
    includes: [
      "Cambridge / Edexcel alignment",
      "Past paper practice",
      "Exam technique coaching",
      "Weekly progress reports",
      "University prep guidance",
      "Parent progress meetings",
    ],
    ideal: "Families with international ambitions, expat families, or those targeting UK, US, or global university admissions.",
    image: "/programs/british.jpg",
    popular: false,
  },
  {
    id: "montessori",
    tag: "Montessori",
    name: "Montessori Approach",
    tagline: "Child-led. Curiosity-first. Deeply effective.",
    description:
      "The authentic Montessori method adapted for home delivery — hands-on learning, self-directed exploration, and intrinsic motivation. For parents who believe education should ignite rather than extinguish curiosity.",
    ageRange: "Ages 2 – 12",
    grades: "Early Years to Upper Primary",
    price: "From KES 13,500",
    period: "per month",
    accent: "#8B7355",
    darkAccent: "#171009",
    subjects: ["Practical Life Skills", "Sensorial Development", "Language Arts", "Mathematics", "Cultural Studies", "Science & Nature", "Creative Expression"],
    includes: [
      "Montessori-trained tutor",
      "Materials list & guidance",
      "Observation-based reporting",
      "Parent education sessions",
      "Environment setup advice",
      "Flexible pacing",
    ],
    ideal: "Parents of younger children who want to nurture independence, creativity, and a genuine love of learning from an early age.",
    image: "/programs/montessori.jpg",
    popular: false,
  },
  {
    id: "custom",
    tag: "Custom",
    name: "Custom Learning Plan",
    tagline: "Built entirely around your child.",
    description:
      "No template. No constraints. We design a learning plan from scratch based on your child's strengths, gaps, interests, and goals — drawing from multiple frameworks to create something that fits perfectly.",
    ageRange: "All ages",
    grades: "Any level",
    price: "From KES 10,000",
    period: "per month",
    accent: "#6B8FA3",
    darkAccent: "#090D11",
    subjects: ["Fully customised subject selection", "Learning style assessment", "Multi-curriculum blend", "Interest-led projects", "Gap-filling modules", "Enrichment electives"],
    includes: [
      "Full learning needs assessment",
      "Bespoke curriculum design",
      "Multi-framework approach",
      "Regular plan reviews",
      "Priority tutor matching",
      "Direct founder involvement",
    ],
    ideal: "Children with unique learning needs, twice-exceptional students, or families who want something that goes beyond any standard curriculum.",
    image: "/programs/custom.jpg",
    popular: false,
  },
];

// ══════════════════════════════════════════════════════════════
// 1. HERO
// ══════════════════════════════════════════════════════════════
function ProgramsHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-[65vh] overflow-hidden bg-[#0F0F0F]">
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Faint watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span
          className="select-none text-[18vw] font-black leading-none text-white/[0.018]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          PROGRAMS
        </span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-8 py-28 text-center md:px-16">
        <div
          className={`mb-6 flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        >
          <span className="h-px w-8 bg-[#C9A84C]/40" />
          <span className="text-[11px] font-medium tracking-[0.18em] text-[#C9A84C]">
            OUR PROGRAMS
          </span>
          <span className="h-px w-8 bg-[#C9A84C]/40" />
        </div>

        <h1
          className={`mb-6 max-w-3xl text-[52px] font-black leading-[1.0] tracking-[-2.5px] text-[#F5F5F0] transition-all duration-700 delay-100 md:text-[66px] lg:text-[76px] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Four paths.
          <br />
          <span className="text-[#C9A84C]">One perfect fit.</span>
        </h1>

        <p
          className={`mb-12 max-w-lg text-[15px] font-light leading-[1.85] text-[#F5F5F0]/45 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          From Kenya's national CBC to Cambridge IGCSE, from Montessori early
          years to fully custom plans — every EduNest program is delivered
          one-on-one, at your child's pace.
        </p>

        {/* Program quick-nav pills */}
        <div
          className={`flex flex-wrap justify-center gap-3 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {programs.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-[12px] font-medium text-[#F5F5F0]/55 transition-all duration-300 hover:border-[#C9A84C]/35 hover:text-[#F5F5F0]"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
              {p.tag}
              {p.popular && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                  style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
                >
                  Popular
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 2. PROGRAM DEEP-DIVE CARDS — alternating layout
// ══════════════════════════════════════════════════════════════
function ProgramCard({ program, index }: { program: typeof programs[0]; index: number }) {
  const { ref, visible } = useVisible();
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      id={program.id}
      className="relative py-24"
      style={{ background: index % 2 === 0 ? "#0F0F0F" : "#0A0A0A" }}
    >
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="mx-auto max-w-7xl px-8 md:px-16">
        <div className={`grid items-start gap-14 lg:grid-cols-2 ${!isEven ? "lg:direction-rtl" : ""}`}>

          {/* ── LEFT (or right on odd): Info ── */}
          <div
            className={`transition-all duration-1000 ${!isEven ? "lg:order-2" : ""}`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : `translateX(${isEven ? "-28px" : "28px"})`,
            }}
          >
            {/* Tag + Popular badge */}
            <div className="mb-5 flex items-center gap-3">
              <span
                className="rounded-full px-4 py-1.5 text-[11px] font-semibold"
                style={{ background: `${program.accent}18`, border: `1px solid ${program.accent}28`, color: program.accent }}
              >
                {program.tag}
              </span>
              {program.popular && (
                <span
                  className="rounded-full px-3 py-1.5 text-[10px] font-semibold"
                  style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}
                >
                  ✦ Most Popular
                </span>
              )}
            </div>

            <h2
              className="mb-2 text-[36px] font-black leading-[1.05] tracking-[-1.5px] text-[#F5F5F0] md:text-[42px]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {program.name}
            </h2>
            <p className="mb-5 text-[14px] font-light" style={{ color: program.accent }}>
              {program.tagline}
            </p>
            <p className="mb-8 text-[14px] font-light leading-[1.85] text-[#F5F5F0]/45">
              {program.description}
            </p>

            {/* Age + Grade strip */}
            <div className="mb-8 flex gap-4">
              {[
                { label: "Age Range", val: program.ageRange },
                { label: "Grade Level", val: program.grades },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex-1 rounded-xl border border-white/7 bg-[#141412] px-4 py-3"
                >
                  <p className="mb-0.5 text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/30">
                    {item.label.toUpperCase()}
                  </p>
                  <p className="text-[13px] font-semibold text-[#F5F5F0]/80">{item.val}</p>
                </div>
              ))}
            </div>

            {/* Subjects */}
            <div className="mb-8">
              <p className="mb-3 text-[11px] font-medium tracking-[0.1em] text-[#F5F5F0]/30">
                SUBJECTS COVERED
              </p>
              <div className="flex flex-wrap gap-2">
                {program.subjects.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-3 py-1.5 text-[11px] font-medium"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(245,245,240,0.55)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing + CTA */}
            <div className="flex items-center gap-5 rounded-2xl border border-white/8 bg-[#141412] p-5">
              <div>
                <p className="text-[10px] font-medium tracking-[0.1em] text-[#F5F5F0]/30">
                  STARTING FROM
                </p>
                <p
                  className="text-[28px] font-black leading-none text-[#F5F5F0]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {program.price}
                </p>
                <p className="mt-0.5 text-[11px] text-[#F5F5F0]/30">{program.period}</p>
              </div>
              <div className="ml-auto flex flex-col gap-2">
                <a
                  href="#contact"
                  className="rounded-lg px-6 py-3 text-[13px] font-semibold text-[#0F0F0F] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  style={{ background: program.accent, boxShadow: `0 0 0 0 ${program.accent}` }}
                >
                  Enquire Now
                </a>
                <p className="text-center text-[10px] text-[#F5F5F0]/25">Free consultation</p>
              </div>
            </div>
          </div>

          {/* ── RIGHT (or left on odd): Visual card ── */}
          <div
            className={`transition-all duration-1000 delay-200 ${!isEven ? "lg:order-1" : ""}`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : `translateX(${isEven ? "28px" : "-28px"})`,
            }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute -inset-[1px] rounded-[32px]"
              style={{ background: `linear-gradient(135deg, ${program.accent}28 0%, transparent 50%)` }}
            />

            <div
              className="relative overflow-hidden rounded-[32px]"
              style={{
                height: "480px",
                background: program.darkAccent,
                boxShadow: `0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px ${program.accent}12`,
              }}
            >
              {/* Ambient wash */}
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(ellipse at 40% 20%, ${program.accent}20 0%, transparent 55%)` }}
              />

              {/* Image */}
              <img
                src={program.image}
                alt={program.name}
                className="absolute inset-0 h-full w-full object-cover object-center"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />

              {/* Placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-25">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full border text-[20px] font-black"
                  style={{ borderColor: `${program.accent}40`, color: program.accent, fontFamily: "'Playfair Display', serif" }}
                >
                  {program.tag[0]}
                </div>
                <p className="text-[11px] tracking-widest" style={{ color: `${program.accent}60` }}>
                  {program.tag.toUpperCase()} PHOTO
                </p>
              </div>

              {/* Bottom fade */}
              <div
                className="absolute bottom-0 left-0 right-0 z-10"
                style={{ height: "200px", background: `linear-gradient(to top, ${program.darkAccent} 0%, transparent 100%)` }}
              />

              {/* What's included overlay card */}
              <div className="absolute bottom-5 left-5 right-5 z-20 rounded-2xl border border-white/10 bg-[#0D0D0B]/88 p-4 backdrop-blur-md">
                <p className="mb-3 text-[10px] font-medium tracking-[0.1em] text-[#F5F5F0]/30">
                  WHAT'S INCLUDED
                </p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                  {program.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div
                        className="h-1 w-1 flex-shrink-0 rounded-full"
                        style={{ background: program.accent }}
                      />
                      <span className="text-[11px] text-[#F5F5F0]/60">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideal for badge — top left */}
              <div
                className="absolute left-5 top-5 z-20 max-w-[200px] rounded-xl border border-white/10 bg-[#0D0D0B]/85 p-3 backdrop-blur-md"
              >
                <p className="mb-1 text-[9px] font-medium tracking-[0.1em] text-[#F5F5F0]/30">
                  IDEAL FOR
                </p>
                <p className="text-[11px] leading-[1.5] text-[#F5F5F0]/65">{program.ideal}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 3. COMPARISON TABLE
// ══════════════════════════════════════════════════════════════
const compRows = [
  { label: "Age range",          cbc: "4 – 17",        british: "5 – 18",         montessori: "2 – 12",      custom: "All ages"    },
  { label: "Curriculum body",    cbc: "KICD Kenya",     british: "Cambridge/Edexcel", montessori: "AMI/AMS",  custom: "Bespoke"     },
  { label: "Starting price",     cbc: "KES 12,000",    british: "KES 15,000",     montessori: "KES 13,500",  custom: "KES 10,000"  },
  { label: "Exam prep",          cbc: "KCPE / KCSE",   british: "IGCSE / A-Level", montessori: "None",       custom: "As required" },
  { label: "Session format",     cbc: "1-on-1",        british: "1-on-1",         montessori: "1-on-1",      custom: "1-on-1"      },
  { label: "Progress reports",   cbc: "Weekly",        british: "Weekly",         montessori: "Observational", custom: "Weekly"   },
  { label: "Flexible pacing",    cbc: "✓",             british: "✓",              montessori: "✓✓",          custom: "✓✓✓"        },
  { label: "International rec.", cbc: "Kenya only",    british: "Global",         montessori: "Global",      custom: "Varies"      },
];

function ComparisonTable() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="bg-[#0F0F0F] py-24">
      <div className="absolute left-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="mx-auto max-w-7xl px-8 md:px-16">
        <div
          className="mb-12 text-center transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <Label text="COMPARE PROGRAMS" center />
          <h2
            className="mx-auto max-w-xl text-[38px] font-black leading-[1.05] tracking-[-1.5px] text-[#F5F5F0] md:text-[46px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Not sure which to choose?
            <br />
            <span className="text-[#C9A84C]">Compare side by side.</span>
          </h2>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-white/8 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transitionDelay: "200ms" }}
        >
          {/* Table header */}
          <div className="grid grid-cols-5 border-b border-white/8 bg-[#141412]">
            <div className="px-5 py-4" />
            {programs.map((p) => (
              <div key={p.id} className="px-5 py-4 text-center">
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{ background: `${p.accent}18`, color: p.accent }}
                >
                  {p.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {compRows.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-5 border-b border-white/[0.05] transition-colors duration-200 hover:bg-white/[0.02]"
              style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
            >
              <div className="px-5 py-3.5">
                <span className="text-[12px] font-medium text-[#F5F5F0]/45">{row.label}</span>
              </div>
              {[row.cbc, row.british, row.montessori, row.custom].map((val, j) => (
                <div key={j} className="flex items-center justify-center px-5 py-3.5">
                  <span className="text-center text-[12px] text-[#F5F5F0]/70">{val}</span>
                </div>
              ))}
            </div>
          ))}

          {/* CTA row */}
          <div className="grid grid-cols-5 bg-[#141412]">
            <div className="px-5 py-4">
              <span className="text-[11px] text-[#F5F5F0]/25">Enquire</span>
            </div>
            {programs.map((p) => (
              <div key={p.id} className="flex items-center justify-center px-5 py-4">
                <a
                  href="#contact"
                  className="rounded-lg px-4 py-2 text-[11px] font-semibold transition-all duration-200 hover:scale-[1.03]"
                  style={{ background: `${p.accent}18`, border: `1px solid ${p.accent}25`, color: p.accent }}
                >
                  Choose
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 4. HOW IT WORKS — 4-step process
// ══════════════════════════════════════════════════════════════
const steps = [
  { num: "01", title: "Book a consultation", body: "A free 30-minute call with our team. No obligation, no pressure — just an honest conversation about your child's needs.", accent: "#C9A84C" },
  { num: "02", title: "We design your plan", body: "Based on the consultation, we select the right curriculum, identify the best-fit tutor, and build a personalised learning plan.", accent: "#7A9E7E" },
  { num: "03", title: "Meet your tutor", body: "We introduce you to your matched tutor. If the fit isn't right, we rematch — no questions asked.", accent: "#C9A84C" },
  { num: "04", title: "Learning begins", body: "Sessions start on your schedule. Weekly reports keep you informed. Your dashboard gives you visibility into everything.", accent: "#7A9E7E" },
];

function HowItWorks() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative bg-[#0A0A0A] py-24">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      {/* Diagonal texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 60px)" }}
      />

      <div className="relative mx-auto max-w-7xl px-8 md:px-16">
        <div
          className="mb-14 text-center transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <Label text="THE PROCESS" center />
          <h2
            className="mx-auto max-w-xl text-[38px] font-black leading-[1.05] tracking-[-1.5px] text-[#F5F5F0] md:text-[46px]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            From enquiry to first lesson
            <br />
            <span className="text-[#C9A84C]">in four simple steps.</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="group relative overflow-hidden rounded-2xl border border-white/7 bg-[#141412] p-6 transition-all duration-500 hover:border-white/12"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.7s ease ${150 + i * 100}ms, transform 0.7s ease ${150 + i * 100}ms, border-color 0.3s`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse at 10% 10%, ${step.accent}10 0%, transparent 65%)` }}
              />

              {/* Big faint number */}
              <div
                className="mb-4 text-[52px] font-black leading-none"
                style={{ color: `${step.accent}20`, fontFamily: "'Playfair Display', serif" }}
              >
                {step.num}
              </div>

              <h3
                className="mb-2.5 text-[15px] font-semibold text-[#F5F5F0]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {step.title}
              </h3>
              <p className="text-[12.5px] font-light leading-[1.8] text-[#F5F5F0]/42">{step.body}</p>

              {/* Connector arrow — all but last */}
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-[#F5F5F0]/15 lg:block">
                  →
                </div>
              )}

              <div
                className="absolute bottom-0 left-5 right-5 h-[1.5px] origin-left scale-x-0 rounded-full transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: `linear-gradient(to right, ${step.accent}70, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 5. CTA
// ══════════════════════════════════════════════════════════════
function ProgramsCTA() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0F0F0F] py-28">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 65%)" }}
      />

      <div
        className="relative mx-auto max-w-3xl px-8 text-center transition-all duration-1000 md:px-16"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)" }}
      >
        <Label text="GET STARTED" center />

        <h2
          className="mb-6 text-[42px] font-black leading-[1.02] tracking-[-1.5px] text-[#F5F5F0] md:text-[52px]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Not sure which program
          <br />
          <span className="text-[#C9A84C]">is right for your child?</span>
        </h2>

        <p className="mb-10 text-[15px] font-light leading-[1.85] text-[#F5F5F0]/42">
          Book a free consultation and we'll recommend the best fit based on
          your child's age, learning style, academic goals, and your family's
          lifestyle. No obligation required.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#contact"
            className="rounded-lg bg-[#C9A84C] px-9 py-4 text-[14px] font-semibold text-[#0F0F0F] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C9A84C]/25 active:scale-[0.98]"
          >
            Book a Free Consultation
          </a>
          <a
            href="/tutors"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-9 py-4 text-[14px] font-medium text-[#F5F5F0]/60 transition-all duration-300 hover:border-[#C9A84C]/35 hover:text-[#F5F5F0]"
          >
            Meet Our Tutors
            <span className="text-[#C9A84C]">→</span>
          </a>
        </div>

        <p className="mt-8 text-[12px] text-[#F5F5F0]/22">
          No commitment · Response within 24 hours · All curricula available nationwide
        </p>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE EXPORT
// ══════════════════════════════════════════════════════════════
export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <LandingNav />
      <main>
        <ProgramsHero />
        {programs.map((program, i) => (
          <ProgramCard key={program.id} program={program} index={i} />
        ))}
        <ComparisonTable />
        <HowItWorks />
        <ProgramsCTA />
      </main>
    </div>
  );
}