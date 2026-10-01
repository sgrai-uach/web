/**
 * Utilidades para generación y validación de contraseñas de acceso institucional.
 */

export interface ValidacionPasswordResult {
  esValida: boolean;
  tieneLongitudMinima: boolean;
  tieneLetras: boolean;
  tieneNumeros: boolean;
  errores: string[];
}

/**
 * Valida la fortaleza básica de una contraseña según los requisitos del sistema:
 * - Mínimo 8 caracteres.
 * - Alfanumérica (debe contener letras y números).
 */
export function validarFortalezaPassword(password: string): ValidacionPasswordResult {
  const tieneLongitudMinima = typeof password === 'string' && password.length >= 8;
  const tieneLetras = /[a-zA-Z]/.test(password);
  const tieneNumeros = /\d/.test(password);

  const errores: string[] = [];
  if (!tieneLongitudMinima) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!tieneLetras) {
    errores.push('La contraseña debe incluir al menos una letra');
  }
  if (!tieneNumeros) {
    errores.push('La contraseña debe incluir al menos un número');
  }

  const esValida = tieneLongitudMinima && tieneLetras && tieneNumeros;

  return {
    esValida,
    tieneLongitudMinima,
    tieneLetras,
    tieneNumeros,
    errores,
  };
}

/**
 * Genera una contraseña segura y aleatoria con una longitud especificada (por defecto 12 caracteres).
 * Garantiza la presencia de mayúsculas, minúsculas, números y al menos un carácter seguro.
 */
export function generarPasswordSegura(longitud = 12): string {
  const minChars = 8;
  const targetLen = Math.max(longitud, minChars);

  const minusculas = 'abcdefghijkmnpqrstuvwxyz'; // sin l, o confusas
  const mayusculas = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I, O
  const numeros = '23456789'; // sin 0, 1
  const simbolos = '!@#$%&*';

  // Asegurar al menos uno de cada categoría
  const obligatorios = [
    minusculas[Math.floor(Math.random() * minusculas.length)],
    mayusculas[Math.floor(Math.random() * mayusculas.length)],
    numeros[Math.floor(Math.random() * numeros.length)],
    simbolos[Math.floor(Math.random() * simbolos.length)],
  ];

  const todos = minusculas + mayusculas + numeros + simbolos;
  const restantes: string[] = [];
  for (let i = obligatorios.length; i < targetLen; i++) {
    restantes.push(todos[Math.floor(Math.random() * todos.length)]);
  }

  // Mezclar array con Fisher-Yates
  const combinados = [...obligatorios, ...restantes];
  for (let i = combinados.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinados[i], combinados[j]] = [combinados[j], combinados[i]];
  }

  return combinados.join('');
}
