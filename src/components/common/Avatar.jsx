import React, { useState } from 'react';

/**
 * Derive up to two initials from a full name string.
 * "Rahul Verma" → "RV", "Priya" → "P"
 *
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a deterministic background color from a name string.
 * Uses a simple hash so the same name always gets the same color.
 *
 * @param {string} name
 * @returns {string} Tailwind bg class
 */
const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-orange-500',
];

function getColorClass(name) {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * Avatar — shows a photo if `photoUrl` is provided and loads successfully,
 * otherwise falls back to colored initials.
 *
 * @param {{
 *   name: string,
 *   photoUrl?: string,
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
 *   className?: string,
 * }} props
 */
export function Avatar({ name, photoUrl, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const sizeClass = sizeClasses[size] ?? sizeClasses.md;
  const initials = getInitials(name);
  const colorClass = getColorClass(name);
  const showPhoto = photoUrl && !imgError;

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full
        flex-shrink-0 overflow-hidden select-none
        ${sizeClass}
        ${showPhoto ? '' : `${colorClass} text-white font-semibold`}
        ${className}
      `}
      aria-label={name ? `Avatar for ${name}` : 'User avatar'}
      role="img"
    >
      {showPhoto ? (
        <img
          src={photoUrl}
          alt={name ?? 'User avatar'}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

export default Avatar;
