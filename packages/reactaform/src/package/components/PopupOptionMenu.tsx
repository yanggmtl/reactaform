import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

export type PopupOptionMenuPosition = {
  x: number;
  y: number;
}

export interface PopupOption {
  label: string;
}

export interface PopupOptionMenuProps<T extends PopupOption> {
  pos: PopupOptionMenuPosition | null;
  options: T[];
  onClose: () => void;
  onClickOption: (option: T) => void;
}

export function PopupOptionMenu<T extends PopupOption>({
  pos,
  options,
  onClose,
  onClickOption
}: PopupOptionMenuProps<T>) {
  const menuRef = useRef<HTMLDivElement>(null);
  const popupRoot =
    typeof window !== "undefined" ? document.getElementById("popup-root") : null;
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!popupRoot) return null;
  if (options === undefined || options.length === 0) return null;
  // allow 0 coordinates; only bail when pos or coordinates are null/undefined
  if (!pos || pos.x == null || pos.y == null) return null;

  // clamp position so the popup doesn't render off-screen
  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const maxLeft = Math.max(0, vw - 160);
  const safeLeft = Math.max(0, Math.min(pos.x, maxLeft));
  const safeTop = Math.max(0, pos.y);

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: safeTop,
        left: safeLeft,
        backgroundColor: "var(--reactaform-primary-bg, #fff)",
        border: "1px solid var(--reactaform-border-color, #ccc)",
        borderRadius: "var(--reactaform-border-radius, 4px)",
        boxShadow: "var(--reactaform-shadow, 0 2px 10px rgba(0,0,0,0.2))",
        zIndex: 1000,
        minWidth: "var(--reactaform-menu-min-width, 150px)",
      }}
    >
      {options.map((option: T, index: number) => (
        <div
          key={option.label ?? index}
          onClick={() => {
            onClickOption(option);
            onClose();
          }}
          style={{
            padding: "var(--reactaform-menu-item-padding, 8px 12px)",
            cursor: "pointer",
            fontSize: "var(--reactaform-menu-item-font-size, 0.8em)",
            borderBottom: index < options.length - 1 ? "1px solid var(--reactaform-border-light, #eee)" : undefined,
            transition: "background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--reactaform-hover-bg, #e0e0e0)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          {option.label}
        </div>
      ))}
    </div>,
    popupRoot
  );
};

export default PopupOptionMenu;