import * as React from "react";
// Styling for groups is handled by CSS classes in reactaform.css
import type { DefinitionPropertyField, FieldValueType, ErrorType } from "../core/reactaFormTypes";
import { FieldRenderer } from "./FieldRenderer";

export interface FieldGroupProps {
  groupName: string;
  defaultOpen?: boolean;
  fields: DefinitionPropertyField[];
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError?: (fieldName: string, error: ErrorType) => void;
  errorsMap?: Record<string, string>;
  t: (key: string) => string;
}

/**
 * Self-managing collapsible field group component with internal toggle state
 */
export const FieldGroup = React.memo<FieldGroupProps>(
  ({ groupName, defaultOpen = true, fields, valuesMap, handleChange, handleError, errorsMap, t }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const onToggle = React.useCallback(() => setIsOpen(prev => !prev), []);

    return (
      <fieldset className="reactaform-group">
        <legend onClick={onToggle} className="reactaform-group_legend">
          <span>{t(groupName)}</span>
          <span className="reactaform-group_legend_arrow">{isOpen ? "▼" : "▶"}</span>
        </legend>
        {isOpen &&
          fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              valuesMap={valuesMap}
              handleChange={handleChange}
              handleError={handleError}
              errorsMap={errorsMap}
            />
          ))}
      </fieldset>
    );
  }
);

FieldGroup.displayName = "FieldGroup";
