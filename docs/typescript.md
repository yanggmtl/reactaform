# TypeScript

# TypeScript and the Type-Safe API

ReactaForm provides first-class TypeScript support so your form definitions, custom components,
validation handlers and submission handlers are all type-checked. This improves DX with
autocomplete, inline documentation and compile-time safety.

## What you get
- Strongly-typed `FormDefinition` and `FieldDefinition` shapes.
- Typed context hooks (`useReactaFormContext`) with typed `definition`, `values`, `errors` and helpers.
- Type-safe registration helpers for components, validation handlers and submission handlers.

## Type-safe form definition (example)
```ts
import type { FormDefinition } from 'reactaform';

const contactForm: FormDefinition = {
	name: 'contactForm',
	displayName: 'Contact Form',
	version: '1.0.0',
	properties: [
		{
			type: 'text',
			name: 'fullName',
			displayName: 'Full Name',
			defaultValue: '',
			required: true,
			minLength: 2,
			maxLength: 100,
		},
		{
			type: 'email',
			name: 'email',
			displayName: 'Email Address',
			defaultValue: '',
			required: true,
		}
	]
};
```

TypeScript will warn you if you use an unknown property on a field or supply the wrong value type.

## Registering typed components
```ts
import { registerComponent, InputComponentProps } from 'reactaform';

const CustomInput: React.FC<InputComponentProps> = ({ field, value, onChange, style, t }) => {
	return (
		<div style={style.container}>
			<label style={style.label}>{t(field.displayName)}</label>
			<input value={value as string} onChange={e => onChange(e.target.value)} style={style.input} />
		</div>
	);
};

registerComponent('custom', CustomInput);
```

The `InputComponentProps` type ensures the component receives the expected props (field metadata, current value, change handler, style helpers and translation helper).

## Typed context hook
Use `useReactaFormContext()` to access typed form state and helpers:

```ts
import { useReactaFormContext } from 'reactaform';

function MyComponent() {
	const { definition, values, errors, setValue, validateField, t } = useReactaFormContext();
	// `definition` is `FormDefinition`
	// `values` and `errors` are typed records keyed by field name
}
```

## Validation handlers (type-safe)
```ts
import { registerFieldValidationHandler, ValidationResult } from 'reactaform';

registerFieldValidationHandler('phoneValidator', (value: unknown): ValidationResult => {
	const phone = String(value ?? '');
	if (!/^\d{10}$/.test(phone)) {
		return { isValid: false, error: 'validation.invalidPhone' };
	}
	return { isValid: true };
});
```

Validation handlers return a `ValidationResult` which can include an error message key (for i18n) — keep messages as keys where possible so the UI can translate them via the app's `t()` function.

## Submission handlers (type-safe)
```ts
import { registerSubmissionHandler, FormSubmissionHandler } from 'reactaform';

const submitHandler: FormSubmissionHandler = (definition, instanceName, values, t) => {
	// values is typed as Record<string, unknown>
	console.log('submit', { definition, instanceName, values });
	return undefined; // or return an error string
};

registerSubmissionHandler('mySubmit', submitHandler);
```

## Types Provided

- `ReactaFormContextType` — provider context shape (language, `t`, styles, `definitionName`).
- `ReactaFormProviderProps` — props accepted by `ReactaFormProvider`.
- `DefinitionPropertyField` — a property descriptor for `ReactaDefinition` (name, type, displayName, validation, layout, etc.).
- `ReactaDefinition` — form definition structure (`name`, `version`, `displayName`, `properties[]`, handlers).
- `ReactaInstance` — persisted instance shape (`name`, `definition`, `version`, `values`).
- `ReactaFormProps` — props for the top-level `ReactaForm` component.
- `FieldValueType` — union of allowed field value types (boolean, number, string, arrays, unit tuple, `File`, etc.).
- `ErrorType` — error string or `null`.
- `FieldValidationHandler` — single-field validator signature `(value, t) => string | undefined`.
- `FormValidationHandler` — cross-field validator signature `(valuesMap, t) => string[] | undefined`.
- `FormSubmissionHandler` — submission handler signature `(definition, instanceName, valuesMap, t) => string[] | undefined`.
- `InputOnChange<T>` — generic input change callback `(value: T | string, error: string | null) => void`.
- `BaseInputProps<TValue, TField>` — base props for input components (`field`, `value`, `onChange`, `onError`).
- `RegistryResult<T>` — generic registry operation result `{ success, data?, error? }`.
- `ValidationResult` — enhanced validation result `{ isValid, errors[], warnings? }`.
- `EnhancedDefinitionPropertyField` — extended property field with category/tags/dependencies/conditional 

## Extensibility tips
- Extend field types in your app by re-exporting or augmenting the exported `FieldDefinition`/`FormDefinition` types so your domain-specific fields stay typed across code.
- Use typed registration helpers so custom components and handlers are checked at compile-time.

## Benefits
- Catch errors early during development.
- Improved IDE autocomplete and inline docs.
- Safer refactors and clearer migration paths when upgrading ReactaForm.

## References
- See the interactive guide: `/features/type-safe-api`
- Implementation types (export entry): `src/types` or the package's type exports
