**Performance Considerations**

- **Purpose:** Practical guidance for keeping ReactaForm fast at runtime and during builds. Covers rendering patterns, data handling, network usage, and profiling recommendations.

## Rendering & React patterns

- Minimize unnecessary re-renders: prefer `useMemo` / `useCallback` for stable handlers and derived values. - Avoid recreating inline objects/arrays on every render (style objects, option arrays). Extract them outside render or memoize.
- Use `key` correctly for lists to avoid full re-renders of list items when ordering changes.


## Debouncing & throttling

- Use `useDebouncedCallback` (provided) for expensive operations triggered by frequent changes (e.g., live validation, remote autosave, or heavy formatting).
- Debounce network-backed validations and avoid running form-wide validation on every keystroke unless necessary.


## CSS & paint performance

- The project uses CSS variables and a small set of shared class names. Keep CSS selectors flat and avoid deep descendant selectors to reduce style calculation cost.
- Avoid forced synchronous layouts (no layout thrashing): do not read layout properties (offsetWidth/height) and then write in tight loops.

## Recommendations (concrete)

- Memoize: large derived objects and field renderers.
- Debounce: live validation, autosave, and network validation.
- Lazy-load: heavy or rarely used field components.
- Cache: translations, remote options, and other fetched assets.

## Future Enhancement
- Virtualize fields for ReactaForm Rendering to speed up refresh for large numbers fields
