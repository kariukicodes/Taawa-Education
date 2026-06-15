import { useRef, useState } from "react";

const tutors = [
  {
    name: "Amina Odhiambo",
    role: "Mathematics & Sciences",
    subjects: ["CBC Math", "Physics", "Chemistry"],
    experience: "8 yrs",
    image: "/amina.jpg",
    initials: "AO",
    accent: "#C9A84C",
  },
    {
      name: "Brian Mutua",
      role: "English & Humanities",
      subjects: ["English", "History", "CRE"],
      experience: "6 yrs",
      image: "/mutua.jpg",
      initials: "BM",
      accent: "#7A9E7E",
    },
  {
    name: "Cynthia Waweru",
    role: "Early Childhood (CBC)",
    subjects: ["Grade 1–3", "Literacy", "Numeracy"],
    experience: "5 yrs",
    image: "/cynthia.jpg",
    initials: "CW",
    accent: "#8B7355",
  },
  {
    name: "David Kariuki",
    role: "British Curriculum",
    subjects: ["IGCSE Math", "Science", "English"],
    experience: "10 yrs",
    image: "/kariuki.png",
    initials: "DK",
    accent: "#6B8FA3",
  },
  {
    name: "Esther Njoki",
    role: "Languages & Arts",
    subjects: ["Kiswahili", "Art", "Music"],
    experience: "7 yrs",
      image: "/esther.jpg",
    initials: "EN",
    accent: "#A07856",
  },
];

export function TutorsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 295 + 20;
    const next =
      dir === "right"
        ? Math.min(activeIndex + 1, tutors.length - 1)
        : Math.max(activeIndex - 1, 0);
    setActiveIndex(next);
    el.scrollTo({ left: next * cardWidth, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#0A0A08] py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* ── HEADER ── */}
        <div className="mb-16 grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
                Our Tutors
              </span>
            </div>

            <h2
              className="font-display text-[38px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-[48px]"
            >
              Learn from tutors
              <br />
              <span className="text-primary">who truly understand your child.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-5 lg:items-end">
            <p className="max-w-[360px] text-[14px] leading-[1.9] text-muted-foreground lg:text-right">
              Our tutors are carefully selected not just for academic excellence,
              but for their ability to connect, guide, and support each learner’s growth.
              <span className="mt-3 block font-medium text-foreground/80">
                CBC · IGCSE · A-Level · KCSE
              </span>
            </p>

            <a
              href="/tutors"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-2 text-[12px] font-semibold text-primary transition-all duration-300 hover:bg-primary/10"
            >
              View all tutors
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>
        </div>

        {/* ── CARD RAIL ── */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tutors.map((tutor, i) => (
            <TutorCard key={tutor.name} tutor={tutor} index={i} />
          ))}
        </div>

        {/* ── CONTROLS below cards ── */}
        <div className="mt-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tutors.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveIndex(i);
                  scrollRef.current?.scrollTo({ left: i * 315, behavior: "smooth" });
                }}
                className="h-[3px] rounded-full transition-all duration-300"
                style={{
                  width: i === activeIndex ? "24px" : "6px",
                  background:
                    i === activeIndex
                      ? "hsl(var(--primary))"
                      : "hsl(var(--foreground) / 0.15)",
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={activeIndex === 0}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-20"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={activeIndex === tutors.length - 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-20"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
}

import { useEffect } from "react";

function TutorCard({ tutor }: { tutor: (typeof tutors)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [tutor]);

  return (
    <div
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-[20px] transition-all duration-500"
      style={{
        width: "295px",
        background: "#111110",
        border: `1px solid ${hovered ? tutor.accent + "35" : "rgba(255,255,255,0.06)"}`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Photo area ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: "300px", background: "#161614" }}
      >
        {/* Ambient glow — always behind everything */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            zIndex: 0,
            background: `radial-gradient(ellipse at 50% 30%, ${tutor.accent}1A 0%, transparent 70%)`,
            opacity: hovered ? 1 : 0.4,
          }}
        />


        {/* Photo — z-index 2, sits on top of initials */}
        {!imgError ? (
          <img
            src={tutor.image}
            alt={tutor.name}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ zIndex: 2 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <img
            src="/placeholder.svg"
            alt="Tutor placeholder"
            className="absolute inset-0 h-full w-full object-cover object-top opacity-40"
            style={{ zIndex: 2 }}
          />
        )}

        {/* Bottom scrim — z-index 3, always on top of photo */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            zIndex: 3,
            height: "110px",
            background: "linear-gradient(to top, #111110 0%, transparent 100%)",
          }}
        />

        {/* Experience badge — z-index 4, topmost */}
        <div
          className="absolute right-3 top-3 rounded-full px-3 py-[5px] text-[10px] font-semibold tracking-wide backdrop-blur-md"
          style={{
            zIndex: 4,
            background: `${tutor.accent}18`,
            border: `1px solid ${tutor.accent}28`,
            color: tutor.accent,
          }}
        >
          {tutor.experience} exp
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-5 pt-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3
              className="font-display text-[15px] font-semibold leading-tight text-foreground"
            >
              {tutor.name}
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{tutor.role}</p>
          </div>

          <a
            href="/tutors"
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-[6px] text-[10px] font-semibold text-white transition-opacity duration-200 hover:opacity-80"
            style={{ background: "#0A66C2" }}
            onClick={(e) => e.stopPropagation()}
          >
            View tutor
          </a>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.map((s) => (
            <span
              key={s}
              className="rounded-full px-2.5 py-[4px] text-[10px] font-medium text-muted-foreground/80"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Gold bottom accent on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1.5px] transition-all duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${tutor.accent}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />
    </div>
  );
}
