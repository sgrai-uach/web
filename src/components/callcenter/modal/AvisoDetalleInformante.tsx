import React from 'react';
import type { AvisoItem } from '@/types/avisos';

interface DatosInformante {
  nombre?: string;
  telefono?: string;
  rut?: string;
  direccionAproximada?: string;
}

interface AvisoDetalleInformanteProps {
  aviso: AvisoItem;
  datosInf: DatosInformante;
}

export default function AvisoDetalleInformante({ aviso, datosInf }: AvisoDetalleInformanteProps) {
  return (
    <div
      style={{
        border: '1px solid #DFE3E8',
        padding: '1.25rem',
        backgroundColor: '#FAFCFD',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-primary-teal, #1B6F7D)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderBottom: '2px solid var(--color-accent-mint, #4FAE9B)',
          paddingBottom: '0.35rem',
        }}
      >
        Datos del Informante y Contacto
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.4rem', fontSize: '0.875rem' }}>
        <span style={{ color: '#666', fontWeight: 600 }}>Nombre:</span>
        <span style={{ fontWeight: 600 }}>{datosInf.nombre || 'No registrado'}</span>

        <span style={{ color: '#666', fontWeight: 600 }}>Teléfono:</span>
        <span>
          {datosInf.telefono ? (
            <a
              href={`tel:${datosInf.telefono}`}
              style={{
                color: 'var(--color-primary-teal, #1B6F7D)',
                fontWeight: 700,
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              📞 {datosInf.telefono}
            </a>
          ) : (
            'Sin teléfono'
          )}
        </span>

        <span style={{ color: '#666', fontWeight: 600 }}>RUT:</span>
        <span>{datosInf.rut || 'No proporcionado'}</span>

        <span style={{ color: '#666', fontWeight: 600 }}>Dirección Ref.:</span>
        <span>{datosInf.direccionAproximada || 'No especificada'}</span>

        <span style={{ color: '#666', fontWeight: 600 }}>Canal Ingreso:</span>
        <span>{aviso.origenReporte}</span>
      </div>

      {datosInf.telefono && (
        <div style={{ marginTop: '0.5rem' }}>
          <a
            href={`tel:${datosInf.telefono}`}
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--color-charcoal, #3B3F45)',
              color: '#FFFFFF',
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            📞 Iniciar Llamada al Informante
          </a>
        </div>
      )}

      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
          Descripción original recibida:
        </div>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #DFE3E8',
            padding: '0.625rem',
            fontSize: '0.875rem',
            marginTop: '0.25rem',
            color: '#2B2B2B',
            lineHeight: '1.4',
          }}
        >
          {aviso.descripcion}
        </div>
      </div>
    </div>
  );
}
