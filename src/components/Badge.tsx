type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "category" | "language";
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const styles = {
    default: "border-border bg-surface text-foreground-dim",
    category:
      "border-primary/25 bg-primary/10 text-primary",
    language:
      "border-accent/25 bg-accent/10 text-accent",
  };

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-sm font-medium transition-colors ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
