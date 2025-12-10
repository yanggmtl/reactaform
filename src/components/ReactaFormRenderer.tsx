import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type {
  FieldValueType,
  ErrorType,
  DefinitionPropertyField,
  ReactaDefinition,
  ReactaInstance,
} from "../core/reactaFormTypes";
import useReactaFormContext, { ReactaFormContext } from "../hooks/useReactaFormContext";
import { renderFieldsWithGroups } from "./renderFields";
import { VirtualizedFieldList } from "./VirtualizedFieldList";
import { getComponent } from "../core/registries";
import { InstanceName } from "./LayoutComponents";
import {
  updateVisibilityMap,
  updateVisibilityBasedOnSelection,
  initializeVisibility,
} from "../core/fieldVisibility";
import { renameDuplicatedGroups } from "../utils/groupingHelpers";
import { submitForm } from "../core/submitForm";

export interface ReactaFormRendererProps {
  definition: ReactaDefinition;
  instance: ReactaInstance;
  chunkSize?: number;
  chunkDelay?: number;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
  virtualContainerHeight?: number;
  estimatedFieldHeight?: number;
}

const ReactaFormRenderer: React.FC<ReactaFormRendererProps> = ({
  definition,
  instance,
  chunkSize = 50,
  chunkDelay = 50,
  enableVirtualization = false,
  virtualizationThreshold = 50,
  virtualContainerHeight = 600,
  estimatedFieldHeight = 60,
}) => {
  const { properties, displayName } = definition;
  const parentContext = useReactaFormContext();
  const { t, formStyle, language } = parentContext;
  const renderContext = {
    ...parentContext,
    definitionName: definition?.name ?? parentContext.definitionName,
  };
  const [ savedLanguage, setSavedLanguage] = useState("en");

  // Core state
  const [updatedProperties, setUpdatedProperties] = useState<
    DefinitionPropertyField[]
  >([]);
  const [fieldMap, setFieldMap] = useState<
    Record<string, DefinitionPropertyField>
  >({});
  const [valuesMap, setValuesMap] = useState<Record<string, FieldValueType>>(
    {}
  );
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [groupState, setGroupState] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean | null>(null);

  const [loadedCount, setLoadedCount] = useState(0); // how many fields are loaded so far
  const [initDone, setInitDone] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [instanceName, setInstanceName] = useState<string>(instance.name || '');
  const targetInstanceRef = useRef<ReactaInstance>(instance);
  const suppressClearOnNextInstanceUpdate = useRef(false);

 
  // Step 1: Initialize basic structures immediately
  // TODO: rename group name if group name appears more than once?

  // Initialization effect performs synchronous state setup from the `definition`
  // and `instance` props. This is a safe prop->state initialization and will
  // not cause an infinite update loop.
  useEffect(() => {
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
  useEffect(() => {
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
   * 3. Update the errors map (add or remove the entry for the field).
   *
   * Notes:
   * - We keep this handler stable with useCallback so that child components
   *   receiving it won't re-render unnecessarily. The handler depends on
   *   `fieldMap` because visibility logic needs metadata about fields.
   * - We intentionally update visibility inside the functional update for
   *   values to make sure visibility calculations use the up-to-date values
   *   map.
   */
  const handleChange = useCallback(
    (name: string, value: FieldValueType, error: ErrorType) => {
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

      // Update errors map
      setErrors((prev) => {
        if (error) {
          return { ...prev, [name]: error };
        }
        // remove key
        const rest = Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name)) as Record<string, string>;
        return rest;
      });
    },
    [fieldMap, setSubmissionMessage, setSubmissionSuccess]
  );

  // Sync language changes: update savedLanguage and clear messages
  // Use RAF to avoid cascading renders.
  useEffect(() => {
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
  useEffect(() => {
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
  const handleError = useCallback((name: string, error: ErrorType) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [name]: String(error) };
      }
      // remove key
      const rest = Object.fromEntries(Object.entries(prev).filter(([k]) => k !== name)) as Record<string, string>;
      return rest;
    });
  }, []);

  const handleSubmit = () => {
    // Temporarily apply the edited name so submission handlers receive it.
    // Mark that we expect an instance update from this submit and we want
    // to suppress clearing messages when that update arrives.
    suppressClearOnNextInstanceUpdate.current = true;

    const prevName = targetInstanceRef.current?.name;
    targetInstanceRef.current.name = instanceName;

    const result = submitForm(definition, targetInstanceRef.current, valuesMap, t, errors);
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

  // Memoized field renderer for virtualization
  const renderField = useCallback(
    (field: DefinitionPropertyField) => {
      const Component = getComponent(field.type);
      if (!Component) return null;
      return (
        <div key={field.name}>
          <Component
            field={field}
            value={valuesMap[field.name]}
            onChange={(value: FieldValueType, error: ErrorType) =>
              handleChange(field.name, value, error)
            }
            onError={(err: ErrorType) => handleError(field.name, err)}
          />
        </div>
      );
    },
    [valuesMap, handleChange, handleError]
  );

  // Memoize expensive computations
  const isApplyDisabled = useMemo(
    () => Object.values(errors).some(Boolean),
    [errors]
  );

  // Determine if virtualization should be used
  const shouldUseVirtualization = useMemo(() => {
    if (!enableVirtualization) return false;
    const visibleFieldCount = updatedProperties.filter(f => visibility[f.name]).length;
    return visibleFieldCount >= virtualizationThreshold;
  }, [enableVirtualization, updatedProperties, visibility, virtualizationThreshold]);

  if (!initDone) {
    return (
      <ReactaFormContext.Provider value={renderContext}>
        <div>Initializing form...</div>
      </ReactaFormContext.Provider>
    );
  }

  

  return (
    <ReactaFormContext.Provider value={renderContext}>
      <div style={formStyle.container}>
      {displayName && <h2 style={formStyle.titleStyle}>{t(displayName)}</h2>}
      {submissionMessage && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 6,
            backgroundColor: submissionSuccess
              ? 'rgba(76, 175, 80, 0.12)'
              : 'rgba(225, 29, 72, 0.06)',
            border: `1px solid ${submissionSuccess ? 'rgba(76,175,80,0.3)' : 'rgba(225,29,72,0.12)'}`,
            color: submissionSuccess ? 'var(--reactaform-success-color, #4CAF50)' : 'var(--reactaform-error-color, #e11d48)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap', flex: 1 }}>{submissionMessage}</div>
          <button
            onClick={() => { setSubmissionMessage(null); setSubmissionSuccess(null); }}
            aria-label={t('Dismiss')}
            style={{
              marginLeft: 12,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              fontSize: 16,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}
      {instance && (
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
      {shouldUseVirtualization ? (
        <VirtualizedFieldList
          fields={updatedProperties}
          valuesMap={valuesMap}
          visibility={visibility}
          groupState={groupState}
          handleChange={handleChange}
          handleError={handleError}
          toggleGroup={toggleGroup}
          t={t}
          renderField={renderField}
          containerHeight={virtualContainerHeight}
          estimatedFieldHeight={estimatedFieldHeight}
        />
      ) : (
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
            toggleGroup
          )}
          {loadedCount < updatedProperties.length && (
            <div
              style={{
                fontSize: "0.9em",
                color: "var(--reactaform-text-muted, #666)",
              }}
            >
              {/* Loading more fields... ({loadedCount}/{updatedProperties.length}) */}
            </div>
          )}
        </>
      )}
      {/* <Separator /> */}
      <button
        onClick={handleSubmit}
        disabled={isApplyDisabled}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          padding: "var(--reactaform-button-padding, var(--reactaform-space) 12px)",
          backgroundColor: isApplyDisabled
            ? "var(--reactaform-button-disabled-bg, #cccccc)"
            : "var(--reactaform-button-bg, var(--reactaform-success-color))",
          color: "var(--reactaform-button-text, #ffffff)",
          border: "none",
          borderRadius: "4px",
          cursor: isApplyDisabled ? "var(--reactaform-button-disabled-cursor, not-allowed)" : "pointer",
          fontSize: "var(--reactaform-button-font-size, 14px)",
          fontWeight: "var(--reactaform-button-font-weight, 500)",
          boxShadow: "var(--reactaform-button-shadow, none)",
          marginTop: "var(--reactaform-button-margin-top, 0.5em)",
          transition: "opacity 0.2s ease",
          opacity: isApplyDisabled
            ? "var(--reactaform-button-disabled-opacity, 0.6)"
            : btnHover
            ? "var(--reactaform-button-hover-opacity, 0.9)"
            : "1",
        }}
      >
        {t("Submit")}
      </button>
      </div>
    </ReactaFormContext.Provider>
  );
};

export default ReactaFormRenderer;
