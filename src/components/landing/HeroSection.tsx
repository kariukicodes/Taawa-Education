import { useEffect, useState } from "react";

function FloatCard({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={style}
      className={`absolute z-20 rounded-2xl border border-white/10 bg-[#1A1A18]/95 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0F0F0F]">

      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Gold top rule */}
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      {/* SPLIT GRID */}
      <div className="relative z-10 grid min-h-screen items-center lg:grid-cols-2">

        {/* LEFT — Copy */}
        <div className="flex flex-col justify-center px-8 py-24 md:px-16 lg:py-0">

          {/* Badge */}
          <div
            className={`mb-8 flex w-fit items-center gap-2.5 rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/[0.07] px-4 py-2 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A84C]" />
            <span className="text-[11px] font-medium tracking-[0.14em] text-[#C9A84C]">
              Smart Learning
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`mb-6 text-[36px] font-black leading-[1.0] tracking-[-2.5px] text-[#F5F5F0] transition-all duration-700 delay-100 md:text-[44px] lg:text-[52px] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Unlock Your Child’s Full Academic Potential
          </h1>

          {/* Subheadline */}
          <p
            className={`mb-10 max-w-[400px] text-[15px] font-light leading-[1.85] text-[#F5F5F0]/45 transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Through personalized one-on-one learning, expert tutors,
             and structured progress tracking, we help your child learn with confidence, 
             progress, clarity, and measurable results.
          </p>

          {/* CTAs */}
          <div
            className={`mb-12 flex flex-wrap gap-4 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <a
              href="#contact"
              className="rounded-lg bg-[#C9A84C] px-8 py-3.5 text-[13px] font-semibold text-[#0F0F0F] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C9A84C]/25 active:scale-[0.98]"
            >
              Book a Free Consultation
            </a>
            <a
              href="#programs"
              className="flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-[13px] font-medium text-[#F5F5F0]/60 transition-all duration-300 hover:border-[#C9A84C]/35 hover:text-[#F5F5F0]"
            >
              Explore Programs
              <span className="text-[#C9A84C]">→</span>
            </a>
          </div>

          {/* Trust strip */}
          <div
            className={`flex flex-wrap items-center gap-5 border-t border-white/[0.07] pt-7 transition-all duration-700 delay-[500ms] ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex">
              {[
                { i: "GK", bg: "#C9A84C", fg: "#0F0F0F" },
                { i: "DO", bg: "#7A9E7E", fg: "#0F0F0F" },
                { i: "AM", bg: "#6B5B45", fg: "#F5F5F0" },
                { i: "NW", bg: "#3A3A3A", fg: "#C9A84C" },
              ].map((a, idx) => (
                <div
                  key={a.i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0F0F0F] text-[10px] font-bold"
                  style={{ background: a.bg, color: a.fg, marginLeft: idx > 0 ? "-9px" : "0" }}
                >
                  {a.i}
                </div>
              ))}
            </div>
            <div className="text-[12px] leading-[1.6] text-[#F5F5F0]/40">
              <span className="block font-semibold text-[#F5F5F0]/80">48 families enrolled</span>
              across Nairobi &amp; diaspora
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <div className="text-[11px] tracking-[2px] text-[#C9A84C]">★★★★★</div>
              <div className="mt-0.5 text-[11px] text-[#F5F5F0]/30">4.9 · 48 reviews</div>
            </div>
          </div>
        </div>

        {/* RIGHT — Image frame + floating cards */}
        <div className="relative hidden lg:flex lg:items-center lg:justify-center lg:py-16 lg:pr-8">

          {/* Outer wrapper — cards overflow from here */}
          <div className="relative" style={{ width: "420px", height: "560px" }}>

            {/* ── MAIN IMAGE FRAME ──
                Tall rounded portrait card, centred.
                Gold warm ambient behind the image (like the orange panel in inspo).
            ── */}
            <div
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-[36px]"
              style={{
                width: "300px",
                height: "500px",
                transform: "translate(-50%, -50%)",
                background: "#1C1609",
                boxShadow:
                  "0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.12), inset 0 0 60px rgba(201,168,76,0.06)",
              }}
            >
              {/* Warm gold ambient wash — the "orange panel" equivalent from inspo */}
              <div
                className="absolute inset-0 z-10"
                style={{
                  background:
                    "radial-gradient(ellipse at 55% 25%, rgba(201,168,76,0.30) 0%, transparent 60%)",
                }}
              />

              {/* ── REPLACE THIS with your actual <img> ── */}
              <img
                src="heroimage.png"
                alt="EduNest student learning"
                className="absolute inset-0 h-full w-full object-cover object-top"
                style={{ opacity: 0.9 }}
              />

              {/* Bottom fade out */}
              <div
                className="absolute bottom-0 left-0 right-0 z-10"
                style={{
                  height: "120px",
                  background: "linear-gradient(to top, #0F0F0F, transparent)",
                }}
              />

              {/* Inner bottom session card */}
              <div className="absolute bottom-4 left-3 right-3 z-20 rounded-xl border border-white/10 bg-[#0D0D0B]/85 p-3 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-medium tracking-[0.1em] text-[#F5F5F0]/30">
                      CURRENT SESSION
                    </p>
                    <p className="mt-0.5 text-[12px] font-semibold text-[#F5F5F0]">
                      Mathematics · Grade 5
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#F5F5F0]/35">
                      Ms. Amina · CBC
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C]/15">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[#C9A84C]" />
                    </div>
                    <span className="text-[8px] tracking-wider text-[#C9A84C]/60">LIVE</span>
                  </div>
                </div>
                <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-[65%] rounded-full bg-[#C9A84C]" />
                </div>
              </div>
            </div>

            {/* ════════════════════════════
                FLOATING CARDS — escape the frame
                Mirroring inspo: cards outside and overlapping the portrait
            ════════════════════════════ */}

            {/* Card A — top left: big % score (like inspo "60%" card) */}
            <FloatCard delay={700} style={{ top: "20px", left: "0px" }} className="min-w-[138px]">
              <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/30">
                — UP TO
              </p>
              <div
                className="text-[38px] font-black leading-none text-[#F5F5F0]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                92
                <span className="text-[20px] font-normal text-[#C9A84C]">%</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-[1.5] text-[#F5F5F0]/35">
                avg score
                <br />
                this term
              </p>
            </FloatCard>

            {/* Card B — top right: checklist (like inspo checkbox cards) */}
            <FloatCard delay={900} style={{ top: "32px", right: "0px" }} className="min-w-[170px]">
              <p className="mb-2.5 text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/30">
                THIS WEEK
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Math — Grade 5 CBC", done: true, accent: "#C9A84C" },
                  { label: "English Composition", done: true, accent: "#7A9E7E" },
                  { label: "Science revision", done: false, accent: "" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] text-[8px] font-bold"
                      style={
                        item.done
                          ? { background: item.accent + "28", color: item.accent }
                          : { border: "1px solid rgba(255,255,255,0.12)" }
                      }
                    >
                      {item.done ? "✓" : ""}
                    </div>
                    <span
                      className={`text-[11px] ${
                        item.done ? "text-[#F5F5F0]/70" : "text-[#F5F5F0]/28"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </FloatCard>

            {/* Card C — mid right: student profile (like inspo product card bottom-right) */}
            <FloatCard
              delay={1100}
              style={{ top: "50%", right: "0px", transform: "translateY(-50%)" }}
              className="min-w-[160px]"
            >
              <p className="mb-2 text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/30">
                STUDENT
              </p>
              <p className="mb-1.5 text-[13px] font-semibold text-[#F5F5F0]">Zara Kamau</p>
              <div className="mb-2 flex gap-1">
                {["CBC", "Grade 5"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-2 py-[2px] text-[10px] font-medium text-[#C9A84C]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mb-2.5 text-[11px] text-[#F5F5F0]/30">Tutor: Ms. Amina</p>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/8">
                <div className="h-full w-[78%] rounded-full bg-[#7A9E7E]" />
              </div>
              <p className="mt-1.5 text-[10px] text-[#F5F5F0]/22">78% of term complete</p>
            </FloatCard>

            {/* Card D — bottom left: enrollment stat */}
            <FloatCard delay={1300} style={{ bottom: "28px", left: "0px" }} className="min-w-[162px]">
              <p className="mb-1.5 text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/30">
                — NEW THIS MONTH
              </p>
              <div
                className="text-[30px] font-black leading-none text-[#F5F5F0]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                6{" "}
                <span className="text-[16px] font-light text-[#C9A84C]">families</span>
              </div>
              <p className="mt-1 text-[11px] text-[#F5F5F0]/30">joined EduNest in March</p>
            </FloatCard>

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