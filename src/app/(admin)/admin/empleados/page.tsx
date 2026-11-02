'use client';

import React, { useContext, useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import RegistrarEmpleadoModal from '@/components/admin/empleados/RegistrarEmpleadoModal';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import EmpleadoFiltros from '@/components/admin/empleados/EmpleadoFiltros';
import EmpleadoTabla from '@/components/admin/empleados/EmpleadoTabla';
import EmpleadoModificarModal from '@/components/admin/empleados/EmpleadoModificarModal';
import EmpleadoBajaModal from '@/components/admin/empleados/EmpleadoBajaModal';
import { useAdminEmpleados } from '@/hooks/useAdminEmpleados';
import { useEmpleados } from '@/hooks/useEmpleados';
import type { EmpleadoUsuario } from '@/types/empleados';
import styles from './AdminEmpleadosPage.module.css';

/**
 * Vista de Gestión de Personal (Administración).
 * Conforme a docs/ARCHITECTURE.md: Vista delgada orquestadora Master-Detail.
 * Lista permanente a la izquierda y ficha de modificación a la derecha (widget sobrepuesto en móvil).
 */
export default function AdminEmpleadosPage() {
  const [modalRegistroAbierto, setModalRegistroAbierto] = useState(false);
  const [registroVersion, setRegistroVersion] = useState(0);
  const { showSuccess } = useToast();

  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);

  // Control de acceso granular RBAC: acción de registro depende de personal:crear o personal:gestionar
  const puedeRegistrar =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['personal:crear', 'personal:gestionar']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['personal:crear', 'personal:gestionar']) || session.usuarioActivo.esAdmin
      : true;

  // Consulta del módulo depende de personal:leer, personal:gestionar o personal:crear
  const puedeVerDirectorio =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['personal:leer', 'personal:gestionar', 'personal:crear']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['personal:leer', 'personal:gestionar', 'personal:crear']) || session.usuarioActivo.esAdmin
      : true;

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
    estadoOperativoFiltro,
    setEstadoOperativoFiltro,
    especialidadFiltro,
    setEspecialidadFiltro,
    cargoFiltro,
    setCargoFiltro,
    incluirInactivos,
    setIncluirInactivos,
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
    limpiarFiltros,
  } = useEmpleados({ versionActualizacion: versionActualizacion + registroVersion });

  const handleRegistrado = (nuevo: EmpleadoUsuario) => {
    showSuccess(`Funcionario ${nuevo.nombres} ${nuevo.apellidos} registrado exitosamente.`);
    setModalRegistroAbierto(false);
    setRegistroVersion((v) => v + 1);
  };

  // Bloqueo de acceso si el usuario no tiene permisos para consultar el módulo
  if (!puedeVerDirectorio) {
    const rolActual = auth?.usuario?.rolNombre || session?.usuarioActivo?.rol || 'Usuario';
    return (
      <div className={styles.pageContainer}>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Administración' },
            { label: 'Gestión de Personal' },
          ]}
        />
        <AccesoDenegadoState
          rolUsuario={rolActual}
          modulo="Gestión de Personal"
          permisoRequerido="personal:leer"
          mensajePersonalizado="No dispone de los privilegios requeridos para consultar el directorio de personal del SGRAI. Solicite a un Administrador la asignación del permiso correspondiente."
        />
      </div>
    );
  }

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

      {/* Tarjeta de Título Institucional con acción de alta */}
      <PageTitleCard
        title="Gestión de Personal"
        description="Búsqueda, auditoría y asignación de roles, delegaciones y especialidades para personal municipal y de terreno."
        actionSlot={
          puedeRegistrar ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalRegistroAbierto(true)}
              icon={<UserPlus size={16} />}
            >
              + Nuevo Funcionario
            </Button>
          ) : undefined
        }
      />

      {/* Contenedor Principal a ancho completo: Filtros + Tabla con paginación */}
      <div className={styles.tableContainer}>
        <EmpleadoFiltros
          termino={termino}
          setTermino={setTermino}
          delegacionFiltro={delegacionFiltro}
          setDelegacionFiltro={setDelegacionFiltro}
          rolFiltro={rolFiltro}
          setRolFiltro={setRolFiltro}
          estadoFiltro={estadoFiltro}
          setEstadoFiltro={setEstadoFiltro}
          estadoOperativoFiltro={estadoOperativoFiltro}
          setEstadoOperativoFiltro={setEstadoOperativoFiltro}
          especialidadFiltro={especialidadFiltro}
          setEspecialidadFiltro={setEspecialidadFiltro}
          cargoFiltro={cargoFiltro}
          setCargoFiltro={setCargoFiltro}
          incluirInactivos={incluirInactivos}
          setIncluirInactivos={setIncluirInactivos}
          ordenarPor={ordenarPor}
          setOrdenarPor={setOrdenarPor}
          orden={orden}
          setOrden={setOrden}
          delegaciones={catalogos.delegaciones}
          roles={catalogos.roles}
          especialidades={catalogos.especialidades}
          cargando={cargando}
          onLimpiarFiltros={limpiarFiltros}
        />

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
          onLimpiarFiltros={limpiarFiltros}
        />
      </div>

      {/* Modal Institucional de Modificación de Funcionario (HU-12) */}
      <EmpleadoModificarModal
        usuario={usuarioSeleccionado}
        isOpen={Boolean(usuarioSeleccionado)}
        onClose={cancelarSeleccion}
        onEmpleadoActualizado={confirmarActualizacion}
        onDarDeBaja={() => {
          if (usuarioSeleccionado && usuarioSeleccionado.usuario_activo) {
            solicitarBaja(usuarioSeleccionado);
          }
        }}
      />

      {/* Modal de confirmación de baja lógica (HU-13) */}
      <EmpleadoBajaModal
        empleado={empleadoAEliminar}
        eliminando={eliminando}
        onConfirmar={confirmarBaja}
        onCancelar={cancelarBaja}
      />

      {/* Modal Institucional de Registro de Nuevo Funcionario (HU-10) */}
      <RegistrarEmpleadoModal
        isOpen={modalRegistroAbierto}
        onClose={() => setModalRegistroAbierto(false)}
        onEmpleadoRegistrado={handleRegistrado}
      />
    </div>
  );
}
