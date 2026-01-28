# Theme Integration Guide

## How Themes Work in ReactaForm

ReactaForm themes are distributed as separate CSS files that users can selectively import based on their needs. This approach provides:

- **Minimal bundle size** - Only import themes you use
- **Tree-shakeable** - Build tools can eliminate unused themes
- **Runtime theme switching** - Import multiple themes and switch via the `theme` prop
- **Easy customization** - Override CSS variables per theme

## For Library Consumers

### 1. Import a Single Theme

```tsx
// In your app entry point (main.tsx, App.tsx, etc.)
import 'reactaform/themes/material.css';
import { ReactaForm } from 'reactaform';

function App() {
  return (
    <ReactaForm 
      definitionData={yourDefinition}
      theme="material"
    />
  );
}
```

### 2. Theme Switching (Multiple Themes)

```tsx
import 'reactaform/themes/material.css';
import 'reactaform/themes/material-dark.css';
import { ReactaForm } from 'reactaform';
import { useState } from 'react';

function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsDark(!isDark)}>
        Toggle {isDark ? 'Light' : 'Dark'} Mode
      </button>
      <ReactaForm 
        definitionData={yourDefinition}
        theme={isDark ? 'material-dark' : 'material'}
      />
    </div>
  );
}
```

### 3. Multiple Forms with Different Themes

```tsx
import 'reactaform/themes/material.css';
import 'reactaform/themes/blueprint.css';
import { ReactaForm } from 'reactaform';

function App() {
  return (
    <>
      <ReactaForm 
        definitionData={formA}
        theme="material"
      />
      <ReactaForm 
        definitionData={formB}
        theme="blueprint"
      />
    </>
  );
}
```

### 4. Dynamic Theme Import (Code Splitting)

```tsx
import { ReactaForm } from 'reactaform';
import { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState('material');
  
  useEffect(() => {
    // Dynamically import theme CSS
    import(`reactaform/themes/${theme}.css`);
  }, [theme]);
  
  return (
    <div>
      <select onChange={(e) => setTheme(e.target.value)}>
        <option value="material">Material</option>
        <option value="ant-design">Ant Design</option>
        <option value="blueprint">Blueprint</option>
      </select>
      <ReactaForm 
        definitionData={yourDefinition}
        theme={theme}
      />
    </div>
  );
}
```

## For Library Maintainers

### Build Process

Themes are automatically copied from `src/themes/` to `dist/themes/` during build:

```bash
npm run build:lib
```

This runs:
1. Vite builds the library bundle
2. TypeScript generates type definitions
3. `scripts/copy-themes.js` copies all theme CSS files

### Adding New Themes

1. Create theme file: `src/themes/your-theme.css`
2. Define theme using `[data-reactaform-theme="your-theme"]` selector
3. Set CSS custom properties (see existing themes for reference)
4. Run `npm run build:lib` - theme automatically included

### Theme Structure

```css
[data-reactaform-theme="your-theme"] {
  /* Backgrounds */
  --reactaform-primary-bg: #ffffff;
  --reactaform-secondary-bg: #f9f9f9;
  --reactaform-input-bg: #ffffff;
  
  /* Text */
  --reactaform-text-color: #000000;
  --reactaform-text-muted: #666666;
  
  /* Borders */
  --reactaform-border-color: #cccccc;
  --reactaform-border-hover: #999999;
  --reactaform-border-focus: #4CAF50;
  
  /* Status */
  --reactaform-error-color: #e11d48;
  --reactaform-success-color: #4CAF50;
  
  /* Interactive */
  --reactaform-option-menu-hover-bg: #f5f5f5;
  
  /* Tooltips */
  --reactaform-tooltip-color-bg: rgba(60,60,60,0.92);
  --reactaform-tooltip-color: #ffffff;
  
  /* Shape */
  --reactaform-border-radius: 4px;
  
  /* Elevation */
  --reactaform-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

### Package.json Configuration

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/reactaform.es.js",
      "require": "./dist/reactaform.cjs.js"
    },
    "./style.css": "./dist/reactaform.css",
    "./themes/*.css": "./dist/themes/*.css"
  },
  "files": [
    "dist/*.js",
    "dist/*.css",
    "dist/*.d.ts",
    "dist/themes/*.css"
  ]
}
```

This ensures:
- Themes are included in npm package
- Users can import via `reactaform/themes/theme-name.css`
- TypeScript/bundlers can resolve the imports

## Available Themes

ReactaForm includes **20 professionally designed themes** ready to use in your application.

### Light Themes

| Theme | Import | Description |
|-------|--------|-------------|
| **Material** | `reactaform/themes/material.css` | Material Design 3 inspired with elevated surfaces and rounded corners |
| **Ant Design** | `reactaform/themes/ant-design.css` | Ant Design System with clean lines and comfortable spacing |
| **Blueprint** | `reactaform/themes/blueprint.css` | Blueprint.js style with compact density and professional feel |
| **Fluent** | `reactaform/themes/fluent.css` | Microsoft Fluent Design with soft shadows and modern aesthetics |
| **shadcn** | `reactaform/themes/shadcn.css` | shadcn/ui inspired minimal design with subtle borders |
| **Tailwind** | `reactaform/themes/tailwind.css` | Tailwind CSS aligned colors and utility-first philosophy |
| **Modern Light** | `reactaform/themes/modern-light.css` | Contemporary clean design with balanced contrast |
| **macOS Native** | `reactaform/themes/macos-native.css` | Apple macOS native look with refined details |
| **iOS Mobile** | `reactaform/themes/ios-mobile.css` | iOS design language optimized for mobile devices |
| **Soft Pastel** | `reactaform/themes/soft-pastel.css` | Gentle pastel colors with low contrast for relaxed viewing |
| **Glass Morphism** | `reactaform/themes/glass-morphism.css` | Frosted glass effect with backdrop blur and translucency |
| **High Contrast** | `reactaform/themes/high-contrast-accessible.css` | Maximum contrast for accessibility compliance (WCAG AAA) |

### Dark Themes

| Theme | Import | Description |
|-------|--------|-------------|
| **Material Dark** | `reactaform/themes/material-dark.css` | Material Design dark mode with elevated layering system |
| **Ant Design Dark** | `reactaform/themes/ant-design-dark.css` | Ant Design dark variant with warm undertones |
| **Blueprint Dark** | `reactaform/themes/blueprint-dark.css` | Blueprint.js dark theme with muted blue accents |
| **Tailwind Dark** | `reactaform/themes/tailwind-dark.css` | Tailwind dark mode with slate color palette |
| **Midnight Dark** | `reactaform/themes/midnight-dark.css` | Deep midnight blue theme with subtle gradients |
| **Neon Cyber Dark** | `reactaform/themes/neon-cyber-dark.css` | Cyberpunk aesthetic with neon highlights and sci-fi vibes |

### Size Variants

| Variant | Import | Description |
|---------|--------|-------------|
| **Compact** | `reactaform/themes/compact-variant.css` | Reduced spacing and smaller font sizes for dense layouts |
| **Spacious** | `reactaform/themes/spacious-variant.css` | Generous spacing and larger touch targets for accessibility |

### Usage Examples

```tsx
// Material Design
import 'reactaform/themes/material.css';
<ReactaForm theme="material" ... />

// Dark mode switching
import 'reactaform/themes/material.css';
import 'reactaform/themes/material-dark.css';
<ReactaForm theme={isDark ? 'material-dark' : 'material'} ... />

// Combine with size variant
import 'reactaform/themes/material.css';
import 'reactaform/themes/compact-variant.css';
// Both themes apply - material colors with compact spacing
```

### Theme Selection Guide

**Choose based on your design system:**
- **Material** or **Material Dark** - Google Material Design projects
- **Ant Design** or **Ant Design Dark** - Enterprise applications, admin panels
- **Blueprint** or **Blueprint Dark** - Data-heavy interfaces, dashboards
- **Fluent** - Microsoft ecosystem applications
- **shadcn** - Next.js, React projects using shadcn/ui
- **Tailwind** or **Tailwind Dark** - Tailwind CSS projects
- **iOS Mobile** - Mobile-first iOS apps
- **macOS Native** - Desktop Mac applications
- **High Contrast** - Accessibility-focused applications
- **Neon Cyber Dark** - Gaming, tech, creative applications
- **Midnight Dark** - Professional dark interfaces
- **Glass Morphism** - Modern, premium aesthetics

**Performance tip:** Only import the themes you actively use. Each theme is ~1-1.5KB gzipped.
