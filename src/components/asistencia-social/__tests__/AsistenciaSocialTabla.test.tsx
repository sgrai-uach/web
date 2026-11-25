import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AsistenciaSocialTabla from '../AsistenciaSocialTabla';
import type { EventoAsistenciaSocialItem, EstadoEventoSocial } from '@/types/asistenciaSocial';

function crearEventoMock(
  id: string,
  codigo: string,
  estado: EstadoEventoSocial,
  folioFibe: string | null = null
): EventoAsistenciaSocialItem {
  return {
    id,
    codigo,
    descripcion: 'Caso social de prueba',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    personasAfectadas: 3,
    familiasAfectadas: 1,
    direccionTexto: 'Calle Los Alerces 100',
    latitud: -39.82,
    longitud: -73.22,
    prioridad: 'ALTA',
    estado,
    contactoNombre: 'María González',
    contactoTelefono: '+56912345678',
    contactoRut: null,
    delegacionId: null,
    delegacionNombre: null,
    incidenteId: null,
    asistenteSocialId: estado === 'PENDIENTE' ? null : 'asoc-1',
    asistenteSocialNombre: estado === 'PENDIENTE' ? null : 'Camila Valenzuela',
    folioFibe,
    creadoPor: { id: 'user-1', nombre: 'Encargado' },
    creadoEn: '2026-10-05T12:00:00.000Z',
    actualizadoEn: '2026-10-05T12:00:00.000Z',
  };
}

describe('AsistenciaSocialTabla — Acciones FIBE (HU-71)', () => {
  const meta = { total: 5, pagina: 1, limite: 10, totalPaginas: 1 };

  const eventos: EventoAsistenciaSocialItem[] = [
    crearEventoMock('1', 'AS-2026-0001', 'PENDIENTE'),
    crearEventoMock('2', 'AS-2026-0002', 'ASIGNADO'),
    crearEventoMock('3', 'AS-2026-0003', 'EN_EVALUACION_FIBE', 'FIBE-2026-0003'),
    crearEventoMock('4', 'AS-2026-0004', 'FINALIZADO', 'FIBE-2026-0004'),
    crearEventoMock('5', 'AS-2026-0005', 'DESCARTADO'),
  ];

  it('muestra "Registrar Ficha FIBE" en ASIGNADO y "Editar Ficha FIBE" en EN_EVALUACION_FIBE cuando puedeGestionarFibe es true', () => {
    render(
      <AsistenciaSocialTabla
        eventos={eventos}
        meta={meta}
        onCambiarPagina={vi.fn()}
        puedeGestionarFibe={true}
      />
    );

    const botonesRegistrar = screen.getAllByRole('button', { name: /Registrar Ficha FIBE/i });
    const botonesEditar = screen.getAllByRole('button', { name: /Editar Ficha FIBE/i });

    expect(botonesRegistrar).toHaveLength(1);
    expect(botonesEditar).toHaveLength(1);
    expect(screen.getByText('FIBE: FIBE-2026-0003')).toBeDefined();
  });

  it('oculta las acciones de Ficha FIBE cuando el usuario no tiene permiso asistencia_social:fibe:gestionar', () => {
    render(
      <AsistenciaSocialTabla
        eventos={eventos}
        meta={meta}
        onCambiarPagina={vi.fn()}
        puedeGestionarFibe={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Registrar Ficha FIBE/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Editar Ficha FIBE/i })).toBeNull();
  });
});
