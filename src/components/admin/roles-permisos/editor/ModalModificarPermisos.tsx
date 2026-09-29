import React from 'react';
import Modal from '@/components/common/Modal';
import Heading from '@/components/ui/Heading';
import PermisosEditorModuloSection from './PermisosEditorModuloSection';
import PermisosEditorFooter from './PermisosEditorFooter';
import { useGestionPermisos } from '@/hooks/useGestionPermisos';
import type { RolItem } from '@/types/seguridad';

interface ModalModificarPermisosProps {
  isOpen: boolean;
  rol: RolItem | null;
  usuarioId: string;
  onClose: () => void;
  onGuardadoExitoso: () => void;
}

export default function ModalModificarPermisos({
  isOpen,
  rol,
  usuarioId,
  onClose,
  onGuardadoExitoso,
}: ModalModificarPermisosProps) {
  const {
    cargandoCatalogo,
    guardando,
    seleccionados,
    permisosBloqueados,
    busqueda,
    setBusqueda,
    modulosAgrupados,
    agregadosCount,
    revocadosCount,
    tieneCambios,
    togglePermiso,
    marcarModulo,
    desmarcarModulo,
    guardarCambios,
  } = useGestionPermisos({
    rol,
    usuarioId,
    onExito: () => {
      onGuardadoExitoso();
      onClose();
    },
  });

  if (!rol) return null;
  const modulosKeys = Object.keys(modulosAgrupados);

  return (
    <Modal
      isOpen={isOpen}
      title={`Modificar Permisos — ${rol.nombre}`}
      onClose={guardando ? () => {} : onClose}
      maxWidth="760px"
      actions={
        <PermisosEditorFooter
          totalSeleccionados={seleccionados.size}
          agregadosCount={agregadosCount}
          revocadosCount={revocadosCount}
          guardando={guardando}
          tieneCambios={tieneCambios}
          onGuardar={guardarCambios}
          onCancelar={onClose}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
            Marque o desmarque los permisos para{' '}
            <strong style={{ color: 'var(--color-charcoal, #3B3F45)' }}>{rol.nombre}</strong>.
            Los cambios se aplicarán a todos los funcionarios con este rol.
          </span>

          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar por nombre, código o módulo..."
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderRadius: 0,
              outline: 'none',
              backgroundColor: '#FFFFFF',
              width: '100%',
              boxSizing: 'border-box',
            }}
            aria-label="Filtrar permisos"
          />
        </div>

        {cargandoCatalogo ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#5F676E', fontSize: '14px' }}>
            Cargando catálogo de permisos del sistema...
          </div>
        ) : modulosKeys.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F8FAFC', border: '1px solid #DFE3E8', borderRadius: 0 }}>
            <Heading as="h4" variant="h4" color="charcoal" noMargin>
              No se encontraron permisos disponibles
            </Heading>
            <span style={{ fontSize: '12px', color: '#5F676E' }}>Intente con otro término de búsqueda.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '52vh', overflowY: 'auto', paddingRight: '4px' }}>
            {modulosKeys.map((modulo) => (
              <PermisosEditorModuloSection
                key={modulo}
                modulo={modulo}
                permisos={modulosAgrupados[modulo]}
                seleccionados={seleccionados}
                permisosBloqueados={permisosBloqueados}
                onTogglePermiso={togglePermiso}
                onMarcarModulo={marcarModulo}
                onDesmarcarModulo={desmarcarModulo}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
