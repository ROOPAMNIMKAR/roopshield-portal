import React from 'react';

/**
 * Card — a white surface container with rounded corners and a subtle border.
 *
 * Accepts an optional `className` for additional Tailwind overrides.
 *
 * @param {{
 *   children: React.ReactNode,
 *   className?: string,
 *   onClick?: (e: React.MouseEvent) => void,
 *   as?: keyof JSX.IntrinsicElements,
 * }} props
 */
export function Card({ children, className = '', onClick, as: Tag = 'div', ...rest }) {
  const isInteractive = typeof onClick === 'function';

  return (
    <Tag
      onClick={onClick}
      className={`
        bg-card rounded-xl border border-border shadow-sm
        ${isInteractive ? 'cursor-pointer hover:shadow-md transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-accent' : ''}
        ${className}
      `}
      {...(isInteractive ? { role: 'button', tabIndex: 0 } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Card;
