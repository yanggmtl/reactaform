// Core ReactaForm functionality exports

export * from "./reactaFormTypes";
export * from "./submitForm";
export * from "./fieldVisibility";
export * from "./reactaFormModel";
export * from "./pluginRegistry";
export * from "./componentRegistry";
export * from "./submissionHandlerRegistry";
export * from "./baseRegistry";

// Default export convenience
import * as submitForm from "./submitForm";
import * as fieldVisibility from "./fieldVisibility";
import * as reactaFormModel from "./reactaFormModel";
import * as pluginRegistry from "./pluginRegistry";
import * as componentRegistry from "./componentRegistry";
import * as submissionRegistry from "./submissionHandlerRegistry";

import { registerBaseComponents } from "./componentRegistry";

registerBaseComponents();

export default {
  submitForm,
  fieldVisibility,
  reactaFormModel,
  pluginRegistry,
  componentRegistry,
  submissionRegistry,
};
