import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type FormSubmitButtonProps = PropsWithChildren<{
  busy?: boolean;
}> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export function FormSubmitButton({
  busy = false,
  children,
  disabled,
  className,
  ...props
}: FormSubmitButtonProps) {
  const composedClassName = className
    ? `form-submit-button ${className}`
    : 'form-submit-button';

  return (
    <button
      {...props}
      className={composedClassName}
      disabled={disabled || busy}
      type="submit"
    >
      {busy ? 'Working…' : children}
    </button>
  );
}
