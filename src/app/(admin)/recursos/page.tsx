'use client';

import { useState, useCallback } from 'react';
import type { FiltrosRecursosState, EstadoRecurso } from '@/types/recurso';
import { useRecursos, USUARIOS_PRUEBA } from '@/hooks/useRecursos';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import RecursosHeader from '@/components/admin/recursos/RecursosHeader';
import RecursosFiltros from '@/components/admin/recursos/RecursosFiltros';
import RecursosTabla from '@/components/admin/recursos/RecursosTabla';
import RecursosPaginacion from '@/components/admin/recursos/RecursosPaginacion';
import AccesoDenegadoState from '@/components/admin/recursos/AccesoDenegadoState';
import NotificationBanner from '@/components/common/NotificationBanner';

export default function RecursosPage() {
  const [usuarioActivoId, setUsuarioActivoId] = useState<string>(DEFAULT_ADMIN_USER_ID);

  const [filtros, setFiltros] = useState<FiltrosRecursosState>({
    pagina: 1,
    limite: 10,
    busqueda: '',
    estado: undefined,
    delegacionId: undefined,
    esIndividual: undefined,
  });

  const { recursos, meta, cargando, error, statusCode, recargar } = useRecursos(
    filtros,
    usuarioActivoId
  );

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <RecursosHeader
        totalRecursos={meta.total}
        usuarioActivoId={usuarioActivoId}
        onCambiarUsuario={setUsuarioActivoId}
      />

      {error && statusCode !== 403 && (
        <NotificationBanner
          type="error"
          title="Error al conectar con el servidor de inventario"
          message={error.message}
          onClose={() => recargar()}
        />
      )}

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

        <RecursosPaginacion
          pagina={meta.pagina}
          limite={meta.limite}
          total={meta.total}
          totalPaginas={meta.totalPaginas}
          onCambiarPagina={handleCambiarPagina}
          onCambiarLimite={handleCambiarLimite}
        />
      </div>
    </div>
  );
}
