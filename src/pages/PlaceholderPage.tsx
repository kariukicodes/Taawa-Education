import { LandingNav } from "@/components/landing/LandingNav";
import { Footer } from "@/components/landing/Footer";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          This is a placeholder page for {title}. Content will be added here soon.
        </p>
      </main>
      <Footer />
    </div>
  );
}
