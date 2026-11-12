'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import {
  desvincularEntidadesEventoAtp,
  obtenerEventoAtp,
  vincularEntidadesEventoAtp,
} from '@/services/eventosAtpService';
import { listarIncidentes } from '@/services/incidentesService';
import { listarEventosPrevencion } from '@/services/prevencionService';
import { listarRecuperaciones } from '@/services/recuperacionService';
import { obtenerEventosAsistenciaSocial } from '@/services/asistenciaSocialService';
import {
  ESTADO_EVENTO_ATP_LABEL,
  obtenerEtiquetaNivelAlerta,
  obtenerEtiquetaTipoAmenaza,
  type EventoAtpDetalleCompleto,
  type TipoEntidadVinculable,
  type VincularEntidadesInputParcial,
} from '@/types/eventoAtp';

interface Candidato {
  id: string;
  codigo: string;
  nombre: string;
  eventoAtpId: string | null;
}

const GRUPOS: Array<{
  tipo: TipoEntidadVinculable;
  titulo: string;
  clave: keyof VincularEntidadesInputParcial;
  campoVinculos: keyof EventoAtpDetalleCompleto['vinculos'];
}> = [
  { tipo: 'INCIDENTE', titulo: 'Incidentes', clave: 'incidenteIds', campoVinculos: 'incidentes' },
  {
    tipo: 'EVENTO_PREVENCION',
    titulo: 'Eventos de prevención',
    clave: 'eventoPrevencionIds',
    campoVinculos: 'eventosPrevencion',
  },
  {
    tipo: 'RECUPERACION',
    titulo: 'Operativos de recuperación',
    clave: 'recuperacionIds',
    campoVinculos: 'recuperaciones',
  },
  {
    tipo: 'EVENTO_ASISTENCIA_SOCIAL',
    titulo: 'Casos de asistencia social',
    clave: 'eventoAsistenciaSocialIds',
    campoVinculos: 'eventosAsistenciaSocial',
  },
];

export default function DetalleEventoAtpPage() {
  const params = useParams<{ id: string }>();
  const eventoAtpId = params?.id;
  const pathname = usePathname() || '';
  const { usuarioActivo, hasPermission } = useSimulatedSession();
  const basePath = pathname.startsWith('/gestion')
    ? '/gestion/admin/eventos-atp'
    : '/admin/eventos-atp';

  const puedeVer =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('eventos_atp:vincular') ||
    hasPermission('eventos_atp:crear');

  const [detalle, setDetalle] = useState<EventoAtpDetalleCompleto | null>(null);
  const [candidatos, setCandidatos] = useState<Record<string, Candidato[]>>({});
  const [seleccion, setSeleccion] = useState<Record<string, Set<string>>>({});
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!eventoAtpId) return;

    setCargando(true);
    setError(null);

    const [resDetalle, incidentes, prevencion, recuperaciones, asistencia] =
      await Promise.all([
        obtenerEventoAtp(eventoAtpId),
        listarIncidentes({ page: 1, limit: 100 }, usuarioActivo.id),
        listarEventosPrevencion({ pagina: 1, limite: 100 }),
        listarRecuperaciones({ pagina: 1, limite: 100 }),
        obtenerEventosAsistenciaSocial({ pagina: 1, limite: 100 }, usuarioActivo.id),
      ]);

    if (!resDetalle.exito || !resDetalle.datos) {
      setError(resDetalle.mensaje);
      setDetalle(null);
      setCargando(false);
      return;
    }

    setDetalle(resDetalle.datos);

    setCandidatos({
      INCIDENTE: incidentes.incidentes.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.tipoAfectacion,
        eventoAtpId: item.eventoAtpId,
      })),
      EVENTO_PREVENCION: prevencion.eventos.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        eventoAtpId: item.eventoAtpId,
      })),
      RECUPERACION: recuperaciones.operativos.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        eventoAtpId: item.eventoAtpId,
      })),
      EVENTO_ASISTENCIA_SOCIAL: asistencia.data.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nombre: item.descripcion,
        eventoAtpId: item.eventoAtpId,
      })),
    });

    setCargando(false);
  }, [eventoAtpId, usuarioActivo.id]);

  useEffect(() => {
    queueMicrotask(() => {
      void cargar();
    });
  }, [cargar]);

  const toggleSeleccion = (clave: string, id: string) => {
    setSeleccion((prev) => {
      const actual = new Set(prev[clave] ?? []);
      if (actual.has(id)) actual.delete(id);
      else actual.add(id);
      return { ...prev, [clave]: actual };
    });
  };

  const seleccionadosPorGrupo = useMemo(() => {
    return GRUPOS.map((grupo) => ({
      ...grupo,
      ids: Array.from(seleccion[grupo.clave] ?? []),
    }));
  }, [seleccion]);

  const totalSeleccionados = seleccionadosPorGrupo.reduce(
    (total, grupo) => total + grupo.ids.length,
    0
  );

  const construirInput = (): VincularEntidadesInputParcial => {
    const input: VincularEntidadesInputParcial = {};
    for (const grupo of seleccionadosPorGrupo) {
      if (grupo.ids.length > 0) {
        input[grupo.clave] = grupo.ids;
      }
    }
    return input;
  };

  const handleVincular = async () => {
    if (!eventoAtpId || totalSeleccionados === 0) return;
    setProcesando(true);
    setError(null);
    setMensaje(null);

    try {
      const resultado = await vincularEntidadesEventoAtp(eventoAtpId, construirInput());
      setMensaje(
        `Se vincularon entidades correctamente. Reasignadas: ${resultado.reasignadas.length}. No encontradas: ${resultado.noEncontradas.length}.`
      );
      setSeleccion({});
      await cargar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible vincular las entidades.');
    } finally {
      setProcesando(false);
    }
  };

  const handleDesvincular = async () => {
    if (!eventoAtpId || totalSeleccionados === 0) return;
    setProcesando(true);
    setError(null);
    setMensaje(null);

    try {
      const resultado = await desvincularEntidadesEventoAtp(eventoAtpId, construirInput());
      setMensaje(
        `Se desvincularon entidades correctamente. No desvinculadas: ${resultado.noDesvinculadas.length}.`
      );
      setSeleccion({});
      await cargar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No fue posible desvincular las entidades.');
    } finally {
      setProcesando(false);
    }
  };

  if (!puedeVer) {
    return (
      <InlineNotice variant="error">
        Se requiere el permiso eventos_atp:vincular para consultar este Evento ATP.
      </InlineNotice>
    );
  }

  if (!eventoAtpId) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Eventos ATP', href: basePath },
          { label: detalle?.codigo ?? 'Detalle' },
        ]}
      />

      {detalle && (
        <PageTitleCard
          title={`${detalle.codigo} · ${detalle.nombre}`}
          badge={ESTADO_EVENTO_ATP_LABEL[detalle.estado]}
          description={`${obtenerEtiquetaTipoAmenaza(detalle.tipoAmenaza)} · Alerta ${obtenerEtiquetaNivelAlerta(detalle.nivelAlerta)} · ${detalle.totalVinculados} entidades vinculadas`}
        />
      )}

      {error && <InlineNotice variant="error">{error}</InlineNotice>}
      {mensaje && <InlineNotice variant="success">{mensaje}</InlineNotice>}

      {cargando ? (
        <p>Cargando detalle del Evento ATP...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={handleVincular}
              disabled={totalSeleccionados === 0 || procesando}
            >
              Vincular seleccionados ({totalSeleccionados})
            </Button>
            <Button
              variant="secondary"
              onClick={handleDesvincular}
              disabled={totalSeleccionados === 0 || procesando}
            >
              Desvincular seleccionados
            </Button>
          </div>

          {GRUPOS.map((grupo) => {
            const vinculadas = detalle?.vinculos[grupo.campoVinculos] ?? [];
            const vinculadasIds = new Set(vinculadas.map((item) => item.id));
            const disponibles = (candidatos[grupo.tipo] ?? []).filter(
              (item) => !vinculadasIds.has(item.id)
            );

            return (
              <section
                key={grupo.tipo}
                style={{
                  border: '1px solid var(--border-color-neutral, #DFE3E8)',
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <h2 style={{ margin: '0 0 12px', fontSize: '16px' }}>
                  {grupo.titulo} ({vinculadas.length} vinculadas)
                </h2>

                {vinculadas.length === 0 && disponibles.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: '#5F676E' }}>
                    Sin entidades disponibles.
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                    {vinculadas.map((item) => (
                      <label key={`v-${item.id}`} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={(seleccion[grupo.clave] ?? new Set()).has(item.id)}
                          onChange={() => toggleSeleccion(grupo.clave, item.id)}
                        />
                        <span>
                          <strong>{item.codigo}</strong> · {item.nombre ?? 'Sin nombre'}
                          <em style={{ marginLeft: '6px', color: '#1B6F7D' }}>(vinculada)</em>
                        </span>
                      </label>
                    ))}

                    {disponibles.map((item) => (
                      <label key={`d-${item.id}`} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                        <input
                          type="checkbox"
                          checked={(seleccion[grupo.clave] ?? new Set()).has(item.id)}
                          onChange={() => toggleSeleccion(grupo.clave, item.id)}
                        />
                        <span>
                          <strong>{item.codigo}</strong> · {item.nombre ?? 'Sin nombre'}
                          {item.eventoAtpId && item.eventoAtpId !== eventoAtpId && (
                            <em style={{ marginLeft: '6px', color: '#B45309' }}>(otro evento ATP)</em>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}

      <Link href={basePath}>← Volver al listado de Eventos ATP</Link>
    </div>
  );
}
