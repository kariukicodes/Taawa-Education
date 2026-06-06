import {
  GraduationCap,
  LineChart,
  ShieldCheck,
  Clock3,
  MessageCircleMore,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useContactModal } from "./ContactModalContext";

const features = [
  {
    icon: GraduationCap,
    title: "Expert Tutor Matching",
    description:
      "Every child is matched with a tutor based on learning style, curriculum, subject needs, and academic goals.",
  },
  {
    icon: LineChart,
    title: "Real-Time Progress Tracking",
    description:
      "Parents stay informed through structured updates, lesson records, and measurable progress visibility.",
  },
  {
    icon: Clock3,
    title: "Flexible Family Scheduling",
    description:
      "Learning plans are built around your family’s routine for consistency without unnecessary pressure.",
  },
  {
    icon: MessageCircleMore,
    title: "Clear Parent Communication",
    description:
      "Regular feedback and transparent communication keep you fully involved in your child’s academic journey.",
  },
];

export function WhyChooseSection() {
  const { openModal } = useContactModal();

  return (
    <section className="relative overflow-hidden bg-[#0A0A08] px-4 py-24 lg:px-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(201,168,76,0.14), transparent 22%), radial-gradient(circle at 80% 30%, rgba(122,158,126,0.10), transparent 18%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Badge className="border border-primary/20 bg-primary/10 px-4 py-1 text-[11px] tracking-[0.18em] text-primary uppercase hover:bg-primary/10">
            Why Choose Taawa Education
          </Badge>

          <h2
            className="font-display mt-6 text-3xl font-bold tracking-[-0.03em] text-foreground md:text-5xl"
          >
            Built for parents who want
            <span className="text-primary"> structure, trust, and results</span>
          </h2>

          <p className="mt-5 text-[15px] leading-8 text-muted-foreground md:text-base">
            Taawa Education combines personalised academic support, carefully vetted tutors,
            and clear progress systems to give families a more confident
            homeschooling experience.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Featured card */}
          <Card className="group relative overflow-hidden border-white/10 bg-[#131310]/90 shadow-2xl shadow-black/30 backdrop-blur-xl lg:col-span-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16),transparent_35%)] opacity-80" />
            <CardHeader className="relative pb-4">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <CardTitle
                className="font-display text-2xl text-foreground md:text-3xl"
              >
                A more premium way to support your child’s education
              </CardTitle>

              <CardDescription className="max-w-md text-sm leading-7 text-muted-foreground">
                We go beyond tutoring by creating a structured support system that
                helps students grow academically while giving parents clarity,
                confidence, and peace of mind.
              </CardDescription>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Personalised learning plans",
                  "Curriculum-aligned instruction",
                  "Trusted tutor vetting",
                  "Consistent academic reporting",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground/80"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      openModal();
                    }}
                  >
                    Book Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="border-border bg-transparent text-foreground hover:bg-muted/50 hover:text-foreground"
                >
                  <a href="/programs">Explore Programs</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supporting cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="group border-white/10 bg-[#131310]/85 shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-[#151512]"
                >
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>

                    <CardTitle className="text-lg text-foreground">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>

                    <div className="mt-6 h-px w-full bg-gradient-to-r from-primary/25 to-transparent" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}