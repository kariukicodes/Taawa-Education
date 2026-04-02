import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Tutors", href: "/tutors" },
  { label: "Contact", href: "#contact" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.06] bg-[#0A0A08]/90 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <Link
          to="/"
          className="text-[22px] font-bold tracking-[-0.03em] text-[#F5F5F0]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Edu<span className="text-[#C9A84C]">Nest</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[14px] font-medium text-[#F5F5F0]/58 transition-colors duration-300 hover:text-[#F5F5F0]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/login"
            className="text-[14px] font-medium text-[#F5F5F0]/58 transition-colors hover:text-[#F5F5F0]"
          >
            Sign In
          </Link>

          <a
            href="#contact"
            className="inline-flex items-center rounded-xl bg-[#C9A84C] px-5 py-2.5 text-[13px] font-semibold text-[#0A0A08] transition-all duration-300 hover:scale-[1.02] hover:bg-[#d4b054] active:scale-[0.98]"
          >
            Book Consultation
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#F5F5F0] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#0A0A08]/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-3 text-[14px] text-[#F5F5F0]/70 transition-colors hover:text-[#F5F5F0]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
            <Link
              to="/login"
              className="px-2 text-[14px] font-medium text-[#F5F5F0]/70"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>

            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center rounded-xl bg-[#C9A84C] px-5 py-3 text-[13px] font-semibold text-[#0A0A08]"
            >
              Book Consultation
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}