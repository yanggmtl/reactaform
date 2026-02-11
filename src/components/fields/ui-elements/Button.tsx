import * as React from "react";
import { StandardFieldLayout } from "../../layout/LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
  FieldValueType,
  ErrorType,
} from "../../../core/reactaFormTypes";
import useReactaFormContext from "../../../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../../../styles/cssClasses";
import { getButtonHandler } from "../../../core/registries/buttonHandlerRegistry";

/**
 * Extended props for Button component
 * Unlike other fields, Button needs access to all form values
 * and the ability to change any field
 */
export interface ButtonInputProps extends BaseInputProps<null, DefinitionPropertyField> {
  valuesMap: Record<string, FieldValueType>;
  handleChange: (fieldName: string, value: FieldValueType) => void;
  handleError: (fieldName: string, error: ErrorType) => void;
}

/**
 * Button component for form actions
 * Buttons can execute custom handlers that can read and modify form values
 */
const Button: React.FC<ButtonInputProps> = ({
  field,
  valuesMap,
  handleChange,
  handleError,
}) => {
  const { t } = useReactaFormContext();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [buttonError, setButtonError] = React.useState<string | null>(null);

  const handleClick = React.useCallback(async () => {
    if (!field.action) {
      console.warn(`Button "${field.name}" has no action defined`);
      return;
    }

    const handler = getButtonHandler(field.action);
    if (!handler) {
      const errorMsg = `Button handler "${field.action}" not found`;
      console.error(errorMsg);
      setButtonError(errorMsg);
      return;
    }

    setIsProcessing(true);
    setButtonError(null);

    try {
      await handler(valuesMap, handleChange, handleError, t);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Button handler "${field.action}" failed:`, errorMsg);
      setButtonError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [field, valuesMap, handleChange, handleError, t]);

  const baseButtonStyle: React.CSSProperties = {
    cursor: isProcessing ? "wait" : "pointer",
    opacity: isProcessing ? 0.6 : 1,
  };

  const mergedStyle: React.CSSProperties = { ...baseButtonStyle };

  // If field.width provided, use pixel width override
  if (field.width  && typeof field.width === 'number' && field.width > 0) {
    mergedStyle.width = `${field.width}px`;
  }

  return (
    <StandardFieldLayout field={field} rightAlign={true} error={buttonError}>
      <button
        type="button"
        className={CSS_CLASSES.button}
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={t(field.displayName)}
        aria-busy={isProcessing}
        style={mergedStyle}
      >
        {isProcessing ? t("Processing...") : t(field.displayName)}
      </button>
    </StandardFieldLayout>
  );
};

Button.displayName = "Button";
export default React.memo(Button);
