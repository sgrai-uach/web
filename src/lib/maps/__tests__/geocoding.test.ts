import { describe, it, expect } from 'vitest';
import { geocodificarDireccionEnValdivia, geocodificacionInversaEnValdivia } from '../geocoding';

describe('geocodificarDireccionEnValdivia', () => {
  it('debe resolver instantáneamente direcciones conocidas de Valdivia', async () => {
    const alemania = await geocodificarDireccionEnValdivia('Av. Alemania 550');
    expect(alemania).not.toBeNull();
    expect(alemania?.latitud).toBeCloseTo(-39.8175, 2);
    expect(alemania?.longitud).toBeCloseTo(-73.2412, 2);

    const picarte = await geocodificarDireccionEnValdivia('Ramón Picarte 2000');
    expect(picarte).not.toBeNull();
    expect(picarte?.latitud).toBeCloseTo(-39.8256, 2);

    const niebla = await geocodificarDireccionEnValdivia('Camino a Niebla');
    expect(niebla).not.toBeNull();
    expect(niebla?.latitud).toBeCloseTo(-39.8667, 2);
  });

  it('debe retornar null para textos muy cortos (< 3 caracteres)', async () => {
    const res = await geocodificarDireccionEnValdivia('av');
    expect(res).toBeNull();
  });
});

describe('geocodificacionInversaEnValdivia', () => {
  it('debe retornar el sector aproximado en Valdivia para coordenadas dadas', async () => {
    // Coordenadas cercanas a Isla Teja
    const resultadoTeja = await geocodificacionInversaEnValdivia(-39.8089, -73.2534);
    expect(resultadoTeja).not.toBeNull();
    expect(resultadoTeja?.toLowerCase()).toContain('valdivia');

    // Coordenadas cercanas a Niebla
    const resultadoNiebla = await geocodificacionInversaEnValdivia(-39.8667, -73.3986);
    expect(resultadoNiebla).not.toBeNull();
    expect(resultadoNiebla?.toLowerCase()).toContain('niebla');
  });

  it('debe retornar null para coordenadas no válidas', async () => {
    const res = await geocodificacionInversaEnValdivia(NaN, NaN);
    expect(res).toBeNull();
  });
});

