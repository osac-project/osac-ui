import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface FieldValidationContextValue {
  showErrors: boolean;
  setShowErrors: (show: boolean) => void;
}

const FieldValidationContext = createContext<FieldValidationContextValue>({
  showErrors: false,
  setShowErrors: () => undefined,
});

export const useFieldValidation = () => useContext(FieldValidationContext);

export const FieldValidationProvider = ({ children }: { children: ReactNode }) => {
  const [showErrors, setShowErrors] = useState(false);
  return (
    <FieldValidationContext.Provider value={{ showErrors, setShowErrors }}>
      {children}
    </FieldValidationContext.Provider>
  );
};
