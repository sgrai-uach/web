import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PuntosCriticosTabla from '../PuntosCriticosTabla';
import type { PuntoCriticoItem } from '@/types/puntoCritico';

const mockPunto: PuntoCriticoItem = {
  id: '40000000-0000-4000-8000-000000000001',
  codigo: 'PC-ANG-01',
  nombre: 'Sector Humedal Angachilla',
  descripcion: 'Zona baja con riesgo de anegamiento',
  tipoRiesgo: 'Inundación y anegamiento',
  prioridad: 'ALTA',
  activo: true,
  estadoTexto: 'Activo',
  latitud: -39.8456,
  longitud: -73.2389,
  delegacion: {
    id: '30000000-0000-4000-8000-000000000002',
    codigo: 'DEL_SUR',
    nombre: 'Delegación Municipal Sur',
  },
  creadoEn: '2026-06-15T12:00:00.000Z',
};

describe('PuntosCriticosTabla', () => {
  it('debe renderizar correctamente las columnas esenciales del punto crítico (CA-2)', () => {
    render(
      <PuntosCriticosTabla
        puntosCriticos={[mockPunto]}
        cargando={false}
        esFiltroActivo={false}
        onLimpiarFiltros={vi.fn()}
      />
    );

    expect(screen.getByText('PC-ANG-01')).toBeInTheDocument();
    expect(screen.getByText('Sector Humedal Angachilla')).toBeInTheDocument();
    expect(screen.getByText('Inundación y anegamiento')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(screen.getByText('-39.8456, -73.2389')).toBeInTheDocument();
    expect(screen.getByText('Delegación Municipal Sur')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Acción')).toBeInTheDocument();
  });

  it('debe permitir copiar las coordenadas al portapapeles', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <PuntosCriticosTabla
        puntosCriticos={[mockPunto]}
        cargando={false}
        esFiltroActivo={false}
        onLimpiarFiltros={vi.fn()}
      />
    );

    const botonCopiar = screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(botonCopiar);

    expect(writeTextMock).toHaveBeenCalledWith('-39.8456, -73.2389');
    expect(await screen.findByText('Copiado')).toBeInTheDocument();
  });

  it('debe mostrar el estado vacío si no hay puntos registrados (CA-3)', () => {
    render(
      <PuntosCriticosTabla
        puntosCriticos={[]}
        cargando={false}
        esFiltroActivo={false}
        onLimpiarFiltros={vi.fn()}
      />
    );

    expect(screen.getByText('No hay puntos críticos registrados')).toBeInTheDocument();
  });

  it('debe invocar onSeleccionarPunto al hacer clic sobre una fila de la tabla', () => {
    const handleSeleccionar = vi.fn();
    render(
      <PuntosCriticosTabla
        puntosCriticos={[mockPunto]}
        cargando={false}
        esFiltroActivo={false}
        onLimpiarFiltros={vi.fn()}
        onSeleccionarPunto={handleSeleccionar}
      />
    );

    const filaPunto = screen.getByText('Sector Humedal Angachilla');
    fireEvent.click(filaPunto);

    expect(handleSeleccionar).toHaveBeenCalledWith(mockPunto);
  });

  describe('Acción de Desactivación / Eliminación (HU-56)', () => {
    it('debe renderizar el botón Eliminar para un punto crítico activo y ejecutar onEliminarPunto sin abrir el detalle', () => {
      const handleEliminar = vi.fn();
      const handleSeleccionar = vi.fn();

      render(
        <PuntosCriticosTabla
          puntosCriticos={[mockPunto]}
          cargando={false}
          esFiltroActivo={false}
          onLimpiarFiltros={vi.fn()}
          onSeleccionarPunto={handleSeleccionar}
          onEliminarPunto={handleEliminar}
          puedeEliminar={true}
        />
      );

      const botonEliminar = screen.getByRole('button', {
        name: `Eliminar punto crítico ${mockPunto.codigo}`,
      });
      expect(botonEliminar).toBeInTheDocument();
      expect(botonEliminar).not.toBeDisabled();

      fireEvent.click(botonEliminar);

      expect(handleEliminar).toHaveBeenCalledWith(mockPunto);
      expect(handleSeleccionar).not.toHaveBeenCalled();
    });

    it('debe deshabilitar el botón Eliminar si el usuario no tiene permisos (puedeEliminar = false)', () => {
      render(
        <PuntosCriticosTabla
          puntosCriticos={[mockPunto]}
          cargando={false}
          esFiltroActivo={false}
          onLimpiarFiltros={vi.fn()}
          onEliminarPunto={vi.fn()}
          puedeEliminar={false}
        />
      );

      const botonEliminar = screen.getByRole('button', {
        name: `Eliminar punto crítico ${mockPunto.codigo}`,
      });
      expect(botonEliminar).toBeDisabled();
    });

    it('debe mostrar etiqueta Inactivo y no renderizar botón de acción si el punto ya fue desactivado', () => {
      const puntoInactivo: PuntoCriticoItem = {
        ...mockPunto,
        id: '40000000-0000-4000-8000-000000000005',
        activo: false,
        estadoTexto: 'Inactivo',
      };

      render(
        <PuntosCriticosTabla
          puntosCriticos={[puntoInactivo]}
          cargando={false}
          esFiltroActivo={false}
          onLimpiarFiltros={vi.fn()}
          onEliminarPunto={vi.fn()}
          puedeEliminar={true}
        />
      );

      expect(
        screen.queryByRole('button', {
          name: `Eliminar punto crítico ${puntoInactivo.codigo}`,
        })
      ).not.toBeInTheDocument();
    });
  });
});
