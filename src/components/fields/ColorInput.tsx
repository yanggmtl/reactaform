import * as React from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { CSS_CLASSES, combineClasses } from "../../utils/cssClasses";
import { validateFieldValue } from "../../core/validation";

type ColorOption = {
  label: string; // Color name
  value: string; // Color hex value
};

type ColorField = DefinitionPropertyField & {
  defaultValue?: string; // Should be a valid hex color
};

export type ColorInputProps = BaseInputProps<string, ColorField>;

const predefinedColors: ColorOption[] = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#ff0000" },
  { label: "Green", value: "#008000" },
  { label: "Blue", value: "#0000ff" },
  { label: "Yellow", value: "#ffff00" },
  { label: "Cyan", value: "#00ffff" },
  { label: "Magenta", value: "#ff00ff" },
  { label: "Orange", value: "#ffa500" },
  { label: "Purple", value: "#800080" },
  { label: "Brown", value: "#a52a2a" },
  { label: "Gray", value: "#808080" },
  { label: "Light Gray", value: "#d3d3d3" },
  { label: "Pink", value: "#ffc0cb" },
];

function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexRegex.test(color);
}

function toRGB(color: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(color)) return null;

  const normalizedColor = normalizeHexColor(color);
  const bigint = parseInt(normalizedColor.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Normalizes a hex color string to a 6-digit lowercase format.
 *
 * This function is useful for comparing colors reliably,
 * especially when one color may be written in shorthand form (e.g. "#abc")
 * and the other in full form (e.g. "#aabbcc").
 *
 * Examples:
 * - normalizeHexColor("#abc") => "#aabbcc"
 * - normalizeHexColor("#ABC") => "#aabbcc"
 * - normalizeHexColor("#ffffff") => "#ffffff"
 *
 * @param color - A valid hex color string (#RGB or #RRGGBB).
 * @returns The normalized 6-digit lowercase hex color.
 */
function normalizeHexColor(color: string): string {
  if (!color) return "#000000";

  color = color.toLowerCase();

  if (/^#([a-f0-9]){3}$/i.test(color)) {
    // Expand shorthand (e.g., #abc �?#aabbcc)
    return (
      "#" +
      color
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join("")
    );
  }

  return color;
}

/**
 * ColorInput Component
 * ---------------------
 * A reusable color input field that supports a predefined list of color options
 * (e.g., Red, Blue, etc.) and also allows the user to choose a custom color via
 * a native HTML `<input type="color">`.
 *
 * Props:
 * - field: field metadata including display name and tooltip.
 * - value: currently selected color (hex string).
 * - onChange: callback to propagate changes to parent form.
 */
const ColorInput: React.FC<ColorInputProps> = ({ field, value, onChange, onError }) => {
  const { t, definitionName } = useReactaFormContext();

  // Store the custom color string separately
  const [inputColor, setInputColor] = React.useState<string>("#000000");
  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  const colorRef = React.useRef<HTMLInputElement | null>(null);
  const onErrorRef = React.useRef<ColorInputProps["onError"] | undefined>(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    const inputValue = value && isValidHexColor(value) ? value : "#000000";
    const normColor = normalizeHexColor(inputValue);
    // Sync prop -> local state immediately. This is a safe prop->state sync
    // and tests/consumers expect the select to reflect the prop synchronously.
    setInputColor(normColor);
  }, [value]);

  React.useEffect(() => {
    const err = validateFieldValue(definitionName, field, value ?? "#000000", t);
    onErrorRef.current?.(err ?? null);
  }, [value, field, definitionName, t]);

  const error = validateFieldValue(definitionName, field, value ?? "#000000", t);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setInputColor(newValue);
    onChange?.(newValue, null);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setInputColor(newColor);
    onChange?.(newColor, null);
  };

  // Compute the color shown in the preview box
  const foundColor = predefinedColors.find(
    (color) => color.value === inputColor
  );
  const { r, g, b } = toRGB(inputColor) || { r: 0, g: 0, b: 0 };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
        <select
          ref={selectRef}
          id={field.name}
          value={inputColor}
          onChange={handleSelectChange}
          style={{ minWidth: "120px", flex: 1 }}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputSelect)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field.name}-error` : undefined}
        >
          {predefinedColors.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label)}
            </option>
          ))}
          {!foundColor ? (
            <option key={inputColor} value={inputColor}>
              ({r}, {g}, {b})
            </option>
          ) : null}
        </select>
          <label
          style={{
            width: "2.5em",
            height: "1.8em",
            display: "inline-block",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: inputColor,
            cursor: "pointer",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <input
              ref={colorRef}
              id={`${field.name}-color`}
              type="color"
              value={inputColor}
              onChange={handleColorChange}
              style={{
                opacity: 0,
                width: "100%",
                height: "100%",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.name}-error` : undefined}
          />
        </label>
      </div>
    </StandardFieldLayout>
  );
};

export default ColorInput;
