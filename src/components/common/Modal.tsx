import React, { useEffect, useRef } from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  actions,
  maxWidth = '540px',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(36, 39, 43, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          maxWidth,
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08))',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            backgroundColor: '#14505A',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Heading
            id="modal-title"
            as="h3"
            variant="h3"
            color="white"
            noMargin
          >
            {title}
          </Heading>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Cerrar ventana modal"
            style={{
              color: '#FFFFFF',
              fontSize: '1.25rem',
              minHeight: 'auto',
              padding: '0 6px',
            }}
          >
            &times;
          </Button>
        </div>

        {/* Contenido */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            fontSize: '14px',
            color: '#2B2B2B',
          }}
        >
          {children}
        </div>

        {/* Acciones */}
        {actions && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#ECEFF3',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop: '1px solid #ECEFF3',
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
