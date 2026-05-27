/**
 * TopBar — top navigation bar for authenticated pages.
 *
 * Contains: RoopShield logo, current user name + avatar, dark-mode toggle,
 * notifications bell with badge, global search bar, logout button.
 *
 * Requirements: 3.1, 3.5, 3.6, 3.7, 19.1
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useNotifications } from '../../hooks/useNotifications';

function TopBar({ onMenuToggle }) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  const { internResults, taskResults } = useGlobalSearch(debouncedQuery);
  const { count: notifCount } = useNotifications(currentUser?.id);

  const hasResults = internResults.length > 0 || taskResults.length > 0;

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  // Initials avatar
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="h-16 bg-primary dark:bg-gray-900 flex items-center px-4 gap-3 shadow-md z-30 relative">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Toggle navigation menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-1 shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
        <span className="text-xl font-extrabold text-white tracking-tight">
          Roop<span className="text-accent">Shield</span>
        </span>
      </Link>

      {/* Global search */}
      <div ref={searchRef} className="relative flex-1 max-w-sm ml-4 hidden sm:block">
        <label htmlFor="global-search" className="sr-only">Search interns and tasks</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="global-search"
            type="search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search interns, tasks…"
            className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg pl-9 pr-3 py-1.5 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            autoComplete="off"
          />
        </div>

        {/* Search dropdown */}
        {searchOpen && debouncedQuery && hasResults && (
          <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border z-50 overflow-hidden">
            {internResults.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-xs font-semibold text-textSecondary uppercase tracking-wide bg-gray-50 dark:bg-gray-700">Interns</p>
                {internResults.map((intern) => (
                  <button
                    key={intern.id}
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate('/admin/interns'); }}
                    className="w-full text-left px-3 py-2 text-sm text-textPrimary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {intern.name}
                    <span className="ml-2 text-xs text-textSecondary">{intern.department}</span>
                  </button>
                ))}
              </div>
            )}
            {taskResults.length > 0 && (
              <div>
                <p className="px-3 py-1.5 text-xs font-semibold text-textSecondary uppercase tracking-wide bg-gray-50 dark:bg-gray-700">Tasks</p>
                {taskResults.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate('/admin/tasks'); }}
                    className="w-full text-left px-3 py-2 text-sm text-textPrimary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {task.title}
                    <span className="ml-2 text-xs text-textSecondary">{task.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications bell */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
          aria-label={`Notifications${notifCount > 0 ? `, ${notifCount} tasks due soon` : ''}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 0 0-5-5.917V4a1 1 0 1 0-2 0v1.083A6 6 0 0 0 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
          </svg>
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-danger text-white text-xs flex items-center justify-center font-bold leading-none">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* User info — clickable → profile for admin/hr */}
        <div className="hidden sm:flex items-center gap-2 px-2">
          {(currentUser?.role === 'admin' || currentUser?.role === 'hr') ? (
            <Link
              to={currentUser.role === 'hr' ? '/hr/profile' : '/admin/profile'}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-1"
              aria-label="My account settings"
            >
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
                {initials}
              </div>
              <span className="text-sm text-white/90 font-medium max-w-[120px] truncate">
                {currentUser?.name ?? ''}
              </span>
            </Link>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold shrink-0" aria-hidden="true">
                {initials}
              </div>
              <span className="text-sm text-white/90 font-medium max-w-[120px] truncate">
                {currentUser?.name ?? ''}
              </span>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
          aria-label="Logout"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
