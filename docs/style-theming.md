# Style & Theming

ReactaForm uses CSS variables as the single source of truth for styling.
All visual aspects—colors, spacing, typography, borders, and component states—are controlled through a consistent set of `--reactaform-*` variables.

Built-in themes are simply CSS files that define these variables. ReactaForm components read from them at runtime, which makes theming predictable, flexible, and easy to override.

For the complete and authoritative list of variables, see the API reference: [CSS Variables Reference](./api-reference.md#style--theming).

## How ReactaForm Styling Works
### CSS Variables as the Styling Engine

ReactaForm components do not hardcode colors or spacing. Instead, they rely entirely on CSS variables such as:

```css
--reactaform-primary-bg
--reactaform-text-color
--reactaform-border-focus
```

This design enables:

  - Theme switching without re-rendering components

  - Partial overrides without redefining entire themes

  - Safe coexistence of multiple themes on the same page

### Theme Scoping

Each ReactaForm instance renders a container with a data-reactaform-theme attribute:

```tsx
<div data-reactaform-theme="material" class="reactaform-container">
  <!-- form content -->
</div>
```

Theme stylesheets target this attribute and define variables within its scope:

```css
[data-reactaform-theme="material"] {
  --reactaform-primary-bg: #ffffff;
  --reactaform-text-color: #1f2937;
}
```

Because variables are scoped:

- Different forms can use different themes
- Themes can be swapped at runtime
- Overrides affect only the intended form instance

## Major CSS Variables (Overview)

ReactaForm themes all share the same variable names. Most customization only requires changing a small subset.

### Colors & Surfaces

| Variable | Purpose |
| --- | --- |
| `--reactaform-primary-bg` | Form/container background |
| `--reactaform-secondary-bg` | Section/card background |
| `--reactaform-input-bg` | Input background |
| `--reactaform-text-color` | Primary text |
| `--reactaform-text-muted` | Help text, hints |
| `--reactaform-border-color` | Default border |
| `--reactaform-border-hover` | Hover state |
| `--reactaform-border-focus` | Focus ring |
| `--reactaform-error-color` | Error states |
| `--reactaform-success-color` | Success states |

### Spacing & Layout

| Variable | Purpose |
| --- | --- |
| `--reactaform-container-padding` | Form padding |
| `--reactaform-field-gap` | Vertical spacing between fields |

### Typography

| Variable | Purpose |
| --- | --- |
| `--reactaform-font-family` | Form base font family |
| `--reactaform-font-size` | Form base font size |
| `--reactaform-font-weight` | Form base weight |

### Shape & Controls

| Variable | Purpose |
| --- | --- |
| `--reactaform-form-border-radius` | Form border radius |
| `--reactaform-form-border-style` | Form border style |
| `--reactaform-form-border-width` | Form border width |
| `--reactaform-border-radius` | Control rounding |
| `--reactaform-border-width` | Border thickness |

➡️ For the full list, see [CSS Variables Reference](./api-reference.md#style--theming)

## Quick Start (Using a Built-in Theme)

```tsx
import 'reactaform/themes/material.css';
import { ReactaForm } from 'reactaform';

function App() {
  return <ReactaForm theme="material" definitionData={definition} />;
}
```

### Examples: Customizing Themes
#### Example 1: Override a Few Variables (Recommended)

```css
/* custom-theme.css */
[data-reactaform-theme="material"] {
  --reactaform-primary-bg: #f0f9ff;
  --reactaform-border-focus: #0284c7;
  --reactaform-button-bg: #0284c7;
}
```

```tsx
import 'reactaform/themes/material.css';
import './custom-theme.css';
```

This approach keeps updates safe while allowing branding tweaks.

#### Example 2: Create a Custom Theme

```css
[data-reactaform-theme="my-brand"] {
  --reactaform-primary-bg: #ffffff;
  --reactaform-secondary-bg: #f8fafc;
  --reactaform-text-color: #1e293b;
  --reactaform-border-focus: #3b82f6;

  --reactaform-space: 0.5rem;
  --reactaform-font-family: 'Inter', system-ui, sans-serif;
  --reactaform-border-radius: 0.5rem;
}
```

```tsx
import './themes/my-brand.css';

<ReactaForm theme="my-brand" definitionData={definition} />
```

#### Example 3: Combine Color Theme + Size Variant

```tsx
import 'reactaform/themes/material.css';
import 'reactaform/themes/compact-variant.css';

<ReactaForm theme="material" definitionData={definition} />
```

## Built-in CSS Themes

ReactaForm ships with 20 ready-to-use CSS themes, plus size variants.

### Light Themes

  - material
  - ant-design
  - blueprint
  - fluent
  - shadcn
  - tailwind
  - modern-light
  - macos-native
  - ios-mobile
  - soft-pastel
  - glass-morphism
  - high-contrast-accessible

### Dark Themes

  - material-dark
  - ant-design-dark
  - blueprint-dark
  - tailwind-dark
  - midnight-dark
  - neon-cyber-dark

### Size Variants

  - compact-variant
  - spacious-variant

Size variants only adjust spacing variables and can be combined with any color theme.

## Theme Naming Convention (Dark Mode)

ReactaForm uses a naming convention to determine whether a theme is treated as a dark theme.

If a theme name contains the word dark, ReactaForm automatically considers it a dark theme and adjusts component behavior accordingly (for example, contrast handling and internal defaults). This naming convention is to speed up dark mode check without checking primitive background color.

```tsx
import { isDarkTheme } from 'reactaform';

isDarkTheme('material-dark');   // true
isDarkTheme('midnight-dark');   // true
isDarkTheme('material');        // false
```

### Rules:

- Theme names must include dark if they represent a dark mode design
- Any theme name containing dark is treated as a dark theme
- Custom dark themes should follow this convention (e.g. my-brand-dark)

This rule ensures consistent dark-mode behavior across built-in and custom themes without requiring additional configuration.

## API Reference

For detailed, up-to-date documentation:

- Complete CSS Variable List:
  👉 CSS Variables Reference

- Theme Utilities & Detection:
  👉 Theme Utilities

- Theme Catalog:
  👉 Theme Catalog