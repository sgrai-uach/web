export interface Coordenadas {
  latitud: number;
  longitud: number;
}

// Coordenadas base de sectores y avenidas representativas de Valdivia para resolución instantánea
const REFERENCIAS_VALDIVIA: Record<string, Coordenadas> = {
  centro: { latitud: -39.81422, longitud: -73.24589 },
  picarte: { latitud: -39.8256, longitud: -73.2321 },
  alemania: { latitud: -39.8175, longitud: -73.2412 },
  teja: { latitud: -39.8089, longitud: -73.2534 },
  niebla: { latitud: -39.8667, longitud: -73.3986 },
  collico: { latitud: -39.8055, longitud: -73.2189 },
  animas: { latitud: -39.7995, longitud: -73.2356 },
  corvi: { latitud: -39.8312, longitud: -73.2285 },
  angachilla: { latitud: -39.8456, longitud: -73.2398 },
  costanera: { latitud: -39.8122, longitud: -73.2485 },
  ercilla: { latitud: -39.8221, longitud: -73.2388 },
  arauco: { latitud: -39.8164, longitud: -73.2443 },
  bueras: { latitud: -39.8198, longitud: -73.2435 },
  francia: { latitud: -39.8335, longitud: -73.2302 },
};

const NOMBRES_SECTORES_VALDIVIA: Record<string, string> = {
  centro: 'Sector Centro',
  picarte: 'Avenida Ramón Picarte',
  alemania: 'Avenida Alemania',
  teja: 'Sector Isla Teja',
  niebla: 'Sector Niebla',
  collico: 'Sector Collico',
  animas: 'Sector Las Ánimas',
  corvi: 'Sector Corvi',
  angachilla: 'Sector Angachilla',
  costanera: 'Avenida Costanera Arturo Prat',
  ercilla: 'Calle Alonso de Ercilla',
  arauco: 'Calle Arauco',
  bueras: 'Calle Coronel Bueras',
  francia: 'Avenida Francia',
};

function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resuelve una dirección escrita a coordenadas geográficas en Valdivia.
 * 1. Primero busca coincidencias con avenidas/sectores clave (resolución instantánea y offline).
 * 2. Si no coincide, consulta OpenStreetMap Nominatim con timeout de 2.5s acotado a Valdivia, Chile.
 */
export async function geocodificarDireccionEnValdivia(
  direccion: string
): Promise<Coordenadas | null> {
  const direccionLimpia = normalizarTexto(direccion);
  if (direccionLimpia.length < 3) return null;

  // 1. Detección rápida por sectores de Valdivia
  for (const [clave, coord] of Object.entries(REFERENCIAS_VALDIVIA)) {
    if (direccionLimpia.includes(clave)) {
      return coord;
    }
  }

  // 2. Consulta a OpenStreetMap Nominatim
  try {
    const query = `${direccion}, Valdivia, Region de Los Rios, Chile`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1&countrycodes=cl`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'es',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          latitud: parseFloat(parseFloat(data[0].lat).toFixed(5)),
          longitud: parseFloat(parseFloat(data[0].lon).toFixed(5)),
        };
      }
    }
  } catch {
    // Si falla la red o timeout, retorna centro de Valdivia como fallback
  }

  return REFERENCIAS_VALDIVIA.centro;
}

/**
 * Resuelve una posición en el mapa (latitud, longitud) a una dirección legible en Valdivia.
 * 1. Intenta consultar OpenStreetMap Nominatim reverse con timeout de 2.5s.
 * 2. Si no hay conexión o falla, deduce el sector más cercano a partir de las referencias comunales.
 */
export async function geocodificacionInversaEnValdivia(
  latitud: number,
  longitud: number
): Promise<string | null> {
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) return null;

  // 1. Consulta a OpenStreetMap Nominatim reverse geocoding
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      latitud
    )}&lon=${encodeURIComponent(longitud)}&zoom=18&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'es',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = (await res.json()) as {
        address?: {
          road?: string;
          house_number?: string;
          pedestrian?: string;
          suburb?: string;
          neighbourhood?: string;
        };
        display_name?: string;
      };

      if (data.address) {
        const calle = data.address.road || data.address.pedestrian || '';
        const numero = data.address.house_number || '';
        const sector = data.address.suburb || data.address.neighbourhood || '';

        if (calle) {
          const partes: string[] = [];
          partes.push(numero ? `${calle} ${numero}` : calle);
          if (sector && !calle.toLowerCase().includes(sector.toLowerCase())) {
            partes.push(sector);
          }
          return partes.join(', ');
        }
      }

      if (data.display_name) {
        const partes = data.display_name.split(',').map((p) => p.trim());
        if (partes.length >= 2) {
          return `${partes[0]}, ${partes[1]}`;
        }
        return partes[0];
      }
    }
  } catch {
    // Si falla la red o timeout, se usa el fallback por sectores
  }

  // 2. Fallback de sector más cercano en Valdivia
  let menorDistancia = Infinity;
  let sectorCercano = 'centro';

  for (const [clave, coord] of Object.entries(REFERENCIAS_VALDIVIA)) {
    const dist = Math.hypot(coord.latitud - latitud, coord.longitud - longitud);
    if (dist < menorDistancia) {
      menorDistancia = dist;
      sectorCercano = clave;
    }
  }

  const nombreSector = NOMBRES_SECTORES_VALDIVIA[sectorCercano] || 'Valdivia';
  return `${nombreSector}, Valdivia`;
}

