import * as React from 'react';
import type { FieldValidationMode, ReactaFormProviderProps, TranslationMap } from '../../core/reactaFormTypes';
import { ReactaFormContext } from '../../hooks/useReactaFormContext';
import {
  loadCommonTranslation,
  loadUserTranslation,
  createTranslationFunction
} from '../../utils/translationCache';
import { registerBaseComponents } from '../../core/registries/componentRegistry';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '../../validation/registerBuiltinTypeValidators';

// Import CSS variables if needed
import '../../styles/reactaform.css';

registerBaseComponents();
ensureBuiltinFieldTypeValidatorsRegistered();

// Local copies of style generators previously in utils/styleConfig.ts
const getFormStyle = (
  style: Record<string, unknown> | undefined
): Record<string, Record<string, unknown>> => {
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
  style: Record<string, unknown> | undefined
): Record<string, Record<string, unknown>> => {
  const baseInputStyle = {
    color: "var(--reactaform-color-text)",
    fontFamily: (style as Record<string, unknown>)?.fontFamily as string || "var(--reactaform-font-family, inherit)",
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

/**
 * ReactaFormProvider component - Context provider for ReactaForm configuration
 * @param {ReactaFormProviderProps} props - The component props
 * @param {ReactNode} props.children - Child components to wrap with context
 * @param {string} [props.definitionName] - Name of the form definition
 * @param {Record<string, unknown>} [props.defaultStyle] - Default styling configuration
 * @param {string} [props.defaultLanguage='en'] - Default language code for translations
 * @param {string} [props.defaultTheme='light'] - Default theme name
 * @param {string} [props.defaultLocalizeName] - Name of custom localization file
 * @param {FieldValidationMode} [props.defaultFieldValidationMode='realTime'] - Validation timing mode
 * @param {string} [props.className='reactaform-container'] - CSS class name for the container
 * @param {boolean} [props.displayInstanceName] - Whether to display the instance name
 */
export const ReactaFormProvider = ({
  children,
  definitionName = '',
  defaultStyle,
  defaultLanguage = 'en',
  defaultTheme = 'light',
  defaultLocalizeName = '',
  defaultFieldValidationMode = 'realTime',
  className = 'reactaform-container',
  defaultDisplayInstanceName = true
}: ReactaFormProviderProps & { defaultFieldValidationMode?: FieldValidationMode }) => {
  const providerDefinitionName = definitionName;
  const localizeName = defaultLocalizeName;
  const theme = defaultTheme;
  const language = defaultLanguage;

  // Make a stable defaultStyle object so effects that depend on it don't
  // rerun every render when callers omit the prop ({} literal would be new each time)
  const stableDefaultStyle = React.useMemo(
    () => (defaultStyle ?? {}) as Record<string, unknown>,
    [defaultStyle]
  );

  // Keep common and user maps separate in state so updates trigger rerenders
  // and consumers pick up translations as soon as they load.
  const [commonMapState, setCommonMapState] = React.useState<TranslationMap>({});
  const [userMapState, setUserMapState] = React.useState<TranslationMap>({});

  // Initialize localization map (cancellable)
  React.useEffect(() => {
    let mounted = true;
    const loadTranslation = async () => {
      if (language === 'en') {
        if (mounted) {
          setCommonMapState({});
          setUserMapState({});
        }
        return;
      }

      // Load common translations
      try {
        const commonResult = await loadCommonTranslation(language);
        const commonMap = commonResult.success ? commonResult.translations : {};
        if (mounted) setCommonMapState(commonMap);

        // Load user translations
        const userResult = await loadUserTranslation(language, localizeName);
        const userMap = userResult.success ? userResult.translations : {};
        if (mounted) setUserMapState(userMap);
      } catch {
        // Fail silently — translation loading shouldn't crash the app
        if (mounted) {
          setCommonMapState({});
          setUserMapState({});
        }
      }
    };

    loadTranslation();
    return () => {
      mounted = false;
    };
  }, [language, localizeName]);

  // Initialize form and field style
  const formStyle = React.useMemo(() => getFormStyle(stableDefaultStyle), [stableDefaultStyle]);
  const fieldStyle = React.useMemo(() => getFieldStyle(stableDefaultStyle), [stableDefaultStyle]);

  // Memoize the underlying translation function so `t` is stable and cheap to call
  const translationFn = React.useMemo(
    () => createTranslationFunction(language, commonMapState, userMapState),
    [language, commonMapState, userMapState]
  );

  const t = React.useCallback(
    (defaultText: string, ...args: unknown[]) => translationFn(defaultText, ...args),
    [translationFn]
  );

  const contextValue = React.useMemo(
    () => ({
      definitionName: providerDefinitionName,
      language,
      theme,
      formStyle,
      fieldStyle,
      t,
      fieldValidationMode: defaultFieldValidationMode,
      displayInstanceName: defaultDisplayInstanceName
    }),
    [ providerDefinitionName, language, theme, 
      fieldStyle, formStyle, t,
      defaultFieldValidationMode, defaultDisplayInstanceName ]
  );

  // Only apply height: 100% if the user provided a height in their style prop
  const wrapperStyle = stableDefaultStyle?.height ? { height: '100%' } : undefined;

  return (
    <ReactaFormContext.Provider value={contextValue}>
      <div
        data-reactaform-theme={theme}
        className= {className}
        style={wrapperStyle}
      >
        {children}
      </div>
    </ReactaFormContext.Provider>
  );
};