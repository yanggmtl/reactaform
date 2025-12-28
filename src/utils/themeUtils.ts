/**
 * Utility functions for theme detection and management
 */

/**
 * Determines if a theme is dark-themed based on naming convention.
 * 
 * Convention: Theme names containing "dark" are considered dark themes.
 * 
 * When creating custom themes:
 * - Include "dark" in the theme name for dark themes (e.g., "my-theme-dark")
 * - Or rely on CSS variables only and avoid theme-specific logic
 * 
 * @param themeName - The theme name from the `theme` prop
 * @returns true if the theme is dark-themed
 * 
 * @example
 * isDarkTheme('material-dark') // true
 * isDarkTheme('dark') // true
 * isDarkTheme('midnight-dark') // true
 * isDarkTheme('my-custom-dark') // true
 * isDarkTheme('material') // false
 */
export function isDarkTheme(themeName: string): boolean {
  // Simple rule: if theme name contains "dark", it's a dark theme
  return themeName.toLowerCase().includes('dark');
}
