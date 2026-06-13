import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCheck, Users } from "lucide-react";
import { useContactModal } from "@/components/landing/ContactModalContext";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function ModeToggle({
  isPrograms,
  onToggle,
}: {
  isPrograms: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-4">
      <span
        className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 ${
          isPrograms ? "text-primary" : "text-white/28"
        }`}
      >
        Programs
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={!isPrograms}
        aria-label="Switch between Programs and Tutors"
        onClick={onToggle}
        className={`relative inline-flex h-[28px] w-[52px] flex-shrink-0 cursor-pointer items-center rounded-full border p-[3px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isPrograms
            ? "border-white/10 bg-white/6"
            : "border-primary/30 bg-primary/15"
        }`}
      >
        <span
          className={`inline-block h-[20px] w-[20px] transform rounded-full shadow-md transition-all duration-300 ${
            isPrograms
              ? "translate-x-0 bg-white/30"
              : "translate-x-[24px] bg-primary"
          }`}
        />
      </button>

      <span
        className={`text-[11px] font-bold uppercase tracking-widest transition-colors duration-200 ${
          !isPrograms ? "text-primary" : "text-white/28"
        }`}
      >
        Tutors
      </span>
    </div>
  );
}

// ─── Floating UI Cards ────────────────────────────────────────────────────────

function MilestoneCard() {
  return (
    <div className="absolute left-4 top-10 w-[196px] -rotate-[6deg] rounded-[18px] border border-white/8 bg-[#1A1A17] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/15">
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>
      <p className="mb-1 text-[10px] text-white/35">Today's milestone</p>
      <p className="text-[14px] font-semibold leading-snug text-white">
        Review CBC<br />week 4 plan
      </p>
    </div>
  );
}

function ProgressCard() {
  return (
    <div className="absolute right-4 top-10 w-[210px] rotate-[5deg] rounded-[18px] border border-white/8 bg-[#1A1A17] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <p className="text-[13px] font-semibold text-white">Term Progress</p>
      <p className="mb-3 text-[10px] text-white/35">CBC · Grade 5 · Term 2</p>
      <div className="mb-1 h-[5px] overflow-hidden rounded-full bg-white/8">
        <div className="h-full w-[72%] rounded-full bg-primary" />
      </div>
      <div className="mb-3 flex justify-between text-[10px] text-white/30">
        <span>Week 8 of 11</span><span>72%</span>
      </div>
      <div className="mb-1 h-[5px] overflow-hidden rounded-full bg-white/8">
        <div className="h-full w-[55%] rounded-full bg-[#7A9E7E]" />
      </div>
      <div className="flex justify-between text-[10px] text-white/30">
        <span>Assignments</span><span>55%</span>
      </div>
    </div>
  );
}

function SessionCard() {
  return (
    <div className="absolute left-1/2 top-1/2 w-[228px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-white/10 bg-[#181816] p-5 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] bg-primary/15 text-[15px] font-black text-primary">
          AO
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white">Amina Odhiambo</p>
          <p className="text-[10px] text-white/35">CBC · Mathematics</p>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2 rounded-[8px] bg-[#7A9E7E]/15 px-3 py-2.5">
        <span className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-[#7A9E7E]" />
        <span className="text-[11px] font-semibold text-[#7A9E7E]">Session confirmed</span>
      </div>
      <div className="space-y-1.5 border-t border-white/6 pt-3">
        {[
          ["Next session", "Tue, 9:00 AM"],
          ["Subject", "Grade 5 Math"],
          ["Sessions done", "28 / 40"],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10px] text-white/35">{label}</span>
            <span className="text-[11px] font-semibold text-white">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShortlistCard() {
  return (
    <div className="absolute bottom-8 left-4 w-[188px] rounded-[18px] border border-white/8 bg-[#181816] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <p className="mb-3 text-[13px] font-semibold text-white">Top matches</p>
      {[
        { name: "CBC", tag: "Best fit", width: "78%", color: "#C9A84C" },
        { name: "British", tag: "Strong fit", width: "58%", color: "#7A9E7E" },
      ].map((item) => (
        <div key={item.name} className="mb-2 rounded-[10px] bg-white/[0.04] p-2.5">
          <div className="mb-1.5 flex justify-between text-[10px]">
            <span className="font-semibold text-white/80">{item.name}</span>
            <span className="text-white/30">{item.tag}</span>
          </div>
          <div className="h-[4px] overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full" style={{ width: item.width, background: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EnrolledCard() {
  return (
    <div className="absolute bottom-10 right-4 w-[176px] rounded-[18px] border border-white/8 bg-[#181816] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="mb-1 flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-white/30" />
        <span className="text-[10px] text-white/35">Families enrolled</span>
      </div>
      <p className="mb-2 text-[28px] font-bold text-primary">340+</p>
      <div className="inline-flex items-center gap-1.5 rounded-[6px] bg-primary/10 px-2.5 py-1.5">
        <CheckCheck className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold text-primary">Active this term</span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const programPills = ["CBC", "British", "Montessori", "Custom"];
const tutorPills   = ["CBC", "British", "Sciences", "Languages"];

export function ProgramsHero() {
  const { openModal } = useContactModal();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isPrograms, setIsPrograms] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  const fade = (delay: string) =>
    `transition-all duration-700 ${delay} ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  const handleToggle = () => {
    if (isPrograms) {
      navigate("/tutors");
    } else {
      setIsPrograms(true);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-[#0F0F0F] pt-24"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Gold glow top-left */}
      <div className="pointer-events-none absolute left-0 top-0 h-[420px] w-[420px] rounded-full bg-primary/[0.06] blur-[100px]" />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="grid min-h-[600px] items-center gap-10 lg:grid-cols-2">

          {/* ── Left copy ── */}
          <div className="flex flex-col justify-center py-14">

            {/* Toggle */}
            <div className={`mb-8 ${fade("delay-0")}`}>
              <ModeToggle isPrograms={isPrograms} onToggle={handleToggle} />
            </div>

            {/* Eyebrow */}
            <div className={`mb-6 ${fade("delay-75")}`}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-semibold tracking-[0.16em] text-white/50">
                  {isPrograms ? "CURRICULUM PATHWAYS" : "TUTOR PROFILES"}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1
              className={`mb-5 text-[52px] font-medium leading-[1.0] tracking-[-0.05em] text-white md:text-[60px] ${fade("delay-100")}`}
            >
              {isPrograms ? (
                <>
                  <span className="block">Choose, compare,</span>
                  <span className="block">and launch the right</span>
                  <span className="block text-primary">learning path.</span>
                </>
              ) : (
                <>
                  <span className="block">Hire top private</span>
                  <span className="block text-primary">tutors</span>
                  <span className="block">for your child.</span>
                </>
              )}
            </h1>

            {/* Subtext */}
            <p className={`mb-8 max-w-[460px] text-[16px] leading-[1.7] text-white/45 ${fade("delay-200")}`}>
              {isPrograms
                ? "Explore CBC, British, Montessori, and custom programs designed to match your child's stage, goals, and ideal pace of learning."
                : "Discover Nairobi's finest tutors and transform your child's learning journey with exceptional care, subject depth, and one-on-one support."}
            </p>

            {/* CTAs */}
            <div className={`mb-7 flex flex-wrap gap-3 ${fade("delay-300")}`}>
              <a
                href={isPrograms ? "#cbc" : "#tutors-grid"}
                className="rounded-[12px] bg-primary px-7 py-[13px] text-[14px] font-bold text-[#0F0F0F] transition-all hover:scale-[1.02] hover:bg-primary/90"
              >
                {isPrograms ? "Explore Programs" : "Explore Tutors"}
              </a>
              <button
                type="button"
                onClick={openModal}
                className="rounded-[12px] border border-white/10 bg-white/[0.05] px-7 py-[13px] text-[14px] font-medium text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.08]"
              >
                Get Guidance
              </button>
            </div>

            {/* Pills */}
            <div className={`flex flex-wrap gap-2 ${fade("delay-400")}`}>
              {(isPrograms ? programPills : tutorPills).map((pill) => (
                <span
                  key={pill}
                  className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium text-white/45 transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: floating cards ── */}
          <div className={`relative hidden h-[560px] lg:block ${fade("delay-300")}`}>
            <MilestoneCard />
            <ProgressCard />
            <SessionCard />
            <ShortlistCard />
            <EnrolledCard />
          </div>

        </div>
      </div>
    </section>
  );
}

export default ProgramsHero;
