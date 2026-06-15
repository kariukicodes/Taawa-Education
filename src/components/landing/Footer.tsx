import { Facebook, Instagram, Linkedin, Music2, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const socials = [
  { icon: Facebook, href: "/#contact", label: "Facebook" },
  { icon: Instagram, href: "/#contact", label: "Instagram" },
  { icon: Linkedin, href: "/#contact", label: "LinkedIn" },
  { icon: Youtube, href: "/#contact", label: "YouTube" },
  { icon: Music2, href: "/#contact", label: "TikTok" },
];

const columns = [
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "FAQ", to: "/#faq" },
      { label: "Contact Us", to: "/#contact" },
      { label: "Fees", to: "/policy/fees" },
    ],
  },
  {
    heading: "For Parents",
    links: [
      { label: "Find a Tutor", to: "/tutors" },
      { label: "Explore Programs", to: "/programs" },
      { label: "Subject Selection", to: "/programs" },
      { label: "How It Works", to: "/#how-it-works" },
      { label: "Book a Consultation", to: "/#contact" },
    ],
  },
  {
    heading: "For Tutors",
    links: [
      { label: "Join as a Tutor", to: "/tutors#join-as-tutor" },
      { label: "Tutor Guidelines", to: "/tutors/guide" },
      { label: "Tutor Dashboard", to: "/login" },
      { label: "Resources", to: "/resources" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Fees Policy", to: "/policy/fees" },
      { label: "Admissions Policy", to: "/policy/admissions" },
      { label: "Child Protection Policy", to: "/policy/child-protection" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0A0A08] px-6 pt-16 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 pb-16 md:grid-cols-3 lg:grid-cols-[220px_1fr_1fr_1fr_1fr] lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="h-[9px] w-[9px] flex-shrink-0 rounded-full bg-primary" />
              <span className="text-[20px] font-bold tracking-[-0.03em] text-white">
                EduNest
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h4 className="mb-6 text-[15px] font-semibold text-white">
                {column.heading}
              </h4>
              <ul className="space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to.includes("#") ? (
                      <a
                        href={link.to}
                        className="text-[13px] text-white/50 transition-colors duration-150 hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-[13px] text-white/50 transition-colors duration-150 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] py-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[12px] text-white/35">
              (c) {new Date().getFullYear()} Taawa Education Ltd. All rights reserved.
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-white/22">
              Malik Heights, 6th Floor, Ngong Road, Nairobi, Kenya
              {" | "}
              128 City Road, London, EC1V 2NX, United Kingdom
            </p>
          </div>

          <div className="flex items-center gap-5">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-white/40 transition-colors duration-150 hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
