'use client';

import React from 'react';
import Link from 'next/link';
import type { IncidenteCreadoExito } from '@/types/incidente-manual';

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
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
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
            fontSize: '20px',
            fontWeight: 800,
          }}
        >
          ✓
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#14505A' }}>
            Reporte Ingresado y Verificado Exitosamente
          </h2>
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
        <div
          style={{
            backgroundColor: '#ECEFF3',
            borderLeft: '4px solid #1B6F7D',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#555', fontWeight: 700 }}>
            Código de Incidente (Encargado)
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#1B6F7D',
              letterSpacing: '1px',
              marginTop: '4px',
            }}
          >
            {datos.codigoIncidente}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            Estado: <strong>SIN_ATENDER</strong>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ECEFF3',
            borderLeft: '4px solid #4FAE9B',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#555', fontWeight: 700 }}>
            Código de Seguimiento del Aviso
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#14505A',
              letterSpacing: '2px',
              marginTop: '4px',
            }}
          >
            {datos.codigoAviso}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            Autoverificado por operador Call Center
          </div>
        </div>
      </div>

      {/* Resumen de los datos del incidente */}
      <div
        style={{
          border: '1px solid #DFE3E8',
          padding: '16px',
          backgroundColor: '#FAFAFA',
          marginBottom: '24px',
          fontSize: '13px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 16px',
        }}
      >
        <div>
          <span style={{ color: '#777' }}>Tipo de afectación:</span>{' '}
          <strong>{datos.tipoAfectacion}</strong>
        </div>
        <div>
          <span style={{ color: '#777' }}>Prioridad:</span>{' '}
          <strong style={{ color: datos.prioridad === 'CRITICA' ? '#C81E1E' : '#14505A' }}>
            {datos.prioridad}
          </strong>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <span style={{ color: '#777' }}>Dirección:</span>{' '}
          <strong>{datos.direccion}</strong>
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onNuevoReporte}
          style={{
            backgroundColor: '#4FAE9B',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>➕</span>
          <span>Ingresar otro reporte</span>
        </button>

        <Link
          href="/"
          style={{
            backgroundColor: '#3B3F45',
            color: '#FFFFFF',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            borderRadius: 0,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
