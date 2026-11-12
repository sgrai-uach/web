import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VinculoEventoAtpPanel } from '../VinculoEventoAtpPanel';
import * as eventosAtpService from '@/services/eventosAtpService';
import * as permisoHook from '@/hooks/usePuedeVincularEventoAtp';
import { EventoAtpServiceError } from '@/services/eventosAtpService';
import type { EventoAtpResumen, ResultadoVinculacion } from '@/types/eventoAtp';

const eventoAtpId = '50000000-0000-4000-8000-000000000001';
const entidadId = 'a0000000-0000-4000-8000-000000000001';

const eventos: EventoAtpResumen[] = [
  {
    id: eventoAtpId,
    codigo: 'ATP-2026-0001',
    nombre: 'Sistema Frontal Mayo 2026',
    descripcion: 'Sistema frontal con precipitaciones intensas.',
    tipoAmenaza: 'METEOROLOGICA',
    nivelAlerta: 'AMARILLA',
    fechaInicio: '2026-05-01T10:00:00.000Z',
    fechaTermino: '2026-05-03T18:00:00.000Z',
    estado: 'ACTIVO',
    delegaciones: [],
    creadoPorId: '00000000-0000-4000-8000-000000000003',
    creadoEn: '2026-05-01T09:55:00.000Z',
    actualizadoEn: '2026-05-01T09:55:00.000Z',
    totalVinculados: 1,
  },
];

const resultado: ResultadoVinculacion = {
  eventoAtpId,
  accion: 'VINCULADO',
  entidades: {
    incidentes: [],
    eventosPrevencion: [],
    recuperaciones: [],
    eventosAsistenciaSocial: [],
  },
  reasignadas: [],
  noEncontradas: [],
  noDesvinculadas: [],
  vinculadoPorId: '00000000-0000-4000-8000-000000000003',
  ocurridoEn: '2026-05-01T10:00:00.000Z',
};

describe('VinculoEventoAtpPanel (H60)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(permisoHook, 'usePuedeVincularEventoAtp').mockReturnValue(true);
    vi.spyOn(eventosAtpService, 'listarEventosAtp').mockResolvedValue({
      exito: true,
      eventos,
      mensaje: 'ok',
    });
  });

  it('vincula la entidad al Evento ATP seleccionado', async () => {
    const vincular = vi
      .spyOn(eventosAtpService, 'vincularEntidadesEventoAtp')
      .mockResolvedValueOnce(resultado);
    const onCambio = vi.fn();

    render(
      <VinculoEventoAtpPanel
        tipoEntidad="INCIDENTE"
        entidadId={entidadId}
        eventoAtpId={null}
        onCambio={onCambio}
      />
    );

    const select = await screen.findByLabelText(/Vincular a Evento ATP activo/i);
    await waitFor(() =>
      expect(screen.getByText(/ATP-2026-0001 · Sistema Frontal/)).toBeInTheDocument()
    );

    fireEvent.change(select, { target: { value: eventoAtpId } });
    fireEvent.click(screen.getByRole('button', { name: /Vincular Evento ATP/i }));

    await waitFor(() =>
      expect(vincular).toHaveBeenCalledWith(eventoAtpId, {
        incidenteIds: [entidadId],
      })
    );
    expect(onCambio).toHaveBeenCalledWith(eventoAtpId);
    expect(
      await screen.findByText(/Entidad vinculada al Evento ATP exitosamente/i)
    ).toBeInTheDocument();
  });

  it('desvincula la entidad del Evento ATP actual', async () => {
    const desvincular = vi
      .spyOn(eventosAtpService, 'desvincularEntidadesEventoAtp')
      .mockResolvedValueOnce({ ...resultado, accion: 'DESVINCULADO' });
    const onCambio = vi.fn();

    render(
      <VinculoEventoAtpPanel
        tipoEntidad="EVENTO_PREVENCION"
        entidadId={entidadId}
        eventoAtpId={eventoAtpId}
        eventoAtpCodigo="ATP-2026-0001"
        onCambio={onCambio}
      />
    );

    await waitFor(() =>
      expect(screen.getByText(/Actualmente vinculado a ATP-2026-0001/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /Desvincular/i }));

    await waitFor(() =>
      expect(desvincular).toHaveBeenCalledWith(eventoAtpId, {
        eventoPrevencionIds: [entidadId],
      })
    );
    expect(onCambio).toHaveBeenCalledWith(null);
  });

  it('muestra el error de dominio al fallar la vinculación', async () => {
    vi.spyOn(eventosAtpService, 'vincularEntidadesEventoAtp').mockRejectedValueOnce(
      new EventoAtpServiceError({
        message: 'El Evento ATP no está ACTIVO.',
        statusCode: 409,
      })
    );

    render(
      <VinculoEventoAtpPanel
        tipoEntidad="RECUPERACION"
        entidadId={entidadId}
        eventoAtpId={null}
      />
    );

    const select = await screen.findByLabelText(/Vincular a Evento ATP activo/i);
    await waitFor(() =>
      expect(screen.getByText(/ATP-2026-0001 · Sistema Frontal/)).toBeInTheDocument()
    );

    fireEvent.change(select, { target: { value: eventoAtpId } });
    fireEvent.click(screen.getByRole('button', { name: /Vincular Evento ATP/i }));

    expect(
      await screen.findByText('El Evento ATP no está ACTIVO.')
    ).toBeInTheDocument();
  });

  it('oculta los controles cuando el usuario no puede vincular', () => {
    vi.spyOn(permisoHook, 'usePuedeVincularEventoAtp').mockReturnValue(false);

    render(
      <VinculoEventoAtpPanel
        tipoEntidad="EVENTO_ASISTENCIA_SOCIAL"
        entidadId={entidadId}
        eventoAtpId={eventoAtpId}
        eventoAtpCodigo="ATP-2026-0001"
      />
    );

    expect(
      screen.getByText(/Vinculado al Evento ATP ATP-2026-0001/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Vincular Evento ATP/i })
    ).not.toBeInTheDocument();
  });
});
