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

/**
 * Determines if a color string represents a dark color.
 * Supports hex (3, 4, 6, 8 digits) and rgb/rgba formats.
 * 
 * @param color - The color string to check
 * @returns true if the color is considered dark (luminance < 128)
 */
export function isDarkColor(color: string): boolean {
  if (!color) return false;
  
  // Remove whitespace
  const c = color.trim();
  
  let r = 0, g = 0, b = 0;

  // Handle hex
  if (c.startsWith('#')) {
    const hex = c.substring(1);
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } 
  // Handle rgb/rgba
  else if (c.startsWith('rgb')) {
    const match = c.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      r = Math.min(255, Math.max(0, parseFloat(match[0])));
      g = Math.min(255, Math.max(0, parseFloat(match[1])));
      b = Math.min(255, Math.max(0, parseFloat(match[2])));
    }
  }
  // Handle named colors (basic support) or fallback
  else {
    // For unknown formats, we can't reliably determine. 
    // Returning false (light) is a safe default or we could try to use a canvas to determine.
    // For this utility, we'll stick to simple parsing.
    return false;
  }

  // Calculate luminance (YIQ formula)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq < 128;
}
