import React from 'react';

/**
 * Button — reusable button with variant support.
 *
 * Variants:
 *   primary   — filled accent blue (default)
 *   secondary — outlined accent blue
 *   danger    — filled red
 *   ghost     — transparent with hover background
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
 *   type?: 'button' | 'submit' | 'reset',
 *   disabled?: boolean,
 *   onClick?: (e: React.MouseEvent) => void,
 *   children: React.ReactNode,
 *   className?: string,
 *   'aria-label'?: string,
 * }} props
 */

const VARIANT_CLASSES = {
  primary:
    'bg-accent text-white hover:bg-[#175d8a] focus:ring-accent disabled:bg-accent/50',
  secondary:
    'border border-accent text-accent bg-transparent hover:bg-accent/10 focus:ring-accent disabled:opacity-50',
  danger:
    'bg-danger text-white hover:bg-red-700 focus:ring-danger disabled:bg-danger/50',
  ghost:
    'text-textSecondary bg-transparent hover:bg-gray-100 focus:ring-gray-400 disabled:opacity-50',
};

export function Button({
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  children,
  className = '',
  ...rest
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:cursor-not-allowed
        ${variantClass}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
