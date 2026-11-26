import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OperativoRecuperacionDrawer } from '../OperativoRecuperacionDrawer';
import * as recuperacionService from '@/services/recuperacionService';
import type { OperativoRecuperacionDetalle } from '@/types/recuperacion';

const mockShowError = vi.fn();

vi.mock('@/components/ui/Toast', () => ({
  useOptionalToast: () => ({
    showError: mockShowError,
  }),
}));

const mockDetalle: OperativoRecuperacionDetalle = {
  id: 'op-1',
  codigo: 'REC-2026-0001',
  nombre: 'Entrega de Zinc',
  descripcion: 'Operativo en sector Collico',
  sector: 'Collico',
  direccionTexto: null,
  prioridad: 'ALTA',
  contactoNombre: null,
  contactoTelefono: null,
  latitud: -39.8,
  longitud: -73.2,
  estado: 'EN_EJECUCION',
  familiasAfectadas: 3,
  delegacion: { id: 'd1', codigo: 'DEL_NORTE', nombre: 'Delegación Norte' },
  creadoPor: { id: 'u1', nombre: 'Juan Pérez' },
  mision: {
    id: 'm1',
    codigo: 'MIS-2026-0001',
    titulo: 'Entrega',
    estado: 'EN_CURSO',
    tipoMision: 'RECUPERACION',
  },
  patrulla: { id: 'p1', nombre: 'Patrulla Alfa', estado: 'EN_RECUPERACION' },
  recursos: [{ recursoId: 'r1', nombre: 'Planchas de Zinc', cantidadAsignada: 20 }],
  cantidadInsumosAsignados: 20,
  totalTiposInsumos: 1,
  historial: [
    {
      id: 'h1',
      tipo: 'CREACION',
      titulo: 'Operativo registrado',
      descripcion: 'Creado en sistema',
      registradoPor: { id: 'u1', nombre: 'Juan Pérez' },
      creadoEn: '2026-11-24T12:00:00.000Z',
    },
  ],
  creadoEn: '2026-11-24T12:00:00.000Z',
  actualizadoEn: '2026-11-24T12:00:00.000Z',
  fechaCierre: null,
  observacionesCierre: null,
};

describe('OperativoRecuperacionDrawer (HU-73)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debe repetir fetch ante cambios de referencia de onCerrar y debe cerrar con Escape', async () => {
    const spy = vi
      .spyOn(recuperacionService, 'obtenerDetalleOperativoRecuperacion')
      .mockResolvedValue(mockDetalle);
    const onCerrar1 = vi.fn();
    const onCerrar2 = vi.fn();

    const { rerender } = render(
      <OperativoRecuperacionDrawer operativoId="op-1" onCerrar={onCerrar1} />
    );

    expect(await screen.findByText('Planchas de Zinc')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(1);

    rerender(<OperativoRecuperacionDrawer operativoId="op-1" onCerrar={onCerrar2} />);
    expect(spy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCerrar2).toHaveBeenCalledTimes(1);
  });

  it('debe notificar toast y cerrar automáticamente ante 404 Not Found', async () => {
    vi.spyOn(recuperacionService, 'obtenerDetalleOperativoRecuperacion').mockRejectedValue(
      new recuperacionService.RecuperacionServiceError('No encontrado', { statusCode: 404 })
    );
    const onCerrar = vi.fn();

    render(<OperativoRecuperacionDrawer operativoId="op-404" onCerrar={onCerrar} />);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('No encontrado');
      expect(onCerrar).toHaveBeenCalledTimes(1);
    });
  });
});
