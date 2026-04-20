import { useId } from 'react';

type FormFieldProps = {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'date';
  placeholder?: string;
  hint?: string;
  error?: string;
  defaultValue?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
};

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  hint,
  error,
  defaultValue,
  autoComplete,
  disabled = false,
  required = false,
}: FormFieldProps) {
  const fallbackId = useId();
  const fieldId = `${name}-${fallbackId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <label className="form-field">
      <span className="form-field__label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className="form-field__control"
        defaultValue={defaultValue}
        disabled={disabled}
        id={fieldId}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
      {hint ? (
        <span
          className="form-field__hint"
          id={hintId}
        >
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          className="form-field__error"
          id={errorId}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
