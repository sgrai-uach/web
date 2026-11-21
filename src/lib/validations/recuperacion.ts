import { z } from 'zod';

const ISO_DATETIME_WITH_TZ_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

export const itemRecursoEdicionSchema = z.object({
  recursoId: z.string().uuid('El recurso seleccionado debe tener un identificador válido.'),
  cantidad: z
    .number({ message: 'La cantidad debe ser un número entero.' })
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad debe ser mayor o igual a 1.'),
});

export const editarOperativoRecuperacionSchema = z
  .object({
    descripcion: z
      .string()
      .trim()
      .min(3, 'La descripción debe tener al menos 3 caracteres.')
      .max(1000, 'La descripción no puede superar los 1000 caracteres.')
      .nullable()
      .optional(),
    fechaEstimadaFin: z
      .string()
      .regex(
        ISO_DATETIME_WITH_TZ_REGEX,
        'La fecha estimada de término debe estar en formato ISO-8601 con zona horaria.'
      )
      .nullable()
      .optional(),
    patrullaId: z
      .string()
      .uuid('La patrulla seleccionada debe tener un identificador válido.')
      .optional(),
    recursos: z
      .array(itemRecursoEdicionSchema)
      .min(1, 'Si modifica los insumos, debe asignar al menos un recurso.')
      .optional(),
  })
  .refine(
    (data) =>
      data.descripcion !== undefined ||
      data.fechaEstimadaFin !== undefined ||
      data.patrullaId !== undefined ||
      data.recursos !== undefined,
    {
      message: 'Debe modificar al menos un campo de la planificación antes de guardar.',
    }
  );

export type EditarOperativoRecuperacionFormPayload = z.infer<
  typeof editarOperativoRecuperacionSchema
>;

export const consumoRecursoCierreSchema = z.object({
  recursoId: z.string().uuid('El identificador del recurso debe ser un UUID válido.'),
  cantidadConsumida: z
    .number({ message: 'La cantidad consumida debe ser un número entero.' })
    .int('La cantidad consumida debe ser un número entero.')
    .min(0, 'La cantidad consumida no puede ser negativa.'),
});

export const cerrarOperativoRecuperacionSchema = z
  .object({
    resumenCierre: z
      .string()
      .trim()
      .min(10, 'El resumen de cierre debe tener al menos 10 caracteres.')
      .max(2000, 'El resumen de cierre no puede superar los 2000 caracteres.'),
    consumos: z.array(consumoRecursoCierreSchema).optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.consumos) return;
    const vistos = new Set<string>();
    val.consumos.forEach((item, index) => {
      if (vistos.has(item.recursoId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['consumos', index, 'recursoId'],
          message: 'El recurso está duplicado en el detalle de consumos.',
        });
      }
      vistos.add(item.recursoId);
    });
  });

export type CerrarOperativoRecuperacionFormPayload = z.infer<
  typeof cerrarOperativoRecuperacionSchema
>;
