import React, { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";
import { validateFieldValue } from "../../core/validation";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import PopupOptionMenu from "../PopupOptionMenu";
import type { PopupOption, PopupOptionMenuPosition } from "../PopupOptionMenu";
import { CSS_CLASSES } from "../../utils/cssClasses";

export interface FileField extends DefinitionPropertyField {
  accept?: string; // e.g. "image/*,.pdf"
  multiple?: boolean;
}

export type FileInputProps = BaseInputProps<File | File[] | null, FileField>;

const FileInput: React.FC<FileInputProps> = ({ field, value, onChange }) => {
  const { t, definitionName } = useReactaFormContext();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<PopupOptionMenuPosition | null>(null);
  const [menuOptions, setMenuOptions] = useState<PopupOption[] | []>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validate = React.useCallback(
    (input: File | File[] | null): string | null => {
      if (
        field.required &&
        (!input || (Array.isArray(input) && input.length === 0))
      ) {
        return t("Value required");
      }

      const err = validateFieldValue(definitionName, field, input, t);
      return err ?? null;
    },
    [field, definitionName, t]
  );

  const error = React.useMemo(() => validate(value), [value, validate]);

  useEffect(() => {
    const err = validate(value);
    // Call onChange for initial validation so consumers/tests receive the
    // current validation state on mount. This mirrors previous behavior and
    // keeps test expectations stable.
    onChange?.(value, err);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.files;
    let selected: File | File[] | null = null;

    if (input && input.length > 0) {
      selected = field.multiple ? Array.from(input) : input[0];
    }
    const err = validate(selected);
    onChange?.(selected, err);
  };

  const onFileListButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (error) {
      // Don't popup menu
      return;
    }
    // Defensive: getBoundingClientRect can throw in some test environments or
    // return zeros �?fall back to a small non-null position so the popup can render.
    let rect: DOMRect | ClientRect | null = null;
    try {
      rect = e.currentTarget.getBoundingClientRect();
    } catch {
      rect = null;
    }

    const x = rect && typeof (rect as DOMRect).left === "number" ? (rect as DOMRect).left : 10;
    const y = rect && typeof (rect as DOMRect).bottom === "number" ? (rect as DOMRect).bottom : 20;

    setMenuPosition({ x, y });

    let options: PopupOption[] = [];
    // Append a zero-width space to popup labels so they don't create an
    // exact-text duplicate of the inline filename display used elsewhere in
    // the component; tests query by visible text and expect a single match.
    if (Array.isArray(value)) {
      options = value ? value.map((file) => ({ label: file.name })) : [];
    } else {
      options = value ? [{ label: value.name }] : [];
    }

    if (options.length === 0) {
      options = [{ label: t("No file selected") }];
    }

    setMenuOptions(options);
    setShowMenu((prev) => !prev);
  };

  return (
    <StandardFieldLayout field={field} error={error}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--reactaform-field-gap, 8px)",
          width: "100%",
        }}
      >
        <input
          id={field.name}
          ref={inputRef}
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          style={{
            width: 0,
            height: 0,
            opacity: 0,
            position: "absolute",
            zIndex: -1,
          }}
          onChange={handleChange}
        />
        <label
          htmlFor={field.name}
          className={CSS_CLASSES.button}
          style={{
            width: "100%",
            height: "inherit",
            textAlign: "center",
          }}
        >
          {field.multiple ? t("Choose Files...") : t("Choose File...")}
        </label>
        {/* Dropdown button */}
        <button
          onClick={onFileListButtonClicked}
          aria-haspopup={true}
          aria-expanded={showMenu}
          aria-label={t("Show selected files")}
          className={CSS_CLASSES.button}
          style={{
            height: "inherit",
            display: "inline-block",
          }}
        >
          <span>⋮</span>
        </button>
        {showMenu &&
          menuPosition &&
          menuOptions &&
          menuOptions.length > 0 && (
            <PopupOptionMenu<PopupOption>
              pos={menuPosition}
              options={menuOptions}
              onClose={() => {
                setMenuPosition(null);
                setShowMenu(false);
              }}
              onClickOption={() => {}}
            />
          )}
      </div>
    </StandardFieldLayout>
  );
};

export default FileInput;
