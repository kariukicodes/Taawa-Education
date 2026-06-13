import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useContactModal } from "./ContactModalContext";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Tutors", href: "/tutors" },
  { label: "Contact", href: "/#contact" },
];

type LandingNavProps = {
  theme?: "dark" | "light";
};

export function LandingNav({ theme = "dark" }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal } = useContactModal();

  const isLight = theme === "light";
  const navTextClass = isLight ? "text-[#1E2430]" : "text-foreground";
  const navMutedClass = isLight ? "text-[#7B8698]" : "text-muted-foreground";
  const navHoverClass = isLight ? "hover:text-[#1E2430]" : "hover:text-foreground";
  const scrolledClass = isLight
    ? "border-b border-black/5 bg-[#F7F7F2]/92 backdrop-blur-xl"
    : "border-b border-white/[0.06] bg-[#0A0A08]/90 backdrop-blur-xl";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? scrolledClass : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <Link
          to="/"
          className={`font-display text-[22px] font-bold tracking-[-0.03em] ${navTextClass}`}
        >
          Edu<span className="text-primary">Nest</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-[14px] font-medium transition-colors duration-300 ${navMutedClass} ${navHoverClass}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className={`text-[14px] font-medium transition-colors ${navMutedClass} ${navHoverClass}`}
          >
            Sign In
          </Link>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              openModal();
            }}
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
          >
            Book Consultation
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`${navTextClass} md:hidden`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className={`px-4 py-4 backdrop-blur-xl md:hidden ${
            isLight ? "border-t border-black/5 bg-[#F7F7F2]/96" : "border-t border-white/[0.06] bg-[#0A0A08]/95"
          }`}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-2 py-3 text-[14px] transition-colors ${navMutedClass} ${navHoverClass}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className={`mt-4 flex flex-col gap-3 pt-4 ${isLight ? "border-t border-black/5" : "border-t border-white/[0.06]"}`}>
            <Link
              to="/login"
              className={`px-2 text-[14px] font-medium ${navMutedClass}`}
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>

            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                openModal();
              }}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-[13px] font-semibold text-primary-foreground"
            >
              Book Consultation
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
