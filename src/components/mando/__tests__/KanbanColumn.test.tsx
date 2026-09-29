import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanColumn } from '../KanbanColumn';
import type { IncidenteResumen } from '@/services/incidentesService';

const mockIncidentes: IncidenteResumen[] = [
  {
    id: 'inc-01',
    codigo: 'INC-00000001',
    codigoSeguimiento: '00000001',
    tipoAfectacion: 'Anegamiento',
    descripcion: 'Agua en patio',
    direccion: 'Arauco 450',
    latitud: -39.81,
    longitud: -73.24,
    estado: 'REPORTADO',
    prioridad: 'MEDIA',
    requiereAsistenciaSocial: false,
    fuenteOrigen: 'CHATBOT',
    informanteNombre: null,
    delegacionNombre: 'Centro',
    totalMisiones: 0,
    creadoEn: '2026-09-22T10:00:00Z',
    actualizadoEn: '2026-09-22T10:00:00Z',
  },
];

describe('KanbanColumn', () => {
  it('debe renderizar el título de la columna, contador y tarjetas', () => {
    const onCargarMas = vi.fn();
    const onSeleccionarIncidente = vi.fn();

    render(
      <KanbanColumn
        estado="REPORTADO"
        titulo="Pendiente / Reportado"
        incidentes={mockIncidentes}
        paginacion={{
          total: 10,
          pagina: 1,
          limite: 20,
          totalPaginas: 1,
          tieneSiguiente: false,
          tieneAnterior: false,
        }}
        cargandoMas={false}
        onCargarMas={onCargarMas}
        onSeleccionarIncidente={onSeleccionarIncidente}
      />
    );

    expect(screen.getByText('Pendiente / Reportado')).toBeDefined();
    expect(screen.getByText('1 / 10')).toBeDefined();
    expect(screen.getByText('INC-00000001')).toBeDefined();
  });

  it('debe mostrar mensaje cuando no hay incidentes en la columna', () => {
    const onCargarMas = vi.fn();
    const onSeleccionarIncidente = vi.fn();

    render(
      <KanbanColumn
        estado="VERIFICANDO"
        titulo="En Verificación"
        incidentes={[]}
        paginacion={null}
        cargandoMas={false}
        onCargarMas={onCargarMas}
        onSeleccionarIncidente={onSeleccionarIncidente}
      />
    );

    expect(screen.getByText(/No hay incidentes en este estado/i)).toBeDefined();
  });

  it('debe mostrar el botón de cargar más cuando tieneSiguiente es true', () => {
    const onCargarMas = vi.fn();
    const onSeleccionarIncidente = vi.fn();

    render(
      <KanbanColumn
        estado="EN_ATENCION"
        titulo="En Atención"
        incidentes={mockIncidentes}
        paginacion={{
          total: 45,
          pagina: 1,
          limite: 20,
          totalPaginas: 3,
          tieneSiguiente: true,
          tieneAnterior: false,
        }}
        cargandoMas={false}
        onCargarMas={onCargarMas}
        onSeleccionarIncidente={onSeleccionarIncidente}
      />
    );

    const btnCargar = screen.getByRole('button', { name: /Cargar más casos/i });
    expect(btnCargar).toBeDefined();

    fireEvent.click(btnCargar);
    expect(onCargarMas).toHaveBeenCalledWith('EN_ATENCION');
  });
});
