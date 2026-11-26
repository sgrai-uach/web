import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import MapaOperativoMandoInner from '../MapaOperativoMandoInner';
import type { EventoPrevencionDTO } from '@/types/evento-prevencion';
import type { EventoRecuperacionResponse } from '@/types/recuperacion';

const { bindPopupMock, markerMock } = vi.hoisted(() => {
  const bindPopup = vi.fn();
  const markerInstance = {
    addTo: vi.fn(),
    bindPopup,
    on: vi.fn(),
  };
  markerInstance.addTo.mockReturnValue(markerInstance);
  return {
    bindPopupMock: bindPopup,
    markerMock: vi.fn(() => markerInstance),
  };
});

vi.mock('leaflet', () => {
  const layerGroupInstance = {
    addTo: vi.fn(),
    clearLayers: vi.fn(),
  };
  layerGroupInstance.addTo.mockReturnValue(layerGroupInstance);

  const mapInstance = {
    remove: vi.fn(),
    invalidateSize: vi.fn(),
  };

  const tileLayerInstance = {
    addTo: vi.fn(),
  };

  return {
    default: {
      map: vi.fn(() => mapInstance),
      tileLayer: vi.fn(() => tileLayerInstance),
      layerGroup: vi.fn(() => layerGroupInstance),
      divIcon: vi.fn((opts: unknown) => opts),
      marker: markerMock,
    },
  };
});

describe('MapaOperativoMandoInner — Sanitización XSS en popups (BUG-INT-28)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('escapa etiquetas HTML/XSS en popups de eventos de prevención y sus insumos', () => {
    const eventoPrevencionMalicioso: EventoPrevencionDTO = {
      id: 'prev-xss-1',
      codigo: 'PREV-2026-0001',
      nombre: '<img src=x onerror=alert(1)>Limpieza',
      descripcion: '<script>alert("xss")</script>Despeje preventivo',
      sector: 'Sector "Collico" <svg/onload=alert(2)>',
      direccionTexto: 'Av. <b onmouseover=alert(3)>Alemania</b> 100',
      prioridad: 'ALTA',
      estado: 'EN_EJECUCION',
      latitud: -39.8142,
      longitud: -73.2459,
      puntoCritico: {
        id: 'pc-1',
        codigo: 'PC-<script>1</script>',
        nombre: 'Canal',
      },
      patrulla: {
        id: 'pat-1',
        nombre: 'Patrulla <img src=x>',
        estado: 'EN_PREVENCION',
      },
      mision: {
        id: 'mis-1',
        codigo: 'MIS-<b>1</b>',
        estado: 'DESPACHADA',
      },
      recursos: [
        {
          recursoId: 'rec-1',
          nombre: '<script>evil()</script>Sacos',
          cantidadAsignada: 5,
        },
      ],
      creadoEn: '2026-11-25T10:00:00Z',
    } as unknown as EventoPrevencionDTO;

    render(
      <MapaOperativoMandoInner
        eventosPrevencion={[eventoPrevencionMalicioso]}
        mostrarIncidentes={false}
        mostrarPrevenciones={true}
        mostrarRecuperaciones={false}
      />
    );

    expect(bindPopupMock).toHaveBeenCalledTimes(1);
    const html = String(bindPopupMock.mock.calls[0][0]);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<svg/onload=alert(2)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;Limpieza');
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Despeje preventivo');
    expect(html).toContain('&lt;script&gt;evil()&lt;/script&gt;Sacos');
  });

  it('escapa etiquetas HTML/XSS en popups de eventos de recuperación y codifica el ID en href', () => {
    const eventoRecuperacionMalicioso: EventoRecuperacionResponse = {
      id: 'rec-1" onclick="alert(1)',
      codigo: 'REC-2026-0099',
      nombre: '<script>steal()</script>Entrega Zinc',
      descripcion: null,
      sector: 'Las Ánimas <img src=x onerror=1>',
      direccionTexto: 'Pasaje <b>Sur</b>',
      prioridad: 'CRITICA',
      contactoNombre: null,
      contactoTelefono: null,
      latitud: -39.8142,
      longitud: -73.2459,
      estado: 'PLANIFICADA',
      familiasAfectadas: 3,
      delegacion: null,
      mision: {
        id: 'mis-rec-1',
        codigo: 'MIS-REC-1',
        titulo: 'Entrega',
        estado: 'DESPACHADA',
        tipoMision: 'RECUPERACION',
      },
      patrulla: {
        id: 'pat-rec-1',
        nombre: 'Patrulla <svg onload=x>',
        estado: 'EN_RECUPERACION',
      },
      recursos: [
        {
          recursoId: 'rec-zinc',
          nombre: '<img src=x>Planchas Zinc',
          cantidadAsignada: 12,
        },
      ],
      creadoPorId: 'enc-1',
      creadoEn: '2026-11-25T10:00:00Z',
      actualizadoEn: '2026-11-25T10:00:00Z',
    };

    render(
      <MapaOperativoMandoInner
        eventosRecuperacion={[eventoRecuperacionMalicioso]}
        mostrarIncidentes={false}
        mostrarPrevenciones={false}
        mostrarRecuperaciones={true}
      />
    );

    expect(bindPopupMock).toHaveBeenCalledTimes(1);
    const html = String(bindPopupMock.mock.calls[0][0]);

    expect(html).not.toContain('<script>steal()</script>');
    expect(html).not.toContain('<svg onload=x>');
    expect(html).not.toContain('onclick="alert(1)"');
    expect(html).toContain('&lt;script&gt;steal()&lt;/script&gt;Entrega Zinc');
    expect(html).toContain(
      `href="/eventos-atp/recuperacion/${encodeURIComponent(eventoRecuperacionMalicioso.id)}"`
    );
  });
});

