type FormFeedbackProps = {
  state: 'loading' | 'error' | 'empty' | 'success';
  title: string;
  description: string;
};

export function FormFeedback({
  state,
  title,
  description,
}: FormFeedbackProps) {
  return (
    <section
      className={`form-feedback form-feedback--${state}`}
      role={state === 'error' ? 'alert' : 'status'}
    >
      <div className="form-feedback__header">
        <span className="form-feedback__badge">{state}</span>
        <strong>{title}</strong>
      </div>
      <p>{description}</p>
    </section>
  );
}
