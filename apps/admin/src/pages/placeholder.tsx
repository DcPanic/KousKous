interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  body: string;
}

/** Section that is routed and navigable but not yet implemented. */
export function PlaceholderPage({ title, subtitle, body }: PlaceholderPageProps) {
  return (
    <>
      <h1 className="page-title">{title}</h1>
      <p className="page-subtitle">{subtitle}</p>
      <div className="card">
        <div className="empty-state">{body}</div>
      </div>
    </>
  );
}
