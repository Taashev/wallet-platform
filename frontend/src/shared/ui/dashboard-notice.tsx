type DashboardNoticeProps = {
  title: string;
  description: string;
  tone: 'info' | 'success' | 'error';
};

export function DashboardNotice({
  title,
  description,
  tone,
}: DashboardNoticeProps) {
  return (
    <section
      className={`dashboard-notice dashboard-notice--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <strong>{title}</strong>
      <p>{description}</p>
    </section>
  );
}
