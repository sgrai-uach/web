'use client';

import React, { useState } from 'react';
import {
  useIncidentesKanban,
  ESTADOS_KANBAN,
} from '@/hooks/useIncidentesKanban';
import { useIncidentesKpis } from '@/hooks/useIncidentesKpis';
import { DEFAULT_ENCARGADO_ID, type EstadoIncidente } from '@/services/incidentesService';
import { KanbanHeader } from './KanbanHeader';
import { KanbanFiltros } from './KanbanFiltros';
import { KanbanColumn } from './KanbanColumn';
import { IncidentesKpiCards } from './IncidentesKpiCards';
import { IncidenteDetalleDrawer } from './IncidenteDetalleDrawer';
import { AccesoDenegado } from './AccesoDenegado';
import { Zap } from 'lucide-react';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from '@/styles/mando.module.css';
import { MisionesModal } from './misiones/MisionesModal';

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
    estadosVisibles,
    limpiarFiltros,
    cargarMas,
    recargar,
    conectado,
    ultimoEvento,
    totalIncidentesVisibles,
    incidenteSeleccionadoId,
    setIncidenteSeleccionadoId,
  } = useIncidentesKanban();

  const [misionesModalAbierto, setMisionesModalAbierto] = useState<boolean>(false);
  const [estadoEnfocado, setEstadoEnfocado] = useState<EstadoIncidente | null>(null);

  const {
    kpis,
    cargando: cargandoKpis,
    delegacionId,
    setDelegacionId,
    delegaciones,
    refrescarKpis,
    conectado: conectadoKpis,
  } = useIncidentesKpis({ userId });

  // Manejo de cambio de delegación sincronizado entre KPIs y Kanban
  const handleDelegacionChange = (nuevaDelegacionId: string) => {
    setDelegacionId(nuevaDelegacionId);
    setFiltros({
      ...filtros,
      delegacionId: nuevaDelegacionId || undefined,
    });
  };

  // Manejo de clic en tarjeta de estado (Opción B: enfocar columna y activar soloHoy)
  const handleSelectEstado = (estado: EstadoIncidente) => {
    if (estadoEnfocado === estado) {
      setEstadoEnfocado(null);
    } else {
      setEstadoEnfocado(estado);
      // Activar filtro "soloHoy"
      if (!filtros.soloHoy) {
        setFiltros({
          ...filtros,
          soloHoy: true,
        });
      }
      // Desplazamiento suave hacia la columna seleccionada
      setTimeout(() => {
        const colEl = document.getElementById(`kanban-col-${estado}`);
        if (colEl) {
          colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  const handleRefrescoCompleto = () => {
    refrescarKpis(true);
    recargar();
  };

  return (
    <div className={styles.pageContainer}>
      <KanbanHeader
        totalIncidentesVisibles={totalIncidentesVisibles}
        conectado={conectado}
        userId={userId}
        setUserId={setUserId}
      />

      {esForbidden ? (
        <AccesoDenegado />
      ) : (
        <>
          <IncidentesKpiCards
            kpis={kpis}
            cargando={cargandoKpis}
            delegacionId={delegacionId}
            onDelegacionChange={handleDelegacionChange}
            delegaciones={delegaciones}
            onRefrescar={handleRefrescoCompleto}
            estadoSeleccionado={estadoEnfocado}
            onSelectEstado={handleSelectEstado}
            conectado={conectadoKpis || conectado}
          />

          <KanbanFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onLimpiarFiltros={limpiarFiltros}
            onRecargar={handleRefrescoCompleto}
            cargando={cargando}
            onAbrirMisiones={() => setMisionesModalAbierto(true)}
          />

          {ultimoEvento && (
            <div
              style={{
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                color: 'var(--color-primary-teal, #1B6F7D)',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderBottom: '1px solid var(--border-color-neutral, #DFE3E8)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Zap size={14} color="var(--color-primary-teal, #1B6F7D)" />
              <span>Actualización en vivo: {ultimoEvento}</span>
            </div>
          )}

          {error && !esForbidden && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <InlineNotice variant="error">
                {error}
              </InlineNotice>
            </div>
          )}

          <main className={styles.kanbanArea}>
            <div className={styles.kanbanBoard}>
              {estadosVisibles.map((estado) => (
                <KanbanColumn
                  key={estado}
                  id={`kanban-col-${estado}`}
                  estado={estado}
                  titulo={TITULOS_COLUMNAS[estado]}
                  incidentes={columnas[estado]}
                  paginacion={paginacionColumna[estado]}
                  cargandoMas={cargandoColumna[estado]}
                  resaltada={estadoEnfocado === estado}
                  onCargarMas={cargarMas}
                  onSeleccionarIncidente={(inc) => setIncidenteSeleccionadoId(inc.id)}
                />
              ))}
            </div>
          </main>

          <IncidenteDetalleDrawer
            incidenteId={incidenteSeleccionadoId}
            userId={userId}
            onCerrar={() => setIncidenteSeleccionadoId(null)}
          />

          <MisionesModal
            isOpen={misionesModalAbierto}
            onClose={() => setMisionesModalAbierto(false)}
            userId={userId}
          />
        </>
      )}
    </div>
  );
};
