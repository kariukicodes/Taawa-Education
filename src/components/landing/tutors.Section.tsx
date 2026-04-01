import { useRef, useState } from "react";

const tutors = [
  {
    name: "Amina Odhiambo",
    role: "Mathematics & Sciences",
    subjects: ["CBC Math", "Physics", "Chemistry"],
    experience: "8 yrs exp",
    image: "/tutors/amina.jpg",
    initials: "AO",
    accent: "#C9A84C",
  },
  {
    name: "Brian Mutua",
    role: "English & Humanities",
    subjects: ["English", "History", "CRE"],
    experience: "6 yrs exp",
    image: "/tutors/brian.jpg",
    initials: "BM",
    accent: "#7A9E7E",
  },
  {
    name: "Cynthia Waweru",
    role: "Early Childhood (CBC)",
    subjects: ["Grade 1–3", "Literacy", "Numeracy"],
    experience: "5 yrs exp",
    image: "/tutors/cynthia.jpg",
    initials: "CW",
    accent: "#8B7355",
  },
  {
    name: "David Kariuki",
    role: "British Curriculum",
    subjects: ["IGCSE Math", "Science", "English"],
    experience: "10 yrs exp",
    image: "/tutors/david.jpg",
    initials: "DK",
    accent: "#6B8FA3",
  },
  {
    name: "Esther Njoki",
    role: "Languages & Arts",
    subjects: ["Kiswahili", "Art", "Music"],
    experience: "7 yrs exp",
    image: "/tutors/esther.jpg",
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
    const cardWidth = 300 + 20; // card width + gap
    const next = dir === "right"
      ? Math.min(activeIndex + 1, tutors.length - 1)
      : Math.max(activeIndex - 1, 0);
    setActiveIndex(next);
    el.scrollTo({ left: next * cardWidth, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#0F0F0F] py-24">

      {/* Subtle top border */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-7xl px-8 md:px-16">

        {/* ── Header row ── */}
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          {/* Left: label + heading */}
          <div>
            {/* Badge — matches hero badge style */}
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/[0.07] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
              <span className="text-[11px] font-medium tracking-[0.14em] text-[#C9A84C]">
                OUR TUTORS
              </span>
            </div>

            <h2
              className="text-[42px] font-black leading-[1.05] tracking-[-1.5px] text-[#F5F5F0] md:text-[52px]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Meet Our
              <br />
              <span className="text-[#C9A84C]">Expert Tutors</span>
            </h2>
          </div>

          {/* Right: description + nav arrows and link */}
          <div className="flex flex-col items-start gap-6 lg:items-end">
            <p className="max-w-[360px] text-[14px] font-light leading-[1.8] text-[#F5F5F0]/40 lg:text-right">
              Every EduNest tutor is hand-picked, degree-qualified, and
              experienced in delivering personalised homeschooling — not just
              teaching, but building a relationship with each child.
            </p>
            <a
              href="/tutors"
              className="mb-2 inline-block rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-xs font-semibold text-[#C9A84C] transition hover:bg-[#C9A84C]/20 hover:underline"
              style={{ alignSelf: 'flex-end' }}
            >
              Our Tutors
            </a>
            {/* Carousel nav arrows — same as inspo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={activeIndex === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F5F5F0]/50 transition-all duration-200 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] disabled:cursor-not-allowed disabled:opacity-25"
              >
                ←
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={activeIndex === tutors.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-[#F5F5F0]/50 transition-all duration-200 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] disabled:cursor-not-allowed disabled:opacity-25"
              >
                →
              </button>

              {/* Dot indicators */}
              <div className="ml-3 flex items-center gap-1.5">
                {tutors.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveIndex(i);
                      scrollRef.current?.scrollTo({
                        left: i * 320,
                        behavior: "smooth",
                      });
                    }}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === activeIndex ? "20px" : "6px",
                      background: i === activeIndex ? "#C9A84C" : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable card rail ── */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tutors.map((tutor, i) => (
            <TutorCard key={tutor.name} tutor={tutor} index={i} />
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}

function TutorCard({
  tutor,
  index,
}: {
  tutor: (typeof tutors)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-[#141414] transition-all duration-500"
      style={{
        width: "300px",
        borderColor: hovered ? `${tutor.accent}30` : "rgba(255,255,255,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Photo area ── */}
      <div
        className="relative overflow-hidden"
        style={{ height: "320px", background: "#1A1A18" }}
      >
        {/* Warm ambient behind photo */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, ${tutor.accent}22 0%, transparent 65%)`,
            opacity: hovered ? 1 : 0.5,
          }}
        />

        {/* Photo — replace src with real tutor photos */}
        <img
          src={tutor.image}
          alt={tutor.name}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          onError={(e) => {
            // Fallback to initials placeholder if image missing
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Initials fallback shown when no image */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-[28px] font-black"
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
            height: "80px",
            background: "linear-gradient(to top, #141414, transparent)",
            zIndex: 2,
          }}
        />

        {/* Experience badge — top right */}
        <div
          className="absolute right-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] font-semibold backdrop-blur-md"
          style={{
            background: `${tutor.accent}20`,
            border: `1px solid ${tutor.accent}30`,
            color: tutor.accent,
          }}
        >
          {tutor.experience}
        </div>
      </div>

      {/* ── Info area ── */}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3
              className="text-[16px] font-semibold text-[#F5F5F0]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {tutor.name}
            </h3>
            <p className="mt-0.5 text-[12px] text-[#F5F5F0]/40">{tutor.role}</p>
          </div>

          {/* LinkedIn pill — matches inspo */}
          <a
            href="#"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-200 hover:opacity-80"
            style={{
              background: "#0A66C2",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>

        {/* Subject tags */}
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjects.map((s) => (
            <span
              key={s}
              className="rounded-full px-2.5 py-1 text-[10px] font-medium"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(245,245,240,0.5)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gold accent line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${tutor.accent}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />
    </div>
  );
}