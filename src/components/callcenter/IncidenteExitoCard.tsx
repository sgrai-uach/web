'use client';

import React from 'react';
import { Check, Plus, Home } from 'lucide-react';
import type { IncidenteCreadoExito } from '@/types/incidente-manual';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import CodigoDestacado from './CodigoDestacado';

interface IncidenteExitoCardProps {
  datos: IncidenteCreadoExito;
  onNuevoReporte: () => void;
}

export default function IncidenteExitoCard({
  datos,
  onNuevoReporte,
}: IncidenteExitoCardProps) {
  return (
    <div
      role="status"
      style={{
        backgroundColor: '#FFFFFF',
        border: '2px solid #4FAE9B',
        padding: '28px',
        maxWidth: '720px',
        margin: '0 auto',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Encabezado de éxito */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '2px solid #ECEFF3',
          paddingBottom: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#4FAE9B',
            color: '#FFFFFF',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={22} strokeWidth={3} aria-hidden="true" />
        </div>
        <div>
          <Heading as="h2" variant="h3" color="teal" style={{ margin: 0 }}>
            Reporte Ingresado y Verificado Exitosamente
          </Heading>
          <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
            El incidente quedó indexado automáticamente en estado SIN_ATENDER para el Encargado.
          </p>
        </div>
      </div>

      {/* Bloque de códigos destacados */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <CodigoDestacado
          titulo="Código de Incidente (Encargado)"
          codigo={datos.codigoIncidente}
          subtitulo="Estado: SIN_ATENDER"
          borderColor="#1B6F7D"
          codigoColor="#1B6F7D"
        />
        <CodigoDestacado
          titulo="Código de Seguimiento del Aviso"
          codigo={datos.codigoAviso}
          subtitulo="Autoverificado por operador Call Center"
          borderColor="#4FAE9B"
          codigoColor="#14505A"
        />
      </div>

      {/* Resumen de los datos del incidente */}
      <div style={{ border: '1px solid #DFE3E8', padding: '16px', backgroundColor: '#FAFAFA', marginBottom: '24px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
        <div><span style={{ color: '#777' }}>Tipo de afectación:</span> <strong>{datos.tipoAfectacion}</strong></div>
        <div><span style={{ color: '#777' }}>Prioridad:</span> <strong style={{ color: datos.prioridad === 'CRITICA' ? '#C81E1E' : '#14505A' }}>{datos.prioridad}</strong></div>
        <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#777' }}>Dirección:</span> <strong>{datos.direccion}</strong></div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="primary"
          onClick={onNuevoReporte}
          icon={<Plus size={16} />}
        >
          Ingresar otro reporte
        </Button>

        <Button
          href="/"
          variant="secondary"
          icon={<Home size={16} />}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
