# ReactaForm Builder

The ReactaForm Builder is a visual, drag-and-drop editor for creating and editing ReactaForm JSON definitions without hand-writing JSON. Use the Builder to assemble fields, configure properties and validation, preview behavior in real time, and export production-ready JSON.

## Key Features

- **Drag & Drop:** Add components from the palette to the canvas; reorder fields visually and configure them via the properties panel.
- **Live Preview:** The canvas renders your form as you build; use the full-form preview modal to interactively test validation, conditional logic, and submission behavior.
- **Export JSON:** Export clean, schema-compliant JSON (.json file, clipboard copy, or preview) ready to import into your app. Exports are validated before download.

## Quick Start

- Open the Builder: [Open Builder](https://reactaform.com/builder)
- Start from a template or create a blank form.
- Drag components from the left palette onto the canvas.
- Select a component to edit its `name`, `displayName`, validation rules, and type-specific properties in the right panel.
- Use the Preview button to test the form, then export when ready.

## Builder Interface

![Visual Builder Interface](/img/builder_ui.jpg)

## Export & Re-import

- Download a `.json` file or copy the pretty-printed JSON to the clipboard.
- The Builder performs schema validation before exporting and blocks export on missing required form properties or invalid configurations.
- Exported JSON can be reloaded into the Builder for iteration using the Load/Import option.

## Best Practices & Tips

- Give each component a unique `name` (no spaces or special chars) to avoid collisions.
- Use `displayName` for friendly labels and keep `name` stable for programmatic access.
- Validate conditional dependencies and option arrays in the preview before exporting.

## Resources

- [Builder tool](https://reactaform.com/builder)
- [Templates](https://reactaform.com/templates)
- [Documentation](https://reactaform.com/docs/index.html)
