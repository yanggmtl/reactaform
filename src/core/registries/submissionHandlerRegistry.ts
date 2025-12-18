import type { FieldValueType, FormSubmissionHandler, ReactaInstance } from "../reactaFormTypes";
import BaseRegistry from "./baseRegistry";

const registry = new BaseRegistry<FormSubmissionHandler>();

export function registerSubmissionHandler(submitterName: string, fn: FormSubmissionHandler): void {
  registry.register(submitterName, fn);
}

export function getFormSubmissionHandler(submitterName: string): FormSubmissionHandler | undefined {
  return registry.get(submitterName);
}

export function getSubmissionHandler(submitterName: string): FormSubmissionHandler | undefined {
  return registry.get(submitterName);
}

registerSubmissionHandler(
  "Preset_AlertSubmitHandler",
  (definition, instanceName, valuesMap) => {
    const instance : ReactaInstance = {
      name: instanceName || "Unnamed Instance",
      version: definition.version as string,
      definition: definition.name as string,
      values: valuesMap as unknown as Record<string, FieldValueType>,
    }
    const instanceStr = JSON.stringify(instance, null, 2);
    alert(instanceStr);
    return undefined;
  }
);

export default registry;
