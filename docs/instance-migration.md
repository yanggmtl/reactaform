# Instance Migration

This document explains what an "instance migration" is, when to use it, and how to upgrade saved form instances to a newer form definition version.

## What is being migrated

An instance migration updates a stored form instance (the object that contains user values and the original definition reference) so it conforms to a newer `ReactaDefinition` (a schema with an updated `version`). Typical targets include persisted database records, localStorage entries, or exported JSON created by older app versions.

## When to run a migration

- After changing a form definition in a way that affects stored values (adding/removing fields, changing types, adding defaults).
- Before rendering old instances with the new renderer to avoid validation or runtime errors.

## How to use

The project exposes a migration helper you can call at runtime. Conceptually:

- `upgradeInstanceToLatestDefinition(oldInstance, latestDefinition, callback?)`

Parameters:

- `oldInstance`: the saved instance object (contains `values` and original `definition`/`version`).
- `latestDefinition`: the new `ReactaDefinition` (include `name`, `version`, and `properties`).
- `callback?`: optional function `(oldInstance, newInstance, latestDefinition) => void` to apply custom transforms or preserve legacy fields.

High-level behavior:

- Produces a new instance that matches `latestDefinition` and migrates compatible values.
- Fills missing properties using property defaults defined on the latest definition.
- Provides an opportunity for custom, application-specific handling via the `callback`.

## Example

Old instance (stored):

```json
{
	"definition": "contactForm",
	"version": "1.0.0",
	"values": {
		"name": "Alice",
		"email": "alice@example.com",
		"age": "42",
		"country": "us",
		"tags": "a,b"
	}
}
```

New definition: `age` is now an integer, `tags` is an array, and `newsletter` is added with a default `false`.

Calling the migration helper without a `callback` will produce an upgraded instance similar to:

```json
{
	"definition": "contactForm",
	"version": "2.0.0",
	"values": {
		"name": "Alice",
		"email": "alice@example.com",
		"age": 42,
		"country": "us",
		"tags": ["a","b"],
		"newsletter": false
	}
}
```

## Custom transforms with `callback`

Use the `callback` to handle renames, preserve removed fields, or perform business-specific conversions. Keep the callback deterministic and idempotent.

Example (pseudo-code):

```js
upgradeInstanceToLatestDefinition(oldInst, latestDef, (oldInst, newInst) => {
	if (oldInst.values.companyName && !newInst.values.employer) {
		newInst.values.employer = oldInst.values.companyName;
	}
	if (oldInst.values.legacyNote) {
		newInst.values._legacy = { note: oldInst.values.legacyNote };
	}
});
```

## Best practices

- Prefer explicit callback transforms for renames or semantic changes to avoid data loss.
- Add unit tests for important migration cases (parsing numeric strings, arrays, renamed fields).
- Keep migrations idempotent so they can be safely retried.

## When to avoid automatic migration

- For deep structural refactors or complex semantic changes (split fields, nested object reshaping) implement versioned migration scripts or server-side migration jobs rather than relying on automatic conversions.

## Futher enhancement
- Support versioned upgrades, allowing users to upgrade incrementally between versions.

---

For implementation details, see `src/core/reactaFormModel.ts` (search for `upgradeInstanceToLatestDefinition`).
