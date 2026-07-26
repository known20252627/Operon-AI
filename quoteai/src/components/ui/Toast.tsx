'use client';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="toast" onClick={onDismiss}>
      <span>✓</span>{message}
    </div>
  );
}
