import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LandingNav } from "@/components/landing/LandingNav";
import { useContactModal } from "@/components/landing/ContactModalContext";

// Types

type Tutor = {
  name: string;
  role: string;
  subjects: string[];
  rating: number;
  students: number;
  experience: string;
  image: string;
  initials: string;
  bgColor: string;
  darkBgColor: string;
  textColor: string;
};

// Data

const tutors: Tutor[] = [
  {
    name: "Amina Odhiambo",
    role: "Mathematics & Sciences",
    subjects: ["CBC Math", "Physics", "Chemistry"],
    rating: 4.9,
    students: 32,
    experience: "8 yrs",
    image: "/amina.jpg",
    initials: "AO",
    bgColor: "#D6E8D4",
    darkBgColor: "#1A2E19",
    textColor: "#2D5A29",
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
    bgColor: "#D8E8F5",
    darkBgColor: "#111E2E",
    textColor: "#1A4A6E",
  },
  {
    name: "Cynthia Waweru",
    role: "Early Childhood & CBC",
    subjects: ["Grade 1â€“3", "Literacy", "Numeracy"],
    rating: 5.0,
    students: 18,
    experience: "5 yrs",
    image: "/cynthia.jpg",
    initials: "CW",
    bgColor: "#F5E6D8",
    darkBgColor: "#2A1A0E",
    textColor: "#6E3A1A",
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
    bgColor: "#E8D8F5",
    darkBgColor: "#1E1030",
    textColor: "#4A1A6E",
  },
  {
    name: "Esther Njoki",
    role: "Languages & Arts",
    subjects: ["Kiswahili", "Art", "Music"],
    rating: 4.7,
    students: 22,
    experience: "7 yrs",
    image: "/esther.jpg",
    initials: "EN",
    bgColor: "#F5F0D8",
    darkBgColor: "#252010",
    textColor: "#6E5A1A",
  },
];

const heroTutors = [tutors[0], tutors[1], tutors[4]];

// Sub-components

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "#C9A84C" : "none"}
          stroke="#C9A84C"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function TutorAvatar({
  tutor,
  imgErrors,
  setImgErrors,
  className,
  dark = false,
}: {
  tutor: Tutor;
  imgErrors: Record<string, boolean>;
  setImgErrors: Dispatch<SetStateAction<Record<string, boolean>>>;
  className?: string;
  dark?: boolean;
}) {
  const bg = dark ? tutor.darkBgColor : tutor.bgColor;
  return (
    <>
      <div
        className="absolute inset-0 flex items-end justify-center pb-6"
        style={{ background: bg }}
      >
        <span
          className="select-none text-[64px] font-black leading-none opacity-10"
          style={{ color: tutor.textColor }}
        >
          {tutor.initials}
        </span>
      </div>
      {!imgErrors[tutor.name] && (
        <img
          src={tutor.image}
          alt={tutor.name}
          className={className}
          onError={() =>
            setImgErrors((prev) => ({ ...prev, [tutor.name]: true }))
          }
        />
      )}
    </>
  );
}

// Mode Toggle

function ModeToggle({
  isTutors,
  onToggle,
}: {
  isTutors: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-4">
      {/* Programs label */}
      <span
        className={`text-[13px] font-semibold uppercase tracking-widest transition-colors duration-200 ${
          !isTutors
            ? "text-primary"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        Programs
      </span>

      {/* Toggle pill */}
      <button
        type="button"
        role="switch"
        aria-checked={isTutors}
        aria-label="Switch between Programs and Tutors"
        onClick={onToggle}
        className={`relative inline-flex h-[32px] w-[58px] flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isTutors
            ? "border-primary/40 bg-primary/10 dark:bg-primary/20"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
        }`}
      >
        <span
          className={`inline-block h-[22px] w-[22px] transform rounded-full shadow transition-all duration-300 ${
            isTutors
              ? "translate-x-[28px] bg-primary"
              : "translate-x-[3px] bg-gray-300 dark:bg-gray-500"
          }`}
        />
      </button>

      {/* Tutors label */}
      <span
        className={`text-[13px] font-semibold uppercase tracking-widest transition-colors duration-200 ${
          isTutors
            ? "text-primary"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        Tutors
      </span>
    </div>
  );
}

// Hero Section

function TutorsHero() {
  const { openModal } = useContactModal();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTutors, setIsTutors] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  const fade = (delay: string) =>
    `transition-all duration-700 ${delay} ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  const handleToggle = () => {
    if (isTutors) {
      // switching to Programs â€” navigate to programs page
      navigate("/programs");
    } else {
      setIsTutors(true);
    }
  };

  return (
    <section className="overflow-hidden bg-[#0F0F0F] pb-0 pt-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="grid min-h-[580px] items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">

          {/* Left: Copy */}
          <div className="flex flex-col justify-center py-10">

            {/* Toggle */}
            <div className={`mb-10 ${fade("delay-0")}`}>
              <ModeToggle isTutors={isTutors} onToggle={handleToggle} />
            </div>

            {/* Headline */}
            <h1
              className={`mb-6 max-w-[560px] text-[58px] font-normal leading-[1.07] tracking-[-0.04em] text-gray-50 ${fade("delay-100")}`}
            >
              Hire top private{" "}
              <span className="font-bold text-primary">tutors</span> and
              bring your child&apos;s goals to life.
            </h1>

            {/* Subheading */}
            <p
              className={`mb-8 max-w-[480px] text-[17px] leading-[1.6] text-gray-400 ${fade("delay-200")}`}
            >
              Discover Nairobi&apos;s finest tutors and transform your
              child&apos;s learning journey with exceptional care, subject
              depth, and one-on-one support.
            </p>

            {/* CTAs */}
            <div className={`flex flex-wrap gap-3 ${fade("delay-300")}`}>
              <a
                href="#tutors-grid"
                className="inline-flex items-center justify-center rounded-[10px] bg-primary px-7 py-[14px] text-[14px] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Explore Tutors
              </a>
              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.05] px-7 py-[14px] text-[14px] font-medium text-white/70 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
              >
                Post a Job
              </button>
            </div>
          </div>

          {/* Right: Accordion cards */}
          <div
            className={`flex items-end gap-3 pb-0 ${fade("delay-300")}`}
            onMouseLeave={() => setActiveIndex(0)}
          >
            {heroTutors.map((tutor, i) => {
              const isActive = i === activeIndex;
              return (
                <article
                  key={tutor.name}
                  className={`relative cursor-pointer overflow-hidden rounded-[22px] border border-white/6 transition-all duration-500 ease-out ${
                    isActive ? "h-[440px] w-[280px]" : "h-[440px] w-[110px]"
                  }`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => setActiveIndex(i)}
                >
                  {/* bg set via JS since it's dynamic */}
                  <TutorAvatar
                    tutor={tutor}
                    imgErrors={imgErrors}
                    setImgErrors={setImgErrors}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-500"
                  />

                  {/* Active footer */}
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-b-[22px] bg-[#111]/90 backdrop-blur-sm transition-all duration-500 ${
                      isActive
                        ? "px-5 pb-5 pt-4 opacity-100"
                        : "pointer-events-none px-5 pb-0 pt-0 opacity-0"
                    }`}
                  >
                    <p className="text-[15px] font-semibold leading-none text-gray-100">
                      {tutor.name}
                    </p>
                    <p className="mt-1 text-[12px] text-gray-400">
                      {tutor.role}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars rating={tutor.rating} />
                      <span className="text-[11px] text-gray-400">{tutor.rating}</span>
                    </div>
                    <p className="mt-2 text-[12px] text-gray-400">
                      {tutor.students * 10}+ sessions
                    </p>
                  </div>

                  {/* Collapsed name label */}
                  {!isActive && (
                    <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                      <span
                        className="-rotate-90 whitespace-nowrap text-[11px] font-semibold tracking-wide opacity-60"
                        style={{ color: tutor.textColor }}
                      >
                        {tutor.name.split(" ")[0]}
                      </span>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Partners strip */}
        <div className="border-t border-white/8 py-10">
          <p className="mb-6 text-center text-[12px] font-medium uppercase tracking-widest text-gray-500">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
            {["Brighter Minds", "Elimu Hub", "Safari Scholars", "Twiga Learn"].map((p) => (
              <span
                key={p}
                className="text-[20px] font-semibold tracking-tight text-white/25"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Tutors Grid Section

function TutorsGrid() {
  const { openModal } = useContactModal();
  const [filter, setFilter] = useState("All");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const filters = ["All", "CBC", "British", "Sciences", "Languages"];

  const filteredTutors =
    filter === "All"
      ? tutors
      : tutors.filter(
          (t) =>
            t.subjects.some((s) =>
              s.toLowerCase().includes(filter.toLowerCase())
            ) || t.role.toLowerCase().includes(filter.toLowerCase())
        );

  return (
    <section
      id="tutors-grid"
      className="bg-[#10100F] py-24"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">

        {/* Section header */}
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
              Explore profiles
            </p>
            <h2 className="max-w-[480px] text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-gray-50">
              Browse tutors by curriculum and teaching style.
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-gray-400">
            Each profile highlights subject fit, experience, and the kind of
            learning relationship parents can expect.
          </p>
        </div>

        {/* Filter pills */}
        <div className="mb-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-white/10 bg-white/[0.04] text-gray-400 hover:border-white/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.name}
              className="group overflow-hidden rounded-[20px] border border-white/6 bg-[#181817] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-md"
            >
              {/* Photo area */}
              <div className="relative h-[240px] overflow-hidden">
                <TutorAvatar
                  tutor={tutor}
                  imgErrors={imgErrors}
                  setImgErrors={setImgErrors}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />

                {/* Experience badge */}
                <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-semibold text-gray-200 backdrop-blur-sm">
                  {tutor.experience}
                </span>

                {/* Fade to card bg */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#181817] to-transparent" />
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-[15px] font-semibold text-gray-100">
                  {tutor.name}
                </h3>
                <p className="mt-0.5 text-[12px] text-gray-400">
                  {tutor.role}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Stars rating={tutor.rating} />
                  <span className="text-[11px] text-gray-400">
                    {tutor.rating} Â· {tutor.students}+ students
                  </span>
                </div>

                {/* Subject tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-400"
                    >
                      {subject}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={openModal}
                  className="mt-4 w-full rounded-[10px] border border-white/10 py-2.5 text-[13px] font-medium text-gray-300 transition-all hover:border-primary/35 hover:bg-primary hover:text-primary-foreground"
                >
                  Book a Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <p className="text-[14px] text-gray-400">
            Not sure who&apos;s the right fit? We&apos;ll shortlist options for you.
          </p>
          <button
            type="button"
            onClick={openModal}
            className="rounded-[10px] bg-primary px-8 py-3.5 text-[14px] font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
          >
            Request a Custom Tutor Match
          </button>
        </div>
      </div>
    </section>
  );
}

// Page

export default function TutorsPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <LandingNav />
      <main>
        <TutorsHero />
        <TutorsGrid />
      </main>
    </div>
  );
}
