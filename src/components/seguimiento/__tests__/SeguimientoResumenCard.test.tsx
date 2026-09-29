import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeguimientoResumenCard } from '../SeguimientoResumenCard';
import type { DatosSeguimiento } from '@/services/seguimientoService';

describe('SeguimientoResumenCard', () => {
  const mockDatos: DatosSeguimiento = {
    codigoSeguimiento: '58291045',
    estado: 'EN_ATENCION',
    estadoEtiqueta: 'En Atención',
    estadoDescripcion: 'El incidente fue confirmado en terreno y una cuadrilla operativa municipal está trabajando en el lugar.',
    tipoAfectacion: 'Anegamiento',
    direccionAproximada: 'Av. Alemania 550',
    descripcion: 'Acumulación de agua frente al paradero',
    creadoEn: '2026-09-20T10:15:00.000Z',
    actualizadoEn: '2026-09-20T11:30:00.000Z',
    esDuplicado: false,
  };

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('debe renderizar la información esencial del incidente sin exponer datos confidenciales', () => {
    render(<SeguimientoResumenCard datos={mockDatos} />);

    expect(screen.getByText('58291045')).toBeDefined();
    expect(screen.getByText('En Atención')).toBeDefined();
    expect(screen.getByText(mockDatos.estadoDescripcion)).toBeDefined();
    expect(screen.getByText('Anegamiento')).toBeDefined();
    expect(screen.getByText('Av. Alemania 550')).toBeDefined();
    expect(screen.getByText('Acumulación de agua frente al paradero')).toBeDefined();

    // Comprobar ausencia de datos personales sensibles
    expect(screen.queryByText(/RUT/i)).toBeNull();
    expect(screen.queryByText(/Teléfono/i)).toBeNull();
  });

  it('debe copiar el código al portapapeles al presionar el botón de copiado', () => {
    render(<SeguimientoResumenCard datos={mockDatos} />);

    const botonCopiar = screen.getByRole('button', { name: /copiar/i });
    fireEvent.click(botonCopiar);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('58291045');
    expect(screen.getByText(/Copiado/i)).toBeDefined();
  });

  it('debe desplegar el indicador "Actualizado en vivo" cuando actualizadoEnVivo es true', () => {
    render(<SeguimientoResumenCard datos={mockDatos} actualizadoEnVivo={true} />);

    expect(screen.getByText('Actualizado en vivo')).toBeDefined();
  });

  it('debe mostrar la nota institucional de duplicado cuando esDuplicado es true', () => {
    render(<SeguimientoResumenCard datos={{ ...mockDatos, esDuplicado: true }} />);

    expect(screen.getByText(/asociado a un incidente ya registrado en tu sector/i)).toBeDefined();
  });
});
