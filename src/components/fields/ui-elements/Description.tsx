import * as React from "react";
import useReactaFormContext from "../../../hooks/useReactaFormContext";
import { CSS_CLASSES } from "../../../styles/cssClasses";

interface DescriptionProps {
  field: {
    displayText?: string;
    textAlign?: "left" | "center" | "right";
    allowHtml?: boolean; // if true, displayText is treated as HTML and rendered with dangerouslySetInnerHTML
  };
}

/**
 * Description component for displaying text content in forms
 * This is a UI-only component (not an input) used to show descriptive text
 * Similar to Image component, but for text display
 * 
 * @example
 * // JSON definition:
 * {
 *   "name": "welcomeMessage",
 *   "type": "description",
 *   "displayText": "Welcome to our form! Please fill out all required fields.",
 *   "textAlign": "center",
 *   "allowHtml": false
 * }
 */
const Description: React.FC<DescriptionProps> = ({ field }) => {
  const { t } = useReactaFormContext();
  
  const { displayText = "", textAlign = "left", allowHtml = false } = field;

  return (
    <div
      className={CSS_CLASSES.description}
      style={{ textAlign }}
      {...(allowHtml
        ? { dangerouslySetInnerHTML: { __html: t(displayText) } }
        : { children: t(displayText) })}
    />
  );
};

Description.displayName = "Description";
export default React.memo(Description);
