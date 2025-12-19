import * as React from "react";
import * as ReactDOM from "react-dom";
import useReactaFormContext from "../hooks/useReactaFormContext";

type TooltipProps = {
  content: string;
  size?: "small" | "medium" | "large";
  animation?: boolean;
};

const Tooltip: React.FC<TooltipProps> = ({ content, size = "medium", animation = true }) => {
  const { t, darkMode, formStyle, fieldStyle } = useReactaFormContext();
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [positioned, setPositioned] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const iconRectRef = React.useRef<DOMRect | null>(null);
  const tooltipId = React.useId();

  const tooltipStyles = React.useMemo(() => {
    const sizeConfig: Record<string, React.CSSProperties> = {
      small: { padding: "4px 8px", fontSize: "11px", maxWidth: "200px" },
      medium: { padding: "6px 10px", fontSize: "12px", maxWidth: "240px" },
      large: { padding: "8px 12px", fontSize: "13px", maxWidth: "280px" },
    };

    const base: { icon: React.CSSProperties; text: React.CSSProperties; textVisible: React.CSSProperties } = {
      icon: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.2em",
        height: "1.2em",
        fontSize: "0.9em",
        fontWeight: "bold",
        borderRadius: "50%",
        backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
        color: darkMode ? "#f0f0f0" : "#333",
        border: `1px solid ${darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}`,
        cursor: "pointer",
        transition: animation ? "all 0.2s ease" : undefined,
        marginLeft: "0.3em",
      },
      text: {
        ...sizeConfig[size],
        position: "fixed" as const, // important
        backgroundColor: `var(--reactaform-tooltip-color-bg, ${darkMode ? "rgba(45,45,45,0.95)" : "rgba(60,60,60,0.92)"})`,
        color: `var(--reactaform-tooltip-color, ${darkMode ? "#f0f0f0" : "#fff"})`,
        borderRadius: "6px",
        border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        boxShadow: darkMode
          ? "0 8px 16px rgba(0,0,0,0.4)"
          : "0 6px 18px rgba(0,0,0,0.12)",
        zIndex: 2147483647,
        opacity: 0, // hidden by default
        pointerEvents: "none", // prevent blocking mouse events
        transition: animation ? "opacity 0.2s ease" : undefined,
        whiteSpace: "normal",
        wordBreak: "break-word",
        boxSizing: "border-box",
      },
      textVisible: {
        opacity: 1,
        pointerEvents: "auto",
      },
    };

    const styleFrom = (source: unknown, section?: string, key?: string): React.CSSProperties => {
      if (!section) return {} as React.CSSProperties;
      const src = source as Record<string, unknown> | undefined;
      const sec = src?.[section] as Record<string, unknown> | undefined;
      const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
      return (val ?? {}) as React.CSSProperties;
    };

    // Merge provider overrides (form-level and field-level)
    const merged = {
      icon: { ...base.icon, ...styleFrom(formStyle, 'tooltip', 'icon'), ...styleFrom(fieldStyle, 'tooltip', 'icon') },
      text: { ...base.text, ...styleFrom(formStyle, 'tooltip', 'text'), ...styleFrom(fieldStyle, 'tooltip', 'text') },
      textVisible: base.textVisible,
    };

    return merged;
  }, [darkMode, size, animation, formStyle, fieldStyle]);

  React.useLayoutEffect(() => {
    if (!hover || !ref.current || !tooltipRef.current) return;

    const iconRect = ref.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = iconRect.right + margin;
    let y = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;

    // flip horizontally if needed
    if (x + tooltipRect.width > vw - margin) {
      x = iconRect.left - margin - tooltipRect.width;
    }

    // clamp
    x = Math.max(margin, Math.min(x, vw - tooltipRect.width - margin));
    y = Math.max(margin, Math.min(y, vh - tooltipRect.height - margin));

    setPos({ x, y });
    setPositioned(true);
  }, [hover]);

  // After the tooltip is rendered, measure and clamp so the tooltip box doesn't overflow the viewport
  React.useEffect(() => {
    if (!positioned) return;
    const frame = requestAnimationFrame(() => {
      if (!tooltipRef.current) return;
      const tr = tooltipRef.current.getBoundingClientRect();
      const margin = 8;
      const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
      const vh = typeof window !== "undefined" ? window.innerHeight : 768;
      let newX = pos.x;
      let newY = pos.y;
      const iconRect = iconRectRef.current;
      if (iconRect) {
        // prefer to place to the right of the icon, vertically centered
        const verticalNudge = -4; // visual tweak to better center the bubble with the icon
        // Use viewport coords (no page scroll offsets) because popup root is fixed
        newX = iconRect.right + margin;
        newY =
          iconRect.top + iconRect.height / 2 - tr.height / 2 + verticalNudge;
        // if placing to the right would overflow, place to the left of the icon
        if (newX + tr.width > vw - margin) {
          newX = iconRect.left - margin - tr.width;
        }
      }
      // clamp into viewport as a final fallback
      if (newX + tr.width > vw - margin) {
        newX = Math.max(margin, vw - tr.width - margin);
      }
      if (newX < margin) newX = margin;
      if (newY + tr.height > vh - margin) {
        newY = Math.max(margin, vh - tr.height - margin);
      }
      if (newY < margin) newY = margin;
      if (newX !== pos.x || newY !== pos.y) {
        setPos({ x: newX, y: newY });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [positioned, pos.x, pos.y]);

  const popupRoot =
    typeof document !== "undefined"
      ? document.getElementById("popup-root")
      : null;

  // Always render the tooltip icon; if `popup-root` is missing we still show
  // the icon but skip rendering the floating content. Previously the entire
  // tooltip returned null when popup-root was absent which made icons
  // disappear in host apps that don't mount the ReactaForm wrapper.
  const tooltipContent = (
    <div
      ref={tooltipRef}
      data-tooltip-id={tooltipId}
      style={{
        ...tooltipStyles.text,
        transform: positioned
          ? "translateY(0) scale(1)"
          : "translateY(-4px) scale(0.98)",
        transition: "opacity 120ms ease, transform 120ms ease, visibility 120ms ease",
        width: 240,
        // When positioned is true, apply the visible styles
        ...(positioned ? tooltipStyles.textVisible : {}),
        top: pos.y,
        left: pos.x,
      }}
      data-reactaform-theme={darkMode ? "dark" : "light"}
    >
      {t(content)}
    </div>
  );
  return (
    <>
      <span
        data-testid="tooltip-icon"
        ref={ref}
        aria-describedby={hover ? tooltipId : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...tooltipStyles.icon,
        }}
      >
        ?
      </span>
      {hover &&
        (popupRoot
          ? ReactDOM.createPortal(tooltipContent, popupRoot)
          : tooltipContent)}
    </>
  );
};

export default Tooltip;
