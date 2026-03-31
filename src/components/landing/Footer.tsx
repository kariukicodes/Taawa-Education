export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm font-semibold text-foreground">
          Edu<span className="text-primary">Nest</span>
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} EduNest. Premium homeschooling for Nairobi families.
        </p>
      </div>
    </footer>
  );
}
