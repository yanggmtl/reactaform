// Core ReactaForm functionality exports

export * from "./reactaFormTypes";
export * from "./validation";
export * from "./submitForm";
export * from "./fieldVisibility";
export * from "./reactaFormModel";
export * from "./registries";

// Default export convenience
import * as registries from "./registries";
import * as validation from "./validation";
import * as submitForm from "./submitForm";
import * as fieldVisibility from "./fieldVisibility";
import * as reactaFormModel from "./reactaFormModel";
import { registerBaseComponents } from "./registries";

registerBaseComponents();

export default {
  registries,
  validation,
  submitForm,
  fieldVisibility,
  reactaFormModel
};
