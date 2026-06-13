import {
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MessageSquareQuote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/landing/Footer";
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
    subjects: ["Grade 1-3", "Literacy", "Numeracy"],
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
const joinTutors = [tutors[0], tutors[3], tutors[2]];

// Shared: Stars

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
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

// Shared: TutorAvatar

function TutorAvatar({
  tutor,
  imgErrors,
  setImgErrors,
  className,
  dark = false,
  imageStyle,
}: {
  tutor: Tutor;
  imgErrors: Record<string, boolean>;
  setImgErrors: Dispatch<SetStateAction<Record<string, boolean>>>;
  className?: string;
  dark?: boolean;
  imageStyle?: CSSProperties;
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
          style={imageStyle}
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
      <span
        className={`text-[13px] font-semibold uppercase tracking-widest transition-colors duration-200 ${
          !isTutors ? "text-primary" : "text-gray-400"
        }`}
      >
        Programs
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isTutors}
        aria-label="Switch between Programs and Tutors"
        onClick={onToggle}
        className={`relative inline-flex h-[32px] w-[58px] flex-shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          isTutors
            ? "border-primary/40 bg-primary/10"
            : "border-gray-300 bg-white"
        }`}
      >
        <span
          className={`inline-block h-[22px] w-[22px] transform rounded-full shadow transition-all duration-300 ${
            isTutors
              ? "translate-x-[28px] bg-primary"
              : "translate-x-[3px] bg-gray-300"
          }`}
        />
      </button>
      <span
        className={`text-[13px] font-semibold uppercase tracking-widest transition-colors duration-200 ${
          isTutors ? "text-primary" : "text-gray-400"
        }`}
      >
        Tutors
      </span>
    </div>
  );
}

// Hero

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
    if (isTutors) navigate("/programs");
    else setIsTutors(true);
  };

  return (
    <section className="overflow-hidden bg-[#0F0F0F] pb-0 pt-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="grid min-h-[580px] items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">

          {/* Left */}
          <div className="flex flex-col justify-center py-10">
            <div className={`mb-10 ${fade("delay-0")}`}>
              <ModeToggle isTutors={isTutors} onToggle={handleToggle} />
            </div>
            <h1 className={`mb-6 max-w-[560px] text-[58px] font-normal leading-[1.07] tracking-[-0.04em] text-gray-50 ${fade("delay-100")}`}>
              Hire top private{" "}
              <span className="font-bold text-primary">tutors</span> and
              bring your child&apos;s goals to life.
            </h1>
            <p className={`mb-8 max-w-[480px] text-[17px] leading-[1.6] text-gray-400 ${fade("delay-200")}`}>
              Discover Nairobi&apos;s finest tutors and transform your child&apos;s learning
              journey with exceptional care, subject depth, and one-on-one support.
            </p>
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

          {/* Right: accordion cards */}
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
                  <TutorAvatar
                    tutor={tutor}
                    imgErrors={imgErrors}
                    setImgErrors={setImgErrors}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-all duration-500"
                  />
                  <div
                    className={`absolute inset-x-0 bottom-0 rounded-b-[22px] bg-[#111]/90 backdrop-blur-sm transition-all duration-500 ${
                      isActive ? "px-5 pb-5 pt-4 opacity-100" : "pointer-events-none px-5 pb-0 pt-0 opacity-0"
                    }`}
                  >
                    <p className="text-[15px] font-semibold leading-none text-gray-100">{tutor.name}</p>
                    <p className="mt-1 text-[12px] text-gray-400">{tutor.role}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars rating={tutor.rating} />
                      <span className="text-[11px] text-gray-400">{tutor.rating}</span>
                    </div>
                    <p className="mt-2 text-[12px] text-gray-400">{tutor.students * 10}+ sessions</p>
                  </div>
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
          <p className="mb-6 text-center text-[12px] font-medium uppercase tracking-widest text-gray-500">Trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
            {["Brighter Minds", "Elimu Hub", "Safari Scholars", "Twiga Learn"].map((p) => (
              <span key={p} className="text-[20px] font-semibold tracking-tight text-white/25">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Tutors Grid

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
            t.subjects.some((s) => s.toLowerCase().includes(filter.toLowerCase())) ||
            t.role.toLowerCase().includes(filter.toLowerCase()),
        );

  return (
    <section id="tutors-grid" className="bg-[#10100F] py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-primary">Explore profiles</p>
            <h2 className="max-w-[480px] text-[36px] font-bold leading-[1.1] tracking-[-0.03em] text-gray-50">
              Browse tutors by curriculum and teaching style.
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-gray-400">
            Each profile highlights subject fit, experience, and the kind of learning
            relationship parents can expect.
          </p>
        </div>

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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.name}
              className="group overflow-hidden rounded-[20px] border border-white/6 bg-[#181817] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-md"
            >
              <div className="relative h-[240px] overflow-hidden">
                <TutorAvatar
                  tutor={tutor}
                  imgErrors={imgErrors}
                  setImgErrors={setImgErrors}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-semibold text-gray-200 backdrop-blur-sm">
                  {tutor.experience}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#181817] to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="text-[15px] font-semibold text-gray-100">{tutor.name}</h3>
                <p className="mt-0.5 text-[12px] text-gray-400">{tutor.role}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Stars rating={tutor.rating} />
                  <span className="text-[11px] text-gray-400">{tutor.rating} - {tutor.students}+ students</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-400">
                      {s}
                    </span>
                  ))}
                </div>
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

        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <p className="text-[14px] text-gray-400">Not sure who&apos;s the right fit? We&apos;ll shortlist options for you.</p>
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

// Join as Tutor
// Design ref: YouDesign Africa - light bg, large headline with colored keywords,
// tall accordion portrait cards with frosted name panels, clean left-right layout.

const perks = [
  { icon: "💰", title: "Competitive earnings", body: "Earn KES 1,500-3,000+ per session. Weekly payouts straight to M-Pesa or your bank with no delays." },
  { icon: "📅", title: "Flexible schedule", body: "Morning, evening, weekend - teach when it works. You set your availability, we fill your calendar." },
  { icon: "👨‍👩‍👧", title: "Pre-matched families", body: "We handle discovery and vetting. You meet families already aligned with your subjects and approach." },
  { icon: "📈", title: "Grow your profile", body: "Verified ratings, session history, and reviews. Top tutors get featured placement to new families." },
];

const tutorTestimonials = [
  {
    name: "Amina Odhiambo",
    quote:
      "EduNest helped me build a steady weekly rhythm with families who already value one-on-one learning.",
  },
  {
    name: "David Kariuki",
    quote:
      "The matching process is thoughtful. I spend less time chasing leads and more time teaching students I am a strong fit for.",
  },
  {
    name: "Cynthia Waweru",
    quote:
      "Parents come in with clear expectations, which makes every session feel focused and rewarding from the start.",
  },
  {
    name: "Brian Mutua",
    quote:
      "The experience feels professional throughout. Communication is fast, and the families are genuinely committed.",
  },
  {
    name: "Esther Njoki",
    quote:
      "Being visible on the platform has grown my confidence and brought me steady referrals from the right households.",
  },
];

// Warm card palette adapted to the site's darker visual language
const cardPalette = [
  { bg: "#2B2117", panel: "rgba(94,68,26,0.82)" },
  { bg: "#5A411E", panel: "rgba(68,44,13,0.86)" },
  { bg: "#1F262A", panel: "rgba(18,28,34,0.88)" },
];

function JoinShowcaseCard({
  tutor,
  paletteIndex,
  isExpanded,
}: {
  tutor: Tutor;
  paletteIndex: number;
  isExpanded: boolean;
}) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const palette = cardPalette[paletteIndex];
  const collapsedTransforms = [
    { transform: "scale(1)", marginLeft: "0px", zIndex: 3 },
    { transform: "scale(0.91, 0.87)", marginLeft: "-88px", zIndex: 2 },
    { transform: "scale(0.84, 0.8)", marginLeft: "-104px", zIndex: 1 },
  ] as const;
  const collapsedState = collapsedTransforms[paletteIndex];

  return (
    <article
      className="relative h-full flex-shrink-0 cursor-pointer overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
      style={{
        width: "212px",
        backgroundColor: palette.bg,
        transform: isExpanded ? "scale(1)" : collapsedState.transform,
        marginLeft: isExpanded ? "0px" : collapsedState.marginLeft,
        zIndex: isExpanded ? 3 - paletteIndex : collapsedState.zIndex,
        transition: "transform 0.8s ease, margin-left 0.8s ease",
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[28px]">
        <div
          className="absolute inset-0 flex items-end justify-center pb-8"
          style={{ background: palette.bg }}
        >
          <span className="select-none text-[80px] font-black leading-none opacity-[0.08] text-white">
            {tutor.initials}
          </span>
        </div>
        {!imgErrors[tutor.name] && (
          <img
            src={tutor.image}
            alt={tutor.name}
            className="absolute left-0 w-full object-cover object-top"
            style={{
              height: "100%",
              top: "0px",
              transition: "transform 0.85s cubic-bezier(0.4,0,0.2,1)",
            }}
            onError={() => setImgErrors((prev) => ({ ...prev, [tutor.name]: true }))}
          />
        )}
      </div>

      <div
        className="absolute inset-x-3 bottom-3 rounded-[20px] px-4 py-3.5 backdrop-blur-md"
        style={{
          background: palette.panel,
          minHeight: "84px",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-white">{tutor.name}</p>
        <p className="mt-0.5 text-[12px] text-white/65">{tutor.role}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 2).map((s) => (
              <span key={s} className="rounded-full border border-white/15 bg-black/20 px-2.5 py-0.5 text-[10px] text-white/80">
                {s}
              </span>
            ))}
          </div>
          <Stars rating={tutor.rating} size={11} />
        </div>
      </div>
    </article>
  );
}

function JoinAsTutor() {
  const emptyFormData = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    curriculum: "",
    experience: "",
    message: "",
  };
  const [formData, setFormData] = useState(emptyFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
  const [isShowcaseExpanded, setIsShowcaseExpanded] = useState(false);
  const isAnyModalOpen = isApplicationModalOpen || isPerksModalOpen;

  useEffect(() => {
    if (!isAnyModalOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsApplicationModalOpen(false);
        setIsPerksModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAnyModalOpen]);

  const openApplicationModal = () => {
    if (submitted) {
      setFormData(emptyFormData);
      setSubmitted(false);
    }
    setIsPerksModalOpen(false);
    setIsApplicationModalOpen(true);
  };

  const closeApplicationModal = () => {
    setIsApplicationModalOpen(false);
  };

  const openPerksModal = () => {
    setIsApplicationModalOpen(false);
    setIsPerksModalOpen(true);
  };

  const closePerksModal = () => {
    setIsPerksModalOpen(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="join-as-tutor" className="relative overflow-hidden">
      <div className="relative overflow-hidden bg-[#0E0E0D] px-6 py-16 md:px-10 lg:px-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[10%] h-[340px] w-[340px] rounded-full bg-primary/[0.12] blur-[90px]" />
          <div className="absolute right-[5%] top-[5%] h-[260px] w-[260px] rounded-full bg-[#5B431A]/25 blur-[80px]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_auto] lg:gap-16">
            <div>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 shadow-sm backdrop-blur-sm">
                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-medium text-white/82">For educators</span>
              </div>

              <h2 className="max-w-[500px] text-[38px] font-normal leading-[1.02] tracking-[-0.05em] text-white md:text-[48px]">
                Teach with <span className="font-bold text-primary">EduNest</span>.
                <br />
                Meet better-fit <span className="font-bold text-primary">families</span>.
              </h2>

              <p className="mt-5 max-w-[430px] text-[15px] leading-[1.7] text-white/58">
                Flexible scheduling, trusted matches, and a profile that grows with every session.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openApplicationModal}
                  className="inline-flex items-center justify-center rounded-[12px] bg-primary px-7 py-[14px] text-[14px] font-semibold text-[#0F0F0F] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
                >
                  Apply now
                </button>
                <button
                  type="button"
                  onClick={openPerksModal}
                  className="inline-flex items-center justify-center rounded-[12px] border border-white/12 bg-white/[0.02] px-7 py-[14px] text-[14px] font-medium text-white/78 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white/[0.06]"
                >
                  See perks
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { val: "340+", label: "families on platform" },
                  { val: "4.9", label: "avg tutor rating" },
                  { val: "48h", label: "onboarding time" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[20px] font-bold text-primary">{s.val}</p>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/36">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="hidden h-[390px] w-[620px] items-end justify-end overflow-hidden lg:flex"
              style={{
                gap: isShowcaseExpanded ? "7px" : "0px",
                transition: "gap 0.5s ease",
              }}
              onMouseEnter={() => setIsShowcaseExpanded(true)}
              onMouseLeave={() => setIsShowcaseExpanded(false)}
            >
              {joinTutors.map((tutor, i) => (
                <JoinShowcaseCard
                  key={tutor.name}
                  tutor={tutor}
                  paletteIndex={i}
                  isExpanded={isShowcaseExpanded}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {isApplicationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={closeApplicationModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="educator-application-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#141412] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.5)] md:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                  Educator application
                </p>
                <h3 id="educator-application-title" className="mb-1 text-[22px] font-bold text-white">
                  Apply to teach with us
                </h3>
                <p className="text-[14px] text-white/35">Takes 3 minutes. We reply within 48 hours.</p>
              </div>
              <button
                type="button"
                onClick={closeApplicationModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl leading-none text-white/65 transition-colors hover:border-white/20 hover:text-white"
                aria-label="Close application modal"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center gap-5 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-[20px] font-bold text-white">Application received!</h4>
                <p className="max-w-sm text-[14px] text-white/40">
                  We&apos;ll review your details and reach out within 48 hours to
                  schedule your vetting call.
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(emptyFormData);
                      setSubmitted(false);
                    }}
                    className="text-[13px] text-primary underline-offset-2 hover:underline"
                  >
                    Submit another application
                  </button>
                  <button
                    type="button"
                    onClick={closeApplicationModal}
                    className="rounded-[10px] border border-white/10 px-4 py-2 text-[13px] font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/45">Full name *</label>
                    <input required type="text" placeholder="e.g. Amina Odhiambo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none transition-colors focus:border-primary/50 focus:bg-white/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/45">Email address *</label>
                    <input required type="email" placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none transition-colors focus:border-primary/50 focus:bg-white/[0.06]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/45">Phone number *</label>
                    <input required type="tel" placeholder="+254 7XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none transition-colors focus:border-primary/50 focus:bg-white/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/45">Years of experience *</label>
                    <select required value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full rounded-[10px] border border-white/10 bg-[#141412] px-4 py-3 text-[14px] text-white outline-none transition-colors focus:border-primary/50"
                    >
                      <option value="" disabled>Select range</option>
                      <option value="0-1">Less than 1 year</option>
                      <option value="1-3">1 - 3 years</option>
                      <option value="3-5">3 - 5 years</option>
                      <option value="5-10">5 - 10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/45">Main subject(s) *</label>
                    <input required type="text" placeholder="e.g. Mathematics, Physics"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none transition-colors focus:border-primary/50 focus:bg-white/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/45">Curriculum *</label>
                    <select required value={formData.curriculum}
                      onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                      className="w-full rounded-[10px] border border-white/10 bg-[#141412] px-4 py-3 text-[14px] text-white outline-none transition-colors focus:border-primary/50"
                    >
                      <option value="" disabled>Select curriculum</option>
                      <option value="cbc">CBC (Kenya)</option>
                      <option value="british">British / IGCSE</option>
                      <option value="montessori">Montessori</option>
                      <option value="multiple">Multiple</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-white/45">Why do you want to join? (optional)</label>
                  <textarea rows={3}
                    placeholder="Tell us about your teaching philosophy or what makes you great..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full resize-none rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none transition-colors focus:border-primary/50 focus:bg-white/[0.06]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-[12px] bg-primary py-4 text-[14px] font-bold text-[#0F0F0F] transition-all hover:scale-[1.01] hover:bg-primary/90 hover:shadow-[0_8px_24px_rgba(201,168,76,0.25)] active:scale-[0.99]"
                >
                  Submit Application
                </button>

                <p className="text-center text-[11px] text-white/20">
                  By applying you agree to our{" "}
                  <a href="/terms" className="text-white/35 hover:text-primary">Terms</a> and{" "}
                  <a href="/privacy" className="text-white/35 hover:text-primary">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {isPerksModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          onClick={closePerksModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="educator-perks-title"
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#141412] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.5)] md:p-10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">
                  Educator perks
                </p>
                <h3 id="educator-perks-title" className="mb-1 text-[22px] font-bold text-white">
                  Why tutors choose EduNest
                </h3>
                <p className="max-w-2xl text-[14px] leading-[1.7] text-white/35">
                  A quick look at the value behind the network: stronger matches,
                  better scheduling flexibility, and a profile that keeps growing
                  with every great family experience.
                </p>
              </div>
              <button
                type="button"
                onClick={closePerksModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl leading-none text-white/65 transition-colors hover:border-white/20 hover:text-white"
                aria-label="Close perks modal"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {perks.map((perk) => (
                <div
                  key={perk.title}
                  className="rounded-[22px] border border-white/6 bg-white/[0.03] p-6"
                >
                  <span className="mb-4 block text-[28px]">{perk.icon}</span>
                  <h4 className="mb-2 text-[15px] font-semibold text-white">{perk.title}</h4>
                  <p className="text-[13px] leading-[1.7] text-white/45">{perk.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-white/6 bg-white/[0.025] px-5 py-4">
              <p className="max-w-xl text-[13px] leading-[1.7] text-white/45">
                Ready to join? Open the application modal and send your details in a
                few minutes.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openApplicationModal}
                  className="inline-flex items-center justify-center rounded-[12px] bg-primary px-5 py-3 text-[14px] font-semibold text-[#0F0F0F] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                  Start Application
                </button>
                <button
                  type="button"
                  onClick={closePerksModal}
                  className="inline-flex items-center justify-center rounded-[12px] border border-white/10 px-5 py-3 text-[14px] font-medium text-white/70 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TutorTestimonials() {
  const [startIndex, setStartIndex] = useState(0);

  const visibleTestimonials = Array.from({ length: 3 }, (_, index) => {
    return tutorTestimonials[(startIndex + index) % tutorTestimonials.length];
  });

  return (
    <section className="bg-[#050505] px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[860px]">
            <div className="mb-6 inline-flex items-center gap-2.5 text-white">
              <MessageSquareQuote className="h-5 w-5 text-white" />
              <span className="text-[15px] font-medium tracking-[-0.02em] text-white/92">
                Testimonial
              </span>
            </div>

            <h2 className="text-[42px] font-normal leading-[0.94] tracking-[-0.06em] text-white md:text-[68px]">
              Success in their words.
              <br />
              Real <span className="font-bold text-primary">experience</span> real{" "}
              <span className="font-bold text-primary">success</span>.
            </h2>
          </div>

          <div className="flex items-center gap-5 lg:pt-8">
            <button
              type="button"
              aria-label="Previous testimonials"
              onClick={() =>
                setStartIndex((current) =>
                  (current - 1 + tutorTestimonials.length) % tutorTestimonials.length,
                )
              }
              className="inline-flex h-[64px] w-[64px] items-center justify-center rounded-full border border-primary text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/8"
            >
              <ArrowLeft className="h-8 w-8" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="Next testimonials"
              onClick={() =>
                setStartIndex((current) => (current + 1) % tutorTestimonials.length)
              }
              className="inline-flex h-[64px] w-[64px] items-center justify-center rounded-full bg-primary text-[#0F0F0F] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              <ArrowRight className="h-8 w-8" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {visibleTestimonials.map((testimonial) => (
            <article
              key={`${testimonial.name}-${testimonial.quote}`}
              className="min-h-[235px] rounded-[28px] bg-[#151515] px-7 pb-7 pt-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
            >
              <h3 className="mb-8 text-[18px] font-medium tracking-[-0.03em] text-white">
                {testimonial.name}
              </h3>

              <p className="max-w-[29ch] text-[18px] leading-[1.65] tracking-[-0.025em] text-white/96">
                {testimonial.quote}
              </p>
            </article>
          ))}
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
        <JoinAsTutor />
        <TutorTestimonials />
      </main>
      <Footer />
    </div>
  );
}
