import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { IncidenteDetalleDrawer } from '../IncidenteDetalleDrawer';
import * as incidentesService from '@/services/incidentesService';
import * as misionesService from '@/services/misionesService';
import type { IncidenteDetalle } from '@/services/incidentesService';
import type { MisionDetalleCompleto } from '@/types/misiones';
import {
  clearTrazabilidadCache,
  getIncidentePorMision,
  getTrazabilidadEstado,
  getTrazabilidadPorIncidente,
  setTrazabilidadEstado,
} from '@/lib/socket/trazabilidadStore';

let socketListeners: Record<string, ((...args: unknown[]) => void)[]> = {};
const mockSocket = {
  connected: true,
  connect: vi.fn(),
  emit: vi.fn(),
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (!socketListeners[event]) socketListeners[event] = [];
    socketListeners[event].push(handler);
    return mockSocket;
  }),
  off: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (socketListeners[event]) {
      socketListeners[event] = socketListeners[event].filter((h) => h !== handler);
    }
    return mockSocket;
  }),
};

vi.mock('@/lib/socket/client', () => ({
  getSocket: () => mockSocket,
}));

vi.mock('@/components/ui/Toast', () => {
  const toastMock = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn(),
    showWarning: vi.fn(),
  };
  return {
    useToast: () => toastMock,
    useOptionalToast: () => toastMock,
  };
});

describe('Componente IncidenteDetalleDrawer e integración HU-17', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTrazabilidadCache();
    socketListeners = {};
    mockSocket.connected = true;
  });

  const mockDetalleIncidente: IncidenteDetalle = {
    id: 'i1000000-0000-4000-8000-000000000001',
    codigo: 'INC-2026-0042',
    codigoSeguimiento: '82947102',
    tipoAfectacion: 'Caída de Árbol',
    descripcion: 'Árbol sobre cableado eléctrico',
    direccion: 'Av. Balmaceda 450',
    latitud: -39.8142,
    longitud: -73.2459,
    estado: 'EN_ATENCION',
    prioridad: 'ALTA',
    requiereAsistenciaSocial: false,
    fuenteOrigen: 'CHATBOT',
    informante: {
      nombre: 'Pedro Informante',
      telefono: '+56911223344',
      email: 'pedro@gmail.com',
    },
    delegacion: {
      id: 'del-01',
      nombre: 'Collico',
    },
    misiones: [
      {
        id: 'm1000000-0000-4000-8000-000000000001',
        codigo: 'MIS-2026-0001',
        titulo: 'Despeje de cables',
        descripcion: 'Poda urgente',
        tipoMision: 'ATENCION_CUADRILLA',
        estado: 'EN_CURSO',
        prioridad: 'ALTA',
        justificacionRechazo: null,
        patrulla: null,
        cuadrilla: {
          id: 'c1',
          nombre: 'Cuadrilla Alfa 1',
          estado: 'EN_MISION',
        },
        fechaInicio: '2026-10-02T14:00:00Z',
        fechaCierre: null,
        creadoEn: '2026-10-02T13:30:00Z',
      },
    ],
    recursosAsociados: [],
    creadoEn: '2026-10-02T13:00:00Z',
    actualizadoEn: '2026-10-02T14:00:00Z',
  };

  const mockMisionDetalle: MisionDetalleCompleto = {
    id: 'm1000000-0000-4000-8000-000000000001',
    codigo: 'MIS-2026-0001',
    titulo: 'Despeje de cables',
    descripcion: 'Poda urgente',
    tipoMision: 'ATENCION_CUADRILLA',
    estado: 'EN_CURSO',
    prioridad: 'ALTA',
    justificacionRechazo: null,
    fechaInicio: '2026-10-02T14:00:00Z',
    fechaCierre: null,
    creadoEn: '2026-10-02T13:30:00Z',
    actualizadoEn: '2026-10-02T14:00:00Z',
    creadoPor: null,
    encargado: null,
    incidente: null,
    prevencion: null,
    cuadrilla: {
      id: 'c1',
      nombre: 'Cuadrilla Alfa 1',
      estado: 'EN_MISION',
      delegacionNombre: 'Collico',
      delegado: null,
      recursos: [],
    },
    patrulla: null,
    bitacoraTiempos: [],
    reportesTerreno: [],
  };

  it('no debe renderizar el drawer si incidenteId es null', () => {
    const { container } = render(
      <IncidenteDetalleDrawer
        incidenteId={null}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe abrir MisionDetalleModal al hacer clic en "Ver Detalles" de una misión dentro del drawer', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    vi.spyOn(misionesService, 'obtenerDetalleMision').mockResolvedValueOnce({
      exito: true,
      datos: mockMisionDetalle,
      mensaje: 'Mision OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    // Esperar a que cargue el incidente
    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
      expect(screen.getByText('MIS-2026-0001: Despeje de cables')).toBeDefined();
    });

    // Clic en el botón "Ver Detalles" de la misión
    const btnVerDetalles = screen.getByRole('button', {
      name: /Ver detalles de la misión MIS-2026-0001/i,
    });
    fireEvent.click(btnVerDetalles);

    // Debe abrirse el modal de misión sobre el drawer
    await waitFor(() => {
      expect(misionesService.obtenerDetalleMision).toHaveBeenCalledWith(
        'm1000000-0000-4000-8000-000000000001',
        'user-test'
      );
    });

    // Cerrar el modal de misión con el botón de pie "Cerrar Detalle"
    const btnCerrarMision = screen.getByRole('button', { name: 'Cerrar Detalle' });
    fireEvent.click(btnCerrarMision);

    // El drawer de incidente sigue abierto sin pérdida de contexto
    expect(screen.getByText('INC-2026-0042')).toBeDefined();
  });

  it('muestra la barra de despacho táctico con botón habilitado para intentar el despacho incluso si la patrulla está verificando', async () => {
    const incidenteVerificando: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          id: 'mis-v1',
          codigo: 'MIS-2026-0010',
          titulo: 'Verificación en terreno',
          descripcion: null,
          tipoMision: 'VERIFICACION',
          estado: 'EN_SITIO', // Verificación en curso
          prioridad: 'ALTA',
          justificacionRechazo: null,
          patrulla: { id: 'p1', nombre: 'Patrulla Alpha', estado: 'EN_TERRENO' },
          cuadrilla: null,
          fechaInicio: '2026-10-02T13:30:00Z',
          fechaCierre: null,
          creadoEn: '2026-10-02T13:30:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: incidenteVerificando,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Intervención Táctica Operativa/i)).toBeDefined();
      expect(screen.getByText(/Patrulla asignada: Patrulla Alpha \(EN_SITIO\)/i)).toBeDefined();
    });

    const btnDespachar = screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i });
    expect(btnDespachar.hasAttribute('disabled')).toBe(false);
  });

  it('permite abrir ModalAsignarCuadrilla cuando la verificación concluyó', async () => {
    const incidenteVerificadoListo: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          id: 'mis-v2',
          codigo: 'MIS-2026-0011',
          titulo: 'Verificación concluida',
          descripcion: null,
          tipoMision: 'VERIFICACION',
          estado: 'COMPLETADA',
          prioridad: 'ALTA',
          justificacionRechazo: null,
          patrulla: { id: 'p1', nombre: 'Patrulla Alpha', estado: 'DISPONIBLE' },
          cuadrilla: null,
          fechaInicio: '2026-10-02T13:30:00Z',
          fechaCierre: '2026-10-02T14:00:00Z',
          creadoEn: '2026-10-02T13:30:00Z',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: incidenteVerificadoListo,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Intervención Táctica Operativa/i)).toBeDefined();
    });

    const btnDespachar = screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i });
    expect(btnDespachar.hasAttribute('disabled')).toBe(false);

    fireEvent.click(btnDespachar);

    // Debe abrirse el modal emergente de despacho
    await waitFor(() => {
      expect(screen.getByText('Despachar Cuadrilla Operativa')).toBeDefined();
    });
  });

  it('no muestra el botón de despacho táctico en incidentes que ya están EN_ATENCION', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: {
        ...mockDetalleIncidente,
        estado: 'EN_ATENCION',
      },
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: /Despachar Cuadrilla Operativa/i })).toBeNull();
  });

  it('muestra el botón de despacho de cuadrilla en incidentes REPORTADO para despacho táctico directo', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: {
        ...mockDetalleIncidente,
        estado: 'REPORTADO',
        misiones: [],
      },
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(screen.getByRole('button', { name: /Despachar Cuadrilla Operativa/i })).toBeDefined();
    expect(screen.getByText(/Sin patrulla previa asignada \(despacho táctico directo\)/i)).toBeDefined();
  });

  it('muestra el botón "Despachar Patrulla Verificadora" cuando el incidente está en estado REPORTADO y abre el modal', async () => {
    const mockIncidenteReportado: IncidenteDetalle = {
      ...mockDetalleIncidente,
      id: 'inc-reportado-1',
      codigo: 'INC-2026-9999',
      estado: 'REPORTADO',
      misiones: [],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockIncidenteReportado,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="inc-reportado-1"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-9999')).toBeDefined();
    });

    // En estado REPORTADO, el botón de despachar patrulla en la sección inferior debe estar presente
    const btnDespachar = screen.getByRole('button', { name: /Despachar Patrulla Verificadora/i });
    expect(btnDespachar).toBeDefined();

    // Clic en el botón de despachar patrulla
    fireEvent.click(btnDespachar);

    // Debe abrirse el modal de asignación de patrulla
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /Asignar Patrulla Verificadora/i })).toBeDefined();
    });
  });

  it('NO muestra el botón "Despachar Patrulla Verificadora" si el incidente ya está en estado EN_ATENCION o VERIFICANDO', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente, // estado: EN_ATENCION
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    // En estado EN_ATENCION, no debe estar el botón
    const btnDespachar = screen.queryByRole('button', { name: /Despachar Patrulla/i });
    expect(btnDespachar).toBeNull();
  });

  it('actualiza reactivamente el estado de trazabilidad de la misión ante notificacion:trazabilidad_actualizada', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    // Antes del evento, no se visualiza el badge de trazabilidad
    expect(
      screen.queryByTestId('badge-trazabilidad-m1000000-0000-4000-8000-000000000001')
    ).toBeNull();

    // Simular recepción de evento de socket
    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        patrullaId: 'pat-1',
        estado: 'RECIBIDA',
      });
    });

    // Se debe renderizar el badge con el texto esperado
    await waitFor(() => {
      const badge = screen.getByTestId(
        'badge-trazabilidad-m1000000-0000-4000-8000-000000000001'
      );
      expect(badge).toBeDefined();
      expect(badge.textContent).toBe('Recibida en móvil de terreno');
    });

    // Transición a LEIDA
    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-1',
        misionId: 'm1000000-0000-4000-8000-000000000001',
        patrullaId: 'pat-1',
        estado: 'LEIDA',
      });
    });

    await waitFor(() => {
      const badge = screen.getByTestId(
        'badge-trazabilidad-m1000000-0000-4000-8000-000000000001'
      );
      expect(badge.textContent).toBe('Leída por operador en terreno');
    });
  });

  it('hidrata el badge de trazabilidad desde el cache local cuando el detalle de API omite trazabilidadNotificacion', async () => {
    setTrazabilidadEstado('m1000000-0000-4000-8000-000000000001', 'RECIBIDA');

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    const badge = screen.getByTestId(
      'badge-trazabilidad-m1000000-0000-4000-8000-000000000001'
    );
    expect(badge).toBeDefined();
    expect(badge.textContent).toBe('Recibida en móvil de terreno');
  });

  it('muestra el resumen superior de lectura en terreno para patrulla activa y actualiza en vivo al recibir LEIDA', async () => {
    const detalleConPatrulla: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          ...mockDetalleIncidente.misiones[0],
          id: 'm-pat-001',
          codigo: 'MIS-2026-0099',
          tipoMision: 'VERIFICACION',
          estado: 'DESPACHADA',
          cuadrilla: null,
          patrulla: {
            id: 'pat-01',
            nombre: 'Patrulla Rápida Norte',
            estado: 'EN_VERIFICACION',
          },
          trazabilidadNotificacion: 'PENDIENTE_ENVIO',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: detalleConPatrulla,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId="i1000000-0000-4000-8000-000000000001"
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('drawer-trazabilidad-resumen')).toBeDefined();
    });

    const resumenInicial = screen.getByTestId('drawer-trazabilidad-resumen');
    expect(resumenInicial.textContent).toContain('NO LEÍDA');
    expect(getIncidentePorMision('m-pat-001')).toBe('i1000000-0000-4000-8000-000000000001');

    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-99',
        misionId: 'm-pat-001',
        patrullaId: 'pat-01',
        estado: 'LEIDA',
      });
    });

    await waitFor(() => {
      const resumenActualizado = screen.getByTestId('drawer-trazabilidad-resumen');
      expect(resumenActualizado.textContent).toContain('LEÍDA: Leída por operador en terreno');
    });
  });

  it('BUG-H35-WEB-04: ignora eventos de misiones ajenas sin contaminar el caché del incidente abierto', async () => {
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId={mockDetalleIncidente.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-ajena',
        misionId: 'mision-de-otro-incidente-B',
        patrullaId: 'pat-99',
        estado: 'LEIDA',
      });
    });

    expect(getIncidentePorMision('mision-de-otro-incidente-B')).toBeUndefined();
    expect(getTrazabilidadEstado('mision-de-otro-incidente-B')).toBeUndefined();
    expect(getTrazabilidadPorIncidente(mockDetalleIncidente.id)).toBeUndefined();
    expect(
      screen.queryByTestId('badge-trazabilidad-m1000000-0000-4000-8000-000000000001')
    ).toBeNull();
  });

  it('BUG-H35-WEB-05: impide retroceso visual si llega un evento RECIBIDA o ENVIADA tras LEIDA', async () => {
    const detalleLeida: IncidenteDetalle = {
      ...mockDetalleIncidente,
      estado: 'VERIFICANDO',
      misiones: [
        {
          ...mockDetalleIncidente.misiones[0],
          id: 'm-pat-leida',
          codigo: 'MIS-2026-0111',
          tipoMision: 'VERIFICACION',
          estado: 'DESPACHADA',
          cuadrilla: null,
          patrulla: {
            id: 'pat-11',
            nombre: 'Patrulla Sur',
            estado: 'EN_VERIFICACION',
          },
          trazabilidadNotificacion: 'LEIDA',
        },
      ],
    };

    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: detalleLeida,
      mensaje: 'OK',
    });

    render(
      <IncidenteDetalleDrawer
        incidenteId={mockDetalleIncidente.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('badge-trazabilidad-m-pat-leida').textContent).toBe(
        'Leída por operador en terreno'
      );
    });

    act(() => {
      const handler = socketListeners['notificacion:trazabilidad_actualizada']?.[0];
      handler?.({
        notificacionId: 'notif-tardia',
        misionId: 'm-pat-leida',
        patrullaId: 'pat-11',
        estado: 'RECIBIDA',
      });
      handler?.({
        notificacionId: 'notif-tardia',
        misionId: 'm-pat-leida',
        patrullaId: 'pat-11',
        estado: 'ENVIADA',
      });
    });

    expect(screen.getByTestId('badge-trazabilidad-m-pat-leida').textContent).toBe(
      'Leída por operador en terreno'
    );
    expect(screen.getByTestId('drawer-trazabilidad-resumen').textContent).toContain(
      'LEÍDA: Leída por operador en terreno'
    );
  });

  it('BUG-H35-WEB-07: asegura conexión del socket y suscripción a sala:encargados en montaje aislado sin emitir salir al cerrar', async () => {
    mockSocket.connected = false;
    vi.spyOn(incidentesService, 'obtenerDetalleIncidente').mockResolvedValueOnce({
      exito: true,
      datos: mockDetalleIncidente,
      mensaje: 'OK',
    });

    const { unmount } = render(
      <IncidenteDetalleDrawer
        incidenteId={mockDetalleIncidente.id}
        userId="user-test"
        onCerrar={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('INC-2026-0042')).toBeDefined();
    });

    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));

    act(() => {
      mockSocket.connected = true;
      socketListeners['connect']?.forEach((cb) => cb());
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('join', 'encargado');
    expect(mockSocket.emit).toHaveBeenCalledWith('unirse', 'sala:encargados');

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith(
      'notificacion:trazabilidad_actualizada',
      expect.any(Function)
    );
    expect(mockSocket.emit).not.toHaveBeenCalledWith('salir', 'sala:encargados');
  });
});
