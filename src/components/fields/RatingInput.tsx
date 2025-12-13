// components/RatingInput.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
// Inlined styles (moved from RatingInput.css)
const ratingWrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
};

const starBaseStyle: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '1.5rem',
  lineHeight: 1,
  display: 'inline-block',
  marginRight: '0.25rem',
  userSelect: 'none',
  transition: 'color 0.12s ease',
};
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { validateFieldValue } from "../../core/validation";
import type { DefinitionPropertyField } from "../../core/reactaFormTypes";
import type { BaseInputProps } from "../../core/reactaFormTypes";
import { StandardFieldLayout } from "../LayoutComponents";

// lib/baseTypes.ts or similar

export type RatingInputProps = BaseInputProps<number, DefinitionPropertyField>;

const RatingInput: React.FC<RatingInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const starRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const max = field.max || 5;

  const validate = useCallback(
    (val: number): string | null => {
      if (field.required && val === 0) return t("Value required");
      const err = validateFieldValue(definitionName, field, val, t);
      return err ?? null;
    },
    [field, t, definitionName]
  );

  const prevErrorRef = useRef<string | null>(null);
  const onErrorRef = useRef<RatingInputProps["onError"] | undefined>(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let v = value || 0;
    if (value < 0) {
      v = 0;
    }
    if (value > max) {
      v = max;
    }
    const err = validate(v);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
  }, [value, validate, max]);

  const handleSelect = (val: number) => {
    // Rendered from `value` prop; do not store local rating state.
    const err = validate(val);
    onChange?.(val, err);
  };

  const ratingValue = (() => {
    let v = value || 0;
    if (v < 0) v = 0;
    if (v > max) v = max;
    return v;
  })();

  return (
    <StandardFieldLayout field={field} error={validate(ratingValue)}>
      <div
        role="radiogroup"
        aria-labelledby={`${field.name}-label`}
        style={ratingWrapperStyle}
        aria-invalid={!!validate(ratingValue)}
        aria-describedby={validate(ratingValue) ? `${field.name}-error` : undefined}
      >
        {(() => {
          const iconProp = (field as DefinitionPropertyField & { icon?: string }).icon;
          const iconChar = iconProp && String(iconProp).trim() ? String(iconProp) : "★";
          return [...Array(max)].map((_, i) => {
            const isActive = i < ratingValue;
            const isHover = hoverIndex !== null && i <= hoverIndex;
            const color = isHover || isActive ? 'gold' : 'lightgray';
            return (
              <span
                key={i}
                ref={(el) => (starRefs.current[i] = el)}
                role="radio"
                tabIndex={ratingValue > 0 ? (i === ratingValue - 1 ? 0 : -1) : (i === 0 ? 0 : -1)}
                aria-checked={isActive}
                onClick={() => handleSelect(i + 1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ' ) {
                    e.preventDefault();
                    handleSelect(i + 1);
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const next = Math.min(max - 1, i + 1);
                    starRefs.current[next]?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const prev = Math.max(0, i - 1);
                    starRefs.current[prev]?.focus();
                  }
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ ...starBaseStyle, color }}
                aria-label={`Rating ${i + 1}`}
                title={t(`${field.displayName} ${i + 1}`)}
              >
                {iconChar}
              </span>
            );
          });
        })()}
      </div>
    </StandardFieldLayout>
  );
};

export default RatingInput;
