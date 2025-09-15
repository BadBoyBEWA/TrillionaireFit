import { useState } from 'react';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (() => void) | null;
  variant?: 'danger' | 'warning' | 'info';
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning' | 'info';
    }
  ) => {
    setDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      variant: options?.variant || 'danger',
    });
  };

  const hideConfirm = () => {
    setDialog(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
    }));
  };

  const handleConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    hideConfirm();
  };

  return {
    dialog,
    showConfirm,
    hideConfirm,
    handleConfirm,
  };
}
