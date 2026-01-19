# Templates

ReactaForm provides a set of pre-built form templates designed to help you get started quickly and consistently. Templates define common form structures and behaviors that can be reused, customized, and versioned alongside your application.

## What templates include

Each template contains:

- A form schema (JSON) defining fields, layout, validation rules, and defaults
- Sensible UX patterns for common use cases
- Field naming conventions that work well with APIs and data storage
- Ready-to-edit configurations compatible with the ReactaForm Builder

Templates are meant to be starting points, not rigid solutions. You can freely modify them to match your product requirements.

## Available template categories

ReactaForm ships with templates for common scenarios, including:

- **Contact forms** — Basic contact and inquiry forms with name, email, message, and optional subject fields.
- **Survey forms** — Multi-question surveys with radio groups, checkboxes, ratings, and conditional logic.
- **Registration forms** — User sign-up flows with personal information, credentials, and validation rules.
- **Order forms** — Product or service order forms with item selection, quantities, pricing, and totals.
- **Application forms** — Longer, structured forms for job applications, program enrollment, or submissions.
- **Feedback forms** — Lightweight feedback and rating forms for collecting user input and sentiment.

Additional templates may be added over time as ReactaForm evolves.

## Authoring and managing templates

Templates are typically created and maintained using the ReactaForm visual Builder:

1. Open a template in the Builder.
2. Customize fields, layout, validation, and logic as needed.
3. Export the template as JSON.
4. Store the JSON in your codebase or configuration repository.
5. Version templates alongside your application releases to keep form behavior predictable.

This workflow makes templates:

- Easy to review in code
- Simple to reuse across environments
- Safe to evolve without breaking existing forms

## Templates gallery

The official ReactaForm templates gallery is available at:

[https://reactaform.vercel.app/templates](https://reactaform.vercel.app/templates)

From the gallery you can:

- Browse all available templates by category
- Preview the template structure and JSON definition
- Open any template directly in the ReactaForm Builder for editing
- Use a template as-is or as a base for a custom form

The gallery is the recommended starting point for new forms and experiments.

## Recommended usage

- Use templates to bootstrap new forms quickly
- Treat templates as versioned assets, not one-off experiments
- Customize templates to reflect your domain language and validation rules
- Keep template JSON under source control for traceability