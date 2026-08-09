'use client';

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldChromeProps {
  label?: string;
  error?: string;
  helperText?: ReactNode;
  required?: boolean;
  inputId: string;
  children: ReactNode;
}

function FieldChrome({ label, error, helperText, required, inputId, children }: FieldChromeProps) {
  const messageId = `${inputId}-message`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 flex items-center gap-1 text-sm font-bold text-foreground">
          {label}
          {required && <span className="text-primary" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {(error || helperText) && (
        <div id={messageId} className={cn('mt-2 text-xs leading-5', error ? 'font-semibold text-error' : 'text-text-secondary')}>
          {error || helperText}
        </div>
      )}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
  leadingIcon?: ReactNode;
  prefix?: string;
}

const fieldStyles = [
  'h-14 w-full rounded-2xl border border-border bg-card text-base text-foreground',
  'placeholder:text-text-secondary/65 hover:border-foreground/35',
  'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
  'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
].join(' ');

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leadingIcon, prefix, type = 'text', id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const messageId = error || helperText ? `${inputId}-message` : undefined;

    return (
      <FieldChrome label={label} error={error} helperText={helperText} required={required} inputId={inputId}>
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {leadingIcon}
            </span>
          )}
          {prefix && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 border-r border-border pr-3 text-sm font-semibold text-text-secondary">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={messageId}
            className={cn(
              fieldStyles,
              'px-4',
              leadingIcon && 'pl-12',
              prefix && 'pl-[8.6rem]',
              error && 'border-error focus:border-error focus:ring-error/10',
              className
            )}
            {...props}
          />
        </div>
      </FieldChrome>
    );
  }
);
Input.displayName = 'Input';

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, label, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative">
        <Input ref={ref} type={isVisible ? 'text' : 'password'} label={label} className={cn('pr-12', className)} {...props} />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className={cn(
            'absolute right-3 grid h-9 w-9 place-items-center rounded-full text-text-secondary hover:bg-muted hover:text-foreground',
            label ? 'top-[2.45rem]' : 'top-2.5'
          )}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldChrome label={label} error={error} helperText={helperText} required={required} inputId={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error || helperText ? `${inputId}-message` : undefined}
          className={cn(
            fieldStyles,
            'min-h-32 resize-y px-4 py-3.5',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        />
      </FieldChrome>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: ReactNode;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <FieldChrome label={label} error={error} helperText={helperText} required={required} inputId={inputId}>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error || helperText ? `${inputId}-message` : undefined}
            className={cn(fieldStyles, 'appearance-none px-4 pr-11', error && 'border-error', className)}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
      </FieldChrome>
    );
  }
);
Select.displayName = 'Select';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-text-secondary">
      <span className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center">
        <input id={inputId} type="checkbox" className={cn('peer h-5 w-5 appearance-none rounded-md border border-border bg-card checked:border-primary checked:bg-primary focus:outline-none focus:ring-4 focus:ring-primary/10', className)} {...props} />
        <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
      </span>
      <span>{label}</span>
    </label>
  );
}

export { Input, Textarea, Select };
