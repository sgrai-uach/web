'use client';

import React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import styles from '@/styles/seguimiento.module.css';

interface SeguimientoErrorCardProps {
  codigo?: string;
  mensaje?: string;
  onReintentar?: () => void;
}

export const SeguimientoErrorCard: React.FC<SeguimientoErrorCardProps> = ({
  codigo,
  mensaje = 'No encontramos ningún reporte con el código ingresado. Por favor, verifica el número entregado por el asistente.',
  onReintentar,
}) => {
  const emergencyPhone = process.env.NEXT_PUBLIC_EMERGENCY_PHONE || '1451';

  return (
    <div className={styles.errorCard} role="alert">
      <h3 className={styles.errorTitle}>
        {codigo ? `Reporte #${codigo} No Encontrado` : 'Código de Seguimiento No Encontrado'}
      </h3>
      <p className={styles.errorDescription}>{mensaje}</p>

      <div className={styles.errorActionsRow}>
        <Link href="/seguimiento" className={styles.btnPrimary}>
          Buscar otro código
        </Link>

        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className={styles.btnSecondary}
          >
            Reintentar consulta
          </button>
        )}

        <a
          href={`tel:${emergencyPhone}`}
          className={styles.emergencyCallBtn}
          aria-label={`Llamar a la central de emergencias municipal al número ${emergencyPhone}`}
        >
          <Phone size={16} aria-hidden="true" />
          <span>Llamar al Call Center ({emergencyPhone})</span>
        </a>
      </div>
    </div>
  );
};
