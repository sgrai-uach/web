'use client';

import React from 'react';
import type { DuplicadoItem } from '@/types/incidente-manual';

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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
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
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h2
              id="modal-duplicados-titulo"
              style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.2px' }}
            >
              Posible Incidente Duplicado Detectado
            </h2>
          </div>
        </div>

        {/* Cuerpo del modal */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#2B2B2B', lineHeight: 1.5 }}>
            {mensaje ||
              'Se han registrado los siguientes incidentes o avisos similares en la misma zona durante las últimas 24 horas:'}
          </p>

          {/* Tabla de coincidencias */}
          <div style={{ border: '1px solid #DFE3E8', marginBottom: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#ECEFF3', borderBottom: '2px solid #3B3F45' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Código</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Tipo</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Dirección</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Distancia</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, color: '#14505A' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {coincidencias.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    style={{
                      borderBottom: '1px solid #DFE3E8',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1B6F7D' }}>
                      {item.codigo}
                    </td>
                    <td style={{ padding: '10px 12px' }}>{item.tipoAfectacion}</td>
                    <td style={{ padding: '10px 12px', maxWidth: '200px', wordBreak: 'break-word' }}>
                      {item.direccion}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      {Math.round(item.distanciaMetros)} m
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#ECEFF3',
                          color: '#3B3F45',
                          border: '1px solid #CFD8DC',
                        }}
                      >
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
          <button
            type="button"
            onClick={onOmitir}
            disabled={enviando}
            style={{
              backgroundColor: '#3B3F45',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: enviando ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            Omitir reporte
          </button>

          <button
            type="button"
            onClick={onContinuar}
            disabled={enviando}
            style={{
              backgroundColor: '#4FAE9B',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 22px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: enviando ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            {enviando ? 'Guardando...' : 'Continuar de todos modos'}
          </button>
        </div>
      </div>
    </div>
  );
}
