import { describe, it, expect } from 'vitest';
import { normalizarListaTiposIncidentes, normalizarTipoIncidente } from '@/types/avisos';

describe('normalizarListaTiposIncidentes', () => {
  it('garantiza UUIDs únicos para la lista oficial completa de tipos del backend sin duplicados de key/id', () => {
    const tiposBackend = [
      'Anegamiento',
      'Inundación',
      'Caída de árbol',
      'Corte de energía',
      'Deslizamiento',
      'Deslizamiento de tierra',
      'Daño estructural',
      'Corte de agua potable',
      'Anegamiento de calzada',
      'Incendio estructural / forestal',
      'Incendio',
      'Otro',
    ];

    const resultado = normalizarListaTiposIncidentes(tiposBackend);

    expect(resultado).toHaveLength(tiposBackend.length);

    // Verificar que todos los IDs sean únicos
    const ids = resultado.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    // Verificar que Inundación y Caída de árbol tengan IDs distintos
    const inundacion = resultado.find((t) => t.nombre === 'Inundación');
    const caidaArbol = resultado.find((t) => t.nombre === 'Caída de árbol');

    expect(inundacion).toBeDefined();
    expect(caidaArbol).toBeDefined();
    expect(inundacion!.id).not.toBe(caidaArbol!.id);
  });

  it('normaliza correctamente items con objetos y evita colisiones', () => {
    const listaObjetos = [
      { id: '11111111-1111-4111-8111-111111111111', nombre: 'Tipo Custom 1' },
      { id: '22222222-2222-4222-8222-222222222222', nombre: 'Tipo Custom 2' },
      { nombre: 'Tipo Sin ID' },
    ];

    const resultado = normalizarListaTiposIncidentes(listaObjetos);
    const ids = resultado.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(resultado.length);
  });
});
