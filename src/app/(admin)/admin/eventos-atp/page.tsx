'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import CommonAccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import Select from '@/components/ui/Select';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { DEFAULT_ADMIN_USER_ID } from '@/lib/api/client';
import { listarEventosAtp } from '@/services/eventosAtpService';
import type {
  EstadoEventoAtp,
  EventoAtpResumen,
  ListarEventosAtpQuery,
} from '@/types/eventoAtp';
import {
  ESTADOS_EVENTO_ATP,
  ESTADO_EVENTO_ATP_LABEL,
  obtenerEtiquetaNivelAlerta,
  obtenerEtiquetaTipoAmenaza,
} from '@/types/eventoAtp';

export default function EventosAtpPage() {
  const pathname = usePathname() || '';
  const { usuarioActivo, hasPermission } = useSimulatedSession();
  const panelPath = pathname.startsWith('/gestion')
    ? '/gestion/admin'
    : '/admin';
  const basePath = pathname.startsWith('/gestion')
    ? '/gestion/admin/eventos-atp'
    : '/admin/eventos-atp';

  const puedeVer =
    usuarioActivo.rol === 'Administrador' ||
    Boolean(usuarioActivo.esAdmin) ||
    usuarioActivo.id === DEFAULT_ADMIN_USER_ID ||
    hasPermission('eventos_atp:vincular') ||
    hasPermission('eventos_atp:crear');

  const [eventos, setEventos] = useState<EventoAtpResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoEventoAtp | ''>('ACTIVO');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    const query: ListarEventosAtpQuery = {
      page: pagina,
      limit: 10,
      ...(estado ? { estado } : {}),
      ...(busqueda.trim() ? { busqueda: busqueda.trim() } : {}),
    };

    const res = await listarEventosAtp(query);

    if (res.exito) {
      setEventos(res.eventos);
      setTotalPaginas(res.meta?.totalPages ?? 1);
    } else {
      setEventos([]);
      setError(res.mensaje);
    }

    setCargando(false);
  }, [pagina, estado, busqueda]);

  useEffect(() => {
    queueMicrotask(() => {
      void cargar();
    });
  }, [cargar]);

  if (!puedeVer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Administración' },
            { label: 'Eventos ATP' },
          ]}
        />
        <CommonAccesoDenegadoState
          rolUsuario={usuarioActivo.rol}
          modulo="el Catálogo de Eventos ATP"
          mensajePersonalizado="Se requiere el permiso 'eventos_atp:vincular' para consultar y agrupar entidades bajo Eventos ATP."
          botonVolverHref={panelPath}
          botonVolverTexto="Volver al Panel de Administración"
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Administración' },
          { label: 'Eventos ATP' },
        ]}
      />

      <PageTitleCard
        title="Eventos de Alerta Temprana Preventiva"
        badge="Eventos ATP"
        description="Consulte los marcos oficiales de alerta, revise sus entidades vinculadas y gestione la agrupación transversal de incidentes, prevención, recuperación y asistencia social."
      />

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Select
          id="filtro-estado-eventos-atp"
          label="Estado"
          value={estado}
          onChange={(event) => {
            setPagina(1);
            setEstado(event.target.value as EstadoEventoAtp | '');
          }}
          options={[
            { value: '', label: 'Todos los estados' },
            ...ESTADOS_EVENTO_ATP.map((item) => ({
              value: item.value,
              label: item.label,
            })),
          ]}
        />

        <div style={{ minWidth: '280px', flex: 1 }}>
          <label
            htmlFor="busqueda-eventos-atp"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
          >
            Búsqueda
          </label>
          <input
            id="busqueda-eventos-atp"
            type="search"
            value={busqueda}
            onChange={(event) => {
              setPagina(1);
              setBusqueda(event.target.value);
            }}
            placeholder="Código o nombre del evento..."
            style={{ width: '100%', height: '38px', padding: '0 12px', boxSizing: 'border-box' }}
          />
        </div>

        <Button href={`${basePath}/nuevo`} variant="primary">
          + Nuevo Evento ATP
        </Button>
      </div>

      {error && <InlineNotice variant="error">{error}</InlineNotice>}

      {cargando ? (
        <p>Cargando Eventos ATP...</p>
      ) : eventos.length === 0 ? (
        <InlineNotice variant="info">
          No se encontraron Eventos ATP con los filtros seleccionados.
        </InlineNotice>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color-neutral, #DFE3E8)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Código</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Nombre</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Amenaza</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Alerta</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Estado</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Vinculados</th>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id} style={{ borderTop: '1px solid var(--border-color-neutral, #DFE3E8)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{evento.codigo}</td>
                  <td style={{ padding: '10px 12px' }}>{evento.nombre}</td>
                  <td style={{ padding: '10px 12px' }}>{obtenerEtiquetaTipoAmenaza(evento.tipoAmenaza)}</td>
                  <td style={{ padding: '10px 12px' }}>{obtenerEtiquetaNivelAlerta(evento.nivelAlerta)}</td>
                  <td style={{ padding: '10px 12px' }}>{ESTADO_EVENTO_ATP_LABEL[evento.estado]}</td>
                  <td style={{ padding: '10px 12px' }}>{evento.totalVinculados}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <Link href={`${basePath}/${evento.id}`}>Ver detalle</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#5F676E' }}>
          Página {pagina} de {totalPaginas}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
            disabled={pagina <= 1 || cargando}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPagina((prev) => Math.min(totalPaginas, prev + 1))}
            disabled={pagina >= totalPaginas || cargando}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
