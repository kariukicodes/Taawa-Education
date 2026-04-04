import { useContactModal } from "./ContactModalContext";

export function FinalCTASection() {
  const { openModal } = useContactModal();

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#0A0A08] px-3 py-24 lg:px-3"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      <div className="mx-auto max-w-4xl text-center">
        <div className="rounded-[28px] border border-white/[0.08] bg-[#131310] px-6 py-14 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:px-12">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Get Started
          </p>

          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-foreground md:text-5xl">
            Give your child the support
            <br />
            they deserve
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-muted-foreground">
            Premium tutoring and structured reporting that helps your child grow with confidence.
          </p>

          <button
            type="button"
            onClick={openModal}
            className="mt-8 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
          >
            Book a Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
}