'use client';

import React from 'react';
import { useIncidentesKanban } from '@/hooks/useIncidentesKanban';
import { DEFAULT_ENCARGADO_ID } from '@/services/incidentesService';
import { KanbanHeader } from './KanbanHeader';
import { KanbanFiltros } from './KanbanFiltros';
import { KanbanColumn } from './KanbanColumn';
import { IncidenteDetalleDrawer } from './IncidenteDetalleDrawer';
import { AccesoDenegado } from './AccesoDenegado';
import { Zap } from 'lucide-react';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from '@/styles/mando.module.css';

const TITULOS_COLUMNAS = {
  REPORTADO: 'Pendiente / Reportado',
  VERIFICANDO: 'En Verificación',
  EN_ATENCION: 'En Atención',
  RESUELTO: 'Resuelto',
  NO_ABORDABLE: 'No Abordable',
} as const;

import { useState } from 'react';
import { MisionesModal } from './misiones/MisionesModal';

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

  return (
    <div className={styles.pageContainer}>
      <KanbanHeader
        totalIncidentesVisibles={totalIncidentesVisibles}
        conectado={conectado}
        userId={userId}
        setUserId={setUserId}
      />

      {esForbidden ? (
        <AccesoDenegado onReintentar={() => setUserId(DEFAULT_ENCARGADO_ID)} />
      ) : (
        <>
          <KanbanFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onLimpiarFiltros={limpiarFiltros}
            onRecargar={recargar}
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

