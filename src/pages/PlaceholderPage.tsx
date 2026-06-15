import { Link } from "react-router-dom";

import { Footer } from "@/components/landing/Footer";
import { LandingNav } from "@/components/landing/LandingNav";

interface PlaceholderPageProps {
  title: string;
}

const pageContent: Record<
  string,
  {
    eyebrow: string;
    description: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  }
> = {
  Careers: {
    eyebrow: "Work with us",
    description:
      "We are currently onboarding tutors through our educator application flow. If you would like to teach with EduNest, start from the tutor page and send in your application.",
    primaryCta: { label: "Apply as a tutor", href: "/tutors#join-as-tutor" },
    secondaryCta: { label: "Explore tutors", href: "/tutors" },
  },
  "Contact Us": {
    eyebrow: "Get in touch",
    description:
      "The fastest way to reach the team is through our consultation flow on the homepage. You can also review our programs and tutor options first, then book the right next step.",
    primaryCta: { label: "Book consultation", href: "/#contact" },
    secondaryCta: { label: "Explore programs", href: "/programs" },
  },
  Resources: {
    eyebrow: "Helpful next steps",
    description:
      "We are still building out a dedicated resources hub. In the meantime, parents can review programs, FAQs, and tutor information from the main site.",
    primaryCta: { label: "View programs", href: "/programs" },
    secondaryCta: { label: "Read FAQs", href: "/#faq" },
  },
  "Tutor Guidelines": {
    eyebrow: "For educators",
    description:
      "Our tutor onboarding expectations are currently shared through the educator application process and our legal policies. Start there if you are preparing to join the platform.",
    primaryCta: { label: "Start tutor application", href: "/tutors#join-as-tutor" },
    secondaryCta: { label: "View terms", href: "/terms" },
  },
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const content = pageContent[title] ?? {
    eyebrow: "Page information",
    description:
      "This page is still being expanded, but the main journeys across tutors, programs, and the parent or tutor portals are already available.",
    primaryCta: { label: "Go home", href: "/" },
    secondaryCta: { label: "View tutors", href: "/tutors" },
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="rounded-[28px] border border-border/70 bg-card/80 p-8 shadow-none md:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {content.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={content.primaryCta.href}
              className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {content.primaryCta.label}
            </a>
            <Link
              to={content.secondaryCta.href}
              className="inline-flex items-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {content.secondaryCta.label}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
