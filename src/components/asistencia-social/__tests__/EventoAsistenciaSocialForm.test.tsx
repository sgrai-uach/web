import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventoAsistenciaSocialForm from '../EventoAsistenciaSocialForm';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock('@/context/SimulatedSessionContext', () => ({
  useSimulatedSession: () => ({
    usuarioActivo: {
      id: '00000000-0000-4000-8000-000000000003',
      nombre: 'Encargado de Operaciones',
      rol: 'Encargado',
      esAdmin: false,
    },
    hasPermission: () => true,
  }),
}));

// Mock del mapa Leaflet
vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({ onChange }: { onChange?: (coords: { latitud: number; longitud: number }) => void }) => (
    <div data-testid="mock-location-picker-map">
      <button
        type="button"
        data-testid="mock-map-click-btn"
        onClick={() => onChange?.({ latitud: -39.825, longitud: -73.221 })}
      >
        Simular clic en mapa
      </button>
    </div>
  ),
}));

describe('EventoAsistenciaSocialForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar todos los campos principales del formulario', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    expect(screen.getByText(/1\. Caracterización del Caso y Clasificación de Daño/i)).toBeDefined();
    expect(screen.getByText(/2\. Ubicación Georreferenciada y Sector Territorial/i)).toBeDefined();
    expect(screen.getByText(/3\. Datos Preliminares de Contacto/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Afectación Social/i)).toBeDefined();
    expect(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i)).toBeDefined();
    expect(screen.getByLabelText(/Dirección de Referencia o Calle/i)).toBeDefined();
    expect(await screen.findByTestId('mock-location-picker-map')).toBeDefined();
  });

  it('debe mostrar errores de validación si los campos obligatorios están vacíos', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    const submitBtn = screen.getByRole('button', { name: /Guardar Evento de Asistencia Social/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Por favor complete los campos obligatorios requeridos.',
        'Validación incompleta'
      );
    });

    expect(screen.getByText(/La descripción debe tener al menos 5 caracteres/i)).toBeDefined();
    expect(screen.getByText(/La dirección debe tener al menos 3 caracteres/i)).toBeDefined();
  });

  it('debe actualizar coordenadas cuando se interactúa con el mapa', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    const simularMapaBtn = screen.getByTestId('mock-map-click-btn');
    fireEvent.click(simularMapaBtn);

    const latInput = screen.getByLabelText(/Latitud/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitud/i) as HTMLInputElement;

    expect(latInput.value).toBe('-39.825');
    expect(lngInput.value).toBe('-73.221');
  });

  it('debe enviar el payload correcto y redirigir al registrar exitosamente', async () => {
    const mockCreado = {
      id: '70000000-0000-4000-8000-000000000005',
      codigo: 'AS-2026-0005',
      descripcion: 'Familia con anegamiento severo en patio trasero',
      tipoAfectacion: 'VIVIENDA_ANEGADA',
      personasAfectadas: 3,
      familiasAfectadas: 1,
      direccionTexto: 'Calle Los Notros 890',
      latitud: -39.825,
      longitud: -73.221,
      prioridad: 'ALTA' as const,
      estado: 'PENDIENTE' as const,
      contactoNombre: 'Pedro Soto',
      contactoTelefono: '+56987654321',
      contactoRut: null,
      delegacionId: null,
      delegacionNombre: null,
      incidenteId: null,
      asistenteSocialId: null,
      asistenteSocialNombre: null,
      creadoPor: { id: 'user-1', nombre: 'Encargado' },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    vi.spyOn(asistenciaSocialService, 'crearEventoAsistenciaSocial').mockResolvedValueOnce(mockCreado);

    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    // Llenar campos obligatorios
    fireEvent.change(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i), {
      target: { value: 'Familia con anegamiento severo en patio trasero' },
    });
    fireEvent.change(screen.getByLabelText(/Dirección de Referencia o Calle/i), {
      target: { value: 'Calle Los Notros 890' },
    });

    const submitBtn = screen.getByRole('button', { name: /Guardar Evento de Asistencia Social/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(asistenciaSocialService.crearEventoAsistenciaSocial).toHaveBeenCalledWith(
        expect.objectContaining({
          descripcion: 'Familia con anegamiento severo en patio trasero',
          direccionTexto: 'Calle Los Notros 890',
          tipoAfectacion: 'VIVIENDA_ANEGADA',
          incidenteId: null,
        }),
        '00000000-0000-4000-8000-000000000003'
      );
    });

    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('AS-2026-0005'),
      'Caso Social Creado'
    );
    expect(mockPush).toHaveBeenCalledWith('/gestion/asistente-social');
  });
});
