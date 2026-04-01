import { useEffect, useRef, useState } from "react";

// ── Scroll-triggered visibility hook ──────────────────────────
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

// ── Reusable card shell ────────────────────────────────────────
function BentoCard({
  children,
  className = "",
  style,
  delay = 0,
  visible,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  visible: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/7 bg-[#141412] p-6 transition-all duration-700 hover:border-white/12 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${delay}ms`,
        ...style,
      }}
    >
      {/* Subtle inner glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(ellipse at 20% 20%, rgba(201,168,76,0.06) 0%, transparent 60%)" }}
      />
      {children}
    </div>
  );
}

// ── Card icon badge ────────────────────────────────────────────
function IconBadge({ icon, accent = "#C9A84C" }: { icon: string; accent?: string }) {
  return (
    <div
      className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-[18px]"
      style={{ background: `${accent}15`, border: `1px solid ${accent}25`, color: accent }}
    >
      {icon}
    </div>
  );
}

// ── Card heading + sub ─────────────────────────────────────────
function CardHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <h3
        className="mb-1.5 text-[15px] font-semibold text-[#F5F5F0]"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h3>
      <p className="text-[12px] font-light leading-[1.7] text-[#F5F5F0]/40">{sub}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// INDIVIDUAL FEATURE CARDS
// ══════════════════════════════════════════════════════════════

// 1. Programs & Curricula
function ProgramsCard({ visible }: { visible: boolean }) {
  const programs = [
    { name: "CBC Curriculum",       price: "KES 12,000 / mo", accent: "#C9A84C" },
    { name: "British · IGCSE",      price: "KES 15,000 / mo", accent: "#7A9E7E" },
    { name: "Montessori Approach",  price: "KES 13,500 / mo", accent: "#8B7355" },
    { name: "Custom Learning Plan", price: "From KES 10,000", accent: "#6B8FA3" },
  ];
  return (
    <BentoCard visible={visible} delay={100}>
      <IconBadge icon="◈" accent="#C9A84C" />
      <CardHead title="Programs & Curricula" sub="Flexible plans for every learning style and age group." />
      <div className="flex flex-col gap-2">
        {programs.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between rounded-xl border border-white/6 bg-[#0F0F0D] px-4 py-3 transition-colors duration-200 hover:border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="h-[28px] w-[3px] rounded-full" style={{ background: p.accent }} />
              <div>
                <p className="text-[12px] font-medium text-[#F5F5F0]/80">{p.name}</p>
                <p className="text-[10px] text-[#F5F5F0]/30">{p.price}</p>
              </div>
            </div>
            <span className="text-[#F5F5F0]/20 text-[12px]">→</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// 2. Parent Dashboard
function ParentDashCard({ visible }: { visible: boolean }) {
  const parents = [
    { initials: "GK", bg: "#C9A84C", fg: "#0F0F0F" },
    { initials: "DO", bg: "#7A9E7E", fg: "#0F0F0F" },
    { initials: "AM", bg: "#8B7355", fg: "#F5F5F0" },
    { initials: "NW", bg: "#6B8FA3", fg: "#F5F5F0" },
  ];
  return (
    <BentoCard visible={visible} delay={200}>
      <IconBadge icon="◉" accent="#7A9E7E" />
      <CardHead title="Parent Dashboard" sub="Real-time visibility into your child's progress, schedule, and reports." />
      {/* Avatar stack */}
      <div className="mb-4 flex">
        {parents.map((p, i) => (
          <div
            key={p.initials}
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#141412] text-[11px] font-bold"
            style={{ background: p.bg, color: p.fg, marginLeft: i > 0 ? "-10px" : "0" }}
          >
            {p.initials}
          </div>
        ))}
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#141412] text-[10px] font-medium text-[#F5F5F0]/50"
          style={{ background: "#1E1E1C", marginLeft: "-10px" }}
        >
          +44
        </div>
      </div>
      {/* Mini progress bars */}
      <div className="flex flex-col gap-2.5">
        {[
          { label: "Zara K. — Math",    pct: 82, color: "#C9A84C" },
          { label: "Leo K. — English",  pct: 67, color: "#7A9E7E" },
          { label: "Ethan O. — Science",pct: 91, color: "#8B7355" },
        ].map((s) => (
          <div key={s.label}>
            <div className="mb-1 flex justify-between">
              <span className="text-[10px] text-[#F5F5F0]/40">{s.label}</span>
              <span className="text-[10px] font-medium" style={{ color: s.color }}>{s.pct}%</span>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/6">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// 3. Tutor Sessions (wide card)
function SessionsCard({ visible }: { visible: boolean }) {
  const sessions = [
    { subject: "Mathematics · Grade 5", tutor: "Ms. Amina", time: "9:00 – 10:00 AM", day: "Mon", color: "#C9A84C", live: true },
    { subject: "English Composition",   tutor: "Mr. Brian",  time: "11:00 – 12:00 PM", day: "Wed", color: "#7A9E7E", live: false },
    { subject: "Science · CBC",         tutor: "Ms. Cynthia",time: "2:00 – 3:00 PM",  day: "Thu", color: "#8B7355", live: false },
  ];
  return (
    <BentoCard visible={visible} delay={300} className="lg:col-span-2">
      <IconBadge icon="◷" accent="#C9A84C" />
      <CardHead title="Live & Scheduled Sessions" sub="Manage timetables, join lessons, and track attendance — all in one place." />
      <div className="grid gap-3 sm:grid-cols-3">
        {sessions.map((s) => (
          <div
            key={s.subject}
            className="relative overflow-hidden rounded-xl border border-white/6 bg-[#0F0F0D] p-4"
          >
            {s.live && (
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#C9A84C]/15 px-2 py-0.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9A84C]" />
                <span className="text-[9px] font-semibold tracking-wider text-[#C9A84C]">LIVE</span>
              </div>
            )}
            <div
              className="mb-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${s.color}18`, color: s.color }}
            >
              {s.day}
            </div>
            <p className="mb-0.5 text-[12px] font-semibold text-[#F5F5F0]/85">{s.subject}</p>
            <p className="mb-1 text-[10px] text-[#F5F5F0]/35">{s.tutor}</p>
            <p className="text-[10px] font-medium" style={{ color: s.color }}>{s.time}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// 4. Progress Reporting
function ReportingCard({ visible }: { visible: boolean }) {
  const bars = [65, 80, 55, 90, 72, 85, 60, 95, 70, 88, 75, 92];
  const colors = ["#C9A84C", "#7A9E7E", "#C9A84C", "#C9A84C", "#7A9E7E", "#C9A84C",
                  "#7A9E7E", "#C9A84C", "#7A9E7E", "#C9A84C", "#7A9E7E", "#C9A84C"];
  return (
    <BentoCard visible={visible} delay={400}>
      <IconBadge icon="◫" accent="#7A9E7E" />
      <CardHead title="Progress Reporting" sub="Weekly academic reports with tutor comments and performance trends." />
      {/* Mini bar chart */}
      <div className="flex h-[72px] items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-700"
            style={{
              height: `${h}%`,
              background: colors[i],
              opacity: 0.7 + (i % 3) * 0.1,
              transitionDelay: `${400 + i * 40}ms`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between">
        <span className="text-[10px] text-[#F5F5F0]/25">Oct</span>
        <span className="text-[10px] text-[#F5F5F0]/25">Nov</span>
        <span className="text-[10px] text-[#F5F5F0]/25">Dec</span>
        <span className="text-[10px] text-[#F5F5F0]/25">Jan</span>
      </div>
    </BentoCard>
  );
}

// 5. Tutor Management
function TutorMgmtCard({ visible }: { visible: boolean }) {
  const tutors = [
    { initials: "AO", name: "Amina O.", subject: "Mathematics", status: "Active",  accent: "#C9A84C", students: 8  },
    { initials: "BM", name: "Brian M.", subject: "English",     status: "Active",  accent: "#7A9E7E", students: 6  },
    { initials: "CW", name: "Cynthia W",subject: "CBC · Early", status: "Busy",    accent: "#8B7355", students: 5  },
  ];
  return (
    <BentoCard visible={visible} delay={300}>
      <IconBadge icon="✦" accent="#C9A84C" />
      <CardHead title="Tutor Management" sub="Assign tutors, track tasks, and manage earnings — all from one panel." />
      <div className="flex flex-col gap-2.5">
        {tutors.map((t) => (
          <div key={t.name} className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0F0F0D] px-3 py-2.5">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}28` }}
            >
              {t.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#F5F5F0]/80 truncate">{t.name}</p>
              <p className="text-[10px] text-[#F5F5F0]/30 truncate">{t.subject}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                style={{
                  background: t.status === "Active" ? "rgba(122,158,126,0.15)" : "rgba(201,168,76,0.15)",
                  color: t.status === "Active" ? "#7A9E7E" : "#C9A84C",
                }}
              >
                {t.status}
              </div>
              <span className="text-[9px] text-[#F5F5F0]/25">{t.students} students</span>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// 6. Payments & Billing
function BillingCard({ visible }: { visible: boolean }) {
  const payments = [
    { name: "Grace Kamau",   plan: "CBC Monthly",     amount: "KES 12,000", status: "Paid",    dot: "#7A9E7E" },
    { name: "David Omondi",  plan: "British Curriculum", amount: "KES 15,000", status: "Pending", dot: "#C9A84C" },
    { name: "Amara Njoroge", plan: "Custom Plan",      amount: "KES 10,500", status: "Overdue", dot: "#E05252" },
  ];
  return (
    <BentoCard visible={visible} delay={500}>
      <IconBadge icon="◬" accent="#7A9E7E" />
      <CardHead title="Payments & Billing" sub="Track fees, invoices, and tutor earnings with clear status tracking." />
      <div className="flex flex-col gap-2">
        {payments.map((p) => (
          <div key={p.name} className="rounded-xl border border-white/6 bg-[#0F0F0D] px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#F5F5F0]/70">{p.name}</p>
                <p className="text-[10px] text-[#F5F5F0]/30">{p.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-semibold" style={{ color: "#F5F5F0" }}>{p.amount}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.dot }} />
                  <span className="text-[9px]" style={{ color: p.dot }}>{p.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// 7. Lead Management (wide)
function LeadsCard({ visible }: { visible: boolean }) {
  const leads = [
    { name: "Sarah Mwangi",   curriculum: "CBC",     status: "New",                  statusColor: "#C9A84C",  date: "Today" },
    { name: "James Otieno",   curriculum: "British", status: "Consultation Booked",  statusColor: "#7A9E7E",  date: "Yesterday" },
    { name: "Priya Sharma",   curriculum: "Custom",  status: "Enrolled",             statusColor: "#4A9B6F",  date: "2 days ago" },
    { name: "Kevin Odhiambo", curriculum: "CBC",     status: "Contacted",            statusColor: "#6B8FA3",  date: "3 days ago" },
  ];
  return (
    <BentoCard visible={visible} delay={500} className="lg:col-span-2">
      <IconBadge icon="◎" accent="#C9A84C" />
      <CardHead title="Lead & Enrolment CRM" sub="Capture enquiries, track consultation bookings, and onboard new families seamlessly." />
      <div className="overflow-hidden rounded-xl border border-white/6">
        {/* Table header */}
        <div className="grid grid-cols-4 border-b border-white/6 bg-[#0F0F0D] px-4 py-2.5">
          {["Parent", "Curriculum", "Status", "Received"].map((h) => (
            <span key={h} className="text-[10px] font-medium tracking-[0.08em] text-[#F5F5F0]/25">{h}</span>
          ))}
        </div>
        {leads.map((l, i) => (
          <div
            key={l.name}
            className={`grid grid-cols-4 items-center px-4 py-3 transition-colors duration-200 hover:bg-white/[0.02] ${
              i < leads.length - 1 ? "border-b border-white/5" : ""
            }`}
          >
            <span className="text-[12px] font-medium text-[#F5F5F0]/75">{l.name}</span>
            <span className="text-[11px] text-[#F5F5F0]/40">{l.curriculum}</span>
            <div>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: `${l.statusColor}18`, color: l.statusColor }}
              >
                {l.status}
              </span>
            </div>
            <span className="text-[10px] text-[#F5F5F0]/25">{l.date}</span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN SECTION
// ══════════════════════════════════════════════════════════════
export function FeaturesSection() {
  const { ref, visible } = useVisible(0.08);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#0A0A0A] py-28">

      {/* Top rule */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-7xl px-8 md:px-16">

        {/* ── Section header ── */}
        <div
          className="mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px w-8 bg-[#C9A84C]/50" />
            <span className="text-[11px] font-medium tracking-[0.16em] text-[#C9A84C]">
              EVERYTHING YOU NEED
            </span>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h3
              className="text-[40px] font-black leading-[1.05] tracking-[-1.5px] text-[#F5F5F0] md:text-[50px]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              One platform.
              <br />
              <span className="text-[#C9A84C]">Every tool you need.</span>
            </h3>
            <p className="max-w-[360px] text-[14px] font-light leading-[1.8] text-[#F5F5F0]/40 lg:text-right">
              From lead capture to lesson reporting — EduNest brings your entire
              homeschooling operation into one elegant system.
            </p>
          </div>
        </div>

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

          {/* Row 1 */}
          <ProgramsCard visible={visible} />
          <ParentDashCard visible={visible} />
          <ReportingCard visible={visible} />

          {/* Row 2 — sessions spans 2 cols */}
          <SessionsCard visible={visible} />
          <TutorMgmtCard visible={visible} />

          {/* Row 3 — leads spans 2 cols */}
          <LeadsCard visible={visible} />
          <BillingCard visible={visible} />

        </div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    </section>
  );
}