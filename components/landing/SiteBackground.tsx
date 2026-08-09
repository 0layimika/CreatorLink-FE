export function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute -right-24 top-[34rem] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="landing-grid absolute inset-0 opacity-45" />
    </div>
  );
}
