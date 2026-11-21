import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventoAsistenciaSocialForm from '../EventoAsistenciaSocialForm';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import * as asistentesSocialesService from '@/services/asistentesSocialesService';
import * as geocoding from '@/lib/maps/geocoding';
import { incidentesService } from '@/services/incidentesService';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
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
    obtenerDetalle: vi.fn(async () => ({
      exito: false,
      mensaje: 'No encontrado',
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
  geocodificacionInversaEnValdivia: vi.fn(async () => {
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
    mockSearchParams = new URLSearchParams();
    vi.spyOn(asistentesSocialesService, 'obtenerAsistentesSociales').mockResolvedValue({
      data: [
        {
          usuarioId: '50000000-0000-4000-8000-000000000001',
          rut: '16.789.012-3',
          nombres: 'Camila Andrea',
          apellidos: 'Valenzuela Castro',
          nombreCompleto: 'Camila Valenzuela Castro',
          email: 'cvalenzuela@valdivia.cl',
          telefono: '+56987654321',
          delegacionId: '30000000-0000-4000-8000-000000000001',
          delegacionCodigo: 'COSTA',
          delegacionNombre: 'Delegación Municipal Costa',
          personalId: '60000000-0000-4000-8000-000000000001',
          estadoOperativo: 'disponible',
          casosFibeAsignados: 1,
        },
      ],
      meta: { total: 1, pagina: 1, limite: 50, totalPaginas: 1 },
    });
    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValue({
      data: [],
      total: 0,
      pagina: 1,
      limite: 50,
      totalPaginas: 1,
    });
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

  it('debe inicializar todos los campos sin nada preseleccionado por defecto', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    const tipoSelect = screen.getByLabelText(/Tipo de Afectación Social/i) as HTMLSelectElement;
    const prioridadSelect = screen.getByLabelText(/Prioridad de Atención/i) as HTMLSelectElement;
    const personasInput = screen.getByLabelText(/Personas Afectadas Estimadas/i) as HTMLInputElement;
    const familiasInput = screen.getByLabelText(/Familias \/ Hogares Afectados/i) as HTMLInputElement;
    const latInput = screen.getByLabelText(/Latitud \*/i) as HTMLInputElement;
    const lngInput = screen.getByLabelText(/Longitud \*/i) as HTMLInputElement;
    const dirInput = screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/Descripción de la Excepcionalidad Social/i) as HTMLTextAreaElement;

    expect(tipoSelect.value).toBe('');
    expect(prioridadSelect.value).toBe('');
    expect(personasInput.value).toBe('');
    expect(familiasInput.value).toBe('');
    expect(latInput.value).toBe('');
    expect(lngInput.value).toBe('');
    expect(dirInput.value).toBe('');
    expect(descInput.value).toBe('');
    const asistenteSelect = screen.getByLabelText(/Asistente Social Disponible/i) as HTMLSelectElement;
    expect(asistenteSelect.value).toBe('');
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

    // Llenar campos requeridos sin valores predeterminados
    fireEvent.change(screen.getByLabelText(/Tipo de Afectación Social/i), {
      target: { value: 'VIVIENDA_ANEGADA' },
    });
    fireEvent.change(screen.getByLabelText(/Prioridad de Atención/i), {
      target: { value: 'ALTA' },
    });
    fireEvent.click(screen.getByTestId('mock-map-click-btn'));

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
          prioridad: 'ALTA',
          latitud: -39.825,
          longitud: -73.221,
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
      latitud: -39.825,
      longitud: -73.221,
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

    // Seleccionar campos requeridos
    fireEvent.change(screen.getByLabelText(/Tipo de Afectación Social/i), {
      target: { value: 'VIVIENDA_ANEGADA' },
    });
    fireEvent.change(screen.getByLabelText(/Prioridad de Atención/i), {
      target: { value: 'ALTA' },
    });
    fireEvent.click(screen.getByTestId('mock-map-click-btn'));

    // Seleccionar el incidente
    const selects = screen.getAllByRole('combobox');
    const selectIncidente = selects.find((s) => s.innerHTML.includes('INC-2026-0001')) || selects[2];
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
          tipoAfectacion: 'VIVIENDA_ANEGADA',
          prioridad: 'ALTA',
          latitud: -39.825,
          longitud: -73.221,
          incidenteId: '11111111-1111-4000-8000-111111111111',
        }),
        '00000000-0000-4000-8000-000000000003'
      );
    });
  });

  it('debe desplegar la ficha resumen del caso en modal al hacer clic en Desplegar Ficha del Caso y cerrarla al presionar Cerrar Ficha', async () => {
    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    // Ingresar datos
    fireEvent.change(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i), {
      target: { value: 'Familia damnificada por anegamiento severo' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i), {
      target: { value: 'Pasaje Los Coihues 450' },
    });

    // Abrir ficha
    const desplegarBtn = screen.getByRole('button', { name: /Desplegar Ficha del Caso/i });
    expect(desplegarBtn).toBeDefined();
    fireEvent.click(desplegarBtn);

    // Verificar que el modal se desplegó con los datos
    expect(screen.getByText(/Ficha de Evento Social \(Vista Previa\)/i)).toBeDefined();
    expect(screen.getAllByText('Familia damnificada por anegamiento severo').length).toBe(2);
    expect(screen.getAllByText('Pasaje Los Coihues 450').length).toBeGreaterThanOrEqual(1);

    // Cerrar ficha
    const cerrarBtn = screen.getByRole('button', { name: /Cerrar Ficha/i });
    fireEvent.click(cerrarBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Ficha de Evento Social \(Vista Previa\)/i)).toBeNull();
    });
  });

  it('envía asistenteSocialId de forma atómica (Opción A) y redirige a ?estado=ASIGNADO', async () => {
    vi.spyOn(asistenciaSocialService, 'crearEventoAsistenciaSocial').mockResolvedValueOnce({
      id: '70000000-0000-4000-8000-000000000008',
      codigo: 'AS-2026-0008',
      descripcion: 'Anegamiento crítico en vivienda con adulto mayor',
      tipoAfectacion: 'VIVIENDA_ANEGADA',
      personasAfectadas: 2,
      familiasAfectadas: 1,
      direccionTexto: 'Calle Los Notros 890',
      latitud: -39.825,
      longitud: -73.221,
      prioridad: 'ALTA',
      estado: 'ASIGNADO',
      contactoNombre: null,
      contactoTelefono: null,
      contactoRut: null,
      delegacionId: null,
      delegacionNombre: null,
      incidenteId: null,
      asistenteSocialId: '50000000-0000-4000-8000-000000000001',
      asistenteSocialNombre: 'Camila Valenzuela Castro',
      creadoPor: { id: 'user-1', nombre: 'Encargado' },
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    });

    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    await waitFor(() => {
      expect(screen.getByText(/Camila Valenzuela Castro/i)).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText(/Tipo de Afectación Social/i), {
      target: { value: 'VIVIENDA_ANEGADA' },
    });
    fireEvent.change(screen.getByLabelText(/Prioridad de Atención/i), {
      target: { value: 'ALTA' },
    });
    fireEvent.click(screen.getByTestId('mock-map-click-btn'));
    fireEvent.change(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i), {
      target: { value: 'Anegamiento crítico en vivienda con adulto mayor' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i), {
      target: { value: 'Calle Los Notros 890' },
    });
    fireEvent.change(screen.getByLabelText(/Asistente Social Disponible/i), {
      target: { value: '50000000-0000-4000-8000-000000000001' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Evento de Asistencia Social/i }));

    await waitFor(() => {
      expect(asistenciaSocialService.crearEventoAsistenciaSocial).toHaveBeenCalledWith(
        expect.objectContaining({
          asistenteSocialId: '50000000-0000-4000-8000-000000000001',
        }),
        '00000000-0000-4000-8000-000000000003'
      );
    });

    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('Camila Valenzuela Castro'),
      'Caso Social Creado y Asignado'
    );
    expect(mockPush).toHaveBeenCalledWith('/gestion/asistente-social?estado=ASIGNADO');
  });

  it('maneja 409 Conflict al crear con asistente, recarga disponibles y conserva datos del formulario', async () => {
    vi.spyOn(asistenciaSocialService, 'crearEventoAsistenciaSocial').mockRejectedValueOnce(
      new asistenciaSocialService.AsistenciaSocialServiceError(
        'El asistente social seleccionado ya no se encuentra disponible.',
        { statusCode: 409 }
      )
    );

    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    await waitFor(() => {
      expect(screen.getByText(/Camila Valenzuela Castro/i)).toBeDefined();
    });

    const llamadasIniciales = vi.mocked(asistentesSocialesService.obtenerAsistentesSociales).mock
      .calls.length;

    fireEvent.change(screen.getByLabelText(/Tipo de Afectación Social/i), {
      target: { value: 'VIVIENDA_ANEGADA' },
    });
    fireEvent.change(screen.getByLabelText(/Prioridad de Atención/i), {
      target: { value: 'ALTA' },
    });
    fireEvent.click(screen.getByTestId('mock-map-click-btn'));
    fireEvent.change(screen.getByLabelText(/Descripción de la Excepcionalidad Social/i), {
      target: { value: 'Situación de emergencia preservada' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ej\. Calle Los Alerces 1420/i), {
      target: { value: 'Pasaje Los Coihues 450' },
    });
    const asistenteSelect = screen.getByLabelText(/Asistente Social Disponible/i) as HTMLSelectElement;
    fireEvent.change(asistenteSelect, {
      target: { value: '50000000-0000-4000-8000-000000000001' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Evento de Asistencia Social/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('ya no se encuentra disponible');
      expect(
        vi.mocked(asistentesSocialesService.obtenerAsistentesSociales).mock.calls.length
      ).toBeGreaterThan(llamadasIniciales);
    });

    expect(asistenteSelect.value).toBe('');
    expect(
      (screen.getByLabelText(/Descripción de la Excepcionalidad Social/i) as HTMLTextAreaElement)
        .value
    ).toBe('Situación de emergencia preservada');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('precarga contexto H39/H38 vía ?incidenteId= y muestra alertas de consistencia de cierre', async () => {
    mockSearchParams = new URLSearchParams('incidenteId=11111111-1111-4000-8000-111111111111');

    vi.mocked(incidentesService.obtenerDetalle).mockResolvedValueOnce({
      exito: true,
      mensaje: 'OK',
      datos: {
        id: '11111111-1111-4000-8000-111111111111',
        codigo: 'INC-2026-0001',
        codigoSeguimiento: '12345678',
        tipoAfectacion: 'Inundación Mayor',
        descripcion: 'Reporte inicial',
        direccion: 'Avenida Costanera 100',
        latitud: -39.81,
        longitud: -73.24,
        estado: 'NO_ABORDABLE',
        prioridad: 'CRITICA',
        requiereAsistenciaSocial: false,
        verificado: true,
        dictamenTerreno: 'NO_ABORDABLE',
        motivoNoAbordable: 'Predio privado cerrado sin morador presente.',
        fuenteOrigen: 'LLAMADA',
        asteriskCallId: null,
        asteriskCallerPhone: null,
        informante: { id: 'inf-1', nombre: 'Juan Pérez', rut: '11.111.111-1', telefono: '+56955555555' },
        delegacion: { id: '30000000-0000-4000-8000-000000000001', nombre: 'Delegación Municipal Norte', descripcion: null },
        creadoPor: null,
        encargado: null,
        misiones: [],
        recursosAsociados: [],
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        reportesEvaluacionTerreno: [
          {
            id: 'rep-h38',
            misionId: 'm-1',
            tipoReporte: 'EVALUACION_PRIORIDAD',
            versionReporte: 1,
            esRectificacion: false,
            etiquetaReporte: 'Evaluación Prioridad',
            creadoEn: '2026-11-21T10:00:00.000Z',
            evaluacion: { nucleoFamiliarTotal: 3, familias: [{ referencia: 'Familia 1' }, { referencia: 'Familia 2' }] },
          },
          {
            id: 'rep-h39',
            misionId: 'm-1',
            tipoReporte: 'VERIFICACION_CIERRE',
            dictamen: 'NO_ABORDABLE',
            motivoNoAbordable: 'Predio privado cerrado sin morador presente.',
            requiereAsistenciaSocial: false,
            personasAfectadas: 5,
            personasAfectadasPrevias: 3,
            personasAfectadasModificadas: true,
            versionReporte: 2,
            esRectificacion: false,
            etiquetaReporte: 'Informe Técnico de Verificación y Cierre',
            resumenTecnico: 'Diagnóstico consolidado al cierre por patrulla.',
            creadoEn: '2026-11-21T11:00:00.000Z',
          },
        ],
      } as unknown as NonNullable<Awaited<ReturnType<typeof incidentesService.obtenerDetalle>>['datos']>,
    });

    vi.spyOn(asistenciaSocialService, 'obtenerEventosAsistenciaSocial').mockResolvedValueOnce({
      data: [
        {
          id: 'ev-dup-1',
          codigo: 'AS-2026-0090',
          descripcion: 'Existente',
          tipoAfectacion: 'VIVIENDA_ANEGADA',
          personasAfectadas: 5,
          familiasAfectadas: 2,
          direccionTexto: 'Avenida Costanera 100',
          latitud: -39.81,
          longitud: -73.24,
          prioridad: 'CRITICA',
          estado: 'PENDIENTE',
          contactoNombre: null,
          contactoTelefono: null,
          contactoRut: null,
          delegacionId: null,
          delegacionNombre: null,
          incidenteId: '11111111-1111-4000-8000-111111111111',
          asistenteSocialId: null,
          asistenteSocialNombre: null,
          creadoPor: { id: 'u1', nombre: 'Encargado' },
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        },
      ],
      total: 1,
      pagina: 1,
      limite: 50,
      totalPaginas: 1,
    });

    render(<EventoAsistenciaSocialForm basePath="/gestion/asistente-social" />);

    await waitFor(() => {
      expect(screen.getByTestId('resumen-verificacion-h39')).toBeDefined();
    });

    expect((screen.getByLabelText(/Tipo de Afectación Social/i) as HTMLSelectElement).value).toBe(
      'VIVIENDA_ANEGADA'
    );
    expect((screen.getByLabelText(/Prioridad de Atención/i) as HTMLSelectElement).value).toBe(
      'CRITICA'
    );
    expect((screen.getByLabelText(/Personas Afectadas Estimadas/i) as HTMLInputElement).value).toBe(
      '5'
    );
    expect((screen.getByLabelText(/Familias \/ Hogares Afectados/i) as HTMLInputElement).value).toBe(
      '2'
    );
    expect(
      (screen.getByLabelText(/Descripción de la Excepcionalidad Social/i) as HTMLTextAreaElement)
        .value
    ).toBe('Diagnóstico consolidado al cierre por patrulla.');
    expect(screen.getByTestId('alerta-incidente-no-abordable').textContent).toContain(
      'Predio privado cerrado sin morador presente.'
    );
    expect(screen.getByTestId('alerta-sin-fibe-h39')).toBeDefined();
    expect(screen.getByTestId('alerta-evento-social-duplicado').textContent).toContain(
      'AS-2026-0090'
    );
  });
});
