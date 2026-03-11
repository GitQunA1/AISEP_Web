import React from 'react';
import styles from './Button.module.css';

/**
 * Button Component - Reusable button with variants
 * @param {string} children - Button text or content
 * @param {string} variant - 'primary', 'secondary', 'ghost', 'danger'
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional classes
 */
function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[`button--${variant}`]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
