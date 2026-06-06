import { useEffect, useRef, useState } from "react";

function useVisible() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const cards = [
  {
    icon: "✦",
    title: "Our Philosophy",
    body: "Every child learns differently. We combine academic rigour with the flexibility homeschooling uniquely offers.",
    accent: "#C9A84C",
    num: "01",
  },
  {
    icon: "◈",
    title: "Our Approach",
    body: "One dedicated tutor per family. Structured plans, weekly reports, and full transparency at every step.",
    accent: "#7A9E7E",
    num: "02",
  },
  {
    icon: "◎",
    title: "Tutor Vetting",
    body: "Academic checks, live teaching demos, background screening. Only the top 5% of applicants qualify.",
    accent: "#C9A84C",
    num: "03",
  },
  {
    icon: "◇",
    title: "Our Story",
    body: "Founded in Nairobi by parents who saw the gap — and built the platform they wished had existed.",
    accent: "#7A9E7E",
    num: "04",
  },
];

export function AboutSection() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0A0A08] py-28">

      {/* Top + bottom rules */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      {/* Faint dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-3 lg:px-3">

        {/* ── Section label + heading (centred above) ── */}
        <div
          className="mb-16 text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div className="mb-6 flex justify-center">
            <div className="flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                About Us
              </span>
            </div>
          </div>
          <h2
            className="font-display mx-auto max-w-2xl text-3xl font-bold text-foreground md:text-4xl"
          >
            A New Standard
            <br />
            for Home Education.
          </h2>
        </div>

        {/* ── Split: image left | cards right ── */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr]">

          {/* LEFT — image */}
          <div
            className="relative transition-all duration-1000"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-28px)",
              transitionDelay: "150ms",
            }}
          >
            {/* Gradient border ring */}
            <div
              className="absolute -inset-[1px] rounded-[34px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(201,168,76,0.28) 0%, transparent 45%, rgba(122,158,126,0.14) 100%)",
              }}
            />

            <div
              className="relative overflow-hidden rounded-[33px]"
              style={{
                height: "520px",
                background: "#1A160A",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              {/* Ambient gold wash */}
              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at 40% 20%, rgba(201,168,76,0.16) 0%, transparent 55%)",
                }}
              />

              {/* ── YOUR IMAGE — replace src ── */}
              <img
                src="/heroimage.png"
                alt="Taawa Education hero section image"
                className="absolute inset-0 h-full w-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />


              {/* Bottom fade */}
              <div
                className="absolute bottom-0 left-0 right-0 z-20"
                style={{
                  height: "200px",
                  background: "linear-gradient(to top, #0F0F0F 0%, transparent 100%)",
                }}
              />

              {/* Stats pill */}
              <div className="absolute bottom-5 left-5 right-5 z-30 flex items-center justify-around rounded-2xl border border-white/10 bg-[#0C0C0A]/85 py-4 backdrop-blur-md">
                {[
                  { val: "48+",  label: "Families" },
                  { val: "12+",  label: "Tutors"   },
                  { val: "4.9★", label: "Rating"   },
                ].map((s, i) => (
                  <div key={s.label} className="relative flex flex-col items-center">
                    <span
                      className="font-display text-[20px] font-black leading-none text-foreground"
                    >
                      {s.val}
                    </span>
                    <span className="mt-1 text-[10px] text-muted-foreground">{s.label}</span>
                    {i < 2 && (
                      <div className="absolute right-[-16px] top-1/2 h-7 w-px -translate-y-1/2 bg-white/10" />
                    )}
                  </div>
                ))}
              </div>

              {/* Years badge */}
              <div className="absolute right-5 top-5 z-30 flex flex-col items-center justify-center rounded-2xl border border-[#C9A84C]/20 bg-[#1A1A18]/90 px-4 py-3 backdrop-blur-md">
                <span
                  className="font-display text-[22px] font-black leading-none text-primary"
                >
                  5+
                </span>
                <span className="mt-0.5 text-[9px] font-medium tracking-[0.12em] text-muted-foreground">
                  YEARS
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — 2×2 cards + CTA strip */}
          <div className="flex flex-col gap-3">

            <div className="grid grid-cols-2 gap-3">
              {cards.map((card, i) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/7 bg-[#141412] p-5 transition-all duration-500 hover:border-white/[0.13]"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(24px)",
                    transition: `opacity 0.7s ease ${200 + i * 110}ms, transform 0.7s ease ${200 + i * 110}ms, border-color 0.3s ease`,
                  }}
                >
                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse at 0% 0%, ${card.accent}10 0%, transparent 65%)`,
                    }}
                  />

                  {/* Faint number — top right */}
                  <span
                    className="font-display absolute right-4 top-3.5 text-[11px] font-black"
                    style={{
                      color: `${card.accent}28`,
                    }}
                  >
                    {card.num}
                  </span>

                  {/* Icon */}
                  <div
                    className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-[14px] transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `${card.accent}12`,
                      border: `1px solid ${card.accent}20`,
                      color: card.accent,
                    }}
                  >
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-display mb-2 text-[13px] font-semibold leading-snug text-foreground"
                  >
                    {card.title}
                  </h3>

                  {/* Body — short */}
                  <p className="text-[11.5px] font-light leading-[1.75] text-muted-foreground">
                    {card.body}
                  </p>

                  {/* Bottom animated underline */}
                  <div
                    className="absolute bottom-0 left-5 right-5 h-[1.5px] origin-left scale-x-0 rounded-full transition-transform duration-500 group-hover:scale-x-100"
                    style={{
                      background: `linear-gradient(to right, ${card.accent}80, transparent)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* CTA strip */}
            <div
              className="flex items-center justify-between rounded-2xl border border-white/7 bg-[#141412] px-5 py-4 transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: "660ms",
              }}
            >
              <p className="text-[12.5px] font-light text-muted-foreground">
                Want to know more about how Taawa Education works?
              </p>
              <a
                href="/about"
                className="group flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-5 py-2.5 text-[12px] font-medium text-primary transition-all duration-300 hover:bg-primary/15 whitespace-nowrap"
              >
                Read our story
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}