import { describe, it, expect } from 'vitest';
import {
  mapearTipoAfectacionIncidenteASocial,
  resolverDelegacionDesdeIncidente,
  clasificarYOrdenarIncidentesParaVinculacion,
  extraerContextoSocialDesdeIncidente,
  construirDetallesEvaluacionSocial,
} from '../asistenciaSocialIncidenteUtils';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';

describe('asistenciaSocialIncidenteUtils', () => {
  it('mapea las tipologías de incidentes H37/H39 al enum de afectación social', () => {
    expect(mapearTipoAfectacionIncidenteASocial('Inundación Mayor')).toBe('VIVIENDA_ANEGADA');
    expect(mapearTipoAfectacionIncidenteASocial('Anegamiento')).toBe('VIVIENDA_ANEGADA');
    expect(mapearTipoAfectacionIncidenteASocial('Daño estructural')).toBe('DANO_ESTRUCTURAL');
    expect(mapearTipoAfectacionIncidenteASocial('Incendio estructural / forestal')).toBe(
      'INCENDIO_HABITACIONAL'
    );
    expect(mapearTipoAfectacionIncidenteASocial('Deslizamiento de tierra')).toBe('REMOCION_MASA');
    expect(mapearTipoAfectacionIncidenteASocial('Aislamiento rural')).toBe('AISLAMIENTO_HOGAR');
    expect(mapearTipoAfectacionIncidenteASocial('Caída de árbol')).toBe('OTRO_EXCEPCIONAL');
  });

  it('resuelve la delegación por UUID exacto o por nombre normalizado', () => {
    expect(
      resolverDelegacionDesdeIncidente(
        { id: '30000000-0000-4000-8000-000000000002', nombre: 'Cualquier' },
        DELEGACIONES_MUNICIPALES
      )
    ).toBe('30000000-0000-4000-8000-000000000002');

    expect(
      resolverDelegacionDesdeIncidente(
        { id: 'uuid-no-catalogo', nombre: 'Delegacion Municipal Costa' },
        DELEGACIONES_MUNICIPALES
      )
    ).toBe('30000000-0000-4000-8000-000000000003');
  });

  it('excluye incidentes NO_ABORDABLE sin FIBE y prioriza los casos con FIBE requerida y verificados', () => {
    const lista = [
      { id: '1', estado: 'REPORTADO', requiereAsistenciaSocial: false, verificado: false },
      { id: '2', estado: 'NO_ABORDABLE', requiereAsistenciaSocial: false, verificado: true },
      { id: '3', estado: 'VERIFICANDO', requiereAsistenciaSocial: true, verificado: false },
      { id: '4', estado: 'VERIFICANDO', requiereAsistenciaSocial: true, verificado: true },
      { id: '5', estado: 'NO_ABORDABLE', requiereAsistenciaSocial: true, verificado: true },
    ];

    const ordenada = clasificarYOrdenarIncidentesParaVinculacion(lista);
    expect(ordenada.map((i) => i.id)).toEqual(['4', '5', '3', '1']);
  });

  it('consolida personas modificadas en VERIFICACION_CIERRE (H39) con familias rescatadas de EVALUACION_PRIORIDAD (H38)', () => {
    const contexto = extraerContextoSocialDesdeIncidente(
      {
        id: 'inc-1',
        codigo: 'INC-2026-0042',
        tipoAfectacion: 'Inundación',
        descripcion: 'Relato inicial ciudadano',
        direccion: 'Calle Los Alerces 1420',
        latitud: -39.8234,
        longitud: -73.2189,
        estado: 'VERIFICANDO',
        prioridad: 'ALTA',
        requiereAsistenciaSocial: true,
        verificado: true,
        informante: {
          nombre: 'María González',
          telefono: '+56912345678',
          rut: '12.345.678-9',
        },
        delegacion: {
          id: 'deleg-desconocida',
          nombre: 'Delegación Municipal Sur',
        },
        reportesEvaluacionTerreno: [
          {
            id: 'rep-h38',
            tipoReporte: 'EVALUACION_PRIORIDAD',
            versionReporte: 1,
            creadoEn: '2026-11-21T10:00:00.000Z',
            personasAfectadas: 4,
            evaluacion: {
              nucleoFamiliarTotal: 4,
              familias: [{ referencia: 'Familia A' }, { referencia: 'Familia B' }],
            },
          },
          {
            id: 'rep-h39',
            tipoReporte: 'VERIFICACION_CIERRE',
            dictamen: 'REQUIERE_CUADRILLA',
            versionReporte: 2,
            creadoEn: '2026-11-21T11:00:00.000Z',
            personasAfectadas: 6,
            personasAfectadasPrevias: 4,
            personasAfectadasModificadas: true,
            requiereAsistenciaSocial: true,
            resumenTecnico: 'Vivienda con anegamiento de dos hogares verificados en terreno.',
          },
        ],
      },
      DELEGACIONES_MUNICIPALES
    );

    expect(contexto.tipoAfectacion).toBe('VIVIENDA_ANEGADA');
    expect(contexto.prioridad).toBe('ALTA');
    expect(contexto.personasAfectadas).toBe(6);
    expect(contexto.personasPrevias).toBe(4);
    expect(contexto.personasModificadasEnCierre).toBe(true);
    expect(contexto.familiasAfectadas).toBe(2);
    expect(contexto.familiasRescatadasDePrioridad).toBe(true);
    expect(contexto.descripcionSugerida).toBe(
      'Vivienda con anegamiento de dos hogares verificados en terreno.'
    );
    expect(contexto.delegacionId).toBe('30000000-0000-4000-8000-000000000002');
    expect(contexto.tieneCierrePatrulla).toBe(true);
    expect(contexto.dictamenCierre).toBe('REQUIERE_CUADRILLA');
    expect(contexto.requiereFibeVerificado).toBe(true);
  });

  it('detecta cierre NO_ABORDABLE y rechazo de FIBE en informe H39', () => {
    const contexto = extraerContextoSocialDesdeIncidente(
      {
        id: 'inc-2',
        estado: 'NO_ABORDABLE',
        prioridad: 'BAJA',
        requiereAsistenciaSocial: false,
        verificado: true,
        dictamenTerreno: 'NO_ABORDABLE',
        motivoNoAbordable: 'Falsa alarma verificada en el sector.',
        reportesEvaluacionTerreno: [
          {
            id: 'rep-cierre',
            tipoReporte: 'VERIFICACION_CIERRE',
            dictamen: 'NO_ABORDABLE',
            motivoNoAbordable: 'Falsa alarma verificada en el sector.',
            requiereAsistenciaSocial: false,
          },
        ],
      },
      DELEGACIONES_MUNICIPALES
    );

    expect(contexto.esNoAbordable).toBe(true);
    expect(contexto.motivoNoAbordable).toBe('Falsa alarma verificada en el sector.');
    expect(contexto.requiereFibeVerificado).toBe(false);
  });

  it('extrae familiasDesglosadas con grupos vulnerables, daños estimados y compromiso habitacional, y construye detallesEvaluacion', () => {
    const contexto = extraerContextoSocialDesdeIncidente(
      {
        id: 'inc-3',
        estado: 'VERIFICANDO',
        prioridad: 'ALTA',
        requiereAsistenciaSocial: true,
        verificado: true,
        reportesEvaluacionTerreno: [
          {
            id: 'rep-h38-det',
            tipoReporte: 'EVALUACION_PRIORIDAD',
            versionReporte: 1,
            evaluacion: {
              nivelCompromisoVivienda: 'MODERADO',
              danosEstimados: 'Anegamiento en primer piso y colchonetas húmedas',
              familias: [
                {
                  referencia: 'Familia Soto',
                  nucleoFamiliarTotal: 4,
                  cantidadNinos: 2,
                  cantidadAdultosMayores: 1,
                  personasDiscapacitadas: 1,
                  personasElectrodependientes: 0,
                  mascotasAfectadas: 1,
                  nivelCompromisoVivienda: 'MODERADO',
                },
              ],
            },
          },
        ],
      },
      DELEGACIONES_MUNICIPALES
    );

    expect(contexto.nivelCompromisoVivienda).toBe('MODERADO');
    expect(contexto.danosEstimados).toBe('Anegamiento en primer piso y colchonetas húmedas');
    expect(contexto.familiasDesglosadas).toHaveLength(1);
    expect(contexto.familiasDesglosadas[0]).toMatchObject({
      referencia: 'Familia Soto',
      nucleoFamiliarTotal: 4,
      cantidadNinos: 2,
      cantidadAdultosMayores: 1,
      personasDiscapacitadas: 1,
      mascotasAfectadas: 1,
      nivelCompromisoVivienda: 'MODERADO',
    });

    expect(
      construirDetallesEvaluacionSocial({
        familias: [],
        nivelCompromisoVivienda: '',
        danosEstimados: '',
      })
    ).toBeNull();

    const detalles = construirDetallesEvaluacionSocial({
      familias: contexto.familiasDesglosadas,
      nivelCompromisoVivienda: contexto.nivelCompromisoVivienda,
      danosEstimados: contexto.danosEstimados,
    });
    expect(detalles).toMatchObject({
      familiasAfectadas: 1,
      nucleoFamiliarTotal: 4,
      cantidadNinos: 2,
      cantidadAdultosMayores: 1,
      personasDiscapacitadas: 1,
      mascotasAfectadas: 1,
      nivelCompromisoVivienda: 'MODERADO',
      danosEstimados: 'Anegamiento en primer piso y colchonetas húmedas',
    });
  });
});
