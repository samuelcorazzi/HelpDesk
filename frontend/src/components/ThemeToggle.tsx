import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const THEME_STORAGE_KEY = "helpdesk_theme";
const THEME_CHANGE_EVENT = "helpdesk-theme-change";

function getPreferredTheme(): Theme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToTheme(onChange: () => void) {
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  colorScheme.addEventListener("change", onChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    colorScheme.removeEventListener("change", onChange);
  };
}

export function ThemeToggle({
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getPreferredTheme,
    () => "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const actionLabel =
    theme === "dark" ? "Ativar modo claro" : "Ativar modo noturno";

  return (
    <button
      className={`theme-toggle ${showLabel ? "theme-toggle-with-label" : ""} ${className}`.trim()}
      type="button"
      onClick={toggleTheme}
      aria-label={actionLabel}
      title={actionLabel}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
      {showLabel ? (
        <strong>{theme === "dark" ? "Modo claro" : "Modo noturno"}</strong>
      ) : null}
    </button>
  );
}
