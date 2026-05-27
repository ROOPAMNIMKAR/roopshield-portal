import React, { useState, useCallback } from 'react';

/**
 * StarRating — 1–5 interactive star selector.
 *
 * - In interactive mode (readOnly=false): hover highlights stars, click sets value,
 *   keyboard (Arrow keys, Home, End) adjusts value, Enter/Space confirms.
 * - In read-only mode: renders a static display with aria-label.
 *
 * @param {{
 *   value: number,
 *   onChange?: (rating: number) => void,
 *   readOnly?: boolean,
 *   size?: 'sm' | 'md' | 'lg',
 *   label?: string,
 * }} props
 */

const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  label = 'Rating',
}) {
  const [hovered, setHovered] = useState(0);

  const starSize = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  const handleClick = useCallback(
    (rating) => {
      if (!readOnly && onChange) {
        onChange(rating);
      }
    },
    [readOnly, onChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (readOnly) return;
      let next = value;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        next = Math.min(5, value + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        next = Math.max(1, value - 1);
      } else if (e.key === 'Home') {
        next = 1;
      } else if (e.key === 'End') {
        next = 5;
      } else {
        return;
      }
      e.preventDefault();
      if (onChange) onChange(next);
    },
    [readOnly, value, onChange]
  );

  const displayValue = readOnly ? value : hovered || value;

  if (readOnly) {
    return (
      <div
        className="inline-flex items-center gap-0.5"
        aria-label={`${label}: ${value} out of 5 stars`}
        role="img"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className={`${starSize} ${star <= value ? 'text-amber-400' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`
            ${starSize} rounded
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1
            transition-colors duration-100
            ${star <= displayValue ? 'text-amber-400' : 'text-gray-300'}
            hover:scale-110
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-full w-full"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default StarRating;
