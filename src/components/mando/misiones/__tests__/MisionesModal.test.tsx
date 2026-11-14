import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MisionesModal } from '../MisionesModal';
import { MisionesFiltros } from '../MisionesFiltros';
import { MisionesTabla } from '../MisionesTabla';
import {
  clearTrazabilidadCache,
  setTrazabilidadEstado,
} from '@/lib/socket/trazabilidadStore';
import type { MisionItem } from '@/types/misiones';

vi.mock('@/hooks/useCatalogos', () => ({
  useCatalogos: () => ({
    nombresDelegaciones: ['Norte', 'Sur', 'Costa', 'Calle Calle'],
    cargando: false,
  }),
}));

vi.mock('@/services/misionesService', () => ({
  misionesService: {
    listar: vi.fn().mockResolvedValue({
      exito: true,
      data: [
        {
          id: 'mis-1',
          codigo: 'MIS-2026-0001',
          titulo: 'Verificación en Las Ánimas',
          descripcion: 'Evaluar anegamiento de calzada',
          tipoMision: 'VERIFICACION',
          estado: 'EN_CURSO',
          prioridad: 'ALTA',
          delegacionNombre: 'Norte',
          cuadrillaNombre: 'Cuadrilla Alpha',
          creadoEn: '2026-10-04T12:00:00Z',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      mensaje: 'OK',
    }),
  },
}));

describe('MisionesModal y MisionesFiltros', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearTrazabilidadCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar filtros y tabla de misiones dentro del modal', async () => {
    const handleClose = vi.fn();

    render(
      <MisionesModal isOpen={true} onClose={handleClose} />
    );

    // Debe mostrar título del modal
    expect(screen.getByText(/Misiones Operativas en Terreno/i)).toBeDefined();

    // Esperar resolución de lista
    await act(async () => {
      vi.runAllTimers();
    });

    expect(screen.getByText('MIS-2026-0001')).toBeDefined();
    expect(screen.getByText('Verificación en Las Ánimas')).toBeDefined();
    expect(screen.getByText('Cuadrilla Alpha')).toBeDefined();

    // Botón de cerrar
    const btnCerrar = screen.getByLabelText(/Cerrar modal de misiones/i);
    fireEvent.click(btnCerrar);
    expect(handleClose).toHaveBeenCalled();
  });

  it('debe emitir cambios de filtro en MisionesFiltros con nombres legibles', () => {
    const handleFiltrosChange = vi.fn();

    render(
      <MisionesFiltros
        filtros={{
          busqueda: '',
          estado: 'TODOS',
          tipoMision: 'TODOS',
          prioridad: '',
          delegacion: 'TODAS',
          page: 1,
          limit: 10,
        }}
        onFiltrosChange={handleFiltrosChange}
        onLimpiarFiltros={vi.fn()}
        onRefrescar={vi.fn()}
        cargando={false}
      />
    );

    // Filtrar por estado usando botón segmentado
    const btnDespachadas = screen.getByRole('button', { name: 'Despachadas' });
    fireEvent.click(btnDespachadas);
    expect(handleFiltrosChange).toHaveBeenCalledWith({ estado: 'DESPACHADA' });

    // Filtrar por delegación con nombre
    const selectDelegacion = screen.getByLabelText(/Delegación Territorial/i);
    fireEvent.change(selectDelegacion, { target: { value: 'Costa' } });
    expect(handleFiltrosChange).toHaveBeenCalledWith({ delegacion: 'Costa' });
  });

  it('BUG-H35-WEB-07: renderiza etiqueta de trazabilidad en MisionesTabla y reacciona al store sin emojis ni esquinas redondeadas', async () => {
    const misionesMock: MisionItem[] = [
      {
        id: 'mis-tabla-1',
        codigo: 'MIS-2026-0777',
        titulo: 'Verificación Sector Norte',
        descripcion: 'Evaluar anegamiento',
        tipoMision: 'VERIFICACION',
        estado: 'DESPACHADA',
        prioridad: 'ALTA',
        delegacionNombre: 'Norte',
        cuadrillaNombre: null,
        patrullaNombre: 'Patrulla Alfa',
        incidenteId: 'inc-777',
        incidenteCodigo: 'INC-2026-0777',
        justificacionRechazo: null,
        trazabilidadNotificacion: 'PENDIENTE_ENVIO',
        fechaInicio: null,
        fechaCierre: null,
        creadoEn: '2026-11-12T10:00:00Z',
        actualizadoEn: '2026-11-12T10:00:00Z',
      },
    ];

    render(
      <MisionesTabla
        misiones={misionesMock}
        cargando={false}
        hayFiltrosActivos={false}
        onLimpiarFiltros={vi.fn()}
      />
    );

    const badgeInicial = screen.getByTestId('tabla-trazabilidad-mis-tabla-1');
    expect(badgeInicial.textContent).toContain('NO LEÍDA');
    expect(badgeInicial.textContent).toContain('Sin señal / offline');
    expect(badgeInicial.style.borderRadius).toBe('0px');
    expect(/\p{Extended_Pictographic}/u.test(badgeInicial.textContent || '')).toBe(false);

    // Simular actualización en vivo vía WebSocket -> trazabilidadStore supera el estado inicial
    await act(async () => {
      setTrazabilidadEstado('mis-tabla-1', 'LEIDA', 'inc-777');
      await Promise.resolve();
    });

    const badgeActualizado = screen.getByTestId('tabla-trazabilidad-mis-tabla-1');
    expect(badgeActualizado.textContent).toContain('LEÍDA');
    expect(badgeActualizado.textContent).toContain('Leída por operador en terreno');
  });
});
