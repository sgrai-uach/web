import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredIndicator?: boolean;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, requiredIndicator, rightAddon, id, className = '', style, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);

    return (
      <div className={styles.wrapper} style={style}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label} {requiredIndicator && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputControl}>
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${rightAddon ? styles.inputWithRightAddon : ''} ${error ? styles.inputError : ''} ${className}`.trim()}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightAddon && <div className={styles.rightAddon}>{rightAddon}</div>}
        </div>
        {error ? (
          <span id={inputId ? `${inputId}-error` : undefined} className={styles.errorText} role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span className={styles.helperText}>{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
