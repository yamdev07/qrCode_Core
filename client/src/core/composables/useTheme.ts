import { ref } from 'vue'

/**
 * Thème clair / sombre.
 *
 * Trois états : 'light', 'dark', ou 'auto' (suit l'OS). Le choix est persisté
 * et appliqué via l'attribut data-theme sur <html>, que le système de design
 * (style.css) lit pour basculer les tokens de couleur.
 */
type Theme = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'qr-theme'
const theme = ref<Theme>((localStorage.getItem(STORAGE_KEY) as Theme) || 'auto')

function apply(value: Theme): void {
  const root = document.documentElement
  if (value === 'auto') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', value)
  }
}

/** Renvoie true si le rendu courant est sombre (choix explicite ou OS). */
function isDarkNow(): boolean {
  if (theme.value === 'dark') return true
  if (theme.value === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useTheme() {
  function setTheme(value: Theme): void {
    theme.value = value
    localStorage.setItem(STORAGE_KEY, value)
    apply(value)
  }

  /** Bascule simplement clair <-> sombre depuis l'état visible. */
  function toggle(): void {
    setTheme(isDarkNow() ? 'light' : 'dark')
  }

  function init(): void {
    apply(theme.value)
  }

  return { theme, setTheme, toggle, init, isDarkNow }
}
