# Advanced Usage

## Dynamic Forms
- Fetch definitions from remote APIs; cache and hydrate into the renderer at runtime.
- Version definitions and include `version` in JSON for compatibility checks.

## Conditional Fields (Parent / Child Support)

ReactaForm supports parent/child visibility and enabled state for fields using `parents`. In definition property, specify parent name and correspodent value to link two properties together and child visibility is controlled by parents.

Example: parent toggles children

```json
{
	"name": "employment",
	"displayName": "Employment",
	"properties": [
		{ "type": "switch", "name": "isEmployed", "displayName": "Currently Employed" },
		{
			"type": "text",
			"name": "employerName",
			"displayName": "Employer",
			"parents": { "isEmployed": [true] }
		},
		{
			"type": "date",
			"name": "startDate",
			"displayName": "Start Date",
			"parents": { "isEmployed": [true] }
		}
	]
}
```

Implementation notes:
- a properties can has multiple parents, so parents is a key-value map. In the value, multiple values can be included for one parent.

## Group Support

Groups can be used to simplify the UI and make it easier for users to interact with the form. In  ReactaForm definition, all properties are defined in a flat structure and following logic for group support.
- Each property can has a `group` attribute for group name.
- Consecutive properties sharing the same group name are collected into a single group.
- If a group name reappears in a non-consecutive property, a new group is created with a renamed identifier.

Example: Address group

```json
{
  "name": "address",
  "displayName": "Address",
  "properties": [
      { "type": "text", "name": "name", "DisplayName": "User Name"},
      { "type": "text", "name": "line1", "displayName": "Address Line 1", "group": "Address" },
      { "type": "text", "name": "city", "displayName": "City", "group": "Address"  },
      { "type": "text", "name": "postal", "displayName": "Postal Code", "group": "Address"  }
  ]
}
```

Renderer behavior:
- Consecutive properties with same group name are collected and rendered in same group.
- Group can be collapse/expand

## Field Layout
Field layout controls label placement, tooltip display and other per-field presentation hints.

1) Label layout (`labelLayout`)

- Options:
	- `row` — label rendered on the same row as the input (inline label).
	- `column-left` — label rendered above the input and left-aligned.
	- `column-center` — label rendered above the input and center-aligned.

Example:

```json
{
	"type": "text",
	"name": "firstName",
	"displayName": "First name",
	"labelLayout": "row"
}
```

2) Tooltip (`tooltip`)

- Provide a short help string to show beside the field. Tooltips are rendered by the renderer to the right of the field area by default.

Example:

```json
{ "type": "text", "name": "email", "displayName": "Email", "tooltip": "Enter a business email address" }
```

Notes:

- Property names are case-sensitive; prefer `labelLayout` and `tooltip` in definitions.
- Layout hints are renderer suggestions — custom renderers may choose how strictly to honor them.
- Use `layout` (container-level) and CSS variables to control column widths and spacing across the form.

## Custom Validation

ReactaForm exposes typed registration APIs for custom validation at both field and form level.
Please see reference [Validation](./validation.md)

## Theming and CSS variable control
Please see reference [Styling & UI](./styling-ui.md)

