import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Safely handle browser extension interactions
const safelyExecute = (callback: Function) => {
  try {
    return callback();
  } catch (error) {
    // Safely handle runtime.lastError
    if (error instanceof Error && error.message.includes('message port closed')) {
      console.warn('Browser extension communication error handled gracefully');
      return null;
    }
    throw error;
  }
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 5000) => {
    // Generate a unique ID with a random component to avoid duplicates
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    safelyExecute(() => {
      setToasts(prev => [
        ...prev,
        { id, message, type, duration }
      ]);
    });
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      safelyExecute(() => {
        setToasts(prev => prev.slice(1));
      });
    }, toasts[0].duration || 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  const renderToasts = () => {
    return toasts.map((toast) => (
      <div
        key={toast.id}
        className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : toast.type === 'error'
            ? 'bg-red-500 text-white'
            : toast.type === 'warning'
            ? 'bg-yellow-500 text-gray-800'
            : 'bg-blue-500 text-white'
        }`}
      >
        {toast.message}
      </div>
    ));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {renderToasts()}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
