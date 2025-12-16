# Style & Theming

Purpose: How ReactaForm handles light/dark themes, CSS variables for theming, and the recommended customization approaches.

## Theme Mode
ReactaForm exposes theme mode in two related places. The details are shown below with indented/nested bullets for clarity.

- Provider attribute:
  - `data-reactaform-theme` — set to `"dark"` or `"light"` on the provider wrapper depending on active theme.
    - Example: - `<div data-reactaform-theme="dark" class="reactaform-container">...` when dark mode is active.


- Container class:
  - `reactaform-container` — default container class applied by the provider (configurable via the `className` prop).

- Component-level prop (renderer usage):
  - `darkMode` — some renderers (e.g., `ReactaForm` component) accept a `darkMode` prop to request dark mode.
    - Example: `<ReactaForm definitionData={definition} darkMode={true} />`

## Recommended Theming Mechanisms

1. CSS Custom Properties (recommended)
   - The core stylesheet (`src/core/reactaform.css`) uses CSS variables for colors, spacing, borders and typographic tokens.
   - Override variables globally (`:root`) or scope them per-theme using the `[data-reactaform-theme]` attribute.

2. Provider Inline Styles (for structure/layout only)
   - `ReactaFormProvider` accepts a `defaultStyle` prop that produces small inline style objects (e.g., `formStyle`, `fieldStyle`) applied to container elements.
   - Use inline styles for layout-level overrides (width, font-family, container padding). Do not use inline styles for color theming — prefer CSS variables.

## Important CSS Variables (non-exhaustive)

Colors & surfaces:
- `--reactaform-primary-bg` — main container background
- `--reactaform-secondary-bg` — card / surface background
- `--reactaform-input-bg` — input background
- `--reactaform-text-color` — primary text
- `--reactaform-text-muted` — secondary/muted text
- `--reactaform-border-color`, `--reactaform-border-hover`, `--reactaform-border-focus`
- `--reactaform-error-color`, `--reactaform-success-color`

Spacing & sizing:
- `--reactaform-space`, `--reactaform-space-lg` — base spacing units
- `--reactaform-field-gap`, `--reactaform-column-gap`, `--reactaform-inline-gap`, `--reactaform-label-gap`
- `--reactaform-container-padding`, `--reactaform-input-padding`

Typography & shape:
- `--reactaform-font-size`, `--reactaform-font-weight`
- `--reactaform-border-radius`

Buttons & controls:
- `--reactaform-button-bg`, `--reactaform-button-text`, `--reactaform-button-padding`, `--reactaform-button-font-size`

There are dark-mode overrides in the core stylesheet under `[data-reactaform-theme="dark"]` which adjust the above variables for a dark color palette.

## Examples

Global CSS variable override (recommended):

```css
:root {
  --reactaform-primary-bg: #ffffff;
  --reactaform-text-color: #111827;
  --reactaform-border-focus: #0ea5e9;
}

[data-reactaform-theme="dark"] {
  --reactaform-primary-bg: #0b1220;
  --reactaform-text-color: #eef2ff;
}
```

Provider inline style for layout only:

```tsx
<ReactaFormProvider
  defaultDarkMode={false}
  defaultStyle={{ width: '900px', fontFamily: 'Inter, system-ui' }}
>
  <App />
</ReactaFormProvider>
```

## Focus, Accessibility & Contrast

- The core stylesheet applies an explicit focus ring derived from `--reactaform-border-focus`.
- When overriding variables, ensure sufficient contrast for text and focus outlines in both light and dark themes.

## Responsive Behavior

- The stylesheet provides responsive rules that switch to a single-column layout on smaller screens and increase touch-target sizes. These rules respect the same CSS variables, so spacing changes propagate to mobile behavior.

## Best Practices

- Prefer CSS variable overrides so every component (current and future) inherits your theme consistently.
- Use `defaultStyle` for layout-level adjustments only (width, container paddings, fonts).
- For per-form variants, wrap the provider with a class and scope CSS variable overrides to that wrapper.

## References

- Core provider: [src/components/ReactaFormProvider.tsx](src/components/ReactaFormProvider.tsx#L1-L240)
- Core stylesheet and variables: [src/core/reactaform.css](src/core/reactaform.css#L1-L240)


---
