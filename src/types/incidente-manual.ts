import { z } from 'zod';
import { validarRutChileno } from '@/lib/validations/rut';
import { validarTelefonoChileno } from '@/lib/validations/telefono';

export const ORIGENES_REPORTE = ['LLAMADA_TELEFONICA', 'FUNCIONARIO_TERRENO'] as const;
export type OrigenReporte = (typeof ORIGENES_REPORTE)[number];

export const PRIORIDADES_INCIDENTE = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as const;
export type PrioridadIncidente = (typeof PRIORIDADES_INCIDENTE)[number];

export interface DuplicadoItem {
  id: string;
  codigo: string;
  tipoAfectacion: string;
  direccion: string;
  estado: string;
  distanciaMetros: number;
  creadoEn: string;
  origen: 'aviso' | 'incidente';
}

export interface OperadorCallCenter {
  id: string;
  nombre: string;
  rol: string;
}

export const OPERADORES_CALLCENTER_PREDEFINIDOS: OperadorCallCenter[] = [
  {
    id: 'c1111111-1111-4111-8111-111111111111',
    nombre: 'Carlos Miranda (Mesa 1)',
    rol: 'Call Center',
  },
  {
    id: 'c2222222-2222-4222-8222-222222222222',
    nombre: 'Patricia Valenzuela (Mesa 2)',
    rol: 'Call Center',
  },
  {
    id: 'c3333333-3333-4333-8333-333333333333',
    nombre: 'Rodrigo Fuentes (Mesa 3)',
    rol: 'Call Center',
  },
];

export const DEFAULT_CALLCENTER_OPERADOR_ID = OPERADORES_CALLCENTER_PREDEFINIDOS[0].id;

export const TIPOS_AFECTACION_FALLBACK = [
  'Anegamiento',
  'Caída de árbol',
  'Corte de energía',
  'Deslizamiento',
  'Daño estructural',
  'Corte de agua potable',
  'Otro',
];

/**
 * Esquema de validación en cliente para el formulario de ingreso manual.
 */
export const incidenteManualSchema = z.object({
  origenReporte: z.enum(ORIGENES_REPORTE, {
    message: 'Debes seleccionar el origen del reporte (Llamada o Funcionario)',
  }),
  tipoAfectacion: z
    .string()
    .trim()
    .min(1, 'Debes seleccionar un tipo de afectación'),
  descripcion: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres'),
  direccion: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  informanteNombre: z
    .string()
    .trim()
    .min(3, 'El nombre del informante debe tener al menos 3 caracteres'),
  informanteRut: z
    .string()
    .trim()
    .min(1, 'El RUT del informante es obligatorio')
    .refine((val) => validarRutChileno(val), {
      message: 'El RUT ingresado no es válido (verifica cuerpo y dígito verificador)',
    }),
  informanteTelefono: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val === '' || validarTelefonoChileno(val),
      {
        message: 'El teléfono debe tener un formato chileno válido (ej. +56912345678 o 912345678)',
      }
    ),
  prioridad: z.enum(PRIORIDADES_INCIDENTE).default('MEDIA'),
  requiereAsistenciaSocial: z.boolean().default(false),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  asteriskCallId: z.string().trim().optional(),
  asteriskCallerPhone: z.string().trim().optional(),
  forzarCreacion: z.boolean().default(false),
});

export type IncidenteManualFormValues = z.infer<typeof incidenteManualSchema>;

export interface IncidenteCreadoExito {
  codigoIncidente: string;
  codigoAviso: string;
  tipoAfectacion: string;
  direccion: string;
  estado: string;
  prioridad: string;
  creadoEn: string;
}
