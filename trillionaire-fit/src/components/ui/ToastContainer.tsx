'use client';

import Toast from './Toast';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastState[];
  onRemove: (index: number) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <Toast
          key={index}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(index)}
        />
      ))}
    </div>
  );
}
