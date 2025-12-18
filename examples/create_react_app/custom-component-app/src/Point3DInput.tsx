import * as React from "react";
import type { BaseInputProps } from "reactaform";
import {
  StandardFieldLayout,
  validateFieldValue,
  useReactaFormContext,
} from "reactaform";
import { CSS_CLASSES, combineClasses } from "reactaform";

type Point3DValue = [string, string, string];

const Point3DInput: React.FC<BaseInputProps<Point3DValue>> = ({
  field,
  value,
  onChange,
  onError,
}) => {
  const { t, definitionName } = useReactaFormContext();

  // Uncontrolled inputs: use refs and keep an `error` state.
  const xRef = React.useRef<HTMLInputElement | null>(null);
  const yRef = React.useRef<HTMLInputElement | null>(null);
  const zRef = React.useRef<HTMLInputElement | null>(null);
  const validate = React.useCallback(
    (xs: string, ys: string, zs: string): string | null => {
      if (
        field.required &&
        (xs.trim() === "" || ys.trim() === "" || zs.trim() === "")
      ) {
        return t("Value required");
      }

      const x = xs.trim() === "" ? 0 : Number(xs);
      if (!Number.isFinite(x)) return t("Invalid X value");
      const y = ys.trim() === "" ? 0 : Number(ys);
      if (!Number.isFinite(y)) return t("Invalid Y value");
      const z = zs.trim() === "" ? 0 : Number(zs);
      if (!Number.isFinite(z)) return t("Invalid Z value");

      // allow library-level validation to run as well
      const err = validateFieldValue(definitionName, field, [xs, ys, zs], t);
      return err ?? null;
    },
    [field, definitionName, t]
  );

  // initialize error from incoming value so initial instance errors are visible
  const [error, setError] = React.useState<string | null>(() => {
    if (value && Array.isArray(value)) {
      return validate(
        String(value[0] ?? ""),
        String(value[1] ?? ""),
        String(value[2] ?? "")
      );
    }
    return null;
  });

  React.useEffect(() => {
    // sync when external value changes by setting input values on refs
    if (value && Array.isArray(value)) {
      if (xRef.current) xRef.current.value = String(value[0] ?? "");
      if (yRef.current) yRef.current.value = String(value[1] ?? "");
      if (zRef.current) zRef.current.value = String(value[2] ?? "");
    }
    // Do not run validation here; validation runs on user input handlers.
  }, [value]);

  // keep parent informed when our local error state changes
  React.useEffect(() => {
    onError?.(error ?? null);
  }, [error, onError]);

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const xs = e.target.value;
    const ys = yRef.current ? yRef.current.value : "";
    const zs = zRef.current ? zRef.current.value : "";
    const err = validate(xs, ys, zs);
    setError(err);
    onChange?.([xs, ys, zs] as Point3DValue, err ?? null);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ys = e.target.value;
    const xs = xRef.current ? xRef.current.value : "";
    const zs = zRef.current ? zRef.current.value : "";
    const err = validate(xs, ys, zs);
    setError(err);
    onChange?.([xs, ys, zs] as Point3DValue, err ?? null);
  };

  const handleZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zs = e.target.value;
    const xs = xRef.current ? xRef.current.value : "";
    const ys = yRef.current ? yRef.current.value : "";
    const err = validate(xs, ys, zs);
    setError(err);
    onChange?.([xs, ys, zs] as Point3DValue, err ?? null);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          width: "100%",
          border: "1px solid var(--reactaform-border-color)",
          padding: "0.35rem",
          borderRadius: "var(--reactaform-border-radius)",
          backgroundColor: "var(--reactaform-secondary-bg)",
        }}
      >
        <input
          id={`${field.name}-x`}
          type="text"
          placeholder={t("X")}
          defaultValue={
            value && Array.isArray(value) ? String(value[0] ?? "") : undefined
          }
          ref={xRef}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
          onChange={handleXChange}
          aria-label={"X"}
        />
        <input
          id={`${field.name}-y`}
          type="text"
          placeholder={t("Y")}
          defaultValue={
            value && Array.isArray(value) ? String(value[1] ?? "") : undefined
          }
          ref={yRef}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
          onChange={handleYChange}
          aria-label={"Y"}
        />
        <input
          id={`${field.name}-z`}
          type="text"
          placeholder={t("Z")}
          defaultValue={
            value && Array.isArray(value) ? String(value[2] ?? "") : undefined
          }
          ref={zRef}
          className={combineClasses(CSS_CLASSES.input, CSS_CLASSES.inputNumber)}
          onChange={handleZChange}
          aria-label={"Z"}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default Point3DInput;
