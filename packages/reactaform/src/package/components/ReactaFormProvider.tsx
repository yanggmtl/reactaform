/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactaFormProviderProps, TranslationMap } from '../core/reactaFormTypes';
import { ReactaFormContext } from '../hooks/useReactaFormContext';
import {
  loadCommonTranslation,
  loadUserTranslation,
  createTranslationFunction
} from '../utils/translationCache';
import { registerBaseComponents } from '../core/registries';

// Import CSS variables if needed
import '../core/reactaform.css';

registerBaseComponents();

// Local copies of style generators previously in utils/styleConfig.ts
const getFormStyle = (
  style: Record<string, any> | undefined,
  _darkMode = false
): Record<string, Record<string, any>> => {
  return {
    container: {
      padding: "var(--reactaform-space-sm, 8px)",
      margin: "0 auto",
      backgroundColor: "transparent",
      borderRadius: 0,
      color: "var(--reactaform-color-text)",
      fontFamily:
        style?.fontFamily ||
        "var(--reactaform-font-family, system-ui, -apple-system, sans-serif)",
      boxSizing: "border-box",
      minHeight: style?.minHeight ?? "0",
      ...(style?.width
        ? {
            width: style.width,
            overflowX: "auto",
          }
        : {
            maxWidth: "100%",
          }),
      ...(style?.height
        ? {
            height: style.height,
            overflowY: "auto",
          }
        : {}),
    },
    buttonStyle: {
      padding:
        "var(--reactaform-space-sm, 8px) var(--reactaform-space-md, 16px)",
      backgroundColor: "var(--reactaform-color-primary)",
      color: "var(--reactaform-color-background)",
      border: "1px solid var(--reactaform-color-primary)",
      borderRadius: "var(--reactaform-border-radius, 6px)",
      cursor: "pointer",
      fontSize: style?.fontSize || "1rem",
      fontWeight: "600",
      transition: "all 0.2s ease",
      boxShadow: "var(--reactaform-shadow-small, 0 1px 3px rgba(0, 0, 0, 0.12))",
    },
    titleStyle: {
      marginBottom: "var(--reactaform-space-lg, 24px)",
      color: "var(--reactaform-color-text)",
      fontSize: typeof style?.fontSize === "number" ? `${style.fontSize * 1.5}px` : "1.5rem",
      fontWeight: "700",
      lineHeight: "1.2",
      textAlign: "left",
    },
  };
};

const getFieldStyle = (
  style: Record<string, any> | undefined,
  _darkMode = false
): Record<string, Record<string, any>> => {
  const baseInputStyle = {
    color: "var(--reactaform-color-text)",
    fontFamily: style?.fontFamily || "var(--reactaform-font-family, inherit)",
    transition: "all 0.2s ease",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  return {
    container: {
      fontFamily: style?.fontFamily || "var(--reactaform-font-family, inherit)",
      fontSize: style?.fontSize || "var(--reactaform-font-size, 1rem)",
      width: "100%",
      maxWidth: style?.width || "100%",
      marginBottom: "var(--reactaform-space-md, 16px)",
    },
    label: {
      display: "block",
      marginBottom: "var(--reactaform-space-xs, 4px)",
      fontWeight: "500",
      color: "var(--reactaform-color-text)",
      fontSize: "var(--reactaform-font-size, 1rem)",
      fontFamily: style?.fontFamily || "var(--reactaform-font-family, inherit)",
    },
    input: baseInputStyle,
    textInput: baseInputStyle,
    optionInput: baseInputStyle,
    select: {
      ...baseInputStyle,
      cursor: "pointer",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 8px center",
      backgroundSize: "16px",
      paddingRight: "32px",
      backgroundImage: `url("data:image/svg+xml;utf8,<svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        stroke-width='2'
        stroke-linecap='round'
        stroke-linejoin='round'>
        <polyline points='6,9 12,15 18,9'/>
        </svg>")`,
    },
    textarea: {
      ...baseInputStyle,
      minHeight: "80px",
      resize: "vertical",
      paddingTop: "var(--reactaform-space-sm, 8px)",
    },
    error: {
      color: "var(--reactaform-color-error)",
      fontSize: "0.875rem",
      marginTop: "var(--reactaform-space-xs, 4px)",
      display: "block",
    },
  };
};

export const ReactaFormProvider = ({
  children,
  defaultDefinitionName = '',
  defaultStyle,
  defaultLanguage = 'en',
  defaultDarkMode = false,
  defaultLocalizeName = '',
}: ReactaFormProviderProps) => {
  const definitionName = defaultDefinitionName;
  const localizeName = defaultLocalizeName;
  const darkMode = defaultDarkMode;
  const language = defaultLanguage;

  // Make a stable defaultStyle object so effects that depend on it don't
  // rerun every render when callers omit the prop ({} literal would be new each time)
  const stableDefaultStyle = useMemo(() => defaultStyle ?? {}, [defaultStyle]);

  // Keep common and user maps separate in state so updates trigger rerenders
  // and consumers pick up translations as soon as they load.
  const [commonMapState, setCommonMapState] = useState<TranslationMap>({});
  const [userMapState, setUserMapState] = useState<TranslationMap>({});
  const [fieldStyle, setFieldStyle] = useState<Record<string, any>>({});
  const [formStyle, setFormStyle] = useState<Record<string, any>>({});

  // Initialize localization map
  useEffect(() => {
    const loadTranslation = async () => {
      if (language === 'en') {
        // clear states
        if (Object.keys(commonMapState).length > 0) setCommonMapState({});
        if (Object.keys(userMapState).length > 0) setUserMapState({});
        return;
      }

      // Load common translations
      const commonResult = await loadCommonTranslation(language);
      const commonMap = commonResult.success ? commonResult.translations : {};
      if (JSON.stringify(commonMap) !== JSON.stringify(commonMapState)) {
        setCommonMapState(commonMap);
      }

      // Load user translations
      const userResult = await loadUserTranslation(language, localizeName);
      const userMap = userResult.success ? userResult.translations : {};
      if (JSON.stringify(userMap) !== JSON.stringify(userMapState)) {
        setUserMapState(userMap);
      }
    };

    loadTranslation();
  }, [language, localizeName, commonMapState, userMapState]);

  // Initialize form and field style
  useEffect(() => {
    setFormStyle(getFormStyle(stableDefaultStyle, darkMode));
    setFieldStyle(getFieldStyle(stableDefaultStyle, darkMode));
  }, [stableDefaultStyle, darkMode]);

  // Translation function, used for whole form
  const t = useCallback(
    (defaultText: string, ...args: any[]) => 
      createTranslationFunction(language, commonMapState, userMapState)(defaultText, ...args),
    [language, commonMapState, userMapState]
  );

  const contextValue = useMemo(
    () => ({
      definitionName,
      language,
      darkMode,
      formStyle,
      fieldStyle,
      t,
    }),
    [definitionName, language, darkMode, fieldStyle, formStyle, t]
  );

  return (
    <ReactaFormContext.Provider value={contextValue}>
      <div 
        data-reactaform-theme={darkMode ? 'dark' : 'light'}
        className='reactaform-container'
      >
        {children}
      </div>
    </ReactaFormContext.Provider>
  );
};