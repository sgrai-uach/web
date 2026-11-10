import { describe, it, expect } from 'vitest';
import {
  formatearEstado,
  formatearPrioridad,
  formatearHitoBitacora,
  formatearTipoMision,
  obtenerChipEstadoMision,
} from '../estadoUtils';

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


