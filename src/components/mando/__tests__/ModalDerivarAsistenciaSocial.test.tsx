import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalDerivarAsistenciaSocial } from '../ModalDerivarAsistenciaSocial';
import * as useAsistentesModule from '@/hooks/useAsistentesSociales';
import * as asistenciaSocialService from '@/services/asistenciaSocialService';
import type { IncidenteResumen } from '@/services/incidentesService';

vi.mock('@/hooks/useAsistentesSociales');

describe('ModalDerivarAsistenciaSocial (HU-25)', () => {
  const mockRecargar = vi.fn().mockResolvedValue(undefined);
  const mockOnClose = vi.fn();
  const mockOnDerivado = vi.fn();

  const incidenteResuelto: IncidenteResumen = {
    id: 'inc-res-1',
    codigo: 'INC-2026-0450',
    tipoAfectacion: 'VIVIENDA_ANEGADA',
    descripcion: 'Vivienda con anegamiento en primer piso',
    direccion: 'Av. Picarte 1420',
    estado: 'RESUELTO',
    prioridad: 'ALTA',
    personasAfectadas: 4,
    requiereAsistenciaSocial: true,
    delegacionNombre: 'Centro',
    creadoEn: '2026-11-21T10:00:00Z',
    actualizadoEn: '2026-11-21T12:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAsistentesModule.useAsistentesSociales).mockReturnValue({
      asistentes: [
        {
          usuarioId: 'asoc-1',
          rut: '16.543.210-1',
          nombreCompleto: 'Camila Soto Méndez',
          delegacionId: 'del-1',
          delegacionNombre: 'Centro',
          estadoOperativo: 'disponible',
          casosFibeAsignados: 1,
        },
        {
          usuarioId: 'asoc-2',
          rut: '17.111.222-3',
          nombreCompleto: 'Luis Paredes',
          delegacionId: 'del-1',
          delegacionNombre: 'Centro',
          estadoOperativo: 'en_terreno',
          casosFibeAsignados: 4,
        },
      ],
      meta: { total: 2, pagina: 1, limite: 50, totalPaginas: 1 },
      cargando: false,
      error: null,
      statusCode: null,
      recargar: mockRecargar,
    });
  });

  it('filtra solo profesionales disponibles, muestra contexto FIBE/DGRD y prohíbe referencias a Albergues/DIDECO (§3.5)', () => {
    const { container } = render(
      <ModalDerivarAsistenciaSocial
        isOpen
        onClose={mockOnClose}
        incidente={incidenteResuelto}
        usuarioId="enc-1"
        onDerivado={mockOnDerivado}
      />
    );

    expect(screen.getByText('INC-2026-0450')).toBeInTheDocument();
    expect(screen.getByText(/4 persona\(s\) damnificada\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Av\. Picarte 1420/i)).toBeInTheDocument();
    expect(screen.getByText(/Ficha Básica de Emergencia \(FIBE\)/i)).toBeInTheDocument();

    // Solo debe aparecer Camila Soto (disponible), no Luis Paredes (en_terreno)
    expect(screen.getByText('Camila Soto Méndez')).toBeInTheDocument();
    expect(screen.queryByText('Luis Paredes')).not.toBeInTheDocument();

    // Regla §3.5: cero menciones a Albergues o DIDECO
    expect(container.textContent).not.toMatch(/albergue|dideco/i);

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Derivación/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('muestra aviso de actualización si ya existe evento PENDIENTE y envía derivación al confirmar', async () => {
    const spyDerivar = vi
      .spyOn(asistenciaSocialService, 'derivarIncidenteAAsistenciaSocial')
      .mockResolvedValueOnce({
        evento: {
          id: 'ev-1',
          codigo: 'AS-2026-0010',
          descripcion: 'Derivación FIBE',
          tipoAfectacion: 'VIVIENDA_ANEGADA',
          personasAfectadas: 4,
          familiasAfectadas: 1,
          direccionTexto: 'Av. Picarte 1420',
          latitud: -39.81,
          longitud: -73.24,
          prioridad: 'ALTA',
          estado: 'ASIGNADO',
          incidenteId: 'inc-res-1',
          asistenteSocialId: 'asoc-1',
          asistenteSocialNombre: 'Camila Soto Méndez',
          creadoEn: '2026-11-21T12:00:00Z',
          actualizadoEn: '2026-11-21T12:05:00Z',
        },
        accion: 'ACTUALIZADO',
        hitoRegistrado: {
          hito: 'DERIVACION_ASISTENCIA_SOCIAL',
          descripcion: 'Derivado a Camila Soto Méndez',
        },
      });

    render(
      <ModalDerivarAsistenciaSocial
        isOpen
        onClose={mockOnClose}
        incidente={{
          ...incidenteResuelto,
          asistenciaSocial: {
            id: 'ev-1',
            codigo: 'AS-2026-0010',
            estado: 'PENDIENTE',
          },
        }}
        usuarioId="enc-1"
        onDerivado={mockOnDerivado}
      />
    );

    expect(screen.getByText(/evento social pendiente/i)).toBeInTheDocument();

    const radio = screen.getByRole('radio', { name: /Camila Soto Méndez/i });
    fireEvent.click(radio);

    const textarea = screen.getByLabelText(/Observaciones para el profesional/i);
    fireEvent.change(textarea, { target: { value: 'Priorizar grupo familiar con niños' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Derivación/i });
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(spyDerivar).toHaveBeenCalledWith(
        {
          incidenteId: 'inc-res-1',
          asistenteSocialId: 'asoc-1',
          observaciones: 'Priorizar grupo familiar con niños',
        },
        'enc-1',
        expect.objectContaining({
          codigo: 'INC-2026-0450',
          direccion: 'Av. Picarte 1420',
        })
      );
      expect(mockOnDerivado).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('maneja error HTTP 409 mostrando alerta y recargando la nómina de disponibles', async () => {
    vi.spyOn(asistenciaSocialService, 'derivarIncidenteAAsistenciaSocial').mockRejectedValueOnce(
      new asistenciaSocialService.AsistenciaSocialServiceError(
        'El profesional ya no se encuentra disponible',
        { statusCode: 409 }
      )
    );

    render(
      <ModalDerivarAsistenciaSocial
        isOpen
        onClose={mockOnClose}
        incidente={incidenteResuelto}
        usuarioId="enc-1"
        onDerivado={mockOnDerivado}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /Camila Soto Méndez/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Derivación/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'El profesional ya no se encuentra disponible'
      );
      expect(mockRecargar).toHaveBeenCalledTimes(1);
    });
  });
});
