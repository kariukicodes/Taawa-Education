import { useEffect, useState } from "react";
import { useContactModal } from "./ContactModalContext";

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
      className={`absolute z-20 rounded-2xl border border-white/[0.08] bg-[#131310]/90 p-3.5 shadow-2xl shadow-black/70 backdrop-blur-xl transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const AVATARS = [
  { i: "FK", bg: "#C9A84C", fg: "#0F0F0F" },
  { i: "MW", bg: "#7A9E7E", fg: "#0F0F0F" },
  { i: "AO", bg: "#6B5B45", fg: "#F5F5F0" },
  { i: "NK", bg: "#3A3A3A", fg: "#C9A84C" },
  { i: "ZM", bg: "#2C3A2C", fg: "#7A9E7E" },
];

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { openModal } = useContactModal();

  const fadeUp = (delay: string) =>
    `transition-all duration-700 ${delay} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0A0A08]">

      {/* Gold hairline top rule */}
      <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/60 to-transparent" />

      {/* Subtle radial ambient — left side only */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* ─── MAIN GRID ─── */}
      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1280px] items-center px-3 lg:grid-cols-[1fr_480px] lg:gap-16 lg:px-3">

        {/* ─── LEFT: COPY ─── */}
        <div className="flex flex-col justify-center py-28 lg:py-0">

          {/* Eyebrow pill */}
          <div className={`mb-7 w-fit ${fadeUp("delay-0")}`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/[0.08] px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A84C]" />
              <span className="text-[11px] font-semibold tracking-[0.15em] text-primary uppercase">
                CBC · IGCSE · A-Level
              </span>
            </span>
          </div>

          {/* Headline — serif display */}
          <h1 className={`font-display mb-5 text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground md:text-[52px] lg:text-[58px] ${fadeUp("delay-100")}`}>
            Unlock Your Child’s Full Academic Potential
          </h1>

          {/* Sub */}
          <p className={`mb-9 max-w-[420px] text-[15px] font-light leading-[1.9] text-muted-foreground ${fadeUp("delay-200")}`}>
            Personalized homeschooling programs, expert tutors, and real-time progress tracking — built for parents who want more than just tutoring.
          </p>

          {/* CTAs */}
          <div className={`mb-3 flex flex-wrap gap-3 ${fadeUp("delay-300")}`}>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                openModal();
              }}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-[13px] font-bold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
            >
              Book a Free Consultation
              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="/tutors"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-7 py-3.5 text-[13px] font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-foreground"
            >
              Browse Tutors
            </a>
          </div>
          <p className="mb-8 text-[11px] text-muted-foreground">
            Limited slots available — personalized plans for each student
          </p>

          {/* Trust strip */}
          <div className={`border-t border-white/[0.06] pt-7 ${fadeUp("delay-500")}`}>
            <div className="flex flex-wrap items-center gap-6">
              {/* Avatar stack */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {AVATARS.map((a, i) => (
                    <div
                      key={a.i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0A08] text-[9px] font-bold"
                      style={{ background: a.bg, color: a.fg, marginLeft: i > 0 ? "-10px" : "0" }}
                    >
                      {a.i}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground/80">500+ students</p>
                  <p className="text-[11px] text-muted-foreground">across Kenya &amp; diaspora</p>
                </div>
              </div>

              <div className="h-7 w-px bg-white/[0.08]" />

              {/* Stars */}
              <div>
                <p className="text-[12px] tracking-[3px] text-primary">★★★★★</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">4.9 avg · 200+ reviews</p>
              </div>

              <div className="h-7 w-px bg-white/[0.08]" />

              {/* Quick stat */}
              <div>
                <p className="text-[12px] font-semibold text-foreground/80">98% pass rate</p>
                <p className="text-[11px] text-muted-foreground">KCSE &amp; IGCSE 2024</p>
              </div>

              <div className="h-7 w-px bg-white/[0.08]" />

              {/* New: Trusted by parents globally */}
              <div>
                <p className="text-[12px] font-semibold text-foreground/80">Trusted by parents globally</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: VISUAL FRAME ─── */}
        <div className="relative hidden lg:flex lg:items-center lg:justify-center lg:py-20">
          <div className="relative" style={{ width: "440px", height: "580px" }}>

            {/* Portrait card */}
            <div
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-[32px]"
              style={{
                width: "290px",
                height: "490px",
                transform: "translate(-50%, -50%)",
                background: "#14120C",
                boxShadow:
                  "0 60px 120px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,168,76,0.10), inset 0 0 80px rgba(201,168,76,0.04)",
              }}
            >
              {/* Warm ambient */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 60% 20%, rgba(201,168,76,0.22) 0%, transparent 55%)",
                }}
              />

              {/* Hero image — swap src for your actual photo */}
              <img
                src="/heroimage.png"
                alt="Student learning with EduNest tutor"
                className="absolute inset-0 h-full w-full object-cover object-top"
                style={{ opacity: 0.88 }}
              />

              {/* Bottom scrim */}
              <div
                className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
                style={{
                  height: "160px",
                  background: "linear-gradient(to top, #0A0A08 10%, transparent)",
                }}
              />

              {/* Live session pill — inside image at bottom */}
              <div className="absolute bottom-4 left-3 right-3 z-20 rounded-[14px] border border-white/[0.09] bg-[#0D0D0B]/80 p-3 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase">
                      Live session
                    </p>
                    <p className="mt-0.5 text-[12px] font-semibold text-foreground">
                      Mathematics · Grade 8
                    </p>
                    <p className="text-[10px] text-muted-foreground">Mr. Odhiambo · CBC</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C]/15 ring-1 ring-[#C9A84C]/20">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-[#C9A84C]" />
                    </div>
                    <span className="text-[7px] font-bold tracking-wider text-primary/60 uppercase">Live</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-[#C9A84C]/80 to-[#C9A84C]" />
                </div>
                <p className="mt-1 text-[9px] text-muted-foreground/60">62% complete</p>
              </div>
            </div>

            {/* ── FLOATING CARDS ── */}

            {/* Card A — Score callout (top-left) */}
            <FloatCard delay={600} style={{ top: "16px", left: "0px" }}>
              <p className="mb-0.5 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">Top score</p>
              <div className="font-display text-[40px] font-black leading-none text-foreground">
                96<span className="text-[18px] font-light text-primary">%</span>
              </div>
              <p className="mt-1.5 text-[10px] leading-[1.5] text-muted-foreground">
                Wanjiru K. — KCSE<br />Maths, 2024
              </p>
            </FloatCard>

            {/* Card B — Weekly sessions (top-right) */}
            <FloatCard delay={800} style={{ top: "28px", right: "0px" }} className="min-w-[172px]">
              <p className="mb-2 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">This week</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Maths — Grade 8 CBC", done: true, color: "#C9A84C" },
                  { label: "English composition", done: true, color: "#7A9E7E" },
                  { label: "Physics revision", done: true, color: "#7A9E7E" },
                  { label: "Chemistry — IGCSE", done: false, color: "" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div
                      className="flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-[3px] text-[8px] font-black"
                      style={
                        s.done
                          ? { background: s.color + "22", color: s.color }
                          : { border: "1px solid rgba(255,255,255,0.1)" }
                      }
                    >
                      {s.done ? "✓" : ""}
                    </div>
                    <span className={`text-[10px] ${s.done ? "text-foreground/70" : "text-muted-foreground/50"}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </FloatCard>

            {/* Card C — Student profile (mid-right) */}
            <FloatCard
              delay={1000}
              style={{ top: "50%", right: "0px", transform: "translateY(-50%)" }}
              className="min-w-[165px]"
            >
              <p className="mb-2 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">Student</p>
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: "#C9A84C22", color: "#C9A84C" }}
                >
                  ZK
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Zara Kamau</p>
                  <p className="text-[10px] text-muted-foreground/70">Grade 8 · CBC</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2.5">
                {["Maths", "Science", "English"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#C9A84C]/18 bg-[#C9A84C]/[0.08] px-2 py-[2px] text-[9px] font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[81%] rounded-full bg-[#7A9E7E]" />
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground/60">81% of term complete</p>
            </FloatCard>

            {/* Card D — New students (bottom-left) */}
            <FloatCard delay={1200} style={{ bottom: "24px", left: "0px" }} className="min-w-[155px]">
              <p className="mb-1 text-[9px] font-semibold tracking-[0.1em] text-muted-foreground/70 uppercase">New this month</p>
              <div className="font-display text-[32px] font-black leading-none text-foreground">
                12{" "}
                <span className="text-[15px] font-light text-primary">students</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground/70">joined EduNest in April</p>
              <div className="mt-2 flex gap-1">
                {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-[5px] rounded-sm"
                    style={{
                      height: `${h * 0.28}px`,
                      background: i === 6 ? "#C9A84C" : "rgba(201,168,76,0.2)",
                    }}
                  />
                ))}
              </div>
            </FloatCard>

          </div>
        </div>
      </div>

      {/* ─── SCROLL INDICATOR ─── */}
      <div className="absolute bottom-8 left-10 z-20 hidden flex-col items-center gap-2 lg:flex">
        <div className="h-10 w-px animate-pulse bg-gradient-to-b from-[#C9A84C]/50 to-transparent" />
        <span
          className="text-[9px] font-medium tracking-[0.25em] text-muted-foreground/60 uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
      </div>

      {/* ─── MOBILE FLOATING STATS ─── */}
      <div className="relative z-10 mx-auto grid grid-cols-3 gap-3 px-3 pb-10 lg:px-3 lg:hidden">
        {[
          { val: "500+", label: "Students" },
          { val: "4.9★", label: "Rating" },
          { val: "98%", label: "Pass rate" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/[0.07] bg-[#131310]/80 p-3 text-center backdrop-blur-sm"
          >
            <p className="font-display text-[18px] font-black text-primary">
              {s.val}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

    </section>
  );
}