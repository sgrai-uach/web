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

export default function RecursosPage() {
  // Usuario simulado para pruebas de RBAC (por defecto Administrador)
  const [usuarioActivoId, setUsuarioActivoId] = useState<string>(DEFAULT_ADMIN_USER_ID);

  // Estado unificado de filtros y paginación
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

  // Manejadores de cambios en filtros (reinician a la página 1)
  const handleCambiarBusqueda = useCallback((busqueda: string) => {
    setFiltros((prev) => ({
      ...prev,
      busqueda,
      pagina: 1,
    }));
  }, []);

  const handleCambiarEstado = useCallback((estado?: EstadoRecurso) => {
    setFiltros((prev) => ({
      ...prev,
      estado,
      pagina: 1,
    }));
  }, []);

  const handleCambiarDelegacion = useCallback((delegacionId?: string) => {
    setFiltros((prev) => ({
      ...prev,
      delegacionId,
      pagina: 1,
    }));
  }, []);

  const handleCambiarEsIndividual = useCallback((esIndividual?: boolean) => {
    setFiltros((prev) => ({
      ...prev,
      esIndividual,
      pagina: 1,
    }));
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

  // Manejadores de Paginación
  const handleCambiarPagina = useCallback((nuevaPagina: number) => {
    setFiltros((prev) => ({
      ...prev,
      pagina: nuevaPagina,
    }));
  }, []);

  const handleCambiarLimite = useCallback((nuevoLimite: number) => {
    setFiltros((prev) => ({
      ...prev,
      limite: nuevoLimite,
      pagina: 1,
    }));
  }, []);

  // Cambiar usuario para simulación de RBAC
  const handleCambiarUsuario = (nuevoId: string) => {
    setUsuarioActivoId(nuevoId);
  };

  const handleRestablecerAAdmin = () => {
    setUsuarioActivoId(DEFAULT_ADMIN_USER_ID);
  };

  // Determinar si hay filtros activos más allá de la paginación por defecto
  const esFiltroActivo =
    Boolean(filtros.busqueda && filtros.busqueda.trim() !== '') ||
    Boolean(filtros.estado) ||
    Boolean(filtros.delegacionId) ||
    filtros.esIndividual !== undefined;

  // Manejo de Bloqueo RBAC (403 Forbidden)
  if (statusCode === 403) {
    const usuarioActual = USUARIOS_PRUEBA.find((u) => u.id === usuarioActivoId);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <RecursosHeader
          totalRecursos={0}
          usuarioActivoId={usuarioActivoId}
          onCambiarUsuario={handleCambiarUsuario}
        />
        <AccesoDenegadoState
          rolUsuario={usuarioActual?.nombre || 'Perfil sin privilegios'}
          onCambiarAAdmin={handleRestablecerAAdmin}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabecera, Breadcrumbs y Botón de Creación */}
      <RecursosHeader
        totalRecursos={meta.total}
        usuarioActivoId={usuarioActivoId}
        onCambiarUsuario={handleCambiarUsuario}
      />

      {/* Manejo de Error 500 u otros errores de conexión */}
      {error && statusCode !== 403 && (
        <div
          style={{
            backgroundColor: '#FFEBEE',
            border: '1px solid #EF9A9A',
            borderLeft: '4px solid #C62828',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
          role="alert"
        >
          <div>
            <strong style={{ color: '#C62828', display: 'block', fontSize: '14px' }}>
              Error al conectar con el servidor de inventario
            </strong>
            <span style={{ color: '#3B3F45', fontSize: '13px' }}>{error.message}</span>
          </div>

          <button
            type="button"
            onClick={() => recargar()}
            style={{
              backgroundColor: '#C62828',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar conexión
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros en Servidor */}
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

      {/* Tabla de Inventario de Recursos */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <RecursosTabla
          recursos={recursos}
          cargando={cargando}
          esFiltroActivo={esFiltroActivo}
          onLimpiarFiltros={handleLimpiarFiltros}
        />

        {/* Paginación en Servidor */}
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
