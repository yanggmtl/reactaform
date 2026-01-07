import { useContext, createContext } from 'react';
import type { ReactaFormContextType } from '../core/reactaFormTypes';

// Create the context including optional validation mode
export const ReactaFormContext = createContext<ReactaFormContextType | undefined>(undefined);

// Hook to use the context
const useReactaFormContext = (): ReactaFormContextType => {
  const context = useContext(ReactaFormContext);
  if (!context) {
    throw new Error('❌ useReactaFormContext must be used within a <ReactaFormProvider>');
  }
  return context;
};

export default useReactaFormContext;