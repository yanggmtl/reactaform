# Fundamentals

**Purpose:** Explain the mental model behind **ReactaForm** and how its components, validation, submission, and localization work together.

---

## Form Component

**Responsibilities:**  
- Provide a centralized **form context** for fields and handlers.  
- Handle form submission and lifecycle events.  
- Supply `t` for translations and expose **definition metadata**.  

**Lifecycle Management:**  
- Initialize default values for all fields.  
- Validate fields on `change`, and `submit` events.  
- Emit structured submission payloads for handlers.  

**Best Practices:**  
- Keep form logic centralized; avoid embedding complex state inside individual fields.  
- Use the form definition to declare fields, default values, and submission handlers.

---

## Field Components

**Props:**  
- `value`: current field value  
- `error`: current validation error (if any)  
- `onChange`: callback when value changes  
- `onError`: callback when validation fails  

**Patterns:**  
- Prefer **controlled inputs** to ensure predictable behavior.  
- Minimize side effects within field components.  

**Layout:**  
- Use built-in field layouts: `row`, `column-left`, or `colum-center`.  
- Wrap fields in **custom layout components** if your design requires it.  

**Tips:**  
- Avoid duplicating validation logic in fields; rely on form-level rules where possible.  
- Keep presentation and logic separate to maintain flexibility.

---

## Validation Basics

**Built-in Rules:**  
- `required`, `min`/`max`, `pattern`, `enum`/`options`  
- Support for **custom messages** per rule  

**Async Validation:**  
- Validators can return **promises**, enabling server-side checks (e.g., username availability).  

**Field-level vs Form-level:**  
- **Field-level rules**: validate individual input.  
- **Form-level rules**: validate combinations of fields (e.g., password and confirm password match).  
- Combine both to ensure robust validation coverage.  

**Best Practices:**  
- Keep field-level rules simple and fast.  
- Use form-level validation for complex cross-field logic.

---

## Submission Registration System

1. **Specify a submission handler name** in the form definition.  
2. **Implement your submission handler** (sync or async).  
3. **Register the handler** with ReactaForm.  
4. **Handle success and error states**:  
   - Display inline errors via validation output.  
   - Optionally trigger global notifications for success/failure.  

**Tips:**  
- Always validate before submitting; the system ensures that payloads meet field and form-level rules.  
- Use submission handlers to integrate with APIs, logging, or other side effects.

---

## Localization

- **Built-in message translation** is available via `t()`.  
- Supply locale JSON for automatic resolution of messages.  
- Custom messages can be translated using the registration system.  
- Apply custom messages in:  
  - Custom validation rules  
  - Submission error handling  
- Ensure consistency by keeping translation keys centralized.  

**Best Practices:**  
- Use meaningful, descriptive keys for translations (`form.username.required`) rather than hardcoded strings.  
- Maintain separate locale files per language to simplify maintenance.
