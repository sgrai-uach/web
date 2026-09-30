import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { ApiError, listarRolesYPermisos, obtenerDetalleRol } from '@/services/seguridadService';
import { getErrorMessage } from '@/lib/utils/errorUtils';
import type {
  FiltroEstadoPermisos,
  FiltroTipoRol,
  MetricasRoles,
  RolItem,
} from '@/types/seguridad';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';

export function useRolesPermisos() {
  const { showError, showSuccess } = useToast();
  const { usuarioActivo, setUsuarioActivo, refrescarPermisos } = useSimulatedSession();

  const [roles, setRoles] = useState<RolItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorRbac, setErrorRbac] = useState(false);

  const [rolSeleccionado, setRolSeleccionado] = useState<RolItem | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoRol>('TODOS');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoPermisos>('TODOS');

  const cargarRoles = useCallback(
    async (usuarioId: string, silent = false) => {
      if (!silent) setCargando(true);
      try {
        const respuesta = await listarRolesYPermisos(usuarioId);
        setRoles(respuesta.data || []);
        setErrorRbac(false);
        if (silent) {
          showSuccess('Listado de perfiles actualizado', 'Sincronizado');
        }
      } catch (err: unknown) {
        if (err instanceof ApiError && err.isForbidden) {
          setErrorRbac(true);
          setRoles([]);
        } else {
          showError(
            getErrorMessage(err),
            'Error al cargar perfiles'
          );
        }
      } finally {
        if (!silent) setCargando(false);
      }
    },
    [showError, showSuccess]
  );

  useEffect(() => {
    let activo = true;

    async function fetchData() {
      try {
        const respuesta = await listarRolesYPermisos(usuarioActivo.id);
        if (activo) {
          setRoles(respuesta.data || []);
          setErrorRbac(false);
          setCargando(false);
        }
      } catch (err: unknown) {
        if (activo) {
          if (err instanceof ApiError && err.isForbidden) {
            setErrorRbac(true);
            setRoles([]);
          } else {
            showError(
              getErrorMessage(err),
              'Error al cargar perfiles'
            );
          }
          setCargando(false);
        }
      }
    }

    fetchData();

    return () => {
      activo = false;
    };
  }, [usuarioActivo.id, showError]);

  const handleRefrescarManual = useCallback(async () => {
    setRefrescando(true);
    await cargarRoles(usuarioActivo.id, true);
    setRefrescando(false);
  }, [cargarRoles, usuarioActivo.id]);

  const metricas = useMemo<MetricasRoles>(() => {
    const codigosUnicos = new Set<string>();
    let perfilesSistema = 0;
    let perfilesConPermisos = 0;
    let perfilesSinPermisos = 0;

    roles.forEach((r) => {
      if (r.esSistema) perfilesSistema += 1;
      if (r.cantidadPermisos > 0) {
        perfilesConPermisos += 1;
      } else {
        perfilesSinPermisos += 1;
      }

      if (r.permisos && r.permisos.length > 0) {
        r.permisos.forEach((p) => {
          if (p.codigo) codigosUnicos.add(p.codigo);
        });
      }
    });

    return {
      totalPerfiles: roles.length,
      perfilesSistema,
      perfilesConPermisos,
      perfilesSinPermisos,
      totalPermisosUnicos: codigosUnicos.size,
    };
  }, [roles]);

  const rolesFiltrados = useMemo(() => {
    return roles.filter((rol) => {
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideNombre = rol.nombre.toLowerCase().includes(query);
        const coincideDesc = rol.descripcion?.toLowerCase().includes(query) || false;
        const coincideModulo = rol.permisos?.some((p) =>
          p.modulo.toLowerCase().includes(query)
        );
        const coincidePermiso = rol.permisos?.some((p) =>
          p.nombre.toLowerCase().includes(query) || p.codigo.toLowerCase().includes(query)
        );

        if (!coincideNombre && !coincideDesc && !coincideModulo && !coincidePermiso) {
          return false;
        }
      }

      if (filtroTipo === 'SISTEMA' && !rol.esSistema) return false;
      if (filtroTipo === 'PERSONALIZADO' && rol.esSistema) return false;

      if (filtroEstado === 'CON_PERMISOS' && rol.cantidadPermisos === 0) return false;
      if (filtroEstado === 'SIN_PERMISOS' && rol.cantidadPermisos > 0) return false;

      return true;
    });
  }, [roles, busqueda, filtroTipo, filtroEstado]);

  const busquedaActiva =
    Boolean(busqueda.trim()) || filtroTipo !== 'TODOS' || filtroEstado !== 'TODOS';

  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('TODOS');
    setFiltroEstado('TODOS');
  };

  const handleRolActualizado = useCallback(async () => {
    await cargarRoles(usuarioActivo.id, true);
    await refrescarPermisos();
    if (rolSeleccionado) {
      try {
        const detalle = await obtenerDetalleRol(rolSeleccionado.id, usuarioActivo.id);
        if (detalle?.data) {
          setRolSeleccionado(detalle.data);
        }
      } catch {
        // Fallback silencioso si falla el detalle individual; cargarRoles ya refrescó el listado
      }
    }
  }, [cargarRoles, usuarioActivo.id, rolSeleccionado, refrescarPermisos]);

  return {
    usuarioActivo,
    setUsuarioActivo,
    roles: rolesFiltrados,
    cargando,
    refrescando,
    errorRbac,
    rolSeleccionado,
    setRolSeleccionado,
    handleRolActualizado,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    filtroEstado,
    setFiltroEstado,
    handleRefrescarManual,
    metricas,
    busquedaActiva,
    limpiarFiltros,
  };
}
