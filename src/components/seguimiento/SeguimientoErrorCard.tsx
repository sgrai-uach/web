'use client';

import React from 'react';
import { Phone } from 'lucide-react';
import styles from '@/styles/seguimiento.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

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
      <Heading as="h3" variant="h3" color="charcoal-dark" noMargin className={styles.errorTitle}>
        {codigo ? `Reporte #${codigo} No Encontrado` : 'Código de Seguimiento No Encontrado'}
      </Heading>
      <p className={styles.errorDescription}>{mensaje}</p>

      <div className={styles.errorActionsRow}>
        <Button href="/seguimiento" variant="primary">
          Buscar otro código
        </Button>

        {onReintentar && (
          <Button
            type="button"
            variant="secondary"
            onClick={onReintentar}
          >
            Reintentar consulta
          </Button>
        )}

        <Button
          href={`tel:${emergencyPhone}`}
          variant="destructive"
          aria-label={`Llamar a la central de emergencias municipal al número ${emergencyPhone}`}
        >
          <Phone size={16} aria-hidden="true" />
          <span>Llamar al Call Center ({emergencyPhone})</span>
        </Button>
      </div>
    </div>
  );
};
