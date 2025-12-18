import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";

import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import { CSS_CLASSES } from "../../utils";

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
}) => {
  const { t, formStyle, fieldStyle, definitionName } = useReactaFormContext();
  const fs = formStyle as Record<string, unknown> | undefined;
  const ffs = fieldStyle as Record<string, unknown> | undefined;

  const styleFrom = (
    source: Record<string, unknown> | undefined,
    section?: string,
    key?: string
  ): React.CSSProperties => {
    if (!section) return {};
    const sec = source?.[section] as Record<string, unknown> | undefined;
    const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
    return (val ?? {}) as React.CSSProperties;
  };
  const labelStyle = React.useMemo<React.CSSProperties>(() => ({
    display: 'inline-block',
    position: 'relative',
    width: 44,
    height: 24,
    ...styleFrom(fs, 'switch', 'label'),
    ...styleFrom(ffs, undefined, 'label'),
  }), [fs, ffs]);

  const hiddenInputStyle = React.useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    cursor: 'pointer',
    pointerEvents: 'none', // Make hidden input non-interactive to avoid event conflicts
    ...styleFrom(fs, 'switch', 'hiddenInput'),
    ...styleFrom(ffs, undefined, 'hiddenInput'),
  }), [fs, ffs]);

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
    // Use individual border properties to avoid mixing shorthand and
    // non-shorthand style updates (React warns when `border` and
    // `borderColor` are toggled separately). Setting these separately
    // lets us update `borderColor` without replacing the whole shorthand.
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'transparent',
    ...styleFrom(fs, 'switch', 'slider'),
    ...styleFrom(ffs, undefined, 'slider'),
  }), [fs, ffs]);

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
    ...styleFrom(fs, 'switch', 'knob'),
    ...styleFrom(ffs, undefined, 'knob'),
  }), [fs, ffs]);
  const isOn = Boolean(value);
  const prevErrorRef = React.useRef<string | null>(null);
  const onErrorRef = React.useRef<typeof onError | undefined>(onError);

  const validate = React.useCallback((val: boolean) => {
    if (!val) {
      return field.required ? t('Value required') : null;
    }
    const err = validateFieldValue(definitionName, field, val, t);
    return err ?? null;
  }, [field, t, definitionName]);

  // Toggles boolean value on click
  const handleToggle = () => {
    const newVal = !isOn;
    const err = validate(newVal);
    onChange?.(newVal, err);
  };

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const err = validate(isOn);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [isOn, field, validate]);

  const inputId = field.name;
  
  return (
    <StandardFieldLayout field={field} error={validate(isOn)} rightAlign={false}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <label 
          className={CSS_CLASSES.label}
          htmlFor={inputId}
          style={{ textAlign: 'left' as const, justifyContent: 'flex-start' }}
        >
          {t(field.displayName)}
        </label>
        <label style={labelStyle}>
          <input
            id={field.name}
            type="checkbox"
            checked={isOn}
            readOnly={true}
            aria-label={t(field.displayName)}
            aria-invalid={!!validate(isOn)}
            aria-describedby={validate(isOn) ? `${field.name}-error` : undefined}
            style={hiddenInputStyle}
            tabIndex={-1}
          />
          <span
            role="switch"
            data-testid="switch"
            tabIndex={0}
            aria-checked={isOn}
            aria-invalid={!!validate(isOn)}
            aria-describedby={validate(isOn) ? `${field.name}-error` : undefined}
            onClick={handleToggle}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space' || e.key === 'Enter') {
                e.preventDefault();
                handleToggle();
              }
            }}
            className={`reactaform-switch ${isOn ? 'active checked on' : ''} `}
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
      </div>
    </StandardFieldLayout>
  );
};

export default SwitchInput;
