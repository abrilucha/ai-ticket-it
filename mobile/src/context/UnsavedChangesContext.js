import React, { createContext, useContext, useRef, useCallback } from 'react';

const UnsavedChangesContext = createContext(null);

/**
 * UnsavedChangesProvider
 * Permite a pantallas de formulario con cambios pendientes registrar un interceptor (blocker)
 * para evitar la pérdida accidental de datos al interactuar con barras de navegación inferiores (Tabs)
 * o navegación cruzada.
 */
export function UnsavedChangesProvider({ children }) {
  const blockerRef = useRef(null);

  const registerBlocker = useCallback((fn) => {
    blockerRef.current = fn;
    return () => {
      if (blockerRef.current === fn) {
        blockerRef.current = null;
      }
    };
  }, []);

  const checkBlocked = useCallback((proceedCallback) => {
    if (blockerRef.current) {
      return blockerRef.current(proceedCallback);
    }
    if (proceedCallback) {
      proceedCallback();
    }
    return false;
  }, []);

  return (
    <UnsavedChangesContext.Provider value={{ registerBlocker, checkBlocked }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  return useContext(UnsavedChangesContext);
}
