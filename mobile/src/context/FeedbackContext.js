import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { LoadingOverlay } from '../components/LoadingOverlay.js';
import { SuccessToast } from '../components/SuccessToast.js';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [loadingState, setLoadingState] = useState({
    visible: false,
    message: 'Cargando...',
  });

  const [toastState, setToastState] = useState({
    visible: false,
    message: '',
  });

  const showLoading = useCallback((message = 'Cargando...') => {
    setLoadingState({
      visible: true,
      message,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccess = useCallback((message) => {
    setToastState({
      visible: true,
      message,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastState({
      visible: false,
      message: '',
    });
  }, []);

  return (
    <FeedbackContext.Provider
      value={{
        showLoading,
        hideLoading,
        showSuccess,
        hideToast,
      }}
    >
      {children}
      <LoadingOverlay
        visible={loadingState.visible}
        message={loadingState.message}
      />
      <SuccessToast
        visible={toastState.visible}
        message={toastState.message}
        onDismiss={hideToast}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    // Si se utiliza fuera del provider, provee stubs seguros
    return {
      showLoading: () => {},
      hideLoading: () => {},
      showSuccess: () => {},
      hideToast: () => {},
    };
  }
  return context;
}
