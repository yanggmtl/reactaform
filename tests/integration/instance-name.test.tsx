import { describe, it, expect } from 'vitest';
import { registerSubmissionHandler } from '../../src/core/submissionHandlerRegistry';
import { submitForm } from '../../src/core/submitForm';
import type { ReactaDefinition, ReactaInstance } from '../../src/core/reactaFormTypes';

// Minimal definition used by test
const def: ReactaDefinition = {
  name: 'user_profile',
  version: '1.0.0',
  displayName: 'User Profile',
  submitHandlerName: 'testSubmitHandler',
  properties: [
    { name: 'firstName', displayName: 'First Name', type: 'string', defaultValue: '' },
  ],
};

const makeInstance = (name: string): ReactaInstance => ({
  name,
  definition: def.name,
  version: def.version,
  values: { firstName: 'Alice' },
});

describe('ReactaForm instance name behavior', () => {
  it('applies edited name to parent on successful submit', async () => {
    const instance = makeInstance('Original');

    // Parent state simulation
    let parentInstance = { ...instance };

    // Register submission handler similar to instance-app handler
    registerSubmissionHandler('testSubmitHandler', (definition, instanceName, valuesMap) => {
      void definition;
      // handler should receive the updated name (edited by the form)
      // update parent instance immutably (simulate parent setState)
      parentInstance = { ...parentInstance, name: instanceName ?? parentInstance.name, values: valuesMap as unknown as Record<string, unknown> } as ReactaInstance;
      return undefined;
    });

    // Simulate editing the instance name and submitting by calling submitForm
    // Temporarily set the name as if the user edited it
    instance.name = 'Updated';

    const result = await submitForm(def, instance, instance.values, (s) => s, {});
    expect(result.success).toBe(true);

    // After submit handler runs, parentInstance should have updated name
    expect(parentInstance.name).toBe('Updated');
  });
});
