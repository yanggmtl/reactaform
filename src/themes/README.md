# ReactaForm Themes

This folder contains pre-built theme stylesheets for ReactaForm. Import the themes you need in your application.

## Theme Naming Convention

**Dark themes** follow a simple convention: they include "dark" in the theme name.

- ✅ `material-dark`, `ant-design-dark`, `blueprint-dark` → Dark themes
- ✅ `my-custom-dark` → Your custom dark theme
- ✅ All dark themes consistently use this pattern

This convention is used by ReactaForm's internal logic to determine theme behavior for certain components (tooltips, checkboxes, etc.).

## Available Themes

### Light Themes
- `material.css` - Material Design 3 inspired
- `ant-design.css` - Ant Design style
- `blueprint.css` - Blueprint.js style  
- `fluent.css` - Microsoft Fluent Design
- `shadcn.css` - shadcn/ui inspired
- `tailwind.css` - Tailwind CSS aligned
- `modern-light.css` - Modern light theme
- `macos-native.css` - macOS native style
- `ios-mobile.css` - iOS mobile style
- `soft-pastel.css` - Soft pastel colors
- `glass-morphism.css` - Glass morphism effect
- `high-contrast-accessible.css` - High contrast for accessibility

### Dark Themes
- `material-dark.css` - Material Design dark
- `ant-design-dark.css` - Ant Design dark
- `blueprint-dark.css` - Blueprint dark
- `tailwind-dark.css` - Tailwind dark
- `midnight-dark.css` - Deep midnight blue
- `neon-cyber-dark.css` - Neon cyberpunk style

### Variants
- `compact-variant.css` - Compact spacing
- `spacious-variant.css` - Spacious layout

## Usage

### Import specific theme

```tsx
import 'reactaform/themes/material.css';
import { ReactaForm } from 'reactaform';

function App() {
  return <ReactaForm definitionData={...} theme="material" />;
}
```

### Import multiple themes (theme switching)

```tsx
import 'reactaform/themes/material.css';
import 'reactaform/themes/material-dark.css';
import { ReactaForm } from 'reactaform';
import { useState } from 'react';

function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsDark(!isDark)}>
        Toggle Theme
      </button>
      <ReactaForm 
        definitionData={...} 
        theme={isDark ? 'material-dark' : 'material'} 
      />
    </>
  );
}
```

### Combine with size variants

```tsx
import 'reactaform/themes/material.css';
import 'reactaform/themes/compact-variant.css';

// Both themes will be applied
```

## Theme Customization

Each theme uses CSS custom properties. You can override them:

```css
[data-reactaform-theme="material"] {
  --reactaform-primary-bg: #your-color;
  --reactaform-border-radius: 8px;
  /* ... other overrides */
}
```

## Creating Custom Dark Themes

When creating custom dark themes, **include "dark" in the theme name** to ensure proper behavior:

```tsx
// ✅ Good - Follows convention
<ReactaForm theme="my-theme-dark" definitionData={...} />

// ❌ Avoid - Won't be detected as dark theme
<ReactaForm theme="my-theme-night" definitionData={...} />
```

ReactaForm exports an `isDarkTheme()` utility you can use:

```tsx
import { isDarkTheme } from 'reactaform';

const isMyThemeDark = isDarkTheme('my-theme-dark'); // true
const isMyThemeLight = isDarkTheme('my-theme'); // false
```

See the individual theme files for all available CSS variables.
