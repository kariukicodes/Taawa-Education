import { useEffect, useRef, useState } from "react";
import { useContactModal } from "@/components/landing/ContactModalContext";

// ── Scroll visibility hook ─────────────────────────────────────
function useVisible(threshold = 0.12) {
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

// ── Section label ──────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-px w-10 bg-primary/40" />
      <span className="text-[11px] font-medium tracking-[0.18em] text-primary">{text}</span>
      <span className="h-px w-10 bg-primary/40" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 1. HERO — Full-width editorial header
// ══════════════════════════════════════════════════════════════
function AboutHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#0F0F0F]">
      {/* Gold top rule */}
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Large faint background text */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <span
          className="font-display select-none text-[20vw] font-black leading-none tracking-tighter text-foreground/[0.02]"
        >
          ABOUT
        </span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-3 py-32 text-center lg:px-3">
        <div
          className={`mb-6 flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        >
          <span className="h-px w-10 bg-primary/40" />
          <span className="text-[11px] font-medium tracking-[0.18em] text-primary">OUR STORY</span>
          <span className="h-px w-10 bg-primary/40" />
        </div>

        <h1
          className={`font-display mb-6 max-w-4xl text-[52px] font-black leading-[1.0] tracking-[-2.5px] text-foreground transition-all duration-700 delay-100 md:text-[68px] lg:text-[80px] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Built by parents.
          <br />
          <span className="text-primary">For parents.</span>
        </h1>

        <p
          className={`mb-10 max-w-xl text-[16px] font-light leading-[1.85] text-muted-foreground transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          EduNest was born in Nairobi from a simple belief — that every child
          deserves an education as unique as they are. We built the platform we
          wished had existed.
        </p>

        {/* Stat strip */}
        <div
          className={`flex flex-wrap items-center justify-center gap-10 border-t border-white/[0.07] pt-10 transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { val: "5+",   label: "Years serving Nairobi families" },
            { val: "48+",  label: "Families enrolled" },
            { val: "12+",  label: "Expert tutors" },
            { val: "4.9★", label: "Average parent rating" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span
                className="font-display text-[32px] font-black leading-none text-foreground"
              >
                {s.val}
              </span>
              <span className="text-[11px] text-muted-foreground/70">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 2. STORY — Split: text left, image right
// ══════════════════════════════════════════════════════════════
function StorySection() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative bg-[#0A0A0A] py-28">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-3 lg:px-3 lg:grid-cols-2">

        {/* Left — text */}
        <div
          className="transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-28px)" }}
        >
          <SectionLabel text="HOW WE STARTED" />
          <h2
            className="font-display mb-8 text-[38px] font-black leading-[1.05] tracking-[-1.5px] text-foreground md:text-[46px]"
          >
            We saw the gap.
            <br />
            <span className="text-primary">So we filled it.</span>
          </h2>

          <div className="flex flex-col gap-5">
            {[
              {
                year: "2019",
                text: "Two Nairobi families pulled their children from school, frustrated by overcrowded classrooms and one-size-fits-all teaching. They started homeschooling and immediately hit a wall — finding qualified tutors was nearly impossible.",
              },
              {
                year: "2021",
                text: "After two years of manually vetting tutors, building timetables in spreadsheets, and sending progress reports by WhatsApp, it was clear: there had to be a better way. EduNest was incorporated.",
              },
              {
                year: "2024",
                text: "Today EduNest serves 48+ families across Nairobi and the diaspora, with a network of 12+ vetted tutors delivering CBC, British, Montessori, and custom curricula through a single, elegant platform.",
              },
            ].map((item, i) => (
              <div
                key={item.year}
                className="flex gap-5 transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transitionDelay: `${200 + i * 120}ms`,
                }}
              >
                {/* Year marker */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className="flex h-8 w-14 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                    style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}
                  >
                    <span className="text-primary">{item.year}</span>
                  </div>
                  {i < 2 && <div className="mt-2 h-full w-px bg-white/8" />}
                </div>
                <p className="pt-1 text-[14px] font-light leading-[1.85] text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image */}
        <div
          className="relative transition-all duration-1000 delay-200"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(28px)" }}
        >
          <div
            className="absolute -inset-[1px] rounded-[32px]"
            style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.22) 0%, transparent 50%, rgba(122,158,126,0.12) 100%)" }}
          />
          <div
            className="relative overflow-hidden rounded-[32px]"
            style={{ height: "500px", background: "#1A160A", boxShadow: "0 40px 80px rgba(0,0,0,0.55)" }}
          >
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 20%, rgba(201,168,76,0.16) 0%, transparent 55%)" }} />
            <img
              src="/about-story.jpg"
              alt="EduNest founders"
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-20">
              <div className="font-display flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 text-[20px] text-primary">EN</div>
              <p className="text-[11px] tracking-widest text-muted-foreground/70">FOUNDERS PHOTO</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #0A0A0A, transparent)" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 3. VALUES — 3-column cards
// ══════════════════════════════════════════════════════════════
const values = [
  {
    icon: "✦",
    title: "Child-first always",
    body: "Every decision — from curriculum design to tutor selection — starts with one question: what is best for this child?",
    accent: "#C9A84C",
  },
  {
    icon: "◈",
    title: "Radical transparency",
    body: "Parents see everything. Weekly reports, lesson notes, attendance records, and tutor feedback — no surprises.",
    accent: "#7A9E7E",
  },
  {
    icon: "◎",
    title: "Uncompromising quality",
    body: "We turn away 95% of tutor applicants. The 5% who pass represent the finest educators in Nairobi.",
    accent: "#C9A84C",
  },
  {
    icon: "◇",
    title: "Personalised by design",
    body: "No two learning plans are identical. Every student gets a curriculum, pace, and approach built around them.",
    accent: "#7A9E7E",
  },
  {
    icon: "⬡",
    title: "Long-term relationships",
    body: "We match tutors to students carefully and keep those relationships stable — continuity drives better outcomes.",
    accent: "#C9A84C",
  },
  {
    icon: "◭",
    title: "Premium without pretension",
    body: "High standards don't require cold formality. We are warm, human, and genuinely invested in every family.",
    accent: "#7A9E7E",
  },
];

function ValuesSection() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative bg-[#0F0F0F] py-28">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="mx-auto max-w-7xl px-3 lg:px-3">
        <div
          className="mb-14 text-center transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <SectionLabel text="WHAT WE BELIEVE" />
          <h2
            className="font-display mx-auto max-w-xl text-[40px] font-black leading-[1.05] tracking-[-1.5px] text-foreground md:text-[48px]"
          >
            Six values that drive
            <br />
            <span className="text-primary">every decision we make.</span>
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="group relative overflow-hidden rounded-2xl border border-white/7 bg-[#141412] p-6 transition-all duration-500 hover:border-white/12"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.7s ease ${150 + i * 90}ms, transform 0.7s ease ${150 + i * 90}ms, border-color 0.3s`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse at 10% 10%, ${v.accent}10 0%, transparent 65%)` }}
              />
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-[16px] transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${v.accent}14`, border: `1px solid ${v.accent}22`, color: v.accent }}
              >
                {v.icon}
              </div>
              <h3
                className="font-display mb-2.5 text-[15px] font-semibold text-foreground"
              >
                {v.title}
              </h3>
              <p className="text-[12.5px] font-light leading-[1.8] text-muted-foreground">{v.body}</p>
              <div
                className="absolute bottom-0 left-5 right-5 h-[1.5px] origin-left scale-x-0 rounded-full transition-transform duration-500 group-hover:scale-x-100"
                style={{ background: `linear-gradient(to right, ${v.accent}70, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 4. STATS — Full-width dark band
// ══════════════════════════════════════════════════════════════
const stats = [
  { val: "48+",  label: "Families served",           sub: "across Nairobi & diaspora" },
  { val: "12+",  label: "Vetted tutors",              sub: "top 5% of all applicants" },
  { val: "95%",  label: "Retention rate",             sub: "families who stay with us" },
  { val: "4.9",  label: "Average star rating",        sub: "from parent reviews" },
  { val: "300+", label: "Lessons delivered monthly",  sub: "across all students" },
  { val: "4",    label: "Curricula supported",        sub: "CBC, British, Montessori, Custom" },
];

function StatsSection() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative bg-[#0A0A0A] py-24">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      {/* Gold diagonal stripe texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #C9A84C 0px, #C9A84C 1px, transparent 1px, transparent 60px)" }}
      />

      <div className="relative mx-auto max-w-7xl px-3 lg:px-3">
        <div className="grid grid-cols-2 gap-px bg-white/[0.06] sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center bg-[#0A0A0A] px-6 py-10 text-center transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <span
                className="font-display mb-2 text-[36px] font-black leading-none text-foreground"
              >
                {s.val}
                <span className="text-primary">+</span>
              </span>
              <span className="mb-1 text-[12px] font-semibold text-foreground/80">{s.label}</span>
              <span className="text-[10px] text-muted-foreground/70">{s.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 5. TEAM — Founder + leadership cards
// ══════════════════════════════════════════════════════════════
const team = [
  {
    name: "Wanjiku Mwangi",
    role: "Co-Founder & CEO",
    bio: "Former primary school teacher turned education entrepreneur. Pulled her own children from school in 2019 and never looked back.",
    initials: "WM",
    accent: "#C9A84C",
    image: "/team/wanjiku.jpg",
  },
  {
    name: "Omondi Otieno",
    role: "Co-Founder & Head of Curriculum",
    bio: "Curriculum designer with 12 years across Kenya and the UK. Obsessed with building learning plans that actually fit the child.",
    initials: "OO",
    accent: "#7A9E7E",
    image: "/team/omondi.jpg",
  },
  {
    name: "Amara Njoroge",
    role: "Head of Tutor Relations",
    bio: "Runs the vetting and onboarding process that keeps our tutor quality at the top 5%. Former HR director in private education.",
    initials: "AN",
    accent: "#C9A84C",
    image: "/team/amara.jpg",
  },
  {
    name: "Kevin Kamau",
    role: "Head of Operations",
    bio: "Keeps the platform, the schedules, and the families running smoothly. Background in edtech product management.",
    initials: "KK",
    accent: "#7A9E7E",
    image: "/team/kevin.jpg",
  },
];

function TeamSection() {
  const { ref, visible } = useVisible();

  return (
    <section ref={ref} className="relative bg-[#0F0F0F] py-28">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      <div className="mx-auto max-w-7xl px-3 lg:px-3">
        <div
          className="mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <SectionLabel text="THE TEAM" />
          <h2
            className="font-display text-[40px] font-black leading-[1.05] tracking-[-1.5px] text-foreground md:text-[48px]"
          >
            The people behind
            <br />
            <span className="text-primary">EduNest.</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <div
              key={member.name}
              className="group relative overflow-hidden rounded-2xl border border-white/7 bg-[#141412] transition-all duration-500 hover:border-white/12"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(28px)",
                transition: `opacity 0.7s ease ${150 + i * 100}ms, transform 0.7s ease ${150 + i * 100}ms, border-color 0.3s`,
              }}
            >
              {/* Photo area */}
              <div className="relative overflow-hidden" style={{ height: "240px", background: "#1A1A18" }}>
                <div
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(ellipse at 50% 20%, ${member.accent}20 0%, transparent 60%)` }}
                />
                <img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {/* Initials fallback */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
                  <div
                    className="font-display flex h-20 w-20 items-center justify-center rounded-full text-[22px] font-black"
                    style={{ background: `${member.accent}18`, border: `1px solid ${member.accent}30`, color: member.accent }}
                  >
                    {member.initials}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 z-10" style={{ background: "linear-gradient(to top, #141412, transparent)" }} />
              </div>

              {/* Info */}
              <div className="p-5">
                <h3
                  className="font-display mb-0.5 text-[15px] font-semibold text-foreground"
                >
                  {member.name}
                </h3>
                <p className="mb-3 text-[11px] font-medium" style={{ color: member.accent }}>{member.role}</p>
                <p className="text-[12px] font-light leading-[1.75] text-muted-foreground">{member.bio}</p>
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `linear-gradient(to right, transparent, ${member.accent}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// 6. CTA — Final conversion block
// ══════════════════════════════════════════════════════════════
function AboutCTA() {
  const { ref, visible } = useVisible();
  const { openModal } = useContactModal();

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0A0A0A] py-28">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/6 to-transparent" />

      {/* Radial gold glow centre */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 65%)" }}
      />

      <div
        className="relative mx-auto max-w-3xl px-3 text-center transition-all duration-1000 lg:px-3"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)" }}
      >
        <SectionLabel text="READY TO START" />

        <h2
          className="font-display mb-6 text-[42px] font-black leading-[1.02] tracking-[-1.5px] text-foreground md:text-[52px]"
        >
          Give your child the
          <br />
          education they deserve.
        </h2>

        <p className="mb-10 text-[15px] font-light leading-[1.85] text-muted-foreground">
          Book a free 30-minute consultation. We'll understand your child's
          needs, recommend a curriculum, and match you with the right tutor —
          no commitment required.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
            className="rounded-lg bg-primary px-9 py-4 text-[14px] font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-lg hover:shadow-[#C9A84C]/25 active:scale-[0.98]"
          >
            Book a Free Consultation
          </a>
          <a
            href="/tutors"
            className="flex items-center gap-2 rounded-lg border border-white/10 px-9 py-4 text-[14px] font-medium text-muted-foreground transition-all duration-300 hover:border-primary/35 hover:text-foreground"
          >
            Meet Our Tutors
            <span className="text-primary">→</span>
          </a>
        </div>

        {/* Trust note */}
        <p className="mt-8 text-[12px] text-muted-foreground/60">
          No obligation · No payment required · Response within 24 hours
        </p>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE EXPORT
// ══════════════════════════════════════════════════════════════
export default function AboutPage() {
  return (
    <main className="bg-[#0F0F0F]">
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <StatsSection />
      <TeamSection />
      <AboutCTA />
    </main>
  );
}