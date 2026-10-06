import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
  actualizarPermisosRol,
  agruparCatalogoPorModulo,
  obtenerCatalogoPermisos,
  PERMISOS_DEFAULT_SISTEMA,
} from '@/services/seguridadService';
import type { PermisoCatalogoItem, RolItem } from '@/types/seguridad';

interface UseGestionPermisosParams {
  rol: RolItem | null;
  usuarioId: string;
  onExito?: () => void;
}

export function useGestionPermisos({ rol, usuarioId, onExito }: UseGestionPermisosParams) {
  const { showError, showSuccess } = useToast();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [catalogo, setCatalogo] = useState<PermisoCatalogoItem[]>([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(() => {
    return new Set(rol?.permisos ? rol.permisos.map((p) => p.id) : []);
  });
  const [busqueda, setBusqueda] = useState('');
  const [prevRolId, setPrevRolId] = useState<string | null>(rol?.id || null);

  // Sincronizar selección, búsqueda y resetear modo edición cuando cambia el rol
  if (rol && rol.id !== prevRolId) {
    setPrevRolId(rol.id);
    setSeleccionados(new Set(rol.permisos ? rol.permisos.map((p) => p.id) : []));
    setBusqueda('');
    setModoEdicion(false);
  }

  // Identificar IDs iniciales asignados al rol
  const idsIniciales = useMemo(() => {
    if (!rol || !rol.permisos) return new Set<string>();
    return new Set(rol.permisos.map((p) => p.id));
  }, [rol]);

  // Bloquear desmarcación de permisos críticos en perfil Administrador (gestionar y leer)
  const permisosBloqueados = useMemo(() => {
    const bloqueados = new Set<string>();
    if (!rol || rol.nombre !== 'Administrador') return bloqueados;

    catalogo.forEach((p) => {
      if (
        p.codigo === 'seguridad:roles:gestionar' ||
        p.codigo === 'seguridad:roles:leer'
      ) {
        bloqueados.add(p.id);
      }
    });
    return bloqueados;
  }, [rol, catalogo]);

  // Cargar catálogo de permisos al abrir el rol
  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargandoCatalogo(true);
      try {
        const items = await obtenerCatalogoPermisos(usuarioId);
        if (activo) {
          const codigosExistentes = new Set(items.map((p) => p.codigo));
          const defaults = Array.isArray(PERMISOS_DEFAULT_SISTEMA) ? PERMISOS_DEFAULT_SISTEMA : [];
          const itemsFaltantes = defaults.filter(
            (p) => !codigosExistentes.has(p.codigo)
          );
          setCatalogo([...items, ...itemsFaltantes]);
        }
      } catch {
        if (activo) {
          showError(
            'No fue posible cargar el catálogo de permisos desde el servidor.',
            'Error de Catálogo'
          );
        }
      } finally {
        if (activo) setCargandoCatalogo(false);
      }
    }

    if (rol) {
      cargar();
    }

    return () => {
      activo = false;
    };
  }, [rol, usuarioId, showError]);

  const togglePermiso = useCallback(
    (permisoId: string) => {
      if (permisosBloqueados.has(permisoId)) return;

      setSeleccionados((prev) => {
        const next = new Set(prev);
        if (next.has(permisoId)) {
          next.delete(permisoId);
        } else {
          next.add(permisoId);
        }
        return next;
      });
    },
    [permisosBloqueados]
  );

  const marcarModulo = useCallback((permisoIds: string[]) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      permisoIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const desmarcarModulo = useCallback(
    (permisoIds: string[]) => {
      setSeleccionados((prev) => {
        const next = new Set(prev);
        permisoIds.forEach((id) => {
          if (!permisosBloqueados.has(id)) {
            next.delete(id);
          }
        });
        return next;
      });
    },
    [permisosBloqueados]
  );

  const catalogoFiltrado = useMemo(() => {
    if (!busqueda.trim()) return catalogo;
    const q = busqueda.toLowerCase().trim();
    return catalogo.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.modulo.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }, [catalogo, busqueda]);

  const modulosAgrupados = useMemo(() => {
    return agruparCatalogoPorModulo(catalogoFiltrado);
  }, [catalogoFiltrado]);

  const agregadosCount = useMemo(() => {
    let count = 0;
    seleccionados.forEach((id) => {
      if (!idsIniciales.has(id)) count += 1;
    });
    return count;
  }, [seleccionados, idsIniciales]);

  const revocadosCount = useMemo(() => {
    let count = 0;
    idsIniciales.forEach((id) => {
      if (!seleccionados.has(id)) count += 1;
    });
    return count;
  }, [seleccionados, idsIniciales]);

  const tieneCambios = agregadosCount > 0 || revocadosCount > 0;

  const activarModoEdicion = useCallback(() => {
    setModoEdicion(true);
  }, []);

  const cancelarEdicion = useCallback(() => {
    setSeleccionados(new Set(idsIniciales));
    setBusqueda('');
    setModoEdicion(false);
  }, [idsIniciales]);

  const guardarCambios = useCallback(async () => {
    if (!rol || !tieneCambios) return;

    setGuardando(true);
    try {
      const res = await actualizarPermisosRol(
        rol.id,
        Array.from(seleccionados),
        usuarioId
      );
      showSuccess(res.message, 'Permisos Guardados');

      if (typeof window !== 'undefined' && rol) {
        try {
          const codigosSeleccionados = catalogo
            .filter((p) => seleccionados.has(p.id))
            .map((p) => p.codigo);
          localStorage.setItem(
            `sgrai_simulated_perms_${rol.nombre}`,
            JSON.stringify(codigosSeleccionados)
          );
          localStorage.setItem(
            `sgrai_simulated_perms_${rol.id}`,
            JSON.stringify(codigosSeleccionados)
          );
        } catch {
          // Ignorar fallos de localStorage
        }
      }

      setModoEdicion(false);
      if (onExito) onExito();
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : 'Error inesperado al guardar permisos',
        'Error al Guardar'
      );
    } finally {
      setGuardando(false);
    }
  }, [rol, tieneCambios, seleccionados, usuarioId, showSuccess, showError, onExito, catalogo]);

  return {
    modoEdicion,
    activarModoEdicion,
    cancelarEdicion,
    catalogo,
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
  };
}
