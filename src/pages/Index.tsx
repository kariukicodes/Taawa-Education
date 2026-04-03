import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ProgramsSection } from "@/components/landing/ProgramsSection";
import { TutorsSection } from "@/components/landing/TutorsSection";
import { ProgressPreviewSection } from "@/components/landing/ProgressPreviewSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhyChooseSection } from "@/components/landing/WhyChooseSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <AboutSection />
      <ProgressPreviewSection />
      <ProgramsSection />
      <TutorsSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
