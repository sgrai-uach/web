import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OperativosRecuperacionTabla } from '../OperativosRecuperacionTabla';
import type { OperativoRecuperacionListadoItem } from '@/types/recuperacion';

const mockItems: OperativoRecuperacionListadoItem[] = [
  {
    id: 'op-1',
    codigo: 'REC-2026-0001',
    nombre: 'Entrega de Zinc',
    descripcion: 'Descripción de prueba',
    sector: 'Collico',
    direccionTexto: null,
    prioridad: 'CRITICA',
    estado: 'EN_EJECUCION',
    familiasAfectadas: 5,
    delegacion: { id: 'd1', codigo: 'DEL_NORTE', nombre: 'Delegación Norte' },
    cantidadInsumosAsignados: 1,
    totalTiposInsumos: 1,
    recursosResumen: [{ recursoId: 'r1', nombre: 'Plancha Zinc', cantidadAsignada: 1 }],
    creadoEn: '2026-11-24T12:00:00.000Z',
    actualizadoEn: '2026-11-24T12:00:00.000Z',
    fechaCierre: null,
  },
];

describe('OperativosRecuperacionTabla (HU-73)', () => {
  it('debe singularizar 1 unidad y soportar selección por teclado en la fila', () => {
    const onSelect = vi.fn();
    const onToggleOrden = vi.fn();

    render(
      <OperativosRecuperacionTabla
        operativos={mockItems}
        selectedId={null}
        ordenarPor="creadoEn"
        orden="desc"
        onToggleOrden={onToggleOrden}
        onSelectOperativo={onSelect}
      />
    );

    expect(screen.getByText('1 unidad')).toBeInTheDocument();
    expect(screen.getByText('En Ejecución')).toBeInTheDocument();
    expect(screen.getByText('Crítica')).toBeInTheDocument();

    const row = screen.getByRole('row', { name: /Operativo REC-2026-0001/i });
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('op-1');

    fireEvent.click(screen.getByRole('button', { name: /Código/i }));
    expect(onToggleOrden).toHaveBeenCalledWith('codigo');
  });
});
