'use client';

import React from 'react';
import {
  useIncidentesKanban,
  ESTADOS_KANBAN,
} from '@/hooks/useIncidentesKanban';
import { DEFAULT_ENCARGADO_ID } from '@/lib/api/incidentes';
import { KanbanFiltros } from './KanbanFiltros';
import { KanbanColumn } from './KanbanColumn';
import { IncidenteDetalleDrawer } from './IncidenteDetalleDrawer';
import { AccesoDenegado } from './AccesoDenegado';
import styles from '@/styles/mando.module.css';

const TITULOS_COLUMNAS = {
  REPORTADO: 'Pendiente / Reportado',
  VERIFICANDO: 'En Verificación',
  EN_ATENCION: 'En Atención',
  RESUELTO: 'Resuelto',
  NO_ABORDABLE: 'No Abordable',
} as const;

export const KanbanBoard: React.FC = () => {
  const {
    userId,
    setUserId,
    columnas,
    paginacionColumna,
    cargando,
    cargandoColumna,
    error,
    esForbidden,
    filtros,
    setFiltros,
    cargarMas,
    recargar,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
  } = useIncidentesKanban();

  return (
    <div className={styles.pageContainer}>
      {/* Sub-cabecera Operativa del Centro de Mando */}
      <header className={styles.mandoHeader}>
        <div className={styles.mandoTitleGroup}>
          <h1 className={styles.mandoTitle}>Centro de Incidentes</h1>
          <p className={styles.mandoSubtitle}>
            Dirección de Gestión de Riesgos de Desastres — Tablero Táctico ICS ({totalIncidentesVisibles} incidentes cargados)
          </p>
        </div>

        <div className={styles.mandoHeaderControls}>
          {/* Indicador de conexión en tiempo real */}
          <div
            className={styles.liveIndicator}
            title={
              conectado
                ? 'Conexión activa con el servidor de Socket.io (sala:encargados)'
                : 'Intentando conectar al servicio en tiempo real...'
            }
          >
            <span className={conectado ? styles.liveDot : styles.liveDotOffline} />
            <span>{conectado ? 'Tiempo Real Activo' : 'Reconectando...'}</span>
          </div>

          {/* Selector de Simulación de Usuario (Validación RBAC Criterio 5) */}
          <div className={styles.userSimulatorBox}>
            <span>Sesión:</span>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={styles.userSimulatorSelect}
              aria-label="Simular rol de usuario autenticado"
            >
              <option value={DEFAULT_ENCARGADO_ID}>Encargado (Con Permisos)</option>
              <option value="00000000-0000-4000-8000-000000000099">Usuario No Autorizado (403)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Si el acceso fue denegado por RBAC (403), mostrar vista de error */}
      {esForbidden ? (
        <AccesoDenegado onReintentar={() => setUserId(DEFAULT_ENCARGADO_ID)} />
      ) : (
        <>
          {/* Barra de Filtros */}
          <KanbanFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onRecargar={recargar}
            cargando={cargando}
          />

          {/* Notificación de último evento en vivo recibido */}
          {ultimoEvento && (
            <div
              style={{
                backgroundColor: '#EBF8FF',
                color: '#2B6CB0',
                padding: '0.4rem 1.5rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderBottom: '1px solid #BEE3F8',
              }}
            >
              ⚡ Actualización en vivo: {ultimoEvento}
            </div>
          )}

          {error && !esForbidden && (
            <div
              style={{
                backgroundColor: '#FED7D7',
                color: '#742A2A',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          {/* Área principal del Tablero Kanban */}
          <main className={styles.kanbanArea}>
            <div className={styles.kanbanBoard}>
              {ESTADOS_KANBAN.map((estado) => (
                <KanbanColumn
                  key={estado}
                  estado={estado}
                  titulo={TITULOS_COLUMNAS[estado]}
                  incidentes={columnas[estado]}
                  paginacion={paginacionColumna[estado]}
                  cargandoMas={cargandoColumna[estado]}
                  onCargarMas={cargarMas}
                  onSeleccionarIncidente={(inc) => setIncidenteSeleccionadoId(inc.id)}
                />
              ))}
            </div>
          </main>

          {/* Panel Lateral Deslizante de Detalle */}
          <IncidenteDetalleDrawer
            incidenteId={incidenteSeleccionadoId}
            userId={userId}
            onCerrar={() => setIncidenteSeleccionadoId(null)}
          />
        </>
      )}
    </div>
  );
};
