import useReactaFormContext from "../../hooks/useReactaFormContext";

interface SeparatorProps {
  color?: string;
  thickness?: number;
  margin?: string | number;
  label?: string | null;
  alignment?: "left" | "center" | "right";
}

export const Separator: React.FC<SeparatorProps> = ({
  color = "#574d4dff",
  thickness = 1,
  margin = "8px 0",
  label,
  alignment = "center",
}) => {
  const { t } = useReactaFormContext();

  const hrStyle = {
    flex: 1,
    borderTop: `${thickness}px solid ${color}`,
    margin: 0,
  };

  return (
    <div style={{ margin }}>
      {label ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {alignment !== "right" && <hr style={hrStyle} />}
          <span style={{ whiteSpace: "nowrap", fontWeight: "bold", color }}>
            {t(label)}
          </span>
          {alignment !== "left" && <hr style={hrStyle} />}
        </div>
      ) : (
        <hr style={hrStyle} />
      )}
    </div>
  );
};

interface FieldSeparatorProps {
  field: {
    color?: string;
    thickness?: number;
    margin?: string | number;
    label?: string;
    alignment?: "left" | "center" | "right";
  };
  t: (text: string) => string;
}

const FieldSeparator: React.FC<FieldSeparatorProps> = ({ field }) => {
  const { darkMode } = useReactaFormContext();
  const {
    color = darkMode ? "#444444" : "#CCCCCC",
    thickness = 1,
    margin = "8px 0",
    label = null,
    alignment = "center",
  } = field;

  return (
    <Separator
      color={color}
      thickness={thickness}
      margin={margin}
      label={label}
      alignment={alignment}
    />
  );
};

export default FieldSeparator;
