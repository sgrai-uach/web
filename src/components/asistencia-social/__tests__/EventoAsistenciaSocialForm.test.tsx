import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventoAsistenciaSocialForm from '../EventoAsistenciaSocialForm';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import * as geocoding from '@/lib/maps/geocoding';

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

vi.mock('@/services/incidentesService', () => ({
  incidentesService: {
    listar: vi.fn(async () => ({
      exito: true,
      incidentes: [
        {
          id: '11111111-1111-4000-8000-111111111111',
          codigo: 'INC-2026-0001',
          tipoAfectacion: 'Inundación Mayor',
          direccion: 'Avenida Costanera 100',
        },
      ],
      mensaje: 'OK',
    })),
  },
}));

vi.mock('@/lib/maps/geocoding', () => ({
  geocodificarDireccionEnValdivia: vi.fn(async (dir: string) => {
    if (dir.toLowerCase().includes('picarte')) {
      return { latitud: -39.8256, longitud: -73.2321 };
    }
    return { latitud: -39.81422, longitud: -73.24589 };
  }),
  geocodificacionInversaEnValdivia: vi.fn(async (_lat: number, _lng: number) => {
    return 'Avenida Ramón Picarte 2000, Sector Centro';
  }),
}));

// Mock del mapa Leaflet
vi.mock('@/components/maps/LocationPickerMap', () => ({
  default: ({
    onChange,
    onUserSelectLocation,
  }: {
    onChange?: (coords: { latitud: number; longitud: number }) => void;
    onUserSelectLocation?: (coords: { latitud: number; longitud: number }) => void;
  }) => (
    <div data-testid="mock-location-picker-map">
      <button
        type="button"
        data-testid="mock-map-click-btn"
        onClick={() => {
          const coords = { latitud: -39.825, longitud: -73.221 };
          onChange?.(coords);
          onUserSelectLocation?.(coords);
        }}
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

  it('debe renderizar todos los campos principales del formulario incluyendo el vinculador a incidentes', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    expect(screen.getByText(/1\. Caracterización del Caso y Clasificación de Daño/i)).toBeDefined();
    expect(screen.getByText(/2\. Ubicación Georreferenciada y Sector Territorial/i)).toBeDefined();
    expect(screen.getByText(/3\. Datos Preliminares de Contacto/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Afectación Social/i)).toBeDefined();
    expect(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i)).toBeDefined();
    expect(screen.getByText(/Dirección de Referencia o Calle \*/i)).toBeDefined();
    expect(screen.getByText(/Vincular a Incidente en Curso \(Opcional\)/i)).toBeDefined();
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

  it('debe sincronizar la dirección en el input cuando se selecciona un punto en el mapa', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    const simularMapaBtn = screen.getByTestId('mock-map-click-btn');
    fireEvent.click(simularMapaBtn);

    const latInput = screen.getByLabelText(/Latitud/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitud/i) as HTMLInputElement;
    const dirInput = screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i) as HTMLInputElement;

    expect(latInput.value).toBe('-39.825');
    expect(lngInput.value).toBe('-73.221');

    await waitFor(() => {
      expect(geocoding.geocodificacionInversaEnValdivia).toHaveBeenCalledWith(-39.825, -73.221);
      expect(dirInput.value).toBe('Avenida Ramón Picarte 2000, Sector Centro');
    });
  });

  it('debe sincronizar las coordenadas del mapa cuando se ingresa una dirección escrita y se pulsa ubicar en mapa', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    const dirInput = screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i) as HTMLInputElement;
    fireEvent.change(dirInput, { target: { value: 'Avenida Picarte 1500' } });

    const ubicarBtn = screen.getByRole('button', { name: /Ubicar en mapa/i });
    fireEvent.click(ubicarBtn);

    await waitFor(() => {
      expect(geocoding.geocodificarDireccionEnValdivia).toHaveBeenCalledWith('Avenida Picarte 1500');
    });

    const latInput = screen.getByLabelText(/Latitud/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitud/i) as HTMLInputElement;

    expect(latInput.value).toBe('-39.8256');
    expect(lngInput.value).toBe('-73.2321');
  });

  it('debe enviar el payload con incidenteId nulo cuando no se selecciona incidente', async () => {
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
    fireEvent.change(screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i), {
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

  it('debe vincular un incidente cuando el usuario lo selecciona en el campo opcional', async () => {
    const mockCreado = {
      id: '70000000-0000-4000-8000-000000000006',
      codigo: 'AS-2026-0006',
      descripcion: 'Vivienda anegada derivada de desborde de río',
      tipoAfectacion: 'VIVIENDA_ANEGADA',
      personasAfectadas: 2,
      familiasAfectadas: 1,
      direccionTexto: 'Costanera Arturo Prat 200',
      latitud: -39.814,
      longitud: -73.245,
      prioridad: 'ALTA' as const,
      estado: 'PENDIENTE' as const,
      contactoNombre: null,
      contactoTelefono: null,
      contactoRut: null,
      delegacionId: null,
      delegacionNombre: null,
      incidenteId: '11111111-1111-4000-8000-111111111111',
      asistenteSocialId: null,
      asistenteSocialNombre: null,
      creadoPor: { id: 'user-1', nombre: 'Encargado' },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    vi.spyOn(asistenciaSocialService, 'crearEventoAsistenciaSocial').mockResolvedValueOnce(mockCreado);

    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    // Esperar a que carguen los incidentes en el Select
    await waitFor(() => {
      expect(screen.getByText(/INC-2026-0001/i)).toBeDefined();
    });

    // Seleccionar el incidente
    const selects = screen.getAllByRole('combobox');
    const selectIncidente = selects.find((s) => s.innerHTML.includes('INC-2026-0001')) || selects[1];
    fireEvent.change(selectIncidente, {
      target: { value: '11111111-1111-4000-8000-111111111111' },
    });

    // Llenar campos obligatorios
    fireEvent.change(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i), {
      target: { value: 'Vivienda anegada derivada de desborde de río' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i), {
      target: { value: 'Costanera Arturo Prat 200' },
    });

    const submitBtn = screen.getByRole('button', { name: /Guardar Evento de Asistencia Social/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(asistenciaSocialService.crearEventoAsistenciaSocial).toHaveBeenCalledWith(
        expect.objectContaining({
          descripcion: 'Vivienda anegada derivada de desborde de río',
          direccionTexto: 'Costanera Arturo Prat 200',
          incidenteId: '11111111-1111-4000-8000-111111111111',
        }),
        '00000000-0000-4000-8000-000000000003'
      );
    });
  });
});
