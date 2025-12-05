
import type { ReactaDefinition, ReactaFormProps } from "../core/reactaFormTypes"
import ReactaFormRenderer from "./ReactaFormRenderer";
import { ReactaFormProvider } from "./ReactaFormProvider";
import { useEffect, useMemo, useState } from "react";

function useNearestReactaformTheme(ref?: React.RefObject<HTMLElement>) {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    const startEl = ref?.current ?? document.querySelector('[data-reactaform-theme]');
    if (!startEl) return;
    const themedNode = (startEl as Element).closest('[data-reactaform-theme]') as Element | null;
    if (!themedNode) return;
    const read = () => setTheme(themedNode.getAttribute('data-reactaform-theme'));
    read();

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m as MutationRecord).attributeName === 'data-reactaform-theme') {
          read();
        }
      }
    });
    mo.observe(themedNode, { attributes: true, attributeFilter: ['data-reactaform-theme'] });
    return () => mo.disconnect();
  }, [ref]);
  return theme;
}

const ReactaForm: React.FC<ReactaFormProps> = ({
  definitionData,
  instance,
  language,
  className,
  darkMode,
  style, 
}) => {
    const definition = useMemo<ReactaDefinition | null>(() => {
      try {
        return typeof definitionData === 'string' ? JSON.parse(definitionData) : (definitionData ?? null);
      } catch {
        return null;
      }
    }, [definitionData]);
    const inputStyle = { fontSize: "inherit", fontFamily: "inherit", ...style };
    
    const theme = useNearestReactaformTheme();
    const inputDarkMode = darkMode ?? (theme === 'dark');

    const inputLanguage = language ?? 'en';

    useEffect(() => {
      // Add popup-root div if not already present to make sure popups work
      let root = document.getElementById('popup-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'popup-root';
        document.body.appendChild(root);
      }
    }, []);

    if (!definition) {
      return <div style={{ color: 'red' }}>Error: No form definition provided.</div>;
    }

    return(
      definition && ( 
      <ReactaFormProvider
        defaultDefinitionName={definition.name}
        defaultStyle={inputStyle}
        defaultLanguage={inputLanguage}
        defaultDarkMode={inputDarkMode}
        defaultLocalizeName={definition.localization || ""}
        className={className}
      >
        <ReactaFormRenderer
          definition={definition}
          instance={instance?? null}
        />
      </ReactaFormProvider>
      )
    );
};

export default ReactaForm;
