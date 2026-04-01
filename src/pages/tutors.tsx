import { useEffect, useState } from "react";

// ─── Tutor data ───────────────────────────────────────────────
const tutors = [
  {
    name: "Amina Odhiambo",
    role: "Mathematics & Sciences",
    subjects: ["CBC Math", "Physics", "Chemistry"],
    rating: 4.9,
    students: 32,
    experience: "8 yrs",
    image: "/tutors/amina.jpg",
    initials: "AO",
    accent: "#C9A84C",
    bgAccent: "#1C1609",
  },
  {
    name: "Brian Mutua",
    role: "English & Humanities",
    subjects: ["English", "History", "CRE"],
    rating: 4.8,
    students: 24,
    experience: "6 yrs",
    image: "/tutors/brian.jpg",
    initials: "BM",
    accent: "#7A9E7E",
    bgAccent: "#0D150E",
  },
  {
    name: "Cynthia Waweru",
    role: "Early Childhood · CBC",
    subjects: ["Grade 1–3", "Literacy", "Numeracy"],
    rating: 5.0,
    students: 18,
    experience: "5 yrs",
    image: "/tutors/cynthia.jpg",
    initials: "CW",
    accent: "#C9A84C",
    bgAccent: "#1C1609",
  },
  {
    name: "David Kariuki",
    role: "British Curriculum",
    subjects: ["IGCSE Math", "Science", "English"],
    rating: 4.9,
    students: 41,
    experience: "10 yrs",
    image: "/tutors/david.jpg",
    initials: "DK",
    accent: "#7A9E7E",
    bgAccent: "#0D150E",
  },
  {
    name: "Esther Njoki",
    role: "Languages & Arts",
    subjects: ["Kiswahili", "Art", "Music"],
    rating: 4.7,
    students: 22,
    experience: "7 yrs",
    image: "/tutors/esther.jpg",
    initials: "EN",
    accent: "#C9A84C",
    bgAccent: "#1C1609",
  },
];

// ─── Star renderer ─────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#C9A84C" : "none"} stroke="#C9A84C" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ─── Single portrait card ──────────────────────────────────────
function PortraitCard({
  tutor,
  isFront,
  offsetX,
  offsetY,
  zIndex,
  showInfo,
  delay,
  mounted,
}: {
  tutor: (typeof tutors)[0];
  isFront: boolean;
  offsetX: number;
  offsetY: number;
  zIndex: number;
  showInfo: boolean;
  delay: number;
  mounted: boolean;
}) {
  return (
    <div
      className="absolute overflow-hidden rounded-[24px] transition-all duration-700"
      style={{
        width: isFront ? "220px" : "190px",
        height: isFront ? "300px" : "270px",
        left: `${offsetX}px`,
        top: `${offsetY}px`,
        zIndex,
        background: tutor.bgAccent,
        border: `1px solid rgba(255,255,255,${isFront ? "0.1" : "0.05"})`,
        boxShadow: isFront
          ? "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)"
          : "0 16px 40px rgba(0,0,0,0.5)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Ambient warm glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 15%, ${tutor.accent}28 0%, transparent 60%)`,
        }}
      />

      {/* Photo */}
      <img
        src={tutor.image}
        alt={tutor.name}
        className="absolute inset-0 h-full w-full object-cover object-top"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {/* Initials fallback */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-[22px] font-black"
          style={{
            background: `${tutor.accent}18`,
            border: `1px solid ${tutor.accent}30`,
            color: tutor.accent,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {tutor.initials}
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: showInfo ? "160px" : "80px",
          background: `linear-gradient(to top, ${isFront ? "#0A0A08" : "#0F0F0D"} 0%, transparent 100%)`,
          zIndex: 2,
          transition: "height 0.4s ease",
        }}
      />

      {/* Info overlay — only on front card */}
      {showInfo && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <p
            className="mb-0.5 text-[14px] font-semibold text-[#F5F5F0]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {tutor.name}
          </p>
          <p className="mb-2 text-[11px] text-[#F5F5F0]/45">{tutor.role}</p>
          <div className="mb-1.5 flex items-center gap-2">
            <Stars rating={tutor.rating} />
            <span className="text-[10px] text-[#F5F5F0]/40">{tutor.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#C9A84C]">✦</span>
            <span className="text-[10px] text-[#F5F5F0]/40">{tutor.students}+ students</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hero section ──────────────────────────────────────────────
function TutorsHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Cards: front (index 0), mid (index 1), back (index 2)
  // Staggered like inspo — front card prominent, others peeking right
  const cardStack = [
    { tutor: tutors[1], isFront: false, offsetX: 260, offsetY: 30,  zIndex: 1,  showInfo: false, delay: 900  },
    { tutor: tutors[2], isFront: false, offsetX: 180, offsetY: 15,  zIndex: 2,  showInfo: false, delay: 700  },
    { tutor: tutors[0], isFront: true,  offsetX: 60,  offsetY: 0,   zIndex: 3,  showInfo: true,  delay: 500  },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0F0F0F]">

      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Gold top rule */}
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      <div className="relative z-10 grid min-h-screen items-center px-8 md:px-16 lg:grid-cols-2 lg:gap-16">

        {/* ── LEFT: Copy ── */}
        <div className="flex flex-col justify-center py-24 lg:py-0">

          {/* Toggle label — matches inspo "FOR HIRING / FOR CREATIVES" */}
          <div
            className={`mb-8 flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          >
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#C9A84C]">
              FOR PARENTS
            </span>
            {/* Toggle pill */}
            <div className="relative h-6 w-11 cursor-pointer rounded-full border border-white/15 bg-white/5">
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-[#C9A84C]" />
            </div>
            <span className="text-[11px] font-medium tracking-[0.14em] text-[#F5F5F0]/35">
              FOR STUDENTS
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`mb-6 text-[52px] font-black leading-[1.0] tracking-[-2px] text-[#F5F5F0] transition-all duration-700 delay-100 md:text-[62px] lg:text-[68px] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Meet Nairobi's
            <br />
            finest{" "}
            <span className="text-[#C9A84C]">tutors</span>
            <br />
            for your child.
          </h1>

          {/* Sub */}
          <p
            className={`mb-10 max-w-[420px] text-[15px] font-light leading-[1.85] text-[#F5F5F0]/45 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Every EduNest tutor is degree-qualified, background-checked, and
            trained in personalised homeschooling — not just teaching, but
            building a genuine relationship with your child.
          </p>

          {/* CTAs */}
          <div
            className={`mb-12 flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <a
              href="#tutors-grid"
              className="rounded-lg bg-[#C9A84C] px-8 py-3.5 text-[13px] font-semibold text-[#0F0F0F] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C9A84C]/25 active:scale-[0.98]"
            >
              Explore Our Tutors
            </a>
            <a
              href="#contact"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-[13px] font-medium text-[#F5F5F0]/60 transition-all duration-300 hover:border-[#C9A84C]/35 hover:text-[#F5F5F0]"
            >
              Request a Tutor
              <span className="text-[#C9A84C]">→</span>
            </a>
          </div>

          {/* Stats row */}
          <div
            className={`flex flex-wrap items-center gap-8 border-t border-white/[0.07] pt-8 transition-all duration-700 delay-[450ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {[
              { value: "12+", label: "Expert tutors" },
              { value: "48",  label: "Families served" },
              { value: "4.9", label: "Average rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-[28px] font-black leading-none text-[#F5F5F0]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {stat.value}
                  <span className="text-[#C9A84C]">+</span>
                </p>
                <p className="mt-1 text-[11px] text-[#F5F5F0]/35">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Staggered portrait cards ── */}
        <div className="relative hidden lg:flex lg:items-center lg:justify-center">

          {/* Card stack container — sized to contain all 3 cards */}
          <div className="relative" style={{ width: "480px", height: "340px" }}>

            {cardStack.map((c, i) => (
              <PortraitCard
                key={c.tutor.name}
                tutor={c.tutor}
                isFront={c.isFront}
                offsetX={c.offsetX}
                offsetY={c.offsetY}
                zIndex={c.zIndex}
                showInfo={c.showInfo}
                delay={c.delay}
                mounted={mounted}
              />
            ))}

            {/* Floating "vetted" badge — overlaps the front card bottom */}
            <div
              className="absolute z-20 rounded-xl border border-white/10 bg-[#1A1A18]/95 px-4 py-3 backdrop-blur-xl transition-all duration-700"
              style={{
                bottom: "-24px",
                left: "48px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
                transitionDelay: "1100ms",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C]/15">
                  <span className="text-[12px] text-[#C9A84C]">✓</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#F5F5F0]">Vetted &amp; Verified</p>
                  <p className="text-[10px] text-[#F5F5F0]/35">All tutors background-checked</p>
                </div>
              </div>
            </div>

            {/* Floating subject count badge — top right */}
            <div
              className="absolute z-20 rounded-xl border border-white/10 bg-[#1A1A18]/95 px-4 py-3 backdrop-blur-xl transition-all duration-700"
              style={{
                top: "-20px",
                right: "12px",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-12px)",
                transitionDelay: "1300ms",
              }}
            >
              <p className="text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/30">
                SUBJECTS COVERED
              </p>
              <p
                className="text-[26px] font-black leading-none text-[#F5F5F0]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                15<span className="text-[#C9A84C]">+</span>
              </p>
              <p className="mt-0.5 text-[10px] text-[#F5F5F0]/30">across all curricula</p>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-12 z-20 hidden flex-col items-center gap-2 lg:flex">
        <span
          className="text-[10px] font-light tracking-[0.2em] text-[#F5F5F0]/20"
          style={{ writingMode: "vertical-rl" }}
        >
          SCROLL
        </span>
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-[#C9A84C]/40 to-transparent" />
      </div>
    </section>
  );
}

// ─── Full tutors grid below hero ───────────────────────────────
function TutorsGrid() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "CBC", "British", "Montessori", "Sciences", "Languages"];

  const filtered = filter === "All"
    ? tutors
    : tutors.filter((t) => t.subjects.some((s) => s.toLowerCase().includes(filter.toLowerCase())) || t.role.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section id="tutors-grid" className="bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-7xl px-8 md:px-16">

        {/* Filter tabs */}
        <div className="mb-12 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-5 py-2 text-[12px] font-medium transition-all duration-200"
              style={{
                background: filter === f ? "#C9A84C" : "rgba(255,255,255,0.04)",
                color: filter === f ? "#0F0F0F" : "rgba(245,245,240,0.45)",
                border: filter === f ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tutor) => (
            <div
              key={tutor.name}
              className="group relative overflow-hidden rounded-2xl border border-white/7 bg-[#141414] transition-all duration-500 hover:border-[#C9A84C]/25"
            >
              {/* Photo */}
              <div className="relative overflow-hidden" style={{ height: "260px", background: tutor.bgAccent }}>
                <div
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at 50% 20%, ${tutor.accent}22 0%, transparent 60%)` }}
                />
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-[20px] font-black"
                    style={{ background: `${tutor.accent}18`, border: `1px solid ${tutor.accent}30`, color: tutor.accent, fontFamily: "'Playfair Display', serif" }}
                  >
                    {tutor.initials}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "linear-gradient(to top, #141414, transparent)", zIndex: 2 }} />
                <div
                  className="absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] font-semibold backdrop-blur-md"
                  style={{ background: `${tutor.accent}20`, border: `1px solid ${tutor.accent}30`, color: tutor.accent }}
                >
                  {tutor.experience}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#F5F5F0]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {tutor.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#F5F5F0]/40">{tutor.role}</p>
                  </div>
                </div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Stars rating={tutor.rating} />
                  <span className="text-[10px] text-[#F5F5F0]/35">{tutor.rating} · {tutor.students}+ students</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(245,245,240,0.45)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Gold bottom line on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `linear-gradient(to right, transparent, ${tutor.accent}, transparent)` }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-[14px] text-[#F5F5F0]/35">
            Don't see the right fit? We'll match you personally.
          </p>
          <a
            href="#contact"
            className="rounded-lg bg-[#C9A84C] px-8 py-3.5 text-[13px] font-semibold text-[#0F0F0F] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C9A84C]/25"
          >
            Request a Custom Tutor Match
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Page export ───────────────────────────────────────────────
export default function TutorsPage() {
  return (
    <main>
      <TutorsHero />
      <TutorsGrid />
    </main>
  );
}