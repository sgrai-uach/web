import { describe, it, expect } from 'vitest';
import { formatearEstado } from '../estadoUtils';

describe('formatearEstado', () => {
  it('formatea estados de recursos y vehículos a lenguaje natural institucional', () => {
    expect(formatearEstado('DISPONIBLE')).toBe('Disponible');
    expect(formatearEstado('ASIGNADO')).toBe('Asignado');
    expect(formatearEstado('EN_MANTENCION')).toBe('En mantención');
    expect(formatearEstado('NO_DISPONIBLE')).toBe('No disponible');
    expect(formatearEstado('EN_USO')).toBe('En uso');
    expect(formatearEstado('BAJA_DEFINITIVA')).toBe('Dado de baja');
  });

  it('formatea estados operativos de patrullas verificadoras', () => {
    expect(formatearEstado('EN_VERIFICACION')).toBe('En verificación');
    expect(formatearEstado('EN_MISION')).toBe('En misión');
    expect(formatearEstado('EN_PREVENCION')).toBe('En prevención');
    expect(formatearEstado('EN_RECUPERACION')).toBe('En recuperación');
    expect(formatearEstado('DESACTIVADA')).toBe('Desactivada');
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
