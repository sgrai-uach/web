/**
 * Utilidades para formateo de tiempos y duraciones en el SGRAI.
 */

/**
 * Convierte la cantidad de minutos de espera de un aviso en una representación
 * humana legible según el tiempo transcurrido:
 * - 0 min o menor: "Ahora"
 * - 1 a 59 min: "{X} min"
 * - 60 a 1439 min: "{H} h" o "{H} h {M} min"
 * - >= 1440 min (1 día o más): "{D} d" o "{D} d {H} h"
 *
 * @param minutos Cantidad de minutos transcurridos en espera
 * @returns Cadena formateada para visualización en tablas y modales
 */
export function formatearTiempoEspera(minutos: number): string {
  if (typeof minutos !== 'number' || isNaN(minutos) || minutos <= 0) {
    return 'Ahora';
  }

  const mins = Math.floor(minutos);

  if (mins < 60) {
    return `${mins} min`;
  }

  const horas = Math.floor(mins / 60);
  const minsRestantes = mins % 60;

  if (mins < 1440) {
    if (minsRestantes === 0) {
      return `${horas} h`;
    }
    return `${horas} h ${minsRestantes} min`;
  }

  const dias = Math.floor(mins / 1440);
  const horasRestantes = Math.floor((mins % 1440) / 60);

  if (horasRestantes === 0) {
    return `${dias} d`;
  }
  return `${dias} d ${horasRestantes} h`;
}
