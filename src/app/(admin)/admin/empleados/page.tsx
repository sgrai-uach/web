'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import EmpleadoFiltros from '@/components/admin/empleados/EmpleadoFiltros';
import EmpleadoTabla from '@/components/admin/empleados/EmpleadoTabla';
import EmpleadoPanelEdicion from '@/components/admin/empleados/EmpleadoPanelEdicion';
import EmpleadoBajaModal from '@/components/admin/empleados/EmpleadoBajaModal';
import { useAdminEmpleados } from '@/hooks/useAdminEmpleados';
import { useEmpleados } from '@/hooks/useEmpleados';
import styles from './AdminEmpleadosPage.module.css';

/**
 * Vista de Gestión de Personal (Administración).
 * Conforme a docs/ARCHITECTURE.md: Vista delgada orquestadora Master-Detail.
 * Lista permanente a la izquierda y ficha de modificación a la derecha (widget sobrepuesto en móvil).
 */
export default function AdminEmpleadosPage() {
  const {
    usuarioSeleccionado,
    versionActualizacion,
    empleadoAEliminar,
    eliminando,
    seleccionarUsuario,
    cancelarSeleccion,
    solicitarBaja,
    cancelarBaja,
    confirmarBaja,
    confirmarActualizacion,
  } = useAdminEmpleados();

  const {
    termino,
    setTermino,
    delegacionFiltro,
    setDelegacionFiltro,
    rolFiltro,
    setRolFiltro,
    estadoFiltro,
    setEstadoFiltro,
    ordenarPor,
    setOrdenarPor,
    orden,
    setOrden,
    paginaActual,
    setPaginaActual,
    limite,
    setLimite,
    totalItems,
    totalPaginas,
    catalogos,
    empleadosPaginados,
    cargando,
  } = useEmpleados({ versionActualizacion });

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Gestión de Personal' },
        ]}
      />

      {/* Disposición Master-Detail: Lista permanente (izquierda) y Formulario (derecha) */}
      <div className={styles.masterDetailGrid}>
        {/* Columna Izquierda: Barra de Búsqueda/Filtros + Lista permanente con paginación */}
        <div className={styles.tableColumn}>
          {/* Barra de Búsqueda y Filtros compactada */}
          <div className={styles.filtersCard}>
            <EmpleadoFiltros
              termino={termino}
              setTermino={setTermino}
              delegacionFiltro={delegacionFiltro}
              setDelegacionFiltro={setDelegacionFiltro}
              rolFiltro={rolFiltro}
              setRolFiltro={setRolFiltro}
              estadoFiltro={estadoFiltro}
              setEstadoFiltro={setEstadoFiltro}
              ordenarPor={ordenarPor}
              setOrdenarPor={setOrdenarPor}
              orden={orden}
              setOrden={setOrden}
              delegaciones={catalogos.delegaciones}
              roles={catalogos.roles}
              cargando={cargando}
            />
          </div>

          <EmpleadoTabla
            empleados={empleadosPaginados}
            cargando={cargando}
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalItems={totalItems}
            limite={limite}
            onCambiarPagina={setPaginaActual}
            onCambiarLimite={(nuevoLimite) => {
              setLimite(nuevoLimite);
              setPaginaActual(1);
            }}
            usuarioSeleccionadoId={usuarioSeleccionado?.usuario_id}
            onSelectUsuario={seleccionarUsuario}
            onDarDeBaja={solicitarBaja}
          />
        </div>

        {/* Columna Derecha: Panel de Modificación (en desktop) / Widget sobrepuesto (en móvil) */}
        <div className={styles.detailColumn}>
          <EmpleadoPanelEdicion
            usuario={usuarioSeleccionado}
            onEmpleadoActualizado={confirmarActualizacion}
            onCerrar={cancelarSeleccion}
            onDarDeBaja={() => {
              if (usuarioSeleccionado && usuarioSeleccionado.usuario_activo) {
                solicitarBaja(usuarioSeleccionado);
              }
            }}
          />
        </div>
      </div>

      {/* Modal de confirmación de baja lógica (HU-13) */}
      <EmpleadoBajaModal
        empleado={empleadoAEliminar}
        eliminando={eliminando}
        onConfirmar={confirmarBaja}
        onCancelar={cancelarBaja}
      />
    </div>
  );
}
