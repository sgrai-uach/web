import { z } from 'zod';

/**
 * Schema Zod para la validación en cliente del formulario de edición
 * de eventos de prevención activos (H77).
 */
export const recursoEditadoPrevencionSchema = z.object({
  recursoId: z.string().min(1, 'Debe seleccionar un recurso material válido.'),
  cantidad: z
    .number({ message: 'La cantidad debe ser un número.' })
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad mínima por recurso es 1.'),
});

export const editarEventoPrevencionSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres.')
      .max(150, 'El nombre no puede superar los 150 caracteres.')
      .optional(),
    descripcion: z
      .string()
      .trim()
      .min(5, 'La descripción de tareas debe tener al menos 5 caracteres.')
      .max(1000, 'La descripción de tareas no puede superar los 1000 caracteres.')
      .optional(),
    prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], {
      message: 'Seleccione una prioridad válida.',
    }).optional(),
    fechaEstimadaFin: z
      .string()
      .datetime({ offset: true, message: 'La fecha estimada de finalización debe tener formato ISO 8601 válido.' })
      .nullable()
      .optional(),
    recursos: z.array(recursoEditadoPrevencionSchema).optional(),
  })
  .refine(
    (data) =>
      data.nombre !== undefined ||
      data.descripcion !== undefined ||
      data.prioridad !== undefined ||
      data.fechaEstimadaFin !== undefined ||
      data.recursos !== undefined,
    {
      message: 'Debe modificar al menos un campo antes de guardar los cambios.',
    }
  );

export type EditarEventoPrevencionSchemaInput = z.infer<typeof editarEventoPrevencionSchema>;
