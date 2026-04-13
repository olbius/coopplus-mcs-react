import { createContext, useContext, useState, useCallback, type FC, type ReactNode } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface Toast {
  message: string;
  severity: AlertColor;
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((message: string, severity: AlertColor) => {
    setToast({ message, severity });
  }, []);

  const value: ToastContextValue = {
    showSuccess: (msg) => show(msg, 'success'),
    showError:   (msg) => show(msg, 'error'),
    showWarning: (msg) => show(msg, 'warning'),
    showInfo:    (msg) => show(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled">
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
