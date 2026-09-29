import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AvisoDetalleModal from '../AvisoDetalleModal';
import * as avisosService from '@/services/avisosService';
import type { AvisoItem } from '@/types/avisos';

vi.mock('@/components/maps/AvisoMap', () => ({
  default: () => <div data-testid="aviso-map" />,
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showWarning: vi.fn(),
  }),
}));

describe('AvisoDetalleModal', () => {
  const avisoPrueba: AvisoItem = {
    id: '64222dc8-6292-4b1d-b2ec-d4f011229c4d',
    codigoSeguimiento: '62876266',
    tipoAfectacion: 'Inundación',
    tipoPreliminarNombre: 'Inundación',
    direccionTexto: 'Av. Alemania 640',
    descripcion: 'Desborde de estero cercano provocando ingreso de agua.',
    latitud: -39.8179842,
    longitud: -73.2361028,
    informanteNombre: 'Rodrigo Fuentes',
    informanteRut: '11755048-6',
    informanteTelefono: '+56973429909',
    origenReporte: 'TELEFONO',
    estado: 'PENDIENTE_VERIFICACION',
    esDuplicado: false,
    motivoDescarte: null,
    operadorId: null,
    incidenteId: null,
    minutosEnEspera: 10,
    creadoEn: '2026-09-27T16:15:50.949Z',
    actualizadoEn: '2026-09-27T16:15:50.949Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(avisosService, 'obtenerDetalleAviso').mockResolvedValue({
      ...avisoPrueba,
      datosInformante: {
        nombre: 'Rodrigo Fuentes',
        rut: '11755048-6',
        telefono: '+56973429909',
        direccionAproximada: 'Av. Alemania 640',
      },
      adjuntos: [],
    });
  });

  it('no debe renderizar nada si aviso es null', () => {
    const { container } = render(
      <AvisoDetalleModal
        aviso={null}
        operadorId="op-123"
        onClose={vi.fn()}
        onAccionCompletada={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debe manejar catálogo como array de strings sin lanzar TypeError y autoseleccionar coincidencia', async () => {
    // Simula lo que devuelve /api/incidentes/tipos en el backend real
    vi.spyOn(avisosService, 'obtenerTiposIncidentes').mockResolvedValue([
      { id: 'a0000000-0000-4000-8000-000000000001', nombre: 'Anegamiento' },
      { id: 'a0000000-0000-4000-8000-000000000002', nombre: 'Caída de árbol' },
    ]);

    render(
      <AvisoDetalleModal
        aviso={avisoPrueba}
        operadorId="c1111111-1111-4111-8111-111111111111"
        onClose={vi.fn()}
        onAccionCompletada={vi.fn()}
      />
    );

    // Debe renderizar el modal sin crashear
    await waitFor(() => {
      expect(screen.getByText(/Acción: Verificar y Enviar a Operaciones/i)).toBeDefined();
    });

    // Debe mostrar los datos del informante
    expect(screen.getByText('Rodrigo Fuentes')).toBeDefined();
    expect(screen.getByText('11755048-6')).toBeDefined();
  });

  it('debe normalizar tipos cuando la API devuelve strings crudos y permitir verificar', async () => {
    // Simula la función normalizadora manejando strings
    vi.spyOn(avisosService, 'obtenerTiposIncidentes').mockResolvedValue(
      ['Anegamiento', 'Caída de árbol', 'Corte de energía'] as unknown as import('@/types/avisos').TipoIncidenteOpcion[]
    );

    const onAccionCompletada = vi.fn();
    const onClose = vi.fn();

    vi.spyOn(avisosService, 'verificarAviso').mockResolvedValue({
      mensaje: 'Aviso verificado exitosamente',
      avisoId: avisoPrueba.id,
      incidenteId: 'inc-123',
      folio: 'INC-2026-0001',
      estado: 'Reportado',
    });

    render(
      <AvisoDetalleModal
        aviso={avisoPrueba}
        operadorId="c1111111-1111-4111-8111-111111111111"
        onClose={onClose}
        onAccionCompletada={onAccionCompletada}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Verificar y Enviar a Operaciones/i })).toBeDefined();
    });

    const botonVerificar = screen.getByRole('button', { name: /Verificar y Enviar a Operaciones/i });
    fireEvent.click(botonVerificar);

    await waitFor(() => {
      expect(avisosService.verificarAviso).toHaveBeenCalledTimes(1);
    });
  });
});
