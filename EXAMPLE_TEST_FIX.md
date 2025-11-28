# Example: How to Fix Test Type Errors

## Problem
Tests are failing because `createMockField` returns `DefinitionPropertyField` with `type: string`, but specialized fields like `RatingInput` require `type: 'rating'` (a literal type).

## Solution Pattern

For each specialized field test, you need to:

1. **Add the correct `type` literal** to `createMockField` calls
2. **Cast the field** to the specific field type when needed

### Example Fix for RatingInput.test.tsx

**Before:**
```typescript
const field = createMockField({ label: 'Rating', max: 5 });
renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);
```

**After (Option 1 - Add type assertion):**
```typescript
const field = createMockField({ type: 'rating', label: 'Rating', max: 5 }) as RatingField;
renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);
```

**After (Option 2 - Import and use specific type):**
```typescript
import type { RatingField } from '../../../package/core/reactaFormTypes';

const field: RatingField = {
  name: 'testField',
  displayName: 'Rating',
  type: 'rating',
  max: 5,
  defaultValue: 0,
  required: false,
};
renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);
```

## Field Types to Use

- **RatingInput** → `type: 'rating'` → cast to `RatingField`
- **SliderInput** → `type: 'slider'`, needs `min` and `max` → cast to `SliderField`  
- **SpinInput** → `type: 'spin'` → cast to `SpinField`
- **UrlInput** → `type: 'url'` → cast to `UrlField`
- **UnitValueInput** → `type: 'unitValue'`, needs `dimension` → cast to `UnitValueField`

## Quick Fix Script Pattern

For `RatingInput.test.tsx`, add ` as RatingField` after each `createMockField()`:

```typescript
import type { RatingField } from '../../../package/core/reactaFormTypes';

// Then for each test:
const field = createMockField({ type: 'rating', label: 'Rating', max: 5 }) as RatingField;
```

## Files to Fix

1. ✅ `src/tests/components/fields/RatingInput.test.tsx` - Add `as RatingField` casts
2. `src/tests/components/fields/SliderInput.test.tsx` - Add `type: 'slider'`, `min`, `max`, and `as SliderField`
3. `src/tests/components/fields/SpinInput.test.tsx` - Add `type: 'spin'` and `as SpinField`
4. `src/tests/components/fields/UrlInput.test.tsx` - Add `type: 'url'` and `as UrlField`
5. `src/tests/components/fields/UnitValueInput.test.tsx` - Add `type: 'unitValue'`, `dimension`, and `as UnitValueField`
6. `src/tests/components/fields/TimeInput.test.tsx` - Remove `label` (use `displayName` instead)
7. `src/tests/components/fields/TextInput.test.tsx` - Remove `maxLength` (not a standard field property)
8. `src/tests/components/fields/Separator.test.tsx` - Remove unused `container` variables

## Example Complete Fix

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import RatingInput from '../../../package/components/fields/RatingInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { RatingField } from '../../../package/core/reactaFormTypes';

describe('RatingInput', () => {
  it('renders stars with label', () => {
    const field = createMockField({ type: 'rating', label: 'Rating' }) as RatingField;
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);
    
    expect(screen.getByText('Rating')).toBeInTheDocument();
  });
});
```
