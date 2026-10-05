'use client';

import React, { useEffect } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import EmpleadoFormulario from './EmpleadoFormulario';
import { UserCheck, X, FileEdit } from 'lucide-react';
import styles from './EmpleadoPanelEdicion.module.css';

interface EmpleadoPanelEdicionProps {
  usuario: EmpleadoUsuario | null;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
  onCerrar: () => void;
  onDarDeBaja?: () => void;
}

export default function EmpleadoPanelEdicion({
  usuario,
  onEmpleadoActualizado,
  onCerrar,
  onDarDeBaja,
}: EmpleadoPanelEdicionProps) {
  // Manejo de tecla Escape para cerrar en móvil
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && usuario) {
        onCerrar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [usuario, onCerrar]);

  // Si no hay usuario seleccionado
  if (!usuario) {
    return (
      <div className={styles.desktopView}>
        <div className={styles.placeholderCard}>
          <div className={styles.placeholderIcon}>
            <FileEdit size={44} />
          </div>
          <h3 className={styles.placeholderTitle}>Ficha de Modificación</h3>
          <p className={styles.placeholderText}>
            Haga clic en <strong>&ldquo;Editar&rdquo;</strong> en cualquier funcionario de la lista permanente para modificar sus antecedentes y ficha técnica en este panel.
          </p>
        </div>
      </div>
    );
  }

  const renderFormularioCard = () => (
    <div className={styles.formCard}>
      <div className={styles.formCardHeader}>
        <h3 className={styles.formCardTitle}>
          <UserCheck size={18} style={{ color: 'var(--color-primary-teal, #1B6F7D)' }} />
          <span>Ficha de Modificación</span>
        </h3>
        <button
          type="button"
          onClick={onCerrar}
          className={styles.closeButton}
          title="Cerrar panel de modificación"
          aria-label="Cerrar ficha"
        >
          <X size={16} />
          <span>Cerrar</span>
        </button>
      </div>

      <div style={{ padding: '0.5rem 0 0 0' }}>
        <EmpleadoFormulario
          key={usuario.usuario_id}
          usuario={usuario}
          onEmpleadoActualizado={onEmpleadoActualizado}
          onCancelar={onCerrar}
          onDarDeBaja={onDarDeBaja}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Vista Desktop (>= 1024px): Integrado directamente al lado derecho de la grilla */}
      <div className={styles.desktopView}>
        {renderFormularioCard()}
      </div>

      {/* 2. Vista Móvil (< 1024px): Widget sobrepuesto (Drawer con backdrop) */}
      <div className={styles.mobileOverlayView} onClick={onCerrar}>
        <div
          className={styles.mobileDrawer}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Ficha de Modificación de Empleado"
        >
          {renderFormularioCard()}
        </div>
      </div>
    </>
  );
}
