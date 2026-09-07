import { z } from 'zod';

export const tipoCombustibleEnum = z.enum([
  'GASOLINA',
  'DIESEL',
  'ELECTRICO',
  'HIBRIDO',
  'OTRO',
]);

export type TipoCombustible = z.infer<typeof tipoCombustibleEnum>;

export const recursoDetallesSchema = z.object({
  // Comunes / Serializados
  patente: z.string().optional().or(z.literal('')),
  numeroSerie: z.string().optional().or(z.literal('')),
  marca: z.string().optional().or(z.literal('')),
  modelo: z.string().optional().or(z.literal('')),
  anio: z.coerce.number().int().min(1900).max(2100).optional().or(z.nan()),

  // Camionetas y Vehículos
  kilometraje: z.coerce.number().min(0, 'El kilometraje debe ser mayor o igual a 0').optional().or(z.nan()),
  tipoCombustible: tipoCombustibleEnum.optional().or(z.literal('')),
  capacidadPasajeros: z.coerce.number().int().min(1, 'La capacidad de pasajeros debe ser al menos 1').optional().or(z.nan()),
  numeroChasis: z.string().optional().or(z.literal('')),

  // Grúas y Maquinaria
  capacidadCargaKg: z.coerce.number().positive('La capacidad de carga debe ser mayor a 0').optional().or(z.nan()),
  alcanceMaximoMetros: z.coerce.number().positive('El alcance máximo debe ser mayor a 0').optional().or(z.nan()),
  tipoGrua: z.string().optional().or(z.literal('')),
  horometro: z.coerce.number().min(0, 'El horómetro debe ser mayor o igual a 0').optional().or(z.nan()),

  // Motobombas
  caudalMaximoLpm: z.coerce.number().positive('El caudal debe ser mayor a 0').optional().or(z.nan()),
  diametroPulgadas: z.coerce.number().positive('El diámetro debe ser mayor a 0').optional().or(z.nan()),
  potenciaHp: z.coerce.number().positive('La potencia debe ser mayor a 0').optional().or(z.nan()),
});

export type RecursoDetalles = z.infer<typeof recursoDetallesSchema>;

export const recursoFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().trim().optional(),
    esIndividual: z.boolean().default(false),
    cantidadInventario: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined;
        const num = typeof val === 'number' ? val : parseInt(String(val), 10);
        return Number.isNaN(num) ? undefined : num;
      },
      z
        .number({ message: 'La cantidad es obligatoria' })
        .int('La cantidad debe ser un número entero')
        .min(0, 'La cantidad no puede ser negativa')
    ),
    cantidadMinima: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return 0;
        const num = typeof val === 'number' ? val : parseInt(String(val), 10);
        return Number.isNaN(num) ? 0 : num;
      },
      z
        .number({ message: 'Ingresa una cantidad mínima válida' })
        .int('La cantidad mínima debe ser un número entero')
        .min(0, 'La cantidad mínima no puede ser negativa')
        .default(0)
    ),
    latitud: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined;
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        return Number.isNaN(num) ? undefined : num;
      },
      z
        .number({ message: 'La ubicación (latitud) es obligatoria' })
        .min(-90, 'La latitud debe estar entre -90 y 90')
        .max(90, 'La latitud debe estar entre -90 y 90')
    ),
    longitud: z.preprocess(
      (val) => {
        if (val === '' || val === null || val === undefined) return undefined;
        const num = typeof val === 'number' ? val : parseFloat(String(val));
        return Number.isNaN(num) ? undefined : num;
      },
      z
        .number({ message: 'La ubicación (longitud) es obligatoria' })
        .min(-180, 'La longitud debe estar entre -180 y 180')
        .max(180, 'La longitud debe estar entre -180 y 180')
    ),
    detalles: recursoDetallesSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.esIndividual && data.cantidadInventario !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cantidadInventario'],
        message: 'Para recursos individuales, la cantidad en inventario debe ser exactamente 1',
      });
    }
  });

export type RecursoFormInput = z.infer<typeof recursoFormSchema>;

export type SubtipoDetalle = 'NINGUNO' | 'VEHICULO' | 'MAQUINARIA' | 'MOTOBOMBA' | 'SERIALIZADO';
