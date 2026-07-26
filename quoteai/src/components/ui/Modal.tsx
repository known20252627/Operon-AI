'use client';
import { useEffect } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export function Modal({ children, onClose, className = '' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className={className} onMouseDown={e => e.stopPropagation()}>
        {children}
      </section>
    </div>
  );
}

interface ToolModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ToolModal({ title, subtitle, onClose, children }: ToolModalProps) {
  return (
    <Modal onClose={onClose} className="tool-modal">
      <button className="close" onClick={onClose}>×</button>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      {children}
    </Modal>
  );
}
