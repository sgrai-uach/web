'use client';

import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import InlineNotice from '@/components/ui/InlineNotice';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import { useOptionalToast } from '@/components/ui/Toast';
import { usePatrullas } from '@/hooks/usePatrullas';
import { PatrullasFiltros } from './PatrullasFiltros';
import { PatrullaCard } from './PatrullaCard';
import { PatrullasSkeleton } from './PatrullasSkeleton';
import styles from './PanelPatrullas.module.css';

export interface PanelPatrullasModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSelectMision?: (misionId: string) => void;
  onSelectIncidente?: (incidenteId: string) => void;
}

export const PanelPatrullasModal: React.FC<PanelPatrullasModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSelectMision,
  onSelectIncidente,
}) => {
  const {
    patrullas,
    meta,
    cargando,
    error,
    esForbidden,
    conectado,
    ultimoEvento,
    filtros,
    setFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
    dotacionResumen,
  } = usePatrullas({ userId, enabled: isOpen });

  const toast = useOptionalToast();
  const ultimoEventoRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && ultimoEvento && ultimoEvento !== ultimoEventoRef.current) {
      ultimoEventoRef.current = ultimoEvento;
      toast?.showInfo(ultimoEvento, 'Actualización de Patrullas', {
        icon: 'patrulla',
      });
    }
  }, [isOpen, ultimoEvento, toast]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="patrullas-modal-title"
      className={styles.modalBackdrop}
      onClick={onClose}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <header className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <ShieldCheck size={20} color="var(--color-accent-mint, #4FAE9B)" aria-hidden="true" />
            <Heading as="h2" variant="h3" color="white" style={{ margin: 0 }}>
              Patrullas Verificadoras en Terreno
            </Heading>
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {meta.total} {meta.total === 1 ? 'patrulla' : 'patrullas'}
            </span>
            <ConnectionStatusBadge connected={conectado} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Cerrar modal de patrullas"
              style={{ color: '#FFFFFF', minHeight: 'auto', padding: '4px' }}
            >
              <X size={20} />
            </Button>
          </div>
        </header>

        {/* Contenido con scroll */}
        <div className={styles.modalBody}>
          {esForbidden ? (
            <CommonAccesoDenegadoState
              modulo="las Patrullas Verificadoras del Centro de Mando"
              mensajePersonalizado="No cuenta con el permiso requerido (misiones:leer) para visualizar la dotación y estado de patrullas verificadoras."
              botonVolverTexto="Cerrar Panel"
              onReintentar={onClose}
            />
          ) : (
            <>
              {/* Barra de Resumen de Dotación */}
              <div className={styles.dotacionBanner} aria-label="Resumen de dotación de patrullas">
                <div className={styles.dotacionItems}>
                  <div className={styles.dotacionStat}>
                    <span>Total registradas:</span>
                    <span className={`${styles.dotacionValor}`}>{dotacionResumen.total}</span>
                  </div>
                  <div className={styles.dotacionStat}>
                    <span>Disponibles:</span>
                    <span className={`${styles.dotacionValor} ${styles.dotacionValorDisponible}`}>
                      {dotacionResumen.disponibles}
                    </span>
                  </div>
                  <div className={styles.dotacionStat}>
                    <span>En Misión / Verificación:</span>
                    <span className={`${styles.dotacionValor} ${styles.dotacionValorMision}`}>
                      {dotacionResumen.enMision}
                    </span>
                  </div>
                  {dotacionResumen.noDisponibles > 0 && (
                    <div className={styles.dotacionStat}>
                      <span>No disponibles:</span>
                      <span className={`${styles.dotacionValor} ${styles.dotacionValorNoDisponible}`}>
                        {dotacionResumen.noDisponibles}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Filtros */}
              <PatrullasFiltros
                filtros={filtros}
                onFiltrosChange={setFiltros}
                onLimpiarFiltros={limpiarFiltros}
                onRefrescar={recargar}
                cargando={cargando}
              />

              {/* Error si ocurre y no es forbidden */}
              {error && !esForbidden && (
                <InlineNotice variant="error">{error}</InlineNotice>
              )}

              {/* Estados de Lista: Carga, Vacío o Grid */}
              {cargando ? (
                <PatrullasSkeleton cantidad={4} />
              ) : patrullas.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck size={36} color="var(--color-primary-teal, #1B6F7D)" />}
                  title={hayFiltrosActivos ? 'No se encontraron patrullas' : 'No hay patrullas registradas'}
                  description={
                    hayFiltrosActivos
                      ? 'No existen patrullas verificadoras que coincidan con los filtros seleccionados.'
                      : 'Actualmente no se registran patrullas verificadoras activas en el sistema municipal.'
                  }
                  action={
                    hayFiltrosActivos ? (
                      <Button type="button" variant="secondary" size="sm" onClick={limpiarFiltros}>
                        Limpiar Filtros
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className={styles.patrullasGrid} data-testid="patrullas-grid">
                  {patrullas.map((patrulla) => (
                    <PatrullaCard
                      key={patrulla.id}
                      patrulla={patrulla}
                      onSelectMision={onSelectMision}
                      onSelectIncidente={onSelectIncidente}
                    />
                  ))}
                </div>
              )}

              {/* Paginación */}
              <Pagination
                pagina={meta.page}
                totalPaginas={meta.totalPages}
                total={meta.total}
                limite={meta.limit}
                onCambiarPagina={cambiarPagina}
                onCambiarLimite={cambiarLimite}
                opcionesLimite={[10, 20, 50]}
                nombreEntidad="patrullas"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelPatrullasModal;
