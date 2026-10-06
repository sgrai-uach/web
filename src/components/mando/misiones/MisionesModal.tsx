'use client';

import React from 'react';
import { X, Compass } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import Pagination from '@/components/common/Pagination';
import { useMisiones } from '@/hooks/useMisiones';
import { MisionesFiltros } from './MisionesFiltros';
import { MisionesTabla } from './MisionesTabla';

interface MisionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const MisionesModal: React.FC<MisionesModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const {
    misiones,
    meta,
    cargando,
    filtros,
    setFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
  } = useMisiones(userId);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="misiones-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          zIndex: 2010,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-accent-mint, #4FAE9B)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="var(--color-accent-mint, #4FAE9B)" aria-hidden="true" />
            <Heading as="h2" variant="h3" color="white" style={{ margin: 0 }}>
              Misiones Operativas en Terreno
            </Heading>
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {meta.total} {meta.total === 1 ? 'misión' : 'misiones'}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Cerrar modal de misiones"
            style={{ color: '#FFFFFF', minHeight: 'auto', padding: '4px' }}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Contenido con Scroll */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}
        >
          {/* Filtros híbridos estandarizados */}
          <MisionesFiltros
            filtros={filtros}
            onFiltrosChange={setFiltros}
            onLimpiarFiltros={limpiarFiltros}
            onRefrescar={recargar}
            cargando={cargando}
          />

          {/* Listado / Tabla */}
          <MisionesTabla
            misiones={misiones}
            cargando={cargando}
            hayFiltrosActivos={hayFiltrosActivos}
            onLimpiarFiltros={limpiarFiltros}
          />

          {/* Paginación */}
          <Pagination
            pagina={meta.page}
            totalPaginas={meta.totalPages}
            total={meta.total}
            limite={meta.limit}
            onCambiarPagina={cambiarPagina}
            onCambiarLimite={cambiarLimite}
            nombreEntidad="misiones"
          />
        </div>
      </div>
    </div>
  );
};

export default MisionesModal;
