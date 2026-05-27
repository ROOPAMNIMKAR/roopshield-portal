import { create } from 'zustand';

const THEME_KEY = 'roopshield_theme';

/**
 * Reads the stored theme from localStorage.
 * Returns 'dark' or 'light'; defaults to 'light' if nothing is stored.
 */
function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Applies or removes the `dark` class on <html> and persists the value.
 */
function applyTheme(theme) {
  try {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage unavailable — still apply the class in-memory
  }
}

const useThemeStore = create((set) => ({
  theme: 'light',

  /**
   * Initialise the theme from localStorage and apply it to <html>.
   * Call this once on app mount (inside ThemeProvider).
   */
  initTheme() {
    const stored = getStoredTheme();
    applyTheme(stored);
    set({ theme: stored });
  },

  /**
   * Toggle between 'light' and 'dark', persist, and update <html>.
   */
  toggleTheme() {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return { theme: next };
    });
  },
}));

export default useThemeStore;
