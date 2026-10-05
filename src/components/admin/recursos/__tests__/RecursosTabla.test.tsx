import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecursosTabla from '../RecursosTabla';
import type { RecursoItem } from '@/types/recurso';

const mockRecurso: RecursoItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nombre: 'Motosierra Stihl MS 382',
  tipo: 'Herramienta Menor',
  esIndividual: true,
  estado: 'DISPONIBLE',
  cantidadInventario: 1,
  cantidadDisponible: 1,
  cantidadEnUso: 0,
  cantidadMinima: 0,
  latitud: -39.8142,
  longitud: -73.2459,
  descripcion: 'Motosierra para corte de ramas',
  detalles: {},
  delegacion: {
    id: '30000000-0000-4000-8000-000000000001',
    codigo: 'DEL_NORTE',
    nombre: 'Delegación Norte',
  },
  creadoPorId: '00000000-0000-4000-8000-000000000001',
  creadoEn: '2026-09-01T10:00:00Z',
  actualizadoEn: '2026-09-01T10:00:00Z',
};

describe('RecursosTabla - Control RBAC puedeEliminar', () => {
  it('no debe mostrar el botón de eliminar si puedeEliminar es false', () => {
    render(
      <RecursosTabla
        recursos={[mockRecurso]}
        cargando={false}
        esFiltroActivo={false}
        onLimpiarFiltros={vi.fn()}
        onEliminarRecurso={vi.fn()}
        puedeEliminar={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Eliminar/i })).toBeNull();
  });

  it('debe mostrar el botón de eliminar si puedeEliminar es true e invocar onEliminarRecurso', () => {
    const handleEliminar = vi.fn();
    render(
      <RecursosTabla
        recursos={[mockRecurso]}
        cargando={false}
        esFiltroActivo={false}
        onLimpiarFiltros={vi.fn()}
        onEliminarRecurso={handleEliminar}
        puedeEliminar={true}
      />
    );

    const botonEliminar = screen.getByRole('button', { name: /Eliminar/i });
    expect(botonEliminar).toBeDefined();

    fireEvent.click(botonEliminar);
    expect(handleEliminar).toHaveBeenCalledWith(mockRecurso);
  });
});
