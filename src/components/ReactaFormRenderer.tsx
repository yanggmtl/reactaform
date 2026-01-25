import * as React from "react";
import type {
  FieldValueType,
  ErrorType,
  DefinitionPropertyField,
  ReactaDefinition,
  ReactaInstance,
  FormSubmissionHandler,
  FormValidationHandler,
} from "../core/reactaFormTypes";
import useReactaFormContext, { ReactaFormContext } from "../hooks/useReactaFormContext";
import { renderFieldsWithGroups } from "./renderFields";
import { InstanceName } from "./LayoutComponents";
import {
  updateVisibilityMap,
  updateVisibilityBasedOnSelection,
  initializeVisibility,
} from "../core/fieldVisibility";
import { renameDuplicatedGroups } from "../utils/groupingHelpers";
import { submitForm } from "../core/submitForm";
import { validateField } from "../validation/validation";
import { SubmissionMessage } from "./SubmissionMessage";
import SubmissionButton from "./SubmissionButton";

export interface ReactaFormRendererProps {
  definition: ReactaDefinition;
  instance: ReactaInstance;
  onSubmit?: FormSubmissionHandler;
  onValidation?: FormValidationHandler;
  chunkSize?: number;
  chunkDelay?: number;
}

/**
 * ReactaFormRenderer component - Internal form renderer with field management
 * @param {ReactaFormRendererProps} props - The component props
 * @param {ReactaDefinition} props.definition - The form definition object
 * @param {ReactaInstance} props.instance - The form instance with values
 * @param {number} [props.chunkSize=50] - Number of fields to render per chunk for performance
 * @param {number} [props.chunkDelay=50] - Delay in ms between rendering chunks
 */
const ReactaFormRenderer: React.FC<ReactaFormRendererProps> = ({
  definition,
  instance,
  onSubmit = undefined,
  onValidation = undefined,
  chunkSize = 50,
  chunkDelay = 50,
}) => {
  const { properties, displayName } = definition;
  const parentContext = useReactaFormContext();
  const { t, formStyle, language, displayInstanceName } = parentContext;
  const renderContext = {
    ...parentContext,
    definitionName: definition?.name ?? parentContext.definitionName,
  };
  const [ savedLanguage, setSavedLanguage] = React.useState("en");

  // Core state
  const [updatedProperties, setUpdatedProperties] = React.useState<
    DefinitionPropertyField[]
  >([]);
  const [fieldMap, setFieldMap] = React.useState<
    Record<string, DefinitionPropertyField>
  >({});
  const [valuesMap, setValuesMap] = React.useState<Record<string, FieldValueType>>(
    {}
  );
  const [visibility, setVisibility] = React.useState<Record<string, boolean>>({});
  const [groupState, setGroupState] = React.useState<Record<string, boolean>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submissionMessage, setSubmissionMessage] = React.useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<boolean | null>(null);

  const [loadedCount, setLoadedCount] = React.useState(0); // how many fields are loaded so far
  const [initDone, setInitDone] = React.useState(false);
  
  const [instanceName, setInstanceName] = React.useState<string>(instance.name || '');
  const targetInstanceRef = React.useRef<ReactaInstance>(instance);
  const suppressClearOnNextInstanceUpdate = React.useRef(false);

 
  // Step 1: Initialize basic structures immediately
  // Initialization effect performs synchronous state setup from the `definition`
  // and `instance` props. This is a safe prop->state initialization and will
  // not cause an infinite update loop.
  React.useEffect(() => {
    const nameToField = Object.fromEntries(
      properties.map((f) => [
        f.name,
        { ...f, children: {} as Record<string, string[]> },
      ])
    );

    properties.forEach((field) => {
      if (!field.parents) return;
      Object.entries(field.parents).forEach(([parentName, selections]) => {
        const parentField = nameToField[parentName];
        if (!parentField) return;
        selections.forEach((sel) => {
          if (!parentField.children) {
            parentField.children = {};
          }
          const key = String(sel);
          parentField.children[key] = [
            ...(parentField.children[key] || []),
            field.name,
          ];
        });
      });
    });

    // If a group name appears in multiple non-consecutive sequences, rename
    // later sequences so group names remain unique for rendering. Example:
    // g1, g1, g2, g1 -> becomes g1, g1, g2, g1(1)
    renameDuplicatedGroups(properties, nameToField);

    const updatedProps = Object.values(
      nameToField
    ) as DefinitionPropertyField[];

    // Initialize valuesMapInit with definition default values
    const valuesMapInit = {} as Record<string, FieldValueType>;
    updatedProps.forEach((f) => {
      // For UnitValue, the value is in [number, unit] format while in schema definition,
      // it is separated into 2 attributes: defaultValue and defaultUnit
      if (f.type === "unit") {
        // `defaultValue` is expected to be a number and `defaultUnit` a string.
        // Normalize explicitly and assign a typed tuple so TypeScript is happy.
        const numVal =
          typeof f.defaultValue === "number" ? String(f.defaultValue) : "";
        const unitVal =
          typeof f.defaultUnit === "string"
            ? f.defaultUnit
            : String(f.defaultUnit ?? "m");
        valuesMapInit[f.name] = [numVal, unitVal] as unknown as FieldValueType;
      } else {
        valuesMapInit[f.name] = f.defaultValue;
      }
    });

    // Use instance to override valuesMapInit
    targetInstanceRef.current = instance;
    Object.keys(instance.values).forEach((key) => {
      if (nameToField[key] !== undefined) {
        valuesMapInit[key] = instance.values[key];
      }
    });

    // Initialize visibility map
    const vis = initializeVisibility(updatedProps);

    // Initialize group state
    const groupInit = {} as Record<string, boolean>;
    updatedProps.forEach((f) => {
      if (f.group && !(f.group in groupInit)) {
        groupInit[f.group] = true;
      }
    });

    // Defer state updates to avoid synchronous setState inside effect
    const raf = requestAnimationFrame(() => {
      setUpdatedProperties(updatedProps);
      setFieldMap(nameToField);
      setValuesMap(valuesMapInit);
      setVisibility(
        updateVisibilityMap(updatedProps, valuesMapInit, vis, nameToField)
      );
      setGroupState(groupInit);
      setInitDone(true);
      // Update instance name in state to sync with current instance
      setInstanceName(instance.name);
    });
    return () => cancelAnimationFrame(raf);
  }, [properties, instance, definition]);

  // Step 2: Load fields progressively
  React.useEffect(() => {
    if (!initDone || loadedCount >= updatedProperties.length) return;
    const timer = setTimeout(() => {
      setLoadedCount((prev) =>
        Math.min(prev + chunkSize, updatedProperties.length)
      );
    }, chunkDelay);
    return () => clearTimeout(timer);
  }, [initDone, loadedCount, updatedProperties.length, chunkSize, chunkDelay]);

  /*
   * handleChange
   * ----------------
   * This is the central field change handler passed down to rendered field
   * components. Contract:
   * - name: the field name being changed
   * - value: the new value for the field (may be any FieldValueType)
   * - error: optional validation error string
   *
   * Responsibilities:
   * 1. Update the local values map (using a functional update so we always
   *    operate on the latest state and avoid stale closures).
   * 2. Update the visibility map when the changed field affects conditional
   *    visibility (options/select/radio/multi-select/boolean). Visibility is
   *    recomputed from the new values so dependent fields show/hide correctly.
   */
  const handleChange = React.useCallback(
    (name: string, value: FieldValueType) => {
      // Clear any previous submission message when the user changes a value
      setSubmissionMessage(null);
      setSubmissionSuccess(null);
      // Update values map using functional update to ensure we operate on latest state
      // For integer, integer array, float and float array, the value is string
      // integer array value: a string which joins integers with commas
      // float array value: a string which joins floats with commas
      // We need to parse them back to number or number[] when submitting the form
      setValuesMap((prevValues) => {
        const newValues = { ...prevValues, [name]: value };

        // If the field affects visibility, compute and update visibility based on the new values
        const field = fieldMap[name];
        if (field) {
          const supportChildren = [
            "checkbox",
            "dropdown",
            "multi-select",
            "radio",
            "switch",
          ].includes(field.type);
          if (supportChildren) {
            setVisibility((prevVis) =>
              updateVisibilityBasedOnSelection(
                prevVis,
                fieldMap,
                newValues,
                name,
                String(value)
              )
            );
          }
        }

        return newValues;
      });
    },
    [fieldMap, setSubmissionMessage, setSubmissionSuccess]
  );

  // Sync language changes: update savedLanguage and clear messages
  // Use RAF to avoid cascading renders.
  React.useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      if (language !== savedLanguage) {
        setSavedLanguage(language || "en");
        setSubmissionMessage(null);
        setSubmissionSuccess(null);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [language, savedLanguage]);

  // When the active instance changes (selection switched), clear submission messages
  // and sync the editable instance name and ref. Use RAF to avoid cascading renders.
  React.useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      // If this instance update was caused by our own successful submit,
      // skip clearing the submission message but still sync the editable name.
      if (suppressClearOnNextInstanceUpdate.current) {
        suppressClearOnNextInstanceUpdate.current = false;
        // Keep ref in sync with latest instance object
        targetInstanceRef.current = instance;
        setInstanceName(instance.name || "");
        return;
      }

      // Keep ref in sync with latest instance object
      targetInstanceRef.current = instance;
      setSubmissionMessage(null);
      setSubmissionSuccess(null);
      setInstanceName(instance.name || "");
    });
    return () => cancelAnimationFrame(raf);
  }, [instance, instance.name]);

  // handleError: used by input components to report validation-only updates
  // that originate from prop sync (not user events). This keeps the error
  // map up to date when components validate on mount or when external props
  // change without invoking the full handleChange lifecycle.
  const handleError = React.useCallback((name: string, error: ErrorType) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [name]: String(error) };
      }
      // remove key
      const rest = Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name)) as Record<string, string>;
      return rest;
    });
  }, []);

  const handleSubmit = async () => {
    // Temporarily apply the edited name so submission handlers receive it.
    // Mark that we expect an instance update from this submit and we want
    // to suppress clearing messages when that update arrives.
    suppressClearOnNextInstanceUpdate.current = true;

    const prevName = targetInstanceRef.current?.name;
    targetInstanceRef.current.name = instanceName;

    // Determine the error map that will be submitted. We avoid relying on
    // the (async) state update to `errors` and instead use a local
    // `errorsForSubmit` which we set to the freshly computed `newErrors`
    // when running on-submission validation.
    let errorsForSubmit = errors;

    // Go through valuesMap and validate all fields if fieldValidationMode is 'onSubmission'
    if (renderContext.fieldValidationMode === "onSubmission") {
      const newErrors: Record<string, string> = {};
      updatedProperties.forEach((field) => {
        const value = valuesMap[field.name];
        if (value === undefined) return;
        const err = validateField(renderContext.definitionName, field, value, t);
        if (err) {
          newErrors[field.name] = err;
        }
      });

      // Update state and use the fresh map for the remainder of this function.
      setErrors(newErrors);
      errorsForSubmit = newErrors;

      // If there are errors, do not proceed with submission
      if (Object.keys(newErrors).length > 0) {
        setSubmissionMessage(t("Please fix validation errors before submitting the form."));
        setSubmissionSuccess(false);
        return;
      } else {
        setSubmissionMessage(null);
        setSubmissionSuccess(null);
      }
    }

    // No field validation errors, proceed with submission
    // Form validation is processed in submitForm
    const result = await submitForm(definition, targetInstanceRef.current, valuesMap, t, errorsForSubmit, onSubmit, onValidation);
    
    // Display result message in the UI
    const msg = typeof result.message === 'string' ? result.message : String(result.message);
    const errMsg = Object.values(result.errors??{}).join("\n");
    if (errMsg) {
      setSubmissionMessage(msg + "\n" + errMsg);
    } else {
      setSubmissionMessage(msg);
    }
    setSubmissionSuccess(result.success);

    if (!result.success) {
      // Revert name if submission failed
      targetInstanceRef.current.name = prevName ?? targetInstanceRef.current.name;
      setInstanceName(prevName ?? "");
    }
  };

  const toggleGroup = (groupName: string) => {
    setGroupState((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Memoize expensive computations
  const isApplyDisabled = React.useMemo(
    () => renderContext.fieldValidationMode === "realTime" ? Object.values(errors).some(Boolean) : false,
    [errors, renderContext.fieldValidationMode]
  );

  return (
    <ReactaFormContext.Provider value={renderContext}>
      <div style={formStyle.container}>
      {displayName && <h2 style={formStyle.titleStyle}>{t(displayName)}</h2>}
      {/* Display submission message on top*/}
      <SubmissionMessage
        message={submissionMessage}
        success={submissionSuccess}
        onDismiss={() => { setSubmissionMessage(null); setSubmissionSuccess(null); }}
        t={t}
      />
      {displayInstanceName && instance && (
        <InstanceName
          name={instanceName}
          onChange={(newName) => {
            // Only update the editable local name here. The actual instance
            // object's name will be updated only if a submit succeeds.
            setInstanceName(newName);
            setSubmissionMessage(null);
            setSubmissionSuccess(null);
          }}
        />
      )}
        <>
          {renderFieldsWithGroups(
            groupState,
            updatedProperties,
            valuesMap,
            t,
            handleChange,
            handleError,
            visibility,
            loadedCount,
            toggleGroup,
            errors
          )}
          {loadedCount < updatedProperties.length && (
            <div
              style={{
                fontSize: "0.9em",
                color: "var(--reactaform-text-muted, #666)",
              }}
            >
              { t(`Loading more fields...` + ` (${loadedCount}/${updatedProperties.length})`) }
            </div>
          )}
        </>
      {/* <Separator /> */}
      <SubmissionButton onClick={handleSubmit} disabled={isApplyDisabled} t={t} />
      </div>
    </ReactaFormContext.Provider>
  );
};

export default ReactaFormRenderer;
