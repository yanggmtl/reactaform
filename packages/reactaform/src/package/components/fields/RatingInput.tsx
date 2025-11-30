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

export interface RatingField extends DefinitionPropertyField {
  type: "rating";
  max?: number; // default 5
  icon?: string; // optional custom icon
}

export type RatingInputProps = BaseInputProps<number, RatingField>;

const RatingInput: React.FC<RatingInputProps> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();
  const [rating, setRating] = useState<number>(value || 0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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
    const raf = requestAnimationFrame(() => setRating(v));
    return () => cancelAnimationFrame(raf);
  }, [value, validate, max]);

  const handleSelect = (val: number) => {
    setRating(val);
    const err = validate(val);
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={validate(rating)}>
      <div style={ratingWrapperStyle}>
        {(() => {
          const iconChar =
            field.icon && String(field.icon).trim()
              ? String(field.icon)
              : "★";
          return [...Array(max)].map((_, i) => {
            const isActive = i < rating;
            const isHover = hoverIndex !== null && i <= hoverIndex;
            const color = isHover || isActive ? 'gold' : 'lightgray';
            return (
              <span
                key={i}
                onClick={() => handleSelect(i + 1)}
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
