import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PuntoCriticoForm from '../PuntoCriticoForm';
import * as puntosCriticosService from '@/services/puntosCriticosService';
import * as useCatalogosModule from '@/hooks/useCatalogos';

// Mock de useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock de useToast
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

// Mock de Leaflet para evitar problemas en entorno jsdom
vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ latitud, longitud, onChange }: { latitud: number; longitud: number; onChange?: (coords: { latitud: number; longitud: number }) => void }) => (
    <div data-testid="mock-location-picker-map">
      <span>Lat: {latitud}, Lng: {longitud}</span>
      <button
        type="button"
        data-testid="btn-simular-click-mapa"
        onClick={() => onChange?.({ latitud: -39.83000, longitud: -73.24000 })}
      >
        Simular clic en mapa
      </button>
    </div>
  ),
}));

describe('PuntoCriticoForm (HU-58: Creación de Puntos Críticos)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useCatalogosModule, 'useCatalogos').mockReturnValue({
      catalogos: {
        roles: [],
        especialidades: [],
        cargos: [],
        delegaciones: [
          { id: '30000000-0000-4000-8000-000000000001', codigo: 'DEL_NORTE', nombre: 'Delegación Municipal Norte' },
          { id: '30000000-0000-4000-8000-000000000002', codigo: 'DEL_SUR', nombre: 'Delegación Municipal Sur' },
        ],
      },
      cargando: false,
      error: null,
    });
  });

  it('debe renderizar todos los campos requeridos del formulario y el mapa interactivo', async () => {
    render(<PuntoCriticoForm />);

    expect(screen.getByLabelText(/Nombre del Sector \/ Punto Crítico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Amenaza \/ Riesgo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prioridad Operativa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delegación Territorial Asociada/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Latitud \(WGS84\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longitud \(WGS84\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Radio Afectación \(Metros\)/i)).toBeInTheDocument();
    expect(await screen.findByTestId('mock-location-picker-map')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Punto Crítico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('debe mostrar campo de texto condicional al seleccionar "Otro" como tipo de riesgo', () => {
    render(<PuntoCriticoForm />);

    const selectRiesgo = screen.getByLabelText(/Tipo de Amenaza \/ Riesgo/i);
    expect(screen.queryByLabelText(/Especifique el Tipo de Riesgo/i)).not.toBeInTheDocument();

    fireEvent.change(selectRiesgo, { target: { value: 'Otro' } });

    expect(screen.getByLabelText(/Especifique el Tipo de Riesgo/i)).toBeInTheDocument();
  });

  it('debe actualizar coordenadas al recibir interacción del mapa interactivo', () => {
    render(<PuntoCriticoForm />);

    const latInput = screen.getByLabelText(/Latitud \(WGS84\)/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitud \(WGS84\)/i) as HTMLInputElement;

    const btnMapa = screen.getByTestId('btn-simular-click-mapa');
    fireEvent.click(btnMapa);

    expect(latInput.value).toBe('-39.83');
    expect(lngInput.value).toBe('-73.24');
  });

  it('debe bloquear el envío y mostrar errores de validación si faltan campos obligatorios', async () => {
    render(<PuntoCriticoForm />);

    const btnSubmit = screen.getByRole('button', { name: /Guardar Punto Crítico/i });
    fireEvent.click(btnSubmit);

    expect(await screen.findByText(/El nombre es obligatorio y debe contener al menos 3 caracteres/i)).toBeInTheDocument();
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Por favor corrija los campos marcados'),
      'Formulario Incompleto'
    );
  });

  it('debe enviar la petición de creación exitosamente y mostrar pantalla de confirmación', async () => {
    const mockCreado = {
      id: 'e4f5a6b7-c8d9-0123-4567-89abcdef0123',
      codigo: 'PC-SUR-001',
      nombre: 'Socavón Ribera Calle General Lagos',
      descripcion: 'Riesgo de colapso de calzada ante lluvias intensas',
      tipo_riesgo: 'Remoción en Masa / Deslizamiento',
      nivel_prioridad: 'ALTA' as const,
      latitud: -39.82512,
      longitud: -73.25143,
      radio_afectacion_metros: 120,
      delegacion_id: '30000000-0000-4000-8000-000000000002',
      delegacion_nombre: 'Delegación Sur',
      activo: true,
      creado_por_id: '00000000-0000-4000-8000-000000000001',
      creado_por_nombre: 'Carlos Gómez (Administrador)',
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString(),
    };

    const spyCrear = vi.spyOn(puntosCriticosService, 'crearPuntoCritico').mockResolvedValueOnce(mockCreado);

    render(<PuntoCriticoForm />);

    fireEvent.change(screen.getByLabelText(/Nombre del Sector \/ Punto Crítico/i), {
      target: { value: 'Socavón Ribera Calle General Lagos' },
    });
    fireEvent.change(screen.getByLabelText(/Tipo de Amenaza \/ Riesgo/i), {
      target: { value: 'Remoción en Masa / Deslizamiento' },
    });
    fireEvent.change(screen.getByLabelText(/Prioridad Operativa/i), {
      target: { value: 'ALTA' },
    });
    fireEvent.change(screen.getByLabelText(/Delegación Territorial Asociada/i), {
      target: { value: '30000000-0000-4000-8000-000000000002' },
    });
    fireEvent.change(screen.getByLabelText(/Radio Afectación \(Metros\)/i), {
      target: { value: '120' },
    });

    const btnSubmit = screen.getByRole('button', { name: /Guardar Punto Crítico/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(spyCrear).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Socavón Ribera Calle General Lagos',
          tipo_riesgo: 'Remoción en Masa / Deslizamiento',
          nivel_prioridad: 'ALTA',
          radio_afectacion_metros: 120,
          delegacion_id: '30000000-0000-4000-8000-000000000002',
          activo: true,
        }),
        expect.any(String)
      );
    });

    expect(await screen.findByText('Punto Crítico Registrado Exitosamente')).toBeInTheDocument();
    expect(screen.getByText('PC-SUR-001')).toBeInTheDocument();
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('PC-SUR-001'),
      'Registro Exitoso'
    );
  });

  it('debe mostrar mensaje de error si el servicio falla con rechazo del servidor', async () => {
    vi.spyOn(puntosCriticosService, 'crearPuntoCritico').mockRejectedValueOnce(
      new puntosCriticosService.PuntoCriticoServiceError({
        message: 'Error de servidor: Coordenadas ya registradas en otro punto crítico',
        statusCode: 400,
      })
    );

    render(<PuntoCriticoForm />);

    fireEvent.change(screen.getByLabelText(/Nombre del Sector \/ Punto Crítico/i), {
      target: { value: 'Sector Inundable Costanera' },
    });

    const btnSubmit = screen.getByRole('button', { name: /Guardar Punto Crítico/i });
    fireEvent.click(btnSubmit);

    expect(await screen.findByText(/Coordenadas ya registradas en otro punto crítico/i)).toBeInTheDocument();
    expect(mockShowError).toHaveBeenCalledWith(
      expect.stringContaining('Coordenadas ya registradas en otro punto crítico'),
      'Error al guardar'
    );
  });
});
