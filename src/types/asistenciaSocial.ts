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
  })
  .refine(
    (f) => (f.cantidadNinos ?? 0) + (f.cantidadAdultosMayores ?? 0) <= f.nucleoFamiliarTotal,
    {
      message:
        'La suma de niños y adultos mayores no puede superar el total de integrantes del hogar.',
    }
  );

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
