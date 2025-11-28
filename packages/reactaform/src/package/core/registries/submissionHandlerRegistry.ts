import type { FormSubmissionHandler } from "../reactaFormTypes";
import BaseRegistry from "./baseRegistry";

const registry = new BaseRegistry<FormSubmissionHandler>();

export function registerSubmissionHandler(submitterName: string, fn: FormSubmissionHandler): void {
  registry.register(submitterName, fn);
}

export function getFormSubmissionHandler(submitterName: string): FormSubmissionHandler | undefined {
  return registry.get(submitterName);
}

export default registry;
