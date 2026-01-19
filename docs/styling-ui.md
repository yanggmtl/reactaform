# Style & Theming

ReactaForm provides 20 professionally designed pre-built themes plus a flexible CSS variable system for custom styling. This guide covers theme usage, customization, and best practices.

## Quick Start

```tsx
import 'reactaform/themes/material.css';
import { ReactaForm } from 'reactaform';

function App() {
  return <ReactaForm theme="material" definitionData={definition} />;
}
```

## Pre-Built Themes

ReactaForm includes **20 ready-to-use themes** inspired by popular design systems:

### Light Themes
- `material` — Material Design 3 with elevated surfaces
- `ant-design` — Ant Design System with clean lines
- `blueprint` — Blueprint.js compact professional style
- `fluent` — Microsoft Fluent Design
- `shadcn` — shadcn/ui minimal design
- `tailwind` — Tailwind CSS aligned colors
- `modern-light` — Contemporary clean design
- `macos-native` — Apple macOS native look
- `ios-mobile` — iOS design for mobile
- `soft-pastel` — Gentle pastel colors
- `glass-morphism` — Frosted glass effect
- `high-contrast-accessible` — WCAG AAA compliant

### Dark Themes
- `material-dark` — Material Design dark mode
- `ant-design-dark` — Ant Design dark variant
- `blueprint-dark` — Blueprint.js dark theme
- `tailwind-dark` — Tailwind dark mode
- `midnight-dark` — Deep midnight blue
- `neon-cyber-dark` — Cyberpunk neon aesthetic

### Size Variants
- `compact-variant` — Reduced spacing for dense layouts
- `spacious-variant` — Generous spacing for accessibility

## Using Themes

### 1. Import Theme CSS

Import the theme stylesheet in your application entry point or component:

```tsx
// Single theme
import 'reactaform/themes/material.css';

// Multiple themes for switching
import 'reactaform/themes/material.css';
import 'reactaform/themes/material-dark.css';
```

### 2. Set Theme Prop

Pass the theme name to the `ReactaForm` component:

```tsx
<ReactaForm 
  theme="material" 
  definitionData={definition}
/>
```

### 3. Dynamic Theme Switching

```tsx
const [theme, setTheme] = useState('material');

return (
  <>
    <button onClick={() => setTheme('material')}>Light</button>
    <button onClick={() => setTheme('material-dark')}>Dark</button>
    
    <ReactaForm theme={theme} definitionData={definition} />
  </>
);
```

## Theme Architecture

### Data Attribute Selector

ReactaForm applies a `data-reactaform-theme` attribute to the form container:

```html
<div data-reactaform-theme="material" class="reactaform-container">
  <!-- form content -->
</div>
```

Theme stylesheets use this attribute for scoped styling:

```css
[data-reactaform-theme="material"] {
  --reactaform-primary-bg: #ffffff;
  --reactaform-text-color: #1f2937;
  /* ... more variables */
}
```

### Dark Theme Detection

ReactaForm automatically detects dark themes using the `isDarkTheme()` utility:

```tsx
import { isDarkTheme } from 'reactaform';

const darkMode = isDarkTheme('material-dark'); // true
const lightMode = isDarkTheme('material'); // false
```

Any theme name containing "dark" is treated as a dark theme for component behavior adjustments.

## CSS Variables Reference

Check out all CSS variables in api-reference [CSS variable reference](./api-reference.md#css-variables-reference)


## Custom Styling

### Option 1: Override CSS Variables (Recommended)

Create a custom stylesheet that overrides specific variables:

```css
/* custom-theme.css */
[data-reactaform-theme="material"] {
  --reactaform-primary-bg: #f0f9ff;
  --reactaform-border-focus: #0284c7;
  --reactaform-button-bg: #0284c7;
}
```

Import both the base theme and your customizations:

```tsx
import 'reactaform/themes/material.css';
import './custom-theme.css';
```

### Option 2: Create Complete Custom Theme

Create a new theme file with all variables:

```css
/* themes/my-brand.css */
[data-reactaform-theme="my-brand"] {
  /* Colors */
  --reactaform-primary-bg: #ffffff;
  --reactaform-secondary-bg: #f8fafc;
  --reactaform-text-color: #1e293b;
  --reactaform-border-color: #cbd5e1;
  --reactaform-border-focus: #3b82f6;
  
  /* Spacing */
  --reactaform-space: 0.5rem;
  --reactaform-space-lg: 1rem;
  --reactaform-field-gap: 1rem;
  
  /* Typography */
  --reactaform-font-family: 'Inter', system-ui, sans-serif;
  --reactaform-font-size: 0.875rem;
  
  /* Shape */
  --reactaform-border-radius: 0.5rem;
  
  /* Buttons */
  --reactaform-button-bg: #3b82f6;
  --reactaform-button-text: #ffffff;
  
  /* ... additional variables */
}
```

Use your custom theme:

```tsx
import './themes/my-brand.css';

<ReactaForm theme="my-brand" definitionData={definition} />
```

### Option 3: Inline Styles for Layout

Use `defaultStyle` prop for structural adjustments only:

```tsx
<ReactaFormProvider
  defaultTheme="material"
  defaultStyle={{ 
    width: '900px', 
    fontFamily: 'Inter, system-ui' 
  }}
>
  <App />
</ReactaFormProvider>
```

**Note:** Prefer CSS variables for colors and theming. Use inline styles only for layout-specific overrides.

## Advanced Customization

### Scope Themes to Specific Forms

Use wrapper classes to apply different themes to different forms:

```css
.form-admin [data-reactaform-theme="blueprint"] {
  --reactaform-primary-bg: #f5f8fa;
}

.form-user [data-reactaform-theme="blueprint"] {
  --reactaform-primary-bg: #ffffff;
}
```

```tsx
<div className="form-admin">
  <ReactaForm theme="blueprint" definitionData={adminDef} />
</div>

<div className="form-user">
  <ReactaForm theme="blueprint" definitionData={userDef} />
</div>
```

### Combine Base Theme with Variant

Import both a color theme and size variant:

```tsx
import 'reactaform/themes/material.css';
import 'reactaform/themes/compact-variant.css';

// Material colors with compact spacing
<ReactaForm theme="material" definitionData={definition} />
```

### System Theme Detection

Detect user's OS theme preference:

```tsx
function App() {
  const [theme, setTheme] = useState(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'material-dark' : 'material';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'material-dark' : 'material');
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return <ReactaForm theme={theme} definitionData={definition} />;
}
```

## Accessibility & Contrast

### High Contrast Theme

Use the built-in high-contrast theme for accessibility:

```tsx
import 'reactaform/themes/high-contrast-accessible.css';

<ReactaForm theme="high-contrast-accessible" definitionData={definition} />
```

### Focus Indicators

All themes include visible focus rings using `--reactaform-border-focus`. When creating custom themes, ensure:

- Minimum 3:1 contrast ratio for focus indicators (WCAG 2.1 Level AA)
- Focus ring is clearly visible against background
- Focus ring thickness is at least 2px

```css
[data-reactaform-theme="custom"] {
  --reactaform-border-focus: #0066cc;  /* 4.5:1 contrast */
  --reactaform-border-width: 2px;
}
```

### Text Contrast

Ensure text meets WCAG contrast requirements:

- **Normal text:** 4.5:1 contrast ratio (AA) or 7:1 (AAA)
- **Large text:** 3:1 contrast ratio (AA) or 4.5:1 (AAA)

## Responsive Design

All themes include responsive adjustments:

- **Mobile (<640px):** Single-column layout, larger touch targets
- **Tablet (640-1024px):** Adaptive column count
- **Desktop (>1024px):** Full multi-column support

Responsive behavior respects theme CSS variables, so spacing changes automatically propagate.

## Performance Tips

### Only Import Used Themes

Each theme file is ~1-1.5KB gzipped. Only import themes you actually use:

```tsx
// ❌ Don't import unused themes
import 'reactaform/themes/material.css';
import 'reactaform/themes/ant-design.css';
import 'reactaform/themes/blueprint.css';

// ✅ Import only what you need
import 'reactaform/themes/material.css';
```

### Lazy Load Themes

For applications with theme switching, consider lazy loading:

```tsx
async function loadTheme(themeName: string) {
  await import(`reactaform/themes/${themeName}.css`);
}

// Usage
const handleThemeChange = async (newTheme) => {
  await loadTheme(newTheme);
  setTheme(newTheme);
};
```

### CSS Variable Performance

Modern browsers optimize CSS variable lookup. Avoid deeply nested overrides:

```css
/* ❌ Too specific */
.app .container .form [data-reactaform-theme="material"] {
  --reactaform-primary-bg: white;
}

/* ✅ Keep selectors simple */
[data-reactaform-theme="material"] {
  --reactaform-primary-bg: white;
}
```

## Best Practices

1. **Use pre-built themes** as a starting point, override only what you need
2. **Prefer CSS variables** for all color and spacing customizations
3. **Test in both light and dark themes** if supporting theme switching
4. **Verify accessibility** with contrast checkers and keyboard navigation
5. **Keep theme files separate** from component logic for maintainability
6. **Document custom variables** if creating team-wide themes
7. **Use inline styles sparingly** — only for layout-specific adjustments

## Migration from darkMode Prop

If upgrading from an older version that used `darkMode` boolean prop:

```tsx
// Old API ❌
<ReactaForm darkMode={true} definitionData={definition} />

// New API ✅
import 'reactaform/themes/material-dark.css';
<ReactaForm theme="material-dark" definitionData={definition} />
```

The `theme` prop provides more flexibility and access to 20 pre-built themes instead of just light/dark.

## References

- **Theme Catalog:** [src/themes/README.md](https://github.com/yanggmtl/reactaform/blob/master/src/themes/README.md)
- **Core Provider:** [src/components/ReactaFormProvider.tsx](https://github.com/yanggmtl/reactaform/blob/master/src/components/ReactaFormProvider.tsx)
- **Theme Detection:** [src/utils/themeUtils.ts](https://github.com/yanggmtl/reactaform/blob/master/src/utils/themeUtils.ts)

---
