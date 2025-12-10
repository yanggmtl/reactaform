import type { TranslationMap, TranslationCache } from "../core/reactaFormTypes";

/**
 * Translation loading result
 */
export interface TranslationLoadResult {
  success: boolean;
  translations: TranslationMap;
  error?: string;
  fromCache?: boolean;
}

// Enhanced caches with metadata
const commonTranslationCache: TranslationCache = new Map<
  string,
  TranslationMap
>();
export const userTranslationCache: TranslationCache = new Map<
  string,
  TranslationMap
>();
export const userFailedSet = new Set<string>();

// Cache metadata
const cacheMetadata = new Map<
  string,
  {
    loadedAt: Date;
    size: number;
    source: "common" | "user";
  }
>();

/**
 * Enhanced common translation loader with better error handling
 */
export const loadCommon = async (
  language: string
): Promise<TranslationLoadResult> => {
  try {
    let translations: TranslationMap;

    switch (language.toLowerCase()) {
      case "fr":
        translations = (await import("../locales/fr/common.json")).default;
        break;
      case "de":
        translations = (await import("../locales/de/common.json")).default;
        break;
      case "es":
        translations = (await import("../locales/es/common.json")).default;
        break;
      case "zh-cn":
        translations = (await import("../locales/zh-cn/common.json")).default;
        break;
      case "en":
        translations = {}; // English is the default language
        break;
      default:
        translations = {};
    }

    return {
      success: true,
      translations,
      fromCache: false,
    };
  } catch (error) {
    return {
      success: false,
      translations: {},
      error: `Failed to load common translations for ${language}: ${error}`,
    };
  }
};

/**
 * Enhanced common translation loading with caching and metadata
 */
export const loadCommonTranslation = async (
  language: string
): Promise<TranslationLoadResult> => {
  if (!language) {
    return { success: false, translations: {}, error: "Language is required" };
  }

  const normalizedLang = language.toLowerCase();

  if (normalizedLang === "en") {
    return { success: true, translations: {}, fromCache: false };
  }

  // Check cache first
  if (commonTranslationCache.has(normalizedLang)) {
    return {
      success: true,
      translations: commonTranslationCache.get(normalizedLang) || {},
      fromCache: true,
    };
  }

  // Load from source
  const result = await loadCommon(normalizedLang);

  if (result.success) {
    // Cache successful results
    commonTranslationCache.set(normalizedLang, result.translations);
    cacheMetadata.set(normalizedLang, {
      loadedAt: new Date(),
      size: Object.keys(result.translations).length,
      source: "common",
    });
  }

  return result;
};

/**
 * Enhanced user translation loading with better error handling and caching
 */
export const loadUserTranslation = async (
  language: string,
  localizeName: string
): Promise<TranslationLoadResult> => {
  if (!language || !localizeName) {
    return {
      success: false,
      translations: {},
      error: "Both language and localizeName are required",
    };
  }

  const cacheKey = `${language.toLowerCase()}/${localizeName}`;

  // Check failed cache
  if (userFailedSet.has(cacheKey)) {
    return {
      success: false,
      translations: {},
      error: "Previously failed to load",
      fromCache: true,
    };
  }

  // Check successful cache
  if (userTranslationCache.has(cacheKey)) {
    return {
      success: true,
      translations: userTranslationCache.get(cacheKey) || {},
      fromCache: true,
    };
  }

  try {
    let url = localizeName;
    if (!localizeName.includes("/") && !localizeName.includes(".")) {
      url = `/locales/${language}/${localizeName}.json`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      const error = `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 404) {
        // 404 is not a failure, just no translations available
        userTranslationCache.set(cacheKey, {});
        cacheMetadata.set(cacheKey, {
          loadedAt: new Date(),
          size: 0,
          source: "user",
        });

        return {
          success: true,
          translations: {},
          fromCache: false,
        };
      }

      userFailedSet.add(cacheKey);
      return {
        success: false,
        translations: {},
        error,
      };
    }

    // Read response as text then parse so we can provide better error messages
    const contentType = response.headers.get("content-type") || "";
    if (
      !contentType.includes("application/json") &&
      !contentType.includes("text/json")
    ) {
      // Not strictly required, but warn in debug mode
      if (isDebugMode()) {
        console.warn(
          `Translation file at ${url} has unexpected content-type: ${contentType}`
        );
      }
    }

    const text = await response.text();

    if (!text) {
      const error = "Empty translation file";
      userFailedSet.add(cacheKey);
      return { success: false, translations: {}, error };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const error = `Invalid JSON in translation file: ${
        e instanceof Error ? e.message : String(e)
      }`;
      userFailedSet.add(cacheKey);
      return { success: false, translations: {}, error };
    }

    // Ensure we received an object and normalize values to strings.
    if (!parsed || typeof parsed !== "object") {
      const error = "Invalid translation file format";
      userFailedSet.add(cacheKey);
      return {
        success: false,
        translations: {},
        error,
      };
    }

    const userTranslations: TranslationMap = Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
        k,
        typeof v === "string" ? v : String(v),
      ])
    );

    // Validate that response is an object
    if (!userTranslations || typeof userTranslations !== "object") {
      const error = "Invalid translation file format";
      userFailedSet.add(cacheKey);
      return {
        success: false,
        translations: {},
        error,
      };
    }

    // Cache successful result
    userTranslationCache.set(cacheKey, userTranslations);
    cacheMetadata.set(cacheKey, {
      loadedAt: new Date(),
      size: Object.keys(userTranslations).length,
      source: "user",
    });

    return {
      success: true,
      translations: userTranslations,
      fromCache: false,
    };
  } catch (error) {
    const errorMessage = `Failed to load user translations: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    userFailedSet.add(cacheKey);

    return {
      success: false,
      translations: {},
      error: errorMessage,
    };
  }
};

/**
 * Return whether translation subsystem should run in debug mode.
 * Checks multiple env sources (Vite, webpack, Next.js, etc.) for dev/debug mode.
 */
export function isDebugMode(): boolean {
  try {
    // Try Vite's import.meta.env.DEV
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - import.meta typing is Vite-specific
    const importMetaDev = import.meta?.env?.DEV;
    if (importMetaDev) {
      return true;
    }
  } catch {
    // import.meta not available in this environment
  }

  try {
    // Try webpack/CRA process.env.NODE_ENV
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
      return true;
    }
  } catch {
    // process.env not available
  }

  return false;
}

/**
 * Interpolation text
 */
function interpolateText(text: string, args: unknown[]): string {
  if (args.length === 0) {
    return text;
  }
  
  return text.replace(/\{\{(\d+)\}\}/g, (match: string, index: string) => {
    const i = parseInt(index, 10) - 1;
    const replacement = args[i];
    
    if (replacement === undefined || replacement === null) {
      return match; // Keep original placeholder if no replacement
    }
    
    // Convert to string safely
    try {
      return String(replacement);
    } catch {
      return match;
    }
  });
}

/**
 * Create a translation function using provided maps
 * @returns A translation function
 * This function processes text using only dictionary lookups and basic string interpolation.
 * Note: handling pluralization is not supported now
 * @example
 * const t = createTranslationFunction('fr', commonMap, userMap);
 * const translated = t("Hello, {{1}}!", "world");
 */
export const createTranslationFunction = (
  language: string,
  commonMap: TranslationMap,
  userMap: TranslationMap
) => {
  return (defaultText: string, ...args: unknown[]): string => {
    let translateText = defaultText;
    let translated = false;

    // Handle empty or invalid input
    if (!defaultText || typeof defaultText !== "string") {
      return String(defaultText || "");
    }

    const normalizedLang = language.toLowerCase();

    if (normalizedLang === "en") {
      translateText = defaultText;
      translated = true;
    } else {
      // Priority: user-defined > common translations
      if (Object.prototype.hasOwnProperty.call(userMap, defaultText)) {
        translateText = userMap[defaultText];
        translated = true;
      } else if (Object.prototype.hasOwnProperty.call(commonMap, defaultText)) {
        translateText = commonMap[defaultText];
        translated = true;
      } else {
        translateText = defaultText;
      }
    }

    translateText = interpolateText(translateText, args);

    if (!translated && isDebugMode()) {
      console.debug(
        `Missing translation for "${defaultText}" in language "${language}"`
      );
    }
    return translateText;
  };
};

/**
 * Clear all caches
 */
export function clearTranslationCaches(): void {
  commonTranslationCache.clear();
  userTranslationCache.clear();
  userFailedSet.clear();
  cacheMetadata.clear();
}
