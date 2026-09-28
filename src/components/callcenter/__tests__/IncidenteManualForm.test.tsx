import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IncidenteManualForm from '../IncidenteManualForm';
import * as incidentesApi from '@/services/incidentesManualesService';

// Mock del mapa interactivo para evitar problemas con Leaflet en jsdom
vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ onChange }: { onChange: (coords: { latitud: number; longitud: number }) => void }) => (
    <div data-testid="mock-location-picker">
      <button
        type="button"
        data-testid="mock-set-coords"
        onClick={() => onChange({ latitud: -39.8142, longitud: -73.2459 })}
      >
        Fijar Coordenadas
      </button>
    </div>
  ),
}));

describe('IncidenteManualForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(incidentesApi, 'obtenerTiposAfectacion').mockResolvedValue([
      'Anegamiento',
      'Caída de árbol',
    ]);
  });

  it('debe renderizar los campos principales con origen Llamada Telefónica por defecto', async () => {
    render(<IncidenteManualForm />);

    expect(screen.getByText('1. Origen del Reporte *')).toBeDefined();
    expect(screen.getByText('Llamada Telefónica')).toBeDefined();
    expect(screen.getByText('Funcionario en Terreno')).toBeDefined();
    expect(screen.getByLabelText(/dirección o referencia/i)).toBeDefined();
    expect(screen.getByLabelText(/descripción de la emergencia/i)).toBeDefined();
    expect(screen.getByLabelText(/nombre completo/i)).toBeDefined();
    expect(screen.getByLabelText(/rut chileno/i)).toBeDefined();
  });

  it('debe permitir alternar el origen a Funcionario en Terreno', async () => {
    render(<IncidenteManualForm />);

    const radioFuncionario = screen.getByRole('radio', { name: /funcionario en terreno/i });
    expect(radioFuncionario.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(radioFuncionario);

    expect(radioFuncionario.getAttribute('aria-checked')).toBe('true');
  });

  it('debe mostrar errores de validación si se envía con campos vacíos o inválidos', async () => {
    render(<IncidenteManualForm />);

    const botonEnviar = screen.getByRole('button', { name: /guardar y notificar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText('La dirección debe tener al menos 5 caracteres')).toBeDefined();
      expect(screen.getByText('La descripción debe tener al menos 5 caracteres')).toBeDefined();
      expect(screen.getByText('El nombre del informante debe tener al menos 3 caracteres')).toBeDefined();
      expect(screen.getByText('El RUT del informante es obligatorio')).toBeDefined();
    });
  });

  it('debe validar el dígito verificador del RUT con Módulo 11', async () => {
    render(<IncidenteManualForm />);

    const inputRut = screen.getByLabelText(/rut chileno/i);
    // Ingresar un RUT con dígito verificador erróneo (11.111.111-9 en vez de 11.111.111-1)
    fireEvent.change(inputRut, { target: { value: '111111119' } });

    const botonEnviar = screen.getByRole('button', { name: /guardar y notificar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText(/el rut ingresado no es válido/i)).toBeDefined();
    });
  });

  it('debe procesar exitosamente y mostrar la tarjeta de éxito con códigos', async () => {
    vi.spyOn(incidentesApi, 'crearIncidenteManual').mockResolvedValueOnce({
      tipo: 'EXITO',
      datos: {
        codigoIncidente: 'INC-0099',
        codigoAviso: '84920194',
        tipoAfectacion: 'Anegamiento',
        direccion: 'Av. Alemania 550',
        estado: 'SIN_ATENDER',
        prioridad: 'MEDIA',
        creadoEn: '2026-09-13T15:00:00Z',
      },
      mensaje: 'OK',
    });

    render(<IncidenteManualForm />);

    fireEvent.change(screen.getByLabelText(/dirección o referencia/i), {
      target: { value: 'Av. Alemania 550' },
    });
    fireEvent.change(screen.getByLabelText(/descripción de la emergencia/i), {
      target: { value: 'Calle anegada por lluvias torrenciales' },
    });
    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Carlos Miranda' },
    });
    fireEvent.change(screen.getByLabelText(/rut chileno/i), {
      target: { value: '111111111' }, // 11.111.111-1 es válido
    });

    const botonEnviar = screen.getByRole('button', { name: /guardar y notificar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText('Reporte Ingresado y Verificado Exitosamente')).toBeDefined();
      expect(screen.getByText('INC-0099')).toBeDefined();
      expect(screen.getByText('84920194')).toBeDefined();
    });
  });
});
