import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidenteCard } from '../IncidenteCard';
import type { IncidenteResumen } from '@/services/incidentesService';

const mockIncidente: IncidenteResumen = {
  id: 'inc-001',
  codigo: 'INC-58291045',
  codigoSeguimiento: '58291045',
  tipoAfectacion: 'Caída de árbol',
  descripcion: 'Árbol sobre tendido eléctrico',
  direccion: 'Los Robles 300, Isla Teja',
  latitud: -39.8089,
  longitud: -73.2534,
  estado: 'REPORTADO',
  prioridad: 'CRITICA',
  requiereAsistenciaSocial: true,
  fuenteOrigen: 'CHATBOT',
  informanteNombre: 'Vecino Ejemplo',
  delegacionNombre: 'Isla Teja',
  totalMisiones: 2,
  creadoEn: '2026-09-22T10:00:00Z',
  actualizadoEn: '2026-09-22T10:00:00Z',
};

describe('IncidenteCard', () => {
  it('debe renderizar el código, tipo de afectación, dirección y prioridad crítica', () => {
    const handleClick = vi.fn();
    render(<IncidenteCard incidente={mockIncidente} onClick={handleClick} />);

    expect(screen.getByText('INC-58291045')).toBeDefined();
    expect(screen.getByText('Caída de árbol')).toBeDefined();
    expect(screen.getByText('Los Robles 300, Isla Teja')).toBeDefined();
    expect(screen.getByText('Crítica')).toBeDefined();
    expect(screen.getByText('FIBE')).toBeDefined();
    expect(screen.getByText('2 misiones')).toBeDefined();
    expect(screen.getByText('Isla Teja')).toBeDefined();
  });

  it('debe invocar onClick al hacer clic sobre la tarjeta', () => {
    const handleClick = vi.fn();
    render(<IncidenteCard incidente={mockIncidente} onClick={handleClick} />);

    const card = screen.getByRole('button', {
      name: /Ver detalles del incidente INC-58291045/i,
    });
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(mockIncidente);
  });

  it('debe invocar onClick al presionar Enter sobre la tarjeta', () => {
    const handleClick = vi.fn();
    render(<IncidenteCard incidente={mockIncidente} onClick={handleClick} />);

    const card = screen.getByRole('button', {
      name: /Ver detalles del incidente INC-58291045/i,
    });
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar botón "Asignar Patrulla" en estado REPORTADO sin misiones previas y llamar onAsignarPatrulla sin propagar', () => {
    const handleClick = vi.fn();
    const handleAsignar = vi.fn();
    const mockReportadoSinMisiones: IncidenteResumen = {
      ...mockIncidente,
      totalMisiones: 0,
    };
    render(
      <IncidenteCard
        incidente={mockReportadoSinMisiones} // estado: REPORTADO, 0 misiones
        onClick={handleClick}
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnAsignar = screen.getByRole('button', {
      name: /Asignar patrulla verificadora al incidente INC-58291045/i,
    });
    expect(btnAsignar).toBeDefined();

    fireEvent.click(btnAsignar);

    expect(handleAsignar).toHaveBeenCalledTimes(1);
    expect(handleAsignar).toHaveBeenCalledWith(mockReportadoSinMisiones);
    // No debe abrir el drawer (stopPropagation)
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('NO debe renderizar botón "Asignar Patrulla" si el incidente tiene una misión despachada pendiente de confirmación (tieneMisionDespachada: true)', () => {
    const handleClick = vi.fn();
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={{ ...mockIncidente, tieneMisionDespachada: true }}
        onClick={handleClick}
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnAsignar = screen.queryByRole('button', {
      name: /Asignar patrulla verificadora/i,
    });
    expect(btnAsignar).toBeNull();
  });

  it('debe renderizar el botón "Confirmación Pendiente" deshabilitado con estilo ámbar cuando tieneMisionDespachada es true en estado REPORTADO (H69)', () => {
    const handleAsignar = vi.fn();
    const mockReportadoDespachado: IncidenteResumen = {
      ...mockIncidente,
      estado: 'REPORTADO',
      tieneMisionDespachada: true,
    };

    render(
      <IncidenteCard
        incidente={mockReportadoDespachado}
        onClick={vi.fn()}
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnPendiente = screen.getByRole('button', {
      name: /Confirmación pendiente para el incidente INC-58291045/i,
    });
    expect(btnPendiente).toBeDefined();
    expect(btnPendiente).toBeDisabled();
    expect(screen.getByText('Confirmación Pendiente')).toBeDefined();
  });

  it('NO debe renderizar botón "Asignar Patrulla" si el incidente ya está en otro estado (ej. VERIFICANDO)', () => {
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
        onAsignarPatrulla={handleAsignar}
      />
    );

    const btnAsignar = screen.queryByRole('button', {
      name: /Asignar patrulla verificadora/i,
    });
    expect(btnAsignar).toBeNull();
  });

  it('NO debe renderizar botón "Asignar Patrulla" si puedeAsignarPatrulla es false por falta de permisos (BUG-03)', () => {
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={mockIncidente} // estado: REPORTADO
        onClick={vi.fn()}
        onAsignarPatrulla={handleAsignar}
        puedeAsignarPatrulla={false}
      />
    );

    const btnAsignar = screen.queryByRole('button', {
      name: /Asignar patrulla verificadora/i,
    });
    expect(btnAsignar).toBeNull();
  });

  it('debe exhibir la etiqueta "Verificado en terreno" con tooltip y justificación al reclasificarse (H37)', () => {
    const incidenteReclasificado: IncidenteResumen = {
      ...mockIncidente,
      tipoAfectacion: 'Inundación',
      prioridad: 'ALTA',
      reclasificadoEnTerreno: true,
      justificacionReclasificacion: 'Desborde de río constatado en terreno con anegamiento de viviendas.',
      cambioPrioridadMotivo: 'Desborde de río constatado en terreno con anegamiento de viviendas.',
    };

    render(<IncidenteCard incidente={incidenteReclasificado} onClick={vi.fn()} />);

    expect(screen.getByText('Inundación')).toBeDefined();
    expect(screen.getByText('Alta')).toBeDefined();
    const tagVerificado = screen.getByText('Verificado');
    expect(tagVerificado).toBeDefined();
    expect(tagVerificado.parentElement?.getAttribute('title')).toContain(
      'Tipología reclasificada en terreno: Desborde de río constatado en terreno'
    );
    expect(tagVerificado.parentElement?.getAttribute('title')).toContain('Prioridad ajustada: Alta');
  });

  it('NO debe renderizar botón "Asignar Patrulla" si el incidente tiene una misión en curso activa (tieneMisionEnCurso: true)', () => {
    const handleAsignar = vi.fn();
    render(
      <IncidenteCard
        incidente={{
          ...mockIncidente,
          estado: 'REPORTADO',
          totalMisiones: 1,
          tieneMisionEnCurso: true,
          tieneMisionDespachada: false,
        }}
        onClick={vi.fn()}
        onAsignarPatrulla={handleAsignar}
        puedeAsignarPatrulla={true}
      />
    );

    const btnAsignar = screen.queryByRole('button', {
      name: /Asignar patrulla verificadora/i,
    });
    expect(btnAsignar).toBeNull();

    const btnPendiente = screen.queryByRole('button', {
      name: /Confirmación pendiente/i,
    });
    expect(btnPendiente).toBeNull();
  });

  it('debe exhibir la etiqueta "Verificado" cuando verificado es true al cargar desde el servidor (paginación/refresco)', () => {
    const incidenteVerificadoDesdeApi: IncidenteResumen = {
      ...mockIncidente,
      verificado: true,
      reclasificadoEnTerreno: false,
    };

    render(<IncidenteCard incidente={incidenteVerificadoDesdeApi} onClick={vi.fn()} />);

    const tagVerificado = screen.getByText('Verificado');
    expect(tagVerificado).toBeDefined();
  });

  it('debe mostrar indicador de prioridad ajustada manualmente y tooltip con justificación cuando prioridad difiere de prioridadSugerida (HU-38)', () => {
    const incidenteConPrioridadAjustada: IncidenteResumen = {
      ...mockIncidente,
      prioridad: 'CRITICA',
      prioridadSugerida: 'ALTA',
      justificacionPrioridad: 'Avance rápido del agua hacia dormitorio de adulto mayor postrado.',
      totalReportesTerreno: 2,
      verificado: true,
    };

    render(<IncidenteCard incidente={incidenteConPrioridadAjustada} onClick={vi.fn()} />);

    const indicadorAjustada = screen.getByTestId('indicador-prioridad-ajustada');
    expect(indicadorAjustada).toBeDefined();
    expect(indicadorAjustada.textContent).toContain('Ajustada');
    expect(indicadorAjustada.getAttribute('title')).toContain(
      'Prioridad ajustada manualmente en terreno: Crítica (Sugerida por sistema: Alta)'
    );
    expect(indicadorAjustada.getAttribute('title')).toContain(
      'Avance rápido del agua hacia dormitorio de adulto mayor postrado.'
    );

    const badgeReportes = screen.getByTestId('badge-total-reportes-terreno');
    expect(badgeReportes).toBeDefined();
    expect(badgeReportes.textContent).toContain('2 reportes · Rectificado');
  });

  it('debe mostrar chip "No Abordable" y motivo de descarte cuando el incidente está en estado NO_ABORDABLE (H39)', () => {
    const incidenteNoAbordable: IncidenteResumen = {
      ...mockIncidente,
      estado: 'NO_ABORDABLE',
      requiereAsistenciaSocial: false,
      dictamenTerreno: 'NO_ABORDABLE',
      motivoNoAbordable: 'Falsa alarma constatada en terreno por patrulla.',
      verificado: true,
    };

    render(<IncidenteCard incidente={incidenteNoAbordable} onClick={vi.fn()} />);

    expect(screen.getByText('No Abordable')).toBeDefined();
    const motivoBox = screen.getByTestId('card-motivo-no-abordable');
    expect(motivoBox.textContent).toContain('Falsa alarma constatada en terreno por patrulla.');
    expect(screen.queryByText('Requiere Cuadrilla')).toBeNull();
  });

  it('debe mostrar chips Verificado, FIBE y Requiere Cuadrilla cuando el dictamen de cierre requiere cuadrilla (H39)', () => {
    const incidenteListoCuadrilla: IncidenteResumen = {
      ...mockIncidente,
      estado: 'VERIFICANDO',
      prioridad: 'ALTA',
      verificado: true,
      requiereAsistenciaSocial: true,
      dictamenTerreno: 'REQUIERE_CUADRILLA',
    };

    render(<IncidenteCard incidente={incidenteListoCuadrilla} onClick={vi.fn()} />);

    expect(screen.getByText('Verificado')).toBeDefined();
    expect(screen.getByText('FIBE')).toBeDefined();
    expect(screen.getByText('Requiere Cuadrilla')).toBeDefined();
  });

  it('muestra el indicador directo de lectura/no lectura en la tarjeta Kanban según trazabilidadNotificacion', () => {
    const { rerender } = render(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
        trazabilidadNotificacion="PENDIENTE_ENVIO"
      />
    );

    const cardOffline = screen.getByTestId('card-trazabilidad-inc-001');
    expect(cardOffline.textContent).toContain('NO LEÍDA');
    expect(cardOffline.textContent).toContain('Sin señal / offline');
    expect(cardOffline.style.borderRadius).toBe('0px');

    rerender(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
        trazabilidadNotificacion="LEIDA"
      />
    );

    const cardLeida = screen.getByTestId('card-trazabilidad-inc-001');
    expect(cardLeida.textContent).toContain('LEÍDA');
    expect(cardLeida.textContent).toContain('Leída por operador en terreno');
    expect(/\p{Extended_Pictographic}/u.test(cardLeida.textContent || '')).toBe(false);
  });

  it('muestra aviso SIN ACUSE en tarjetas VERIFICANDO sin confirmación recibida aún', () => {
    render(
      <IncidenteCard
        incidente={{ ...mockIncidente, estado: 'VERIFICANDO' }}
        onClick={vi.fn()}
      />
    );

    const aviso = screen.getByTestId('card-trazabilidad-pendiente-inc-001');
    expect(aviso.textContent).toContain('SIN ACUSE');
    expect(aviso.textContent).toContain('Lectura aún no confirmada');
    expect(aviso.style.flexDirection).toBe('column');
    expect(aviso.style.flexShrink).toBe('0');
    expect(aviso.style.overflow).toBe('hidden');
    expect(aviso.style.borderRadius).toBe('0px');
  });

  it('mantiene diseño apilado y contenido contenido dentro de la caja de trazabilidad ante direcciones extensas', () => {
    const direccionLarga = 'a'.repeat(120);
    render(
      <IncidenteCard
        incidente={{
          ...mockIncidente,
          estado: 'VERIFICANDO',
          direccion: direccionLarga,
        }}
        onClick={vi.fn()}
        trazabilidadNotificacion="RECIBIDA"
      />
    );

    const cardBox = screen.getByTestId('card-trazabilidad-inc-001');
    expect(cardBox.style.flexDirection).toBe('column');
    expect(cardBox.style.flexShrink).toBe('0');
    expect(cardBox.style.width).toBe('100%');
    expect(cardBox.style.overflow).toBe('hidden');
    expect(cardBox.style.borderRadius).toBe('0px');
    expect(cardBox.textContent).toContain('RECIBIDA (SIN LEER)');
    expect(cardBox.textContent).toContain('Recibida · pendiente lectura');
    expect(screen.getByText(direccionLarga)).toBeDefined();
  });
});
