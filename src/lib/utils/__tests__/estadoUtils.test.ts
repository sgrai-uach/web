import { describe, it, expect } from 'vitest';
import {
  formatearEstado,
  formatearPrioridad,
  formatearHitoBitacora,
  formatearTipoMision,
  obtenerChipEstadoMision,
  fueTipologiaModificada,
  esJustificacionSinCambios,
  esHitoTipologiaSinCambios,
  formatearNombrePatrulla,
  limpiarDescripcionBitacora,
  formatearDictamenTerreno,
  esReporteVerificacionCierre,
  calcularComparativaPersonasAfectadas,
  esReporteCierreCuadrilla,
  obtenerPesoOrdenReporte,
  formatearEstadoTerreno,
  formatearHorasHombre,
  normalizarMaterialesConsumidos,
  formatearCantidadMaterial,
} from '../estadoUtils';
import { obtenerVarianteChipEstadoTerreno } from '../chipVariants';

describe('formatearEstado', () => {
  it('formatea estados de recursos y vehículos a lenguaje natural institucional', () => {
    expect(formatearEstado('DISPONIBLE')).toBe('Disponible');
    expect(formatearEstado('ASIGNADO')).toBe('Asignado');
    expect(formatearEstado('EN_MANTENCION')).toBe('En mantención');
    expect(formatearEstado('NO_DISPONIBLE')).toBe('No disponible');
    expect(formatearEstado('EN_USO')).toBe('En uso');
    expect(formatearEstado('BAJA_DEFINITIVA')).toBe('Dado de baja');
  });

  it('formatea estados operativos de patrullas verificadoras e incidentes', () => {
    expect(formatearEstado('EN_VERIFICACION')).toBe('En verificación');
    expect(formatearEstado('EN_MISION')).toBe('En misión');
    expect(formatearEstado('EN_PREVENCION')).toBe('En prevención');
    expect(formatearEstado('EN_RECUPERACION')).toBe('En recuperación');
    expect(formatearEstado('DESACTIVADA')).toBe('Desactivada');
    expect(formatearEstado('RECHAZADA')).toBe('Rechazada');
    expect(formatearEstado('REPORTADO')).toBe('Reportado');
    expect(formatearEstado('VERIFICANDO')).toBe('En verificación');
    expect(formatearEstado('EN_ATENCION')).toBe('En atención');
    expect(formatearEstado('RESUELTO')).toBe('Resuelto');
    expect(formatearEstado('NO_ABORDABLE')).toBe('No abordable');
  });

  it('formatea estados operativos de personal y funcionarios', () => {
    expect(formatearEstado('disponible')).toBe('Disponible');
    expect(formatearEstado('en_patrulla')).toBe('En patrulla');
    expect(formatearEstado('en_mision')).toBe('En misión');
    expect(formatearEstado('licencia')).toBe('Licencia médica');
    expect(formatearEstado('descanso')).toBe('En descanso');
    expect(formatearEstado('inactivo')).toBe('Inactivo');
  });

  it('maneja valores nulos, vacíos o indefinidos con fallback configurable', () => {
    expect(formatearEstado(null)).toBe('No especificado');
    expect(formatearEstado(undefined)).toBe('No especificado');
    expect(formatearEstado('')).toBe('No especificado');
    expect(formatearEstado('   ', 'Sin estado')).toBe('Sin estado');
  });

  it('transforma enums desconocidos en formato legible capitalizado', () => {
    expect(formatearEstado('OTRO_ESTADO_NUEVO')).toBe('Otro estado nuevo');
  });
});

describe('formatearPrioridad', () => {
  it('formatea prioridades oficiales de incidentes a string amigable institucional', () => {
    expect(formatearPrioridad('CRITICA')).toBe('Crítica');
    expect(formatearPrioridad('ALTA')).toBe('Alta');
    expect(formatearPrioridad('MEDIA')).toBe('Media');
    expect(formatearPrioridad('BAJA')).toBe('Baja');
  });

  it('maneja valores nulos o vacíos con fallback por defecto', () => {
    expect(formatearPrioridad(null)).toBe('Media');
    expect(formatearPrioridad(undefined)).toBe('Media');
    expect(formatearPrioridad('', 'Baja')).toBe('Baja');
  });
});

describe('formatearHitoBitacora', () => {
  it('formatea hitos de bitácora técnica de terreno en denominaciones legibles', () => {
    expect(formatearHitoBitacora('TIPOLOGIA_RECLASIFICADA')).toBe('Tipología reclasificada en terreno');
    expect(formatearHitoBitacora('MISION_DESPACHADA')).toBe('Misión despachada');
    expect(formatearHitoBitacora('MISION_ACEPTADA')).toBe('Misión aceptada');
    expect(formatearHitoBitacora('EN_RUTA')).toBe('En ruta al sitio');
    expect(formatearHitoBitacora('LLEGADA_A_SITIO')).toBe('Llegada al lugar');
  });

  it('proporciona fallback adecuado para hitos no tabulados', () => {
    expect(formatearHitoBitacora(null)).toBe('Evento registrado');
    expect(formatearHitoBitacora('HITO_PERSONALIZADO_EXTRA')).toBe('Hito personalizado extra');
  });
});

describe('formatearTipoMision', () => {
  it('formatea tipos de misión a denominaciones institucionales amigables', () => {
    expect(formatearTipoMision('VERIFICACION')).toBe('Verificación en terreno');
    expect(formatearTipoMision('ATENCION_CUADRILLA')).toBe('Atención de cuadrilla');
    expect(formatearTipoMision('PREVENCION')).toBe('Operación preventiva');
    expect(formatearTipoMision('RECUPERACION')).toBe('Recuperación de infraestructura');
    expect(formatearTipoMision('ASISTENCIA_SOCIAL')).toBe('Asistencia social (FIBE)');
  });

  it('maneja valores vacíos con fallback por defecto', () => {
    expect(formatearTipoMision(null)).toBe('Misión operativa');
    expect(formatearTipoMision('')).toBe('Misión operativa');
  });
});

describe('obtenerChipEstadoMision', () => {
  it('retorna la configuración semántica institucional para cada estado de misión', () => {
    expect(obtenerChipEstadoMision('EN_CURSO').label).toBe('En curso');
    expect(obtenerChipEstadoMision('DESPACHADA').label).toBe('Despachada');
    expect(obtenerChipEstadoMision('COMPLETADA').label).toBe('Completada');
    expect(obtenerChipEstadoMision('RECHAZADA').label).toBe('Rechazada');
    expect(obtenerChipEstadoMision('RECHAZADA').color).toContain('danger');
    expect(obtenerChipEstadoMision('PLANIFICADA').label).toBe('Planificada');
  });
});

describe('fueTipologiaModificada y detección de ratificación sin cambios', () => {
  it('detecta correctamente cuando la tipología fue modificada vs cuando es igual', () => {
    expect(fueTipologiaModificada('Anegamiento', 'Inundación')).toBe(true);
    expect(fueTipologiaModificada('Deslizamiento', 'Deslizamiento')).toBe(false);
    expect(fueTipologiaModificada('  Deslizamiento ', 'deslizamiento')).toBe(false);
    expect(fueTipologiaModificada(null, 'Deslizamiento')).toBe(false);
  });

  it('detecta justificaciones de ratificación sin variaciones', () => {
    expect(esJustificacionSinCambios('Tipología constatada y ratificada en terreno sin variaciones.')).toBe(true);
    expect(esJustificacionSinCambios('Se constata rotura de matriz.')).toBe(false);
  });

  it('detecta hitos TIPOLOGIA_RECLASIFICADA sin cambios en metadatos o descripción', () => {
    expect(
      esHitoTipologiaSinCambios({
        hito: 'TIPOLOGIA_RECLASIFICADA',
        descripcion: 'Tipología reclasificada en terreno a: Deslizamiento.',
        metadatos: { tipoAnterior: 'Deslizamiento', tipoNuevo: 'Deslizamiento' },
      })
    ).toBe(true);
    expect(
      esHitoTipologiaSinCambios({
        hito: 'TIPOLOGIA_RECLASIFICADA',
        descripcion: 'Tipología reclasificada en terreno a: Inundación.',
        metadatos: { tipoAnterior: 'Anegamiento', tipoNuevo: 'Inundación' },
      })
    ).toBe(false);
  });

  it('formatea nombres de patrulla sin duplicar el prefijo Patrulla', () => {
    expect(formatearNombrePatrulla('Patrulla Lenteja')).toBe('Patrulla Lenteja');
    expect(formatearNombrePatrulla('Alfa 1')).toBe('Patrulla Alfa 1');
    expect(formatearNombrePatrulla(null)).toBe('Patrulla Verificadora');
  });

  it('limpia enums crudos y redundancias en descripciones de bitácora operativa', () => {
    expect(formatearHitoBitacora('VERIFICACION_COMPLETADA')).toBe('Verificación completada');
    expect(
      limpiarDescripcionBitacora(
        'Misión de verificación asignada y despachada a la patrulla Patrulla Lenteja.'
      )
    ).toBe('Misión de verificación asignada y despachada a la Patrulla Lenteja.');
    expect(
      limpiarDescripcionBitacora(
        'Reporte de evaluación #1: Prioridad asignada en terreno a BAJA (Sugerida: CRITICA). Justificación: Ajuste en sitio'
      )
    ).toBe(
      'Reporte de evaluación #1: Prioridad asignada en terreno a Baja (Sugerida: Crítica). Justificación: Ajuste en sitio'
    );
    expect(
      limpiarDescripcionBitacora(
        'Informe técnico enviado y misión cerrada. Dictamen: NO_ABORDABLE. Motivo: Sin acceso'
      )
    ).toBe(
      'Informe técnico enviado y misión cerrada. Dictamen: No Abordable. Motivo: Sin acceso'
    );
  });
});

describe('H39: formatearDictamenTerreno, esReporteVerificacionCierre y comparativa de personas', () => {
  it('formatea dictámenes operativos de verificación y cierre', () => {
    expect(formatearDictamenTerreno('REQUIERE_CUADRILLA')).toBe('Requiere Cuadrilla');
    expect(formatearDictamenTerreno('NO_ABORDABLE')).toBe('No Abordable');
    expect(formatearDictamenTerreno(null)).toBe('No especificado');
  });

  it('formatea hitos de bitácora de cierre de verificación', () => {
    expect(formatearHitoBitacora('REPORTE_VERIFICACION_CIERRE')).toBe(
      'Informe técnico de verificación y cierre registrado'
    );
    expect(formatearHitoBitacora('INCIDENTE_NO_ABORDABLE')).toBe(
      'Incidente declarado no abordable en terreno'
    );
  });

  it('distingue reportes VERIFICACION_CIERRE de reportes de prioridad H38', () => {
    expect(esReporteVerificacionCierre({ tipoReporte: 'VERIFICACION_CIERRE' })).toBe(true);
    expect(esReporteVerificacionCierre({ dictamen: 'NO_ABORDABLE' })).toBe(true);
    expect(esReporteVerificacionCierre({ dictamen: 'REQUIERE_CUADRILLA' })).toBe(true);
    expect(esReporteVerificacionCierre({ tipoReporte: 'EVALUACION_PRIORIDAD' })).toBe(false);
    expect(esReporteVerificacionCierre({ etiquetaReporte: 'Reporte #1 (Inicial)' })).toBe(false);
  });

  it('calcula comparativa de personas afectadas respecto al reporte previo de prioridad', () => {
    const reportePrioridad = {
      id: 'rep-prio-1',
      misionId: 'm-1',
      tipoReporte: 'EVALUACION_PRIORIDAD',
      versionReporte: 1,
      personasAfectadas: 4,
      creadoEn: '2026-11-15T10:00:00Z',
    };
    const reporteCierreSinCambio = {
      id: 'rep-cierre-1',
      misionId: 'm-1',
      tipoReporte: 'VERIFICACION_CIERRE',
      dictamen: 'REQUIERE_CUADRILLA',
      personasAfectadas: 4,
      creadoEn: '2026-11-15T10:30:00Z',
    };
    const reporteCierreModificado = {
      id: 'rep-cierre-2',
      misionId: 'm-1',
      tipoReporte: 'VERIFICACION_CIERRE',
      dictamen: 'REQUIERE_CUADRILLA',
      personasAfectadas: 6,
      creadoEn: '2026-11-15T10:30:00Z',
    };

    expect(
      calcularComparativaPersonasAfectadas(reporteCierreSinCambio, [
        reporteCierreSinCambio,
        reportePrioridad,
      ])
    ).toEqual({ personasPrevias: 4, fueModificado: false });

    expect(
      calcularComparativaPersonasAfectadas(reporteCierreModificado, [
        reporteCierreModificado,
        reportePrioridad,
      ])
    ).toEqual({ personasPrevias: 4, fueModificado: true });

    expect(
      calcularComparativaPersonasAfectadas({
        personasAfectadas: 5,
        personasAfectadasPrevias: 3,
      })
    ).toEqual({ personasPrevias: 3, fueModificado: true });
  });
});

describe('H68: utilidades para cierre de misión de cuadrilla (REPORTE_CUADRILLA)', () => {
  it('distingue REPORTE_CUADRILLA de reportes de patrulla y asigna mayor peso de orden', () => {
    const repPrioridad = { tipoReporte: 'EVALUACION_PRIORIDAD', personasAfectadas: 4 };
    const repPatrulla = { tipoReporte: 'VERIFICACION_CIERRE', dictamen: 'REQUIERE_CUADRILLA' };
    const repCuadrilla = {
      tipoReporte: 'REPORTE_CUADRILLA',
      horasHombre: 5.5,
      materialesConsumidos: [{ recursoId: 'r-1', cantidad: 10 }],
    };

    expect(esReporteCierreCuadrilla(repCuadrilla)).toBe(true);
    expect(esReporteCierreCuadrilla(repPatrulla)).toBe(false);
    expect(esReporteCierreCuadrilla(repPrioridad)).toBe(false);
    expect(
      esReporteCierreCuadrilla({
        etiquetaReporte: 'Informe Técnico Final de Cuadrilla (Cierre de Misión)',
      })
    ).toBe(true);

    expect(obtenerPesoOrdenReporte(repCuadrilla)).toBe(2);
    expect(obtenerPesoOrdenReporte(repPatrulla)).toBe(1);
    expect(obtenerPesoOrdenReporte(repPrioridad)).toBe(0);

    // No debe contaminar comparativa de personas afectadas de patrulla
    expect(
      calcularComparativaPersonasAfectadas(repPatrulla, [repPrioridad, repCuadrilla, repPatrulla])
    ).toEqual({ personasPrevias: 4, fueModificado: false });
  });

  it('formatea estado final del terreno, variantes semánticas de Chip y horas hombre', () => {
    expect(formatearEstadoTerreno('CONTROLADO')).toBe('Controlado');
    expect(formatearEstadoTerreno('REQUIERE_SEGUIMIENTO')).toBe('Requiere seguimiento');
    expect(formatearEstadoTerreno('CRITICO')).toBe('Crítico');
    expect(formatearEstadoTerreno('INACCESIBLE')).toBe('Inaccesible');
    expect(formatearEstadoTerreno(null)).toBe('No especificado');

    expect(obtenerVarianteChipEstadoTerreno('CONTROLADO')).toBe('success');
    expect(obtenerVarianteChipEstadoTerreno('ESTABLE')).toBe('success');
    expect(obtenerVarianteChipEstadoTerreno('FINALIZADO')).toBe('success');
    expect(obtenerVarianteChipEstadoTerreno('REQUIERE_SEGUIMIENTO')).toBe('warning');
    expect(obtenerVarianteChipEstadoTerreno('CRITICO')).toBe('danger');
    expect(obtenerVarianteChipEstadoTerreno('INACCESIBLE')).toBe('danger');
    expect(obtenerVarianteChipEstadoTerreno('')).toBe('neutral');

    expect(formatearHorasHombre(1)).toBe('1 hora hombre');
    expect(formatearHorasHombre(6)).toBe('6 horas hombre');
    expect(formatearHorasHombre(4.5)).toBe('4,5 horas hombre');
    expect(formatearHorasHombre(null)).toBe('No registrado');
  });

  it('normaliza materiales consumidos en camelCase/snake_case, formatea cantidades y limpia bitácora', () => {
    const normalizados = normalizarMaterialesConsumidos([
      {
        recurso_id: 'rec-1',
        nombre_recurso: 'Sacos de arena',
        cantidad: 20,
        unidad: 'sacos',
        observacion: 'Contención en acceso sur',
      },
      {
        recursoId: 'rec-2',
        nombre: 'Polietileno',
        cantidad: 2,
      },
      { recursoId: '', cantidad: 5 },
      { recursoId: 'rec-invalid', cantidad: 0 },
    ]);

    expect(normalizados).toEqual([
      {
        recursoId: 'rec-1',
        nombre: 'Sacos de arena',
        cantidad: 20,
        unidad: 'sacos',
        observacion: 'Contención en acceso sur',
      },
      {
        recursoId: 'rec-2',
        nombre: 'Polietileno',
        cantidad: 2,
        unidad: null,
        observacion: null,
      },
    ]);

    expect(formatearCantidadMaterial(20, 'sacos')).toBe('20 sacos');
    expect(formatearCantidadMaterial(1)).toBe('1 unidad');
    expect(formatearCantidadMaterial(3)).toBe('3 unidades');

    expect(
      limpiarDescripcionBitacora(
        'Misión cerrada por la cuadrilla Cuadrilla Norte. Estado terreno: REQUIERE_SEGUIMIENTO. Cuadrilla pasa a DISPONIBLE.'
      )
    ).toBe(
      'Misión cerrada por la Cuadrilla Norte. Estado terreno: Requiere seguimiento. Cuadrilla pasa a Disponible.'
    );
  });

  it('HU-25: formatea hitos y estados de derivación a Asistencia Social (FIBE / DGRD)', () => {
    expect(formatearHitoBitacora('DERIVACION_ASISTENCIA_SOCIAL')).toBe(
      'Derivación a Asistencia Social (DGRD — Ficha FIBE)'
    );
    expect(formatearEstado('ASISTENCIA_SOCIAL_ASIGNADA')).toBe(
      'Asistente social asignado para levantamiento FIBE'
    );
    expect(formatearEstado('PENDIENTE')).toBe('Pendiente');
    expect(formatearEstado('EN_EVALUACION_FIBE')).toBe('En evaluación FIBE');
  });
});


