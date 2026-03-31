import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-in-up max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Premium Homeschooling
        </p>
        <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
          Exceptional Learning,{" "}
          <span className="text-primary">Tailored for Your Child.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg font-light text-muted-foreground">
          Private homeschooling support designed for ambitious Nairobi families.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#contact"
            className="rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Book a Free Consultation
          </a>
          <a
            href="#programs"
            className="rounded-lg border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Explore Our Programs
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 animate-scroll-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
}
