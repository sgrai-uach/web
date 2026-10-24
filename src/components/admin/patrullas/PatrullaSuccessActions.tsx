'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, ArrowRight, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import styles from './PatrullaForm.module.css';

interface PatrullaSuccessActionsProps {
  patrulla: PatrullaVerificadoraDTO;
  onReset: () => void;
}

export const PatrullaSuccessActions: React.FC<PatrullaSuccessActionsProps> = ({
  patrulla,
  onReset,
}) => {
  const nombreDisplay = patrulla.nombre || patrulla.codigo || 'Patrulla Verificadora';

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        borderLeft: '5px solid var(--color-success, #2E7D32)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div
          style={{
            backgroundColor: '#E8F5E9',
            color: 'var(--color-success, #2E7D32)',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={28} aria-hidden="true" />
        </div>

        <div>
          <Heading as="h2" variant="h2" color="teal-dark" noMargin>
            Patrulla Verificadora Registrada Exitosamente
          </Heading>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '15px',
              color: 'var(--color-text-dark, #2B2B2B)',
              lineHeight: 1.5,
            }}
          >
            La unidad <strong>&ldquo;{nombreDisplay}&rdquo;</strong>{' '}
            {patrulla.codigo ? `[${patrulla.codigo}]` : ''} ha sido dada de alta con estado inicial{' '}
            <strong style={{ color: 'var(--color-success, #2E7D32)' }}>DISPONIBLE</strong>. Su dotación
            y vehículo han quedado asignados y se encuentra visible de inmediato en la consola del
            Centro de Mando.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color-neutral, #DFE3E8)',
        }}
      >
        <Button
          type="button"
          variant="primary"
          size="md"
          href="/gestion/centro-incidentes"
          icon={<ShieldCheck size={16} />}
        >
          Ir a Centro de Mando
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onReset}
          icon={<Plus size={16} />}
        >
          Dar de Alta Otra Patrulla
        </Button>

        <Button
          type="button"
          variant="outline"
          size="md"
          href="/gestion"
        >
          Volver a Administración
        </Button>
      </div>
    </div>
  );
};

export default PatrullaSuccessActions;
