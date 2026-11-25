import { z } from 'zod';

export type PrioridadEventoSocial = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type EstadoEventoSocial =
  | 'PENDIENTE'
  | 'ASIGNADO'
  | 'EN_EVALUACION_FIBE'
  | 'FINALIZADO'
  | 'DESCARTADO';

export type TipoAfectacionSocial =
  | 'VIVIENDA_ANEGADA'
  | 'DANO_ESTRUCTURAL'
  | 'AISLAMIENTO_HOGAR'
  | 'INCENDIO_HABITACIONAL'
  | 'REMOCION_MASA'
  | 'OTRO_EXCEPCIONAL';

export type NivelCompromisoViviendaSocial =
  | 'SIN_DANO'
  | 'LEVE'
  | 'MODERADO'
  | 'GRAVE_INHABITABLE';

export interface NivelCompromisoOption {
  value: NivelCompromisoViviendaSocial;
  label: string;
}

export const NIVELES_COMPROMISO_VIVIENDA: NivelCompromisoOption[] = [
  { value: 'SIN_DANO', label: 'Sin daño estructural' },
  { value: 'LEVE', label: 'Daño leve (habitable)' },
  { value: 'MODERADO', label: 'Daño moderado (afectación parcial)' },
  { value: 'GRAVE_INHABITABLE', label: 'Daño grave / Inhabitable' },
];

export const NIVELES_DANO_VIVIENDA_FIBE: NivelCompromisoOption[] = [
  { value: 'SIN_DANO', label: 'Sin daño' },
  { value: 'LEVE', label: 'Leve' },
  { value: 'MODERADO', label: 'Moderado' },
  { value: 'GRAVE_INHABITABLE', label: 'Grave / No habitable' },
];

export interface FamiliaAfectadaSocialDTO {
  id?: string;
  referencia?: string;
  nucleoFamiliarTotal: number;
  cantidadNinos?: number;
  cantidadAdultosMayores?: number;
  personasDiscapacitadas?: number;
  personasElectrodependientes?: number;
  mascotasAfectadas?: number;
  nivelCompromisoVivienda?: NivelCompromisoViviendaSocial | string;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoRut?: string | null;
}

export interface DetallesEvaluacionSocialDTO {
  familias?: FamiliaAfectadaSocialDTO[];
  nucleoFamiliarTotal?: number;
  familiasAfectadas?: number;
  cantidadNinos?: number;
  cantidadAdultosMayores?: number;
  personasDiscapacitadas?: number;
  personasElectrodependientes?: number;
  mascotasAfectadas?: number;
  nivelCompromisoVivienda?: NivelCompromisoViviendaSocial | string | null;
  danosEstimados?: string | null;
}

export interface TipoAfectacionOption {
  value: TipoAfectacionSocial;
  label: string;
  descripcion: string;
}

export const TIPOS_AFECTACION_SOCIAL: TipoAfectacionOption[] = [
  {
    value: 'VIVIENDA_ANEGADA',
    label: 'Anegamiento de Vivienda',
    descripcion: 'Ingreso o saturación severa de agua en el patio o habitaciones por napas o desborde',
  },
  {
    value: 'DANO_ESTRUCTURAL',
    label: 'Daño Estructural / Techumbre',
    descripcion: 'Desprendimiento de cubierta, colapso de muros o daño severo en la estructura',
  },
  {
    value: 'AISLAMIENTO_HOGAR',
    label: 'Aislamiento de Hogar / Inaccesibilidad',
    descripcion: 'Pérdida de conectividad vial o corte de accesos peatonales al inmueble',
  },
  {
    value: 'INCENDIO_HABITACIONAL',
    label: 'Pérdida Habitacional por Fuego',
    descripcion: 'Afectación grave o total de enseres y vivienda por siniestro ígneo',
  },
  {
    value: 'REMOCION_MASA',
    label: 'Derrumbe o Remoción en Masa',
    descripcion: 'Deslizamiento de tierra, socavón o riesgo inminente de ladera sobre la vivienda',
  },
  {
    value: 'OTRO_EXCEPCIONAL',
    label: 'Otro Caso Excepcional',
    descripcion: 'Situación de vulnerabilidad social de emergencia que no clasifica en las categorías anteriores',
  },
];

export interface CrearEventoAsistenciaSocialDTO {
  descripcion: string;
  tipoAfectacion: TipoAfectacionSocial | string;
  direccionTexto: string;
  latitud: number;
  longitud: number;
  personasAfectadas?: number;
  familiasAfectadas?: number;
  prioridad?: PrioridadEventoSocial;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoRut?: string | null;
  delegacionId?: string | null;
  incidenteId?: string | null;
  asistenteSocialId?: string | null;
  detallesEvaluacion?: DetallesEvaluacionSocialDTO | null;
}

export interface EventoAsistenciaSocialItem {
  id: string;
  codigo: string;
  descripcion: string;
  tipoAfectacion: string;
  personasAfectadas: number;
  familiasAfectadas: number;
  direccionTexto: string;
  latitud: number;
  longitud: number;
  prioridad: PrioridadEventoSocial;
  estado: EstadoEventoSocial;
  contactoNombre: string | null;
  contactoTelefono: string | null;
  contactoRut: string | null;
  delegacionId: string | null;
  delegacionNombre: string | null;
  incidenteId: string | null;
  asistenteSocialId: string | null;
  asistenteSocialNombre: string | null;
  detallesEvaluacion?: DetallesEvaluacionSocialDTO | null;
  folioFibe?: string | null;
  nivelDanoVivienda?: NivelCompromisoViviendaSocial | null;
  observacionesFibe?: string | null;
  fibeRegistradaEn?: string | null;
  fibeRegistradaPorId?: string | null;
  creadoPor: {
    id: string;
    nombre: string;
  };
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarEventosAsistenciaSocialResponse {
  data: EventoAsistenciaSocialItem[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface FiltrosEventosAsistenciaSocialState {
  pagina: number;
  limite: number;
  busqueda?: string;
  delegacionId?: string;
  prioridad?: PrioridadEventoSocial;
  estado?: EstadoEventoSocial;
}

export function validarRutChilenoSocial(rut: string): boolean {
  const limpio = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) {
    return false;
  }
  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dvIngresado === dvEsperado;
}

export const familiaAfectadaSocialSchema = z
  .object({
    id: z.string().optional(),
    referencia: z.string().trim().max(120, 'Máximo 120 caracteres.').optional(),
    nucleoFamiliarTotal: z
      .number()
      .int('Debe ser un número entero.')
      .min(1, 'Cada familia debe registrar al menos 1 integrante.'),
    cantidadNinos: z.number().int().min(0, 'No puede ser negativo.').default(0),
    cantidadAdultosMayores: z.number().int().min(0, 'No puede ser negativo.').default(0),
    personasDiscapacitadas: z.number().int().min(0, 'No puede ser negativo.').default(0),
    personasElectrodependientes: z.number().int().min(0, 'No puede ser negativo.').default(0),
    mascotasAfectadas: z.number().int().min(0, 'No puede ser negativo.').default(0),
    nivelCompromisoVivienda: z.string().optional(),
    contactoNombre: z.string().trim().max(150, 'Máximo 150 caracteres.').nullable().optional(),
    contactoTelefono: z.string().trim().max(50, 'Máximo 50 caracteres.').nullable().optional(),
    contactoRut: z.string().trim().max(20, 'Máximo 20 caracteres.').nullable().optional(),
  })
  .superRefine((f, ctx) => {
    const total = f.nucleoFamiliarTotal;
    if ((f.cantidadNinos ?? 0) + (f.cantidadAdultosMayores ?? 0) > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cantidadNinos'],
        message:
          'La suma de niños y adultos mayores no puede superar el total de integrantes del hogar.',
      });
    }
    if ((f.personasDiscapacitadas ?? 0) > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['personasDiscapacitadas'],
        message:
          'La cantidad de personas con discapacidad no puede superar el total de integrantes del hogar.',
      });
    }
    if ((f.personasElectrodependientes ?? 0) > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['personasElectrodependientes'],
        message:
          'La cantidad de personas electrodependientes no puede superar el total de integrantes del hogar.',
      });
    }
    if (f.contactoRut && f.contactoRut.trim().length > 0 && !validarRutChilenoSocial(f.contactoRut)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contactoRut'],
        message: 'El RUT preliminar ingresado no es válido.',
      });
    }
  });

export const detallesEvaluacionSocialSchema = z.object({
  familias: z.array(familiaAfectadaSocialSchema).optional(),
  nucleoFamiliarTotal: z.number().int().min(0).optional(),
  familiasAfectadas: z.number().int().min(0).optional(),
  cantidadNinos: z.number().int().min(0).optional(),
  cantidadAdultosMayores: z.number().int().min(0).optional(),
  personasDiscapacitadas: z.number().int().min(0).optional(),
  personasElectrodependientes: z.number().int().min(0).optional(),
  mascotasAfectadas: z.number().int().min(0).optional(),
  nivelCompromisoVivienda: z.string().nullable().optional(),
  danosEstimados: z.string().trim().max(500).nullable().optional(),
});

export const crearEventoAsistenciaSocialSchema = z.object({
  descripcion: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres.'),
  tipoAfectacion: z
    .string()
    .min(1, 'Debe seleccionar un tipo de afectación.'),
  direccionTexto: z
    .string()
    .trim()
    .min(3, 'La dirección debe tener al menos 3 caracteres.'),
  latitud: z
    .number({ message: 'Debe fijar la ubicación en el mapa o ingresar una dirección.' })
    .min(-90, 'Latitud inválida.')
    .max(90, 'Latitud inválida.'),
  longitud: z
    .number({ message: 'Debe fijar la ubicación en el mapa o ingresar una dirección.' })
    .min(-180, 'Longitud inválida.')
    .max(180, 'Longitud inválida.'),
  personasAfectadas: z
    .number()
    .int('Debe ser un número entero.')
    .min(0, 'Las personas afectadas no pueden ser negativas.')
    .default(0),
  familiasAfectadas: z
    .number()
    .int('Debe ser un número entero.')
    .min(0, 'Las familias afectadas no pueden ser negativas.')
    .default(0),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], {
    message: 'Debe seleccionar una prioridad de atención.',
  }),
  contactoNombre: z.string().trim().nullable().optional(),
  contactoTelefono: z.string().trim().nullable().optional(),
  contactoRut: z.string().trim().nullable().optional(),
  delegacionId: z.string().nullable().optional(),
  incidenteId: z.string().trim().nullable().optional(),
  asistenteSocialId: z.string().trim().nullable().optional(),
  detallesEvaluacion: detallesEvaluacionSocialSchema.nullable().optional(),
});

export type CrearEventoAsistenciaSocialFormInput = z.infer<typeof crearEventoAsistenciaSocialSchema>;

export interface AsignarAsistenteSocialDTO {
  asistenteSocialId: string;
}

export const asignarAsistenteSocialSchema = z.object({
  asistenteSocialId: z
    .string({ message: 'Debe seleccionar un asistente social disponible.' })
    .trim()
    .min(1, 'Debe seleccionar un asistente social disponible.'),
});

export type AsignarAsistenteSocialFormInput = z.infer<typeof asignarAsistenteSocialSchema>;

export interface ResumenAsistenciaSocialIncidente {
  id: string;
  codigo: string;
  estado: EstadoEventoSocial | string;
  asistenteSocialId?: string | null;
  asistenteSocialNombre?: string | null;
  asignadoEn?: string | null;
  creadoEn?: string | null;
  actualizadoEn?: string | null;
}

export interface DerivarAsistenciaSocialDTO {
  incidenteId: string;
  asistenteSocialId: string;
  observaciones?: string | null;
}

export interface DerivarAsistenciaSocialResponse {
  evento: EventoAsistenciaSocialItem;
  accion: 'CREADO' | 'ACTUALIZADO';
  hitoRegistrado?: {
    id?: string;
    hito: string;
    descripcion: string;
    creadoEn?: string;
  } | null;
}

export const derivarAsistenciaSocialSchema = z.object({
  incidenteId: z
    .string({ message: 'Identificador de incidente no válido.' })
    .trim()
    .min(1, 'Identificador de incidente no válido.'),
  asistenteSocialId: z
    .string({ message: 'Debe seleccionar un asistente social disponible.' })
    .trim()
    .min(1, 'Debe seleccionar un asistente social disponible.'),
  observaciones: z
    .string()
    .trim()
    .max(500, 'Las observaciones no pueden superar los 500 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type DerivarAsistenciaSocialFormInput = z.infer<typeof derivarAsistenciaSocialSchema>;

export interface RegistrarFichaFibeDTO {
  folioFibe: string;
  personasAfectadas?: number | null;
  nivelDanoVivienda?: NivelCompromisoViviendaSocial;
  observacionesSociales?: string | null;
}

export const FOLIO_FIBE_REGEX = /^[A-Za-z0-9-]+$/;

export const registrarFichaFibeSchema = z.object({
  folioFibe: z
    .string({ message: 'El folio oficial de la Ficha FIBE es obligatorio.' })
    .trim()
    .min(1, 'El folio oficial de la Ficha FIBE es obligatorio.')
    .max(50, 'El folio FIBE no puede superar los 50 caracteres.')
    .regex(
      FOLIO_FIBE_REGEX,
      'El folio FIBE solo puede contener letras, números y guiones (sin espacios).'
    )
    .transform((val) => val.toUpperCase()),
  personasAfectadas: z
    .number({ message: 'Debe ingresar un número entero válido.' })
    .int('Debe ser un número entero.')
    .min(0, 'La cantidad de integrantes evaluados no puede ser negativa.')
    .nullable()
    .optional(),
  nivelDanoVivienda: z
    .enum(['SIN_DANO', 'LEVE', 'MODERADO', 'GRAVE_INHABITABLE'], {
      message: 'Debe seleccionar un nivel de daño en vivienda válido.',
    })
    .optional(),
  observacionesSociales: z
    .string()
    .trim()
    .max(2000, 'Las observaciones sociales no pueden superar los 2000 caracteres.')
    .nullable()
    .optional(),
});

export type RegistrarFichaFibeFormInput = z.infer<typeof registrarFichaFibeSchema>;
