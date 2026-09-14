import { describe, it, expect } from 'vitest';
import { geocodificarDireccionEnValdivia } from '../geocoding';

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
