/**
 * Utilidades de validación y formateo de número telefónico chileno.
 */

/**
 * Limpia caracteres de formato en un teléfono (espacios, guiones, paréntesis).
 */
export function limpiarTelefono(telefono: string): string {
  if (!telefono || typeof telefono !== 'string') return '';
  return telefono.replace(/[\s\-()]/g, '').trim();
}

/**
 * Valida si un número telefónico corresponde a un teléfono chileno válido (móvil o fijo).
 * Requisitos:
 * - Campo obligatorio (no vacío).
 * - Formato móvil: 9 dígitos comenzando con 9 (ej: 912345678 o +56912345678).
 * - Formato fijo: 9 dígitos comenzando con código de área (ej: 632220000 para Valdivia o +56632220000).
 */
export function validarTelefonoChileno(telefono: string): boolean {
  const limpio = limpiarTelefono(telefono);
  if (!limpio) return false;

  // Extraer sólo dígitos y eventual '+' al inicio
  if (!/^\+?\d{8,12}$/.test(limpio)) {
    return false;
  }

  // Normalizar removiendo +56 o 56 inicial
  let soloDigitos = limpio;
  if (soloDigitos.startsWith('+56')) {
    soloDigitos = soloDigitos.slice(3);
  } else if (soloDigitos.startsWith('56') && soloDigitos.length === 11) {
    soloDigitos = soloDigitos.slice(2);
  }

  // En Chile todos los números telefónicos tienen 9 dígitos (fijos y móviles)
  if (soloDigitos.length !== 9) {
    return false;
  }

  // Debe ser estrictamente numérico y comenzar con 2-9 (móviles inician con 9)
  return /^[2-9]\d{8}$/.test(soloDigitos);
}

/**
 * Formatea el número normalizado para el envío a la API (formato internacional +56XXXXXXXXX).
 */
export function normalizarTelefonoParaEnvio(telefono: string): string {
  const limpio = limpiarTelefono(telefono);
  let soloDigitos = limpio.replace(/\D/g, '');

  if (soloDigitos.startsWith('56') && soloDigitos.length === 11) {
    soloDigitos = soloDigitos.slice(2);
  }

  if (soloDigitos.length === 9) {
    return `+56${soloDigitos}`;
  }

  return telefono.trim();
}
