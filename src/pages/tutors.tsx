import { useEffect, useState } from "react";
import { LandingNav } from "@/components/landing/LandingNav";

const tutors = [
  {
    name: "Amina Odhiambo",
    role: "Mathematics & Sciences",
    subjects: ["CBC Math", "Physics", "Chemistry"],
    rating: 4.9,
    students: 32,
    experience: "8 yrs",
    image: "/amina.jpg",
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
    image: "/mutua.jpg",
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
    image: "/cynthia.jpg",
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
    image: "/kariuki.png",
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
    image: "/easther.jpg",
    initials: "EN",
    accent: "#C9A84C",
    bgAccent: "#1C1609",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#C9A84C" : "none"}
          stroke="#C9A84C" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Stacked card stack with hover-to-cycle interaction ──────────
function TutorStack({ tutors: stackTutors }: { tutors: typeof tutors }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Cycle to next card
  const cycleNext = () => setActiveIdx((i) => (i + 1) % stackTutors.length);

  // Build display order: active card is front, rest fan behind
  const order = stackTutors.map((_, i) => {
    const pos = (i - activeIdx + stackTutors.length) % stackTutors.length;
    return pos; // 0 = front, 1 = second, 2 = third...
  });

  const visibleCount = 3;

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ width: "280px", height: "400px" }}
      onClick={cycleNext}
      onMouseEnter={cycleNext}
    >
      {stackTutors.map((tutor, i) => {
        const pos = order[i];
        if (pos >= visibleCount) return null;

        const isFront = pos === 0;
        const scale = 1 - pos * 0.06;
        const translateX = pos * 28;
        const translateY = pos * 12;
        const zIndex = visibleCount - pos;
        const opacity = 1 - pos * 0.25;

        return (
          <div
            key={tutor.name}
            className="absolute inset-0 overflow-hidden rounded-[28px]"
            style={{
              background: tutor.bgAccent,
              border: `1px solid rgba(255,255,255,${isFront ? 0.1 : 0.04})`,
              boxShadow: isFront
                ? "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.1)"
                : "0 12px 32px rgba(0,0,0,0.5)",
              transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
              transformOrigin: "top left",
              zIndex,
              opacity,
              transition: "all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Warm ambient */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 50% 15%, ${tutor.accent}28 0%, transparent 60%)`,
                zIndex: 0,
              }}
            />

            {/* Initials fallback */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
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

            {/* Photo */}
            {!imgErrors[tutor.name] && (
              <img
                src={tutor.image}
                alt={tutor.name}
                className="absolute inset-0 h-full w-full object-cover object-top"
                style={{ zIndex: 2 }}
                onError={() => setImgErrors((p) => ({ ...p, [tutor.name]: true }))}
              />
            )}

            {/* Bottom scrim */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: isFront ? "180px" : "60px",
                background: `linear-gradient(to top, ${tutor.bgAccent} 0%, transparent 100%)`,
                zIndex: 3,
                transition: "height 0.55s ease",
              }}
            />

            {/* Info — front card only */}
            {isFront && (
              <div className="absolute bottom-0 left-0 right-0 z-10 p-5" style={{ zIndex: 4 }}>
                <p
                  className="mb-0.5 text-[15px] font-bold text-[#F5F5F0]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {tutor.name}
                </p>
                <p className="mb-2.5 text-[11px] text-[#F5F5F0]/45">{tutor.role}</p>
                <div className="mb-1.5 flex items-center gap-2">
                  <Stars rating={tutor.rating} />
                  <span className="text-[10px] text-[#F5F5F0]/40">{tutor.rating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#C9A84C]">✦</span>
                  <span className="text-[10px] text-[#F5F5F0]/40">{tutor.students}+ students</span>
                </div>
              </div>
            )}

            {/* Experience badge */}
            {isFront && (
              <div
                className="absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold backdrop-blur-md"
                style={{
                  zIndex: 5,
                  background: `${tutor.accent}20`,
                  border: `1px solid ${tutor.accent}30`,
                  color: tutor.accent,
                }}
              >
                {tutor.experience} exp
              </div>
            )}
          </div>
        );
      })}

      {/* Hover hint */}
      <div
        className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-1.5 text-[10px] text-[#F5F5F0]/20"
      >
        <span>hover to browse</span>
        <span className="text-[#C9A84C]/40">→</span>
      </div>

      {/* Dot indicators */}
      <div className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-2">
        {stackTutors.map((_, i) => (
          <div
            key={i}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: i === activeIdx ? "20px" : "5px",
              background: i === activeIdx ? "#C9A84C" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────
function TutorsHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fadeUp = (delay: string) =>
    `transition-all duration-700 ${delay} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0A0A08]">
      <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 75% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1280px] items-center gap-16 px-8 lg:grid-cols-2 lg:px-12">

        {/* ── LEFT ── */}
        <div className="flex flex-col justify-center py-28 lg:py-0">


          {/* Headline */}
          <h1
            className={`mb-6 text-[52px] font-black leading-[1.0] tracking-[-0.03em] text-[#F5F5F0] md:text-[62px] lg:text-[70px] ${fadeUp("delay-100")}`}
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
          <p className={`mb-10 max-w-[400px] text-[15px] font-light leading-[1.9] text-[#F5F5F0]/45 ${fadeUp("delay-200")}`}>
            Every EduNest tutor is degree-qualified, background-checked, and
            trained in personalised homeschooling — not just teaching, but
            building a genuine relationship with your child.
          </p>

          {/* CTAs */}
          <div className={`mb-12 flex flex-wrap gap-4 ${fadeUp("delay-300")}`}>
            <a
              href="#tutors-grid"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#C9A84C] px-8 py-3.5 text-[13px] font-bold text-[#0A0A08] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C9A84C]/20 active:scale-[0.98]"
            >
              Explore Our Tutors
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-3.5 text-[13px] font-medium text-[#F5F5F0]/55 transition-all duration-300 hover:border-[#C9A84C]/40 hover:text-[#F5F5F0]"
            >
              Request a Tutor
              <span className="text-[#C9A84C]">→</span>
            </a>
          </div>

          {/* Stats */}
          <div className={`flex flex-wrap items-center gap-8 border-t border-white/[0.06] pt-8 ${fadeUp("delay-[450ms]")}`}>
            {[
              { value: "12+", label: "Expert tutors" },
              { value: "48+", label: "Families served" },
              { value: "4.9+", label: "Average rating" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="text-[28px] font-black leading-none text-[#C9A84C]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] text-[#F5F5F0]/35">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Hover-to-cycle stack ── */}
        <div className="relative hidden lg:flex lg:items-center lg:justify-center lg:py-20">
          <div className="relative flex flex-col items-center">

            {/* Floating badge — subjects */}
            <div
              className="absolute -top-6 right-0 z-30 rounded-2xl border border-white/[0.08] bg-[#131310]/90 px-4 py-3 backdrop-blur-xl transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-12px)",
                transitionDelay: "1200ms",
              }}
            >
              <p className="text-[9px] font-semibold tracking-[0.12em] text-[#F5F5F0]/28 uppercase">
                Subjects Covered
              </p>
              <p
                className="text-[26px] font-black leading-none text-[#F5F5F0]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                15<span className="text-[#C9A84C]">+</span>
              </p>
              <p className="mt-0.5 text-[10px] text-[#F5F5F0]/30">across all curricula</p>
            </div>

            {/* The stack */}
            <TutorStack tutors={tutors} />

            {/* Floating badge — vetted */}
            <div
              className="absolute -bottom-4 left-0 z-30 rounded-2xl border border-white/[0.08] bg-[#131310]/90 px-4 py-3 backdrop-blur-xl transition-all duration-700"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
                transitionDelay: "1400ms",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C]/15 ring-1 ring-[#C9A84C]/20">
                  <span className="text-[11px] text-[#C9A84C]">✓</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#F5F5F0]">Vetted &amp; Verified</p>
                  <p className="text-[10px] text-[#F5F5F0]/35">All tutors background-checked</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-10 z-20 hidden flex-col items-center gap-2 lg:flex">
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-[#C9A84C]/50 to-transparent" />
        <span
          className="text-[9px] font-medium tracking-[0.25em] text-[#F5F5F0]/18 uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}

// ── Tutors grid ─────────────────────────────────────────────────
function TutorsGrid() {
  const [filter, setFilter] = useState("All");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const filters = ["All", "CBC", "British", "Sciences", "Languages"];

  const filtered =
    filter === "All"
      ? tutors
      : tutors.filter(
          (t) =>
            t.subjects.some((s) => s.toLowerCase().includes(filter.toLowerCase())) ||
            t.role.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <section id="tutors-grid" className="bg-[#0A0A08] py-24">
      <div className="mx-auto max-w-7xl px-8 md:px-12">

        {/* Filter tabs */}
        <div className="mb-12 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-5 py-2 text-[12px] font-medium transition-all duration-200"
              style={{
                background: filter === f ? "#C9A84C" : "rgba(255,255,255,0.04)",
                color: filter === f ? "#0A0A08" : "rgba(245,245,240,0.45)",
                border: filter === f ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tutor) => (
            <div
              key={tutor.name}
              className="group relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#111110] transition-all duration-500 hover:-translate-y-1 hover:border-[#C9A84C]/25"
            >
              <div className="relative overflow-hidden" style={{ height: "260px", background: tutor.bgAccent }}>
                <div
                  className="absolute inset-0"
                  style={{
                    zIndex: 0,
                    background: `radial-gradient(ellipse at 50% 20%, ${tutor.accent}22 0%, transparent 60%)`,
                  }}
                />
                {/* Initials */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1 }}>
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-[20px] font-black"
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
                {/* Photo */}
                {!imgErrors[tutor.name] && (
                  <img
                    src={tutor.image}
                    alt={tutor.name}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                    style={{ zIndex: 2 }}
                    onError={() => setImgErrors((p) => ({ ...p, [tutor.name]: true }))}
                  />
                )}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: "80px",
                    background: "linear-gradient(to top, #111110, transparent)",
                    zIndex: 3,
                  }}
                />
                <div
                  className="absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold backdrop-blur-md"
                  style={{
                    zIndex: 4,
                    background: `${tutor.accent}18`,
                    border: `1px solid ${tutor.accent}28`,
                    color: tutor.accent,
                  }}
                >
                  {tutor.experience}
                </div>
              </div>

              <div className="p-5">
                <h3
                  className="text-[15px] font-semibold text-[#F5F5F0]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {tutor.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-[#F5F5F0]/38">{tutor.role}</p>
                <div className="mb-3 mt-2 flex items-center gap-2">
                  <Stars rating={tutor.rating} />
                  <span className="text-[10px] text-[#F5F5F0]/32">
                    {tutor.rating} · {tutor.students}+ students
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.subjects.map((s) => (
                    <span
                      key={s}
                      className="rounded-full px-2.5 py-[4px] text-[10px] font-medium"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(245,245,240,0.42)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `linear-gradient(to right, transparent, ${tutor.accent}, transparent)` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-[14px] text-[#F5F5F0]/35">
            Don't see the right fit? We'll match you personally.
          </p>
          <a
            href="#contact"
            className="rounded-xl bg-[#C9A84C] px-8 py-3.5 text-[13px] font-bold text-[#0A0A08] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C9A84C]/20"
          >
            Request a Custom Tutor Match
          </a>
        </div>
      </div>
    </section>
  );
}

export default function TutorsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A08]">
      <LandingNav />
      <main>
        <TutorsHero />
        <TutorsGrid />
      </main>
    </div>
  );
}