/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";

export type SwitchField = DefinitionPropertyField;
import useReactaFormContext from "../../hooks/useReactaFormContext";

// Props expected by SwitchInput component
type SwitchInputProps = BaseInputProps<boolean, DefinitionPropertyField>;

/**
 * SwitchInput
 *
 * Renders a toggle switch UI for boolean values.
 * - Clicking anywhere on the container toggles the switch.
 * - Visual toggle with sliding knob and background color changes.
 * - Displays label and optional tooltip.
 */
export const SwitchInput: React.FC<SwitchInputProps> = ({
  field,
  value,
  onChange,
  onError,
  disabled: propDisabled,
}) => {
  const { t, formStyle, fieldStyle } = useReactaFormContext();
  const labelStyle = React.useMemo<React.CSSProperties>(() => ({
    display: 'inline-block',
    position: 'relative',
    width: 44,
    height: 24,
    ...((formStyle as any)?.switch?.label || {}),
    ...((fieldStyle as any)?.label || {}),
  }), [formStyle, fieldStyle]);

  const hiddenInputStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: 'pointer',
    ...((formStyle as any)?.switch?.hiddenInput || {}),
    ...((fieldStyle as any)?.hiddenInput || {}),
  }), [formStyle, fieldStyle]);

  const sliderBaseStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--reactaform-switch-off-bg, #ccc)',
    transition: '0.3s',
    borderRadius: 24,
    border: '2px solid transparent',
    ...((formStyle as any)?.switch?.slider || {}),
    ...((fieldStyle as any)?.slider || {}),
  }), [formStyle, fieldStyle]);

  const knobBaseStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    height: 16,
    width: 16,
    left: 2,
    bottom: 2,
    backgroundColor: 'white',
    transition: '0.3s',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    ...((formStyle as any)?.switch?.knob || {}),
    ...((fieldStyle as any)?.knob || {}),
  }), [formStyle, fieldStyle]);
  const isOn = Boolean(value);
  const [error, setError] = React.useState<string | null>(null);

  const validate = React.useCallback((val: boolean) => {
    if (!val) {
      return field.required ? t('Value required') : null;
    }
    return null;
  }, [field, t]);

  const isDisabled = field.disabled ?? propDisabled ?? false;

  // Toggles boolean value on click
  const handleToggle = () => {
    if (field.readOnly || isDisabled) return;
    const newVal = !isOn;
    const err = validate(newVal);
    setError(err);
    onChange?.(newVal, err);
  };

  React.useEffect(() => {
    const err = validate(isOn);
    setError(err);
    onError?.(err ?? null);
  }, [isOn, field, onError, validate]);

  return (
    <StandardFieldLayout field={field} error={error} rightAlign={true}>
      <label style={labelStyle}>
        <input
          id={field.name}
          type="checkbox"
          checked={isOn}
          onChange={() => handleToggle()}
          disabled={isDisabled}
          readOnly={field.readOnly}
          aria-label={t(field.displayName)}
          aria-hidden={true}
          style={hiddenInputStyle}
        />
        <span
          role="switch"
          data-testid="switch"
          tabIndex={0}
          aria-checked={isOn}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'Enter') {
              e.preventDefault();
              handleToggle();
            }
          }}
          className={`reactaform-switch ${isOn ? 'active checked on' : ''} ${isDisabled ? 'disabled' : ''}`}
          style={isOn ? { ...sliderBaseStyle, backgroundColor: 'var(--reactaform-switch-on-bg, #22c55e)', borderColor: 'var(--reactaform-switch-on-border, #16a34a)' } : sliderBaseStyle}
        >
          <span
            style={{
              ...knobBaseStyle,
              transform: isOn ? 'translateX(20px)' : undefined,
            }}
          />
        </span>
      </label>
    </StandardFieldLayout>
  );
};

export default SwitchInput;
