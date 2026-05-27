import { useEffect } from 'react';
import useThemeStore from '../store/themeStore';

/**
 * ThemeProvider
 *
 * Reads `roopshield_theme` from localStorage on mount and applies the
 * `dark` class to <html> before the first visible frame, preventing a
 * flash of unstyled content (Requirement 19.3).
 *
 * This component does NOT use React context — the theme state is
 * accessible anywhere via `useThemeStore()` from Zustand.
 */
function ThemeProvider({ children }) {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return children;
}

export default ThemeProvider;
