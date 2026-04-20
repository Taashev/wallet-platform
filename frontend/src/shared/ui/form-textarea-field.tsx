import type { ChangeEventHandler } from 'react';
import { useId } from 'react';

type FormTextareaFieldProps = {
  label: string;
  name: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
};

export function FormTextareaField({
  label,
  name,
  placeholder,
  hint,
  error,
  defaultValue,
  value,
  onChange,
  disabled = false,
  required = false,
  rows = 4,
}: FormTextareaFieldProps) {
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
      <textarea
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="form-field__control form-field__control--textarea"
        defaultValue={defaultValue}
        disabled={disabled}
        id={fieldId}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
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
