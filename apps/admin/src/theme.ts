import { colors, shadows } from '@kouskous/shared';

/**
 * Publishes the shared design tokens as CSS custom properties so the admin
 * stylesheet never hard-codes a colour. `colors.pinkDark` becomes
 * `var(--color-pink-dark)`.
 */
export function installThemeVariables(root: HTMLElement = document.documentElement): void {
  for (const [name, value] of Object.entries(colors)) {
    root.style.setProperty(`--color-${toKebabCase(name)}`, value);
  }
  root.style.setProperty('--shadow-card', shadows.card);
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
