# Example Apps (packages/apps)

This folder contains small demo apps that exercise features of the `reactaform` library. The apps are intended to:

- show common integration points (custom submit handlers, form-level validation)
- demonstrate theming/custom CSS variable overrides
- exercise conditional visibility, grouping, and localization
- act as runnable examples during development (they import the local `reactaform` source)

Each app is a minimal Vite + React app located at `packages/apps/<app-name>` and includes a `public/reactaform.svg` used as the favicon.

Important: during development the apps resolve the local library source using a Vite alias that points at `../../reactaform/src/package`. This keeps the apps using the in-workspace library code without needing to publish packages.

---

Available apps
- `instance-app` — full-featured instance manager demonstrating creating new instances, loading instances from JSON, maintaining an instance list, and editing selected instances with ReactaForm. Shows complete instance lifecycle management.
- `submit-handler-app` — demonstrates registering a custom submission handler using `registerSubmissionHandler` and calling it via the definition's `submitHandlerName`.
- `custom-validation-app` — demonstrates a custom form-level validator registered with `registerFormValidationHandler` and referenced via `validationHandlerName` in the definition; the validator enforces `firstNumber < secondNumber`.
- `custom-styles-app` — shows how to override `reactaform` CSS variables by applying a class that re-defines variables (example: `.custom-reactaform`).
- `group-app` — example of grouping fields and rendering grouped sections.
- `parents-app` — demonstrates parent/child visibility relationships (fields that show/hide depending on parent values).
- `dark-mode-app` — simple demo for dark mode visual verification.
- `translation-app` — demonstrates `localization` usage and loading `/public/locales/<lang>/<file>.json`.


Run and build

- Run a single app in dev mode (hot reload):

```powershell
npm --prefix packages/apps/<app-name> run dev
```

- Build a single app for production:

```powershell
npm --prefix packages/apps/<app-name> run build
```

- Build all apps from repository root (script discovers apps):

```powershell
npm run build:apps
```

---

How the apps import the library

- Vite config in each app contains an alias mapping `reactaform` to `../../reactaform/src/package`. This keeps apps pointed at the workspace source:

```ts
resolve: {
  alias: {
    'reactaform': path.resolve(__dirname, '../../reactaform/src/package')
  }
}
```

When publishing the library, update app dependencies to use the published package instead of the alias.

---

Registering custom handlers (examples in apps)

- Form submission handler (register and reference):

1. Define and register a handler with `registerSubmissionHandler(name, fn)` (usually inside a `useEffect`).
2. Set `submitHandlerName` on your definition to the registered name.

- Form-level validation handler (cross-field validation):

1. Register with `registerFormValidationHandler(name, fn)`.
2. Set `validationHandlerName` on your definition.

Example (conceptual):

```ts
registerFormValidationHandler('myFormValidator', (valuesMap, t) => {
  const errors: string[] = [];
  if (Number(valuesMap.a) >= Number(valuesMap.b)) {
    errors.push(t('Field A must be less than Field B'));
  }
  return errors.length ? errors : undefined;
});

// definition.validationHandlerName = 'myFormValidator'
```

The apps include minimal implementations you can copy into your project.

---

Styling and theme customization

- `reactaform` uses CSS custom properties (variables) for theming (see `packages/reactaform/src/package/core/reactaform.css`).
- To override the default look, create a class that redefines the variables and apply that class to the same container as the `reactaform` root element (or a parent). Example in `custom-styles-app`:

```css
.custom-reactaform {
  --reactaform-primary-bg: #0f1724;
  --reactaform-text-color: #f8fafc;
  --reactaform-button-bg: #2563eb;
}
```

Then apply both classes to the container:

```jsx
<div className="reactaform custom-reactaform">
  <ReactaForm definitionData={definition} />
</div>
```

This approach keeps the library styles intact while allowing app-level theming.

---

CI / lockfile notes

- If you add or remove workspace packages, update the root `package-lock.json` by running `npm install` on your machine and commit the updated lockfile. GitHub Actions (and `npm ci`) expect the lockfile to match workspace package definitions.

---

Troubleshooting

- If `npm ci` fails in CI with missing workspace packages, run locally:

```powershell
npm install
git add package-lock.json
git commit -m "chore: update lockfile for apps"
git push
```

- If an app uses a custom handler but nothing happens on submit, ensure the handler was registered before the form is submitted (register in `useEffect`) and that the definition's `submitHandlerName` or `validationHandlerName` matches the registered name.
