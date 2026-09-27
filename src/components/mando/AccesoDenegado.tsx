'use client';

import React from 'react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import styles from '@/styles/mando.module.css';

interface AccesoDenegadoProps {
  onReintentar?: () => void;
}

export const AccesoDenegado: React.FC<AccesoDenegadoProps> = ({ onReintentar }) => {
  return (
    <div className={styles.accesoDenegadoContainer} role="alert">
      <div style={{ marginBottom: '1rem', display: 'inline-flex' }}>
        <ShieldAlert size={56} color="var(--color-danger, #D32F2F)" />
      </div>
      <Heading
        as="h2"
        variant="h3"
        color="charcoal-dark"
        style={{ color: 'var(--color-danger, #D32F2F)', marginBottom: '0.75rem' }}
      >
        Acceso Restringido — 403 Forbidden
      </Heading>
      <p className={styles.accesoDenegadoText}>
        Esta vista del <strong>Centro de Incidentes</strong> está reservada exclusivamente para el
        rol de <strong>Encargado de Operaciones</strong> con permisos tácticos (<code>incidentes:kanban</code>).
        Tu cuenta no cuenta con las atribuciones necesarias para acceder a esta información operativa.
      </p>
      {onReintentar && (
        <div style={{ marginTop: '1.25rem' }}>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onReintentar}
          >
            Reintentar con Sesión de Encargado
          </Button>
        </div>
      )}
    </div>
  );
};
