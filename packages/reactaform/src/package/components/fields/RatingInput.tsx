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
  const { t } = useReactaFormContext();
  const [rating, setRating] = useState<number>(value || 0);
  const [error, setError] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = field.max || 5;

  const validateCb = useCallback(
    (val: number): string | null => {
      if (field.required && val === 0) return t("Value required");
      return null;
    },
    [field, t]
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
    setRating(v);
    const err = validateCb(v);
    setError(err);
    if (err !== prevErrorRef.current) {
      prevErrorRef.current = err;
      onErrorRef.current?.(err ?? null);
    }
    //Add lint disable to avoid infinite loop; we only want to run this
    // when the external `value` prop or validator changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validateCb]);

  const handleSelect = (val: number) => {
    setRating(val);
    const err = validateCb(val);
    setError(err);
    onChange?.(val, err);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
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
