import { useEffect, useState } from "react";
import useReactaFormContext from "../../hooks/useReactaFormContext";
import { StandardFieldLayout } from "../LayoutComponents";
import type {
  BaseInputProps,
  DefinitionPropertyField,
} from "../../core/reactaFormTypes";

export type ImageField = DefinitionPropertyField & {
  alignment?: "left" | "center" | "right";
  defaultValue?: string;
  width?: number;
  height?: number;
  localized?: string;
};

export type ImageProps = BaseInputProps<string, ImageField>;

/**
 * ImageDisplay is a React component that renders an image with optional
 * localization and flexible layout/styling options.
 *
 * Features:
 * - Localized image fallback based on current language (e.g., _fr, _zhcn suffixes).
 * - Supports left, center, or right alignment.
 * - Supports both row and column layout via field.labelLayout property
 * - Dynamically handles width and height:
 *    - If both are specified, uses them directly.
 *    - If only one is specified, uses that and sets the other to `auto`.
 *    - If neither is specified, renders the image without size constraints.
 */
const ImageDisplay: React.FC<ImageProps> = ({ field, value }) => {
  const { language, t } = useReactaFormContext();

  // Determine alignment
  const alignment = field.alignment || "center";
  const alignmentMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  // Determine base image URL from value or defaultValue
  let baseUrl = typeof value === "string" ? value : field.defaultValue || "";
  if (!baseUrl.startsWith("/")) {
    baseUrl = `${import.meta.env.BASE_URL}${baseUrl}`;
  }
  const langs = field.localized?.split(";").map((v) => v.trim());

  const [imageUrl, setImageUrl] = useState<string>(baseUrl);

  /**
   * Try to resolve a localized version of the image
   * based on the current language (if available).
   * Falls back to the base URL if not found.
   */
  useEffect(() => {
    if (!baseUrl) return;

    const parts = baseUrl.split("/");
    const fileName = parts.pop()!;
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex === -1) return;

    const name = fileName.substring(0, dotIndex);
    const ext = fileName.substring(dotIndex);
    let localizedFile: string | null = null;

    if (langs?.includes(language)) {
      localizedFile = `${name}_${language}${ext}`;
    }

    // Use AbortController for fetch cancellation and defer setState via RAF
    const controller = new AbortController();
    let raf = 0;

    if (localizedFile) {
      const localizedPath = [...parts, localizedFile].join("/");
      fetch(localizedPath, { method: "HEAD", signal: controller.signal })
        .then((res) => {
          raf = requestAnimationFrame(() => setImageUrl(res.ok ? localizedPath : baseUrl));
        })
        .catch(() => {
          raf = requestAnimationFrame(() => setImageUrl(baseUrl));
        });
    } else {
      raf = requestAnimationFrame(() => setImageUrl(baseUrl));
    }

    return () => {
      controller.abort();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [baseUrl, language, langs]);

  if (!imageUrl) return null;

  // Extract dimensions
  const { width, height } = field;

  /**
   * Set image attributes and style dynamically:
   * - If both width and height are set: use both.
   * - If only one is set: use it, and set the other to "auto".
   * - If neither is set: don't apply dimensions.
   */
  const imgAttributes: Partial<React.ImgHTMLAttributes<HTMLImageElement>> = {};
  const imgStyle: React.CSSProperties = {
    borderRadius: "8px",
    objectFit: "contain",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    margin: "0 0 8px 0",
  };

  if (width && height) {
    imgAttributes.width = width;
    imgAttributes.height = height;
    imgStyle.width = `${width}px`;
    imgStyle.height = `${height}px`;
  } else if (width && !height) {
    imgAttributes.width = width;
    imgStyle.width = `${width}px`;
    imgStyle.height = "auto";
  } else if (!width && height) {
    imgAttributes.height = height;
    imgStyle.width = "auto";
    imgStyle.height = `${height}px`;
  }

  return (
    <StandardFieldLayout field={field}>
      <div
        style={{
          display: "flex",
          justifyContent: alignmentMap[alignment] || "center",
          margin: "0 0",
        }}
      >
        <img
          src={imageUrl}
          alt={t?.(field.displayName || "Image") || field.displayName || "Image"}
          {...imgAttributes}
          style={imgStyle}
        />
      </div>
    </StandardFieldLayout>
  );
};

export default ImageDisplay;
