import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "yourcbse-theme";

/**
 * Inline script injected before hydration so the correct theme class is applied
 * on first paint (no flash). Default is Light Mode.
 */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k)||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

interface ThemeContextValue {
  /** The user's stored preference. */
  theme: Theme;
  /** The theme actually rendered right now. */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

function applyTheme(theme: Theme, animate = false) {
  if (typeof document === "undefined") return "light" as const;
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  const element = document.documentElement;
  if (animate) {
    element.classList.add("theme-transition");
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => element.classList.remove("theme-transition"), 260);
  }
  element.classList.toggle("dark", dark);
  element.style.colorScheme = dark ? "dark" : "light";
  return dark ? ("dark" as const) : ("light" as const);
}


export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Read the stored preference after hydration to keep SSR markup stable.
  useEffect(() => {
    let stored: Theme = "light";
    try {
      const value = localStorage.getItem(THEME_STORAGE_KEY);
      if (value === "light" || value === "dark" || value === "system") stored = value;
    } catch {
      /* storage unavailable — fall back to light */
    }
    setThemeState(stored);
    setResolvedTheme(applyTheme(stored));
  }, []);

  // Follow the OS when the preference is "system".
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(applyTheme("system"));
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    setResolvedTheme(applyTheme(next, true));

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}
