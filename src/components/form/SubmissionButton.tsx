import * as React from "react";

export interface SubmissionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  t: (s: string) => string;
}

const SubmissionButton: React.FC<SubmissionButtonProps> = ({ onClick, disabled = false, t }) => {
  const [hover, setHover] = React.useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "var(--reactaform-button-padding, var(--reactaform-space) 12px)",
        backgroundColor: disabled
          ? "var(--reactaform-button-disabled-bg, #cccccc)"
          : "var(--reactaform-button-bg, var(--reactaform-success-color))",
        color: "var(--reactaform-button-text, #ffffff)",
        border: "none",
        borderRadius: "4px",
        cursor: disabled ? "var(--reactaform-button-disabled-cursor, not-allowed)" : "pointer",
        fontSize: "var(--reactaform-button-font-size, 14px)",
        fontWeight: "var(--reactaform-button-font-weight, 500)",
        boxShadow: "var(--reactaform-button-shadow, none)",
        marginTop: "var(--reactaform-button-margin-top, 0.5em)",
        transition: "opacity 0.2s ease",
        opacity: disabled
          ? "var(--reactaform-button-disabled-opacity, 0.6)"
          : hover
          ? "var(--reactaform-button-hover-opacity, 0.9)"
          : "1",
      }}
    >
      {t("Submit")}
    </button>
  );
};

export default SubmissionButton;
