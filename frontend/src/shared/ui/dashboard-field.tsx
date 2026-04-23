import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId, useState } from 'react';

type DashboardFieldBaseProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
};

type DashboardInputFieldProps = DashboardFieldBaseProps & {
  multiline?: false;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'name' | 'value' | 'onChange' | 'disabled' | 'required'
  >;
};

type DashboardTextareaFieldProps = DashboardFieldBaseProps & {
  multiline: true;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'name' | 'value' | 'onChange' | 'disabled' | 'required'
  >;
};

type DashboardFieldProps =
  | DashboardInputFieldProps
  | DashboardTextareaFieldProps;

export function DashboardField(props: DashboardFieldProps) {
  const {
    label,
    name,
    error,
    hint,
    required = false,
    disabled = false,
  } = props;
  const generatedId = useId();
  const fieldId = `${name}-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordField =
    !props.multiline && props.inputProps?.type === 'password';
  const resolvedInputType = isPasswordField
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : props.multiline
      ? undefined
      : props.inputProps?.type;

  return (
    <label className="dashboard-field">
      <span className="dashboard-field__label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {props.multiline ? (
        <textarea
          {...props.textareaProps}
          aria-describedby={describedBy}
          aria-errormessage={errorId}
          aria-invalid={Boolean(error)}
          className="dashboard-field__control dashboard-field__control--textarea"
          disabled={disabled}
          id={fieldId}
          name={name}
          onChange={props.onChange}
          required={required}
          value={props.value}
        />
      ) : (
        <span className={`dashboard-field__control-wrap${isPasswordField ? ' dashboard-field__control-wrap--password' : ''}`}>
          <input
            {...props.inputProps}
            aria-describedby={describedBy}
            aria-errormessage={errorId}
            aria-invalid={Boolean(error)}
            className="dashboard-field__control"
            disabled={disabled}
            id={fieldId}
            name={name}
            onChange={props.onChange}
            required={required}
            type={resolvedInputType}
            value={props.value}
          />
          {isPasswordField ? (
            <button
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              className="dashboard-field__toggle"
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault();
                setIsPasswordVisible((current) => !current);
              }}
              type="button"
            >
              {isPasswordVisible ? 'Hide' : 'Show'}
            </button>
          ) : null}
        </span>
      )}
      {hint ? (
        <span
          className="dashboard-field__hint"
          id={hintId}
        >
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          className="dashboard-field__error"
          id={errorId}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
