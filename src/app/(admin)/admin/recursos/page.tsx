'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FiltrosRecursosState, EstadoRecurso } from '@/types/recurso';
import { useRecursos } from '@/hooks/useRecursos';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import RecursosHeader from '@/components/admin/recursos/RecursosHeader';
import RecursosFiltros from '@/components/admin/recursos/RecursosFiltros';
import RecursosTabla from '@/components/admin/recursos/RecursosTabla';
import Pagination from '@/components/common/Pagination';
import AccesoDenegadoState from '@/components/admin/recursos/AccesoDenegadoState';

import { toUserFriendlyErrorMessage } from '@/lib/utils/errorUtils';

export default function RecursosPage() {
  const { showError } = useToast();
  const { usuarioActivo, cambiarUsuarioPorId } = useSimulatedSession();

  const [filtros, setFiltros] = useState<FiltrosRecursosState>({
    pagina: 1,
    limite: 10,
    busqueda: '',
    estado: undefined,
    delegacionId: undefined,
    esIndividual: undefined,
  });

  const { recursos, meta, cargando, error, statusCode } = useRecursos(
    filtros,
    usuarioActivo.id
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
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <RecursosHeader
          totalRecursos={0}
          usuarioActivoId={usuarioActivo.id}
          onCambiarUsuario={cambiarUsuarioPorId}
          tieneAcceso={false}
        />
        <AccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          onCambiarAAdmin={() => cambiarUsuarioPorId(DEFAULT_ADMIN_USER_ID)}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <RecursosHeader
        totalRecursos={meta.total}
        usuarioActivoId={usuarioActivo.id}
        onCambiarUsuario={cambiarUsuarioPorId}
        tieneAcceso={true}
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
    </div>
  );
}
