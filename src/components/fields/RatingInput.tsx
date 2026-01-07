import * as React from "react";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import type { BaseInputProps, DefinitionPropertyField } from "../../core/reactaFormTypes";
import { StandardFieldLayout } from "../LayoutComponents";
import { useFieldValidator } from "../../hooks/useFieldValidator";

const ratingWrapperStyle: React.CSSProperties = {
  display: "flex",
  gap: 4,
};

const starBaseStyle: React.CSSProperties = {
  cursor: "pointer",
  fontSize: "1.5rem",
  lineHeight: 1,
  display: "inline-block",
  marginRight: "0.25rem",
  userSelect: "none",
  transition: "color 0.12s ease",
};

type RatingField = DefinitionPropertyField & {
  max?: number;
  icon?: string;
};

export type RatingInputProps = BaseInputProps<number, RatingField>;

const RatingInput: React.FC<RatingInputProps> = ({ field, value, onChange, onError, error: externalError }) => {
  const { t } = useReactaFormContext();
  const validate = useFieldValidator(field, externalError);

  const max = field.max ?? 5;
  const iconChar = field.icon?.trim() || "★";

  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const starRefs = React.useRef<Array<HTMLSpanElement | null>>([]);

  // Normalize value
  const ratingValue = React.useMemo(() => {
    const v = value ?? 0;
    return Math.min(Math.max(v, 0), max);
  }, [value, max]);

  // Validation
  const error = React.useMemo(() => {
    return validate(ratingValue) ?? null;
  }, [validate, ratingValue]);

  // Notify parent of errors
  React.useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  // Handlers
  const handleSelect = React.useCallback(
    (val: number) => {
      const normalized = Math.min(Math.max(val, 0), max);
      const err = validate(normalized) ?? null;
      onChange?.(normalized, err);
    },
    [max, validate, onChange]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleSelect(index + 1);
          break;
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          starRefs.current[Math.min(max - 1, index + 1)]?.focus();
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          starRefs.current[Math.max(0, index - 1)]?.focus();
          break;
      }
    },
    [max, handleSelect]
  );

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        role="radiogroup"
        aria-labelledby={`${field.name}-label`}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
        style={ratingWrapperStyle}
      >
        {Array.from({ length: max }, (_, i) => {
          const isActive = i < ratingValue;
          const isHover = hoverIndex !== null && i <= hoverIndex;
          const color = isHover || isActive ? "gold" : "lightgray";

          return (
            <span
              key={i}
              ref={(el) => (starRefs.current[i] = el)}
              role="radio"
              tabIndex={ratingValue > 0 ? (i === ratingValue - 1 ? 0 : -1) : i === 0 ? 0 : -1}
              aria-checked={isActive}
              aria-label={`Rating ${i + 1}`}
              title={t(`${field.displayName} ${i + 1}`)}
              onClick={() => handleSelect(i + 1)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ ...starBaseStyle, color }}
            >
              {iconChar}
            </span>
          );
        })}
      </div>
    </StandardFieldLayout>
  );
};

export default RatingInput;
