'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { DuplicadoItem } from '@/types/incidente-manual';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import DuplicadosTabla from './DuplicadosTabla';

interface DuplicadosModalProps {
  isOpen: boolean;
  coincidencias: DuplicadoItem[];
  mensaje?: string;
  enviando?: boolean;
  onOmitir: () => void;
  onContinuar: () => void;
}

export default function DuplicadosModal({
  isOpen,
  coincidencias,
  mensaje,
  enviando = false,
  onOmitir,
  onContinuar,
}: DuplicadosModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-duplicados-titulo"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #14505A',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Cabecera del modal */}
        <div
          style={{
            backgroundColor: '#14505A',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderBottom: '3px solid #FFA000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertTriangle size={20} color="#FFA000" aria-hidden="true" />
          <Heading id="modal-duplicados-titulo" as="h2" variant="h3" color="white" style={{ margin: 0 }}>
            Posible Incidente Duplicado Detectado
          </Heading>
        </div>

        {/* Cuerpo del modal */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#2B2B2B', lineHeight: 1.5 }}>
            {mensaje ||
              'Se han registrado los siguientes incidentes o avisos similares en la misma zona durante las últimas 24 horas:'}
          </p>

          <DuplicadosTabla coincidencias={coincidencias} />

          <div
            style={{
              backgroundColor: '#ECEFF3',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#3B3F45',
              lineHeight: 1.5,
              borderLeft: '4px solid #1B6F7D',
            }}
          >
            <strong>¿Cómo deseas proceder?</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              <li>
                <strong>Omitir reporte:</strong> Cancela este nuevo registro para no duplicar asignaciones al Encargado.
              </li>
              <li>
                <strong>Continuar de todos modos:</strong> Registra un nuevo incidente formal independiente en el sistema.
              </li>
            </ul>
          </div>
        </div>

        {/* Botones de acción del modal */}
        <div
          style={{
            backgroundColor: '#ECEFF3',
            padding: '16px 20px',
            borderTop: '1px solid #DFE3E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <Button variant="secondary" onClick={onOmitir} disabled={enviando}>
            Omitir reporte
          </Button>

          <Button variant="primary" onClick={onContinuar} disabled={enviando}>
            {enviando ? 'Guardando...' : 'Continuar de todos modos'}
          </Button>
        </div>
      </div>
    </div>
  );
}
