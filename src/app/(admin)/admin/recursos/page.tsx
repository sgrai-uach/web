'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FiltrosRecursosState, EstadoRecurso, RecursoItem } from '@/types/recurso';
import { useRecursos, USUARIOS_PRUEBA } from '@/hooks/useRecursos';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import RecursosHeader from '@/components/admin/recursos/RecursosHeader';
import RecursosFiltros from '@/components/admin/recursos/RecursosFiltros';
import RecursosTabla from '@/components/admin/recursos/RecursosTabla';
import RecursoEliminarModal from '@/components/admin/recursos/RecursoEliminarModal';
import Pagination from '@/components/common/Pagination';
import AccesoDenegadoState from '@/components/admin/recursos/AccesoDenegadoState';

import { toUserFriendlyErrorMessage } from '@/lib/utils/errorUtils';

export default function RecursosPage() {
  const { showError, showSuccess } = useToast();
  const [usuarioActivoId, setUsuarioActivoId] = useState<string>(DEFAULT_ADMIN_USER_ID);
  const [recursoAEliminar, setRecursoAEliminar] = useState<RecursoItem | null>(null);

  const [filtros, setFiltros] = useState<FiltrosRecursosState>({
    pagina: 1,
    limite: 10,
    busqueda: '',
    estado: undefined,
    delegacionId: undefined,
    esIndividual: undefined,
  });

  const { recursos, meta, cargando, error, statusCode, removerRecursoDeLista } = useRecursos(
    filtros,
    usuarioActivoId
  );

  const usuarioActual = USUARIOS_PRUEBA.find((u) => u.id === usuarioActivoId);
  const esAdmin = usuarioActual ? usuarioActual.rol === 'Administrador' : usuarioActivoId === DEFAULT_ADMIN_USER_ID;

  const handleEliminacionExitosa = useCallback(
    (recursoEliminado: RecursoItem) => {
      removerRecursoDeLista(recursoEliminado.id);
      showSuccess(
        `El recurso "${recursoEliminado.nombre}" ha sido dado de baja exitosamente del inventario activo.`,
        'Baja de Recurso Confirmada'
      );
    },
    [removerRecursoDeLista, showSuccess]
  );

  useEffect(() => {
    if (error && statusCode !== 403) {
      showError(toUserFriendlyErrorMessage(error), 'Error al cargar recursos');
    }
  }, [error, statusCode, showError]);

  const handleCambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  }, []);

  const handleCambiarEstado = useCallback((estado?: EstadoRecurso) => {
    setFiltros((prev) => ({ ...prev, estado, pagina: 1 }));
  }, []);

  const handleCambiarDelegacion = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({ ...prev, delegacionId, pagina: 1 }));
  }, []);

  const handleCambiarEsIndividual = useCallback((esIndividual?: boolean) => {
    setFiltros((prev) => ({ ...prev, esIndividual, pagina: 1 }));
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltros({
      pagina: 1,
      limite: 10,
      busqueda: '',
      estado: undefined,
      delegacionId: undefined,
      esIndividual: undefined,
    });
  }, []);

  const handleCambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltros((prev) => ({ ...prev, pagina: nuevaPagina }));
  }, []);

  const handleCambiarLimite = useCallback((nuevoLimite: number) => {
    setFiltros((prev) => ({ ...prev, limite: nuevoLimite, pagina: 1 }));
  }, []);

  const esFiltroActivo =
    Boolean(filtros.busqueda && filtros.busqueda.trim() !== '') ||
    Boolean(filtros.estado) ||
    Boolean(filtros.delegacionId) ||
    filtros.esIndividual !== undefined;

  if (statusCode === 403) {
    const usuarioActual = USUARIOS_PRUEBA.find((u) => u.id === usuarioActivoId);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <RecursosHeader
          totalRecursos={0}
          usuarioActivoId={usuarioActivoId}
          onCambiarUsuario={setUsuarioActivoId}
        />
        <AccesoDenegadoState
          rolUsuario={usuarioActual?.nombre || 'Perfil sin privilegios'}
          onCambiarAAdmin={() => setUsuarioActivoId(DEFAULT_ADMIN_USER_ID)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <RecursosHeader
        totalRecursos={meta.total}
        usuarioActivoId={usuarioActivoId}
        onCambiarUsuario={setUsuarioActivoId}
      />

      <RecursosFiltros
        busqueda={filtros.busqueda || ''}
        estado={filtros.estado}
        delegacionId={filtros.delegacionId}
        esIndividual={filtros.esIndividual}
        onCambiarBusqueda={handleCambiarBusqueda}
        onCambiarEstado={handleCambiarEstado}
        onCambiarDelegacion={handleCambiarDelegacion}
        onCambiarEsIndividual={handleCambiarEsIndividual}
        onLimpiarFiltros={handleLimpiarFiltros}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <RecursosTabla
          recursos={recursos}
          cargando={cargando}
          esFiltroActivo={esFiltroActivo}
          onLimpiarFiltros={handleLimpiarFiltros}
          onEliminarRecurso={setRecursoAEliminar}
          puedeEliminar={esAdmin}
        />

        <Pagination
          pagina={meta.pagina}
          limite={meta.limite}
          total={meta.total}
          totalPaginas={meta.totalPaginas}
          onCambiarPagina={handleCambiarPagina}
          onCambiarLimite={handleCambiarLimite}
          nombreEntidad="recursos registrados"
        />
      </div>

      {/* Modal Interactivo de Confirmación de Baja Lógica */}
      <RecursoEliminarModal
        isOpen={Boolean(recursoAEliminar)}
        recurso={recursoAEliminar}
        usuarioActivoId={usuarioActivoId}
        onCerrar={() => setRecursoAEliminar(null)}
        onEliminacionExitosa={handleEliminacionExitosa}
      />
    </div>
  );
}

