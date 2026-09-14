'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  OPERADORES_CALLCENTER_PREDEFINIDOS,
  type OperadorCallCenter,
} from '@/types/incidente-manual';

export default function CallCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [operadorActivo, setOperadorActivo] = useState<OperadorCallCenter>(
    OPERADORES_CALLCENTER_PREDEFINIDOS[0]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ECEFF3',
      }}
    >
      {/* Franja institucional superior (Sage) */}
      <div
        style={{
          backgroundColor: '#A9CBA4',
          color: '#24272B',
          fontSize: '12px',
          fontWeight: 700,
          padding: '6px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          letterSpacing: '0.3px',
        }}
      >
        <span>MUNICIPALIDAD DE VALDIVIA &bull; DIRECCIÓN DE GESTIÓN DE RIESGOS DE DESASTRES</span>
        <span>Entorno: Mesa Central 1451</span>
      </div>

      {/* Barra de navegación principal (Teal Dark) */}
      <header
        style={{
          backgroundColor: '#14505A',
          color: '#FFFFFF',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #4FAE9B',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '20px',
              letterSpacing: '0.5px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                backgroundColor: '#4FAE9B',
                color: '#FFFFFF',
                width: '28px',
                height: '28px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 900,
              }}
            >
              V
            </span>
            <span>SGRAI</span>
          </Link>

          <span style={{ color: '#A9CBA4', fontSize: '18px' }}>|</span>

          <span style={{ fontSize: '14px', fontWeight: 600, color: '#ECEFF3' }}>
            Centro Call Center
          </span>
        </div>

        {/* Enlaces de navegación de Call Center */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/callcenter/manual"
            style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              padding: '8px 14px',
              backgroundColor: pathname === '/callcenter/manual' ? '#4FAE9B' : '#1B6F7D',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>➕</span>
            <span>Nuevo Reporte Manual</span>
          </Link>

          {/* Selector de operador activo de Call Center */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#24272B',
              padding: '6px 12px',
              fontSize: '12px',
              border: '1px solid #3B3F45',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#4FAE9B',
                display: 'inline-block',
              }}
              title="Operador autenticado con permiso crear_incidente_manual"
            />
            <span style={{ color: '#A9CBA4', fontWeight: 600 }}>Operador:</span>
            <select
              value={operadorActivo.id}
              onChange={(e) => {
                const found = OPERADORES_CALLCENTER_PREDEFINIDOS.find((o) => o.id === e.target.value);
                if (found) setOperadorActivo(found);
              }}
              style={{
                backgroundColor: '#3B3F45',
                color: '#FFFFFF',
                border: 'none',
                padding: '3px 6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 0,
              }}
              aria-label="Seleccionar operador activo de Call Center"
            >
              {OPERADORES_CALLCENTER_PREDEFINIDOS.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nombre}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </header>

      {/* Contenedor principal de la vista */}
      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Pie de página institucional */}
      <footer
        style={{
          backgroundColor: '#24272B',
          color: '#ECEFF3',
          padding: '16px 24px',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: 'auto',
          borderTop: '1px solid #3B3F45',
        }}
      >
        <p style={{ margin: 0 }}>
          SGRAI &bull; Sistema de Gestión de Recursos para Atención de Incidentes &bull; Municipalidad de Valdivia &bull; 2026
        </p>
      </footer>
    </div>
  );
}
