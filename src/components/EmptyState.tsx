type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
};

export default function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="glass rounded-2xl px-6 py-12 text-center">
      <p className="text-4xl" aria-hidden="true">
        🎵
      </p>
      <h2 className="mt-4 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-lg text-muted">{message}</p>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="btn-glow mt-6 inline-block rounded-xl px-6 py-3 text-lg font-medium"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
}
