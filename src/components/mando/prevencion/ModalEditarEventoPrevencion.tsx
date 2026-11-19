'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useOptionalToast } from '@/components/ui/Toast';
import { getRecursos } from '@/services/recursosService';
import {
  editarEventoPrevencion,
  PrevencionServiceError,
} from '@/services/prevencionService';
import { editarEventoPrevencionSchema } from '@/lib/validations/eventoPrevencionSchema';
import {
  PRIORIDADES_PREVENCION,
  type EventoPrevencionListItemDTO,
  type EventoPrevencionDTO,
  type PrioridadEventoPrevencion,
  type EditarEventoPrevencionPayload,
  type ItemRecursoSolicitadoPrevencion,
} from '@/types/evento-prevencion';
import type { RecursoItem } from '@/types/recurso';
import {
  Pencil,
  Calendar,
  Boxes,
  Plus,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import styles from './ModalEditarEventoPrevencion.module.css';

interface FilaRecursoEditForm {
  idTemporal: string;
  recursoId: string;
  cantidad: number;
}

export interface ModalEditarEventoPrevencionProps {
  isOpen: boolean;
  evento: EventoPrevencionListItemDTO | null;
  onClose: () => void;
  onSuccess?: (eventoActualizado: EventoPrevencionDTO) => void;
  userId?: string;
}

/**
 * Convierte una fecha ISO 8601 a valor compatible con <input type="datetime-local">
 * en la zona horaria local del navegador (YYYY-MM-DDTHH:mm).
 */
function isoToLocalDatetimeInput(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function normalizarRecursosParaComparar(
  recursos: Array<{ recursoId: string; cantidad: number }>
): string {
  return JSON.stringify(
    [...recursos]
      .filter((r) => r.recursoId)
      .sort((a, b) => a.recursoId.localeCompare(b.recursoId))
      .map((r) => ({ recursoId: r.recursoId, cantidad: r.cantidad }))
  );
}

export const ModalEditarEventoPrevencion: React.FC<ModalEditarEventoPrevencionProps> = ({
  isOpen,
  evento,
  onClose,
  onSuccess,
  userId,
}) => {
  const toast = useOptionalToast();

  const [nombre, setNombre] = useState(() => evento?.nombre || '');
  const [prioridad, setPrioridad] = useState<PrioridadEventoPrevencion>(
    () => evento?.prioridad || 'MEDIA'
  );
  const [descripcion, setDescripcion] = useState(() => evento?.descripcion || '');
  const [fechaEstimadaFinLocal, setFechaEstimadaFinLocal] = useState(() =>
    isoToLocalDatetimeInput(evento?.fechaEstimadaFin)
  );
  const [filasRecursos, setFilasRecursos] = useState<FilaRecursoEditForm[]>(() =>
    (evento?.recursos || []).map((rec, idx) => ({
      idTemporal: `rec-init-${rec.recursoId}-${idx}`,
      recursoId: rec.recursoId,
      cantidad: rec.cantidadAsignada,
    }))
  );

  const [inventario, setInventario] = useState<RecursoItem[]>([]);
  const [cargandoInventario, setCargandoInventario] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Cargar catálogo de recursos materiales desde bodega
  useEffect(() => {
    if (!isOpen) return;
    let activo = true;

    void (async () => {
      try {
        const res = await getRecursos({ pagina: 1, limite: 100 }, userId);
        if (activo && res?.data) {
          setInventario(res.data);
        }
      } catch {
        // Mantiene lista vacía si falla; los asignados siguen visibles con su nombre
      } finally {
        if (activo) setCargandoInventario(false);
      }
    })();

    return () => {
      activo = false;
    };
  }, [isOpen, userId]);

  const opcionesInventario = useMemo(() => {
    const mapa = new Map<string, { id: string; nombre: string; stockInfo?: string }>();
    for (const item of inventario) {
      mapa.set(item.id, {
        id: item.id,
        nombre: item.nombre,
        stockInfo: `Disp: ${item.cantidadDisponible ?? 0}`,
      });
    }
    if (evento?.recursos) {
      for (const rec of evento.recursos) {
        if (!mapa.has(rec.recursoId)) {
          mapa.set(rec.recursoId, {
            id: rec.recursoId,
            nombre: rec.nombre,
          });
        }
      }
    }
    return Array.from(mapa.values());
  }, [inventario, evento]);

  if (!evento) return null;

  const handleAgregarFilaRecurso = () => {
    setFilasRecursos((prev) => [
      ...prev,
      {
        idTemporal: `rec-${Date.now()}-${Math.random()}`,
        recursoId: '',
        cantidad: 1,
      },
    ]);
    setErrorServidor(null);
  };

  const handleCambiarRecursoFila = (idTemporal: string, recursoId: string) => {
    setFilasRecursos((prev) =>
      prev.map((fila) => (fila.idTemporal === idTemporal ? { ...fila, recursoId } : fila))
    );
    setFieldErrors((prev) => ({ ...prev, recursos: '' }));
    setErrorServidor(null);
  };

  const handleCambiarCantidadFila = (idTemporal: string, cantidad: number) => {
    setFilasRecursos((prev) =>
      prev.map((fila) =>
        fila.idTemporal === idTemporal
          ? { ...fila, cantidad: Number.isNaN(cantidad) ? 1 : cantidad }
          : fila
      )
    );
    setFieldErrors((prev) => ({ ...prev, recursos: '' }));
    setErrorServidor(null);
  };

  const handleEliminarFilaRecurso = (idTemporal: string) => {
    setFilasRecursos((prev) => prev.filter((fila) => fila.idTemporal !== idTemporal));
    setFieldErrors((prev) => ({ ...prev, recursos: '' }));
    setErrorServidor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);
    setFieldErrors({});

    // Validar filas incompletas o duplicadas en cliente
    const filasSinSeleccion = filasRecursos.some((f) => !f.recursoId);
    if (filasSinSeleccion) {
      setFieldErrors({
        recursos: 'Seleccione un recurso material en todas las filas o elimine las filas vacías.',
      });
      return;
    }

    const idsSeleccionados = filasRecursos.map((f) => f.recursoId);
    if (new Set(idsSeleccionados).size !== idsSeleccionados.length) {
      setFieldErrors({
        recursos: 'No puede asignar el mismo recurso material más de una vez. Ajuste la cantidad en una sola fila.',
      });
      return;
    }

    const payload: EditarEventoPrevencionPayload = {};

    const nombreTrim = nombre.trim();
    if (nombreTrim !== (evento.nombre || '')) {
      payload.nombre = nombreTrim;
    }

    if (prioridad !== evento.prioridad) {
      payload.prioridad = prioridad;
    }

    const descTrim = descripcion.trim();
    if (descTrim !== (evento.descripcion || '').trim()) {
      payload.descripcion = descTrim;
    }

    const fechaInicialLocal = isoToLocalDatetimeInput(evento.fechaEstimadaFin);
    if (fechaEstimadaFinLocal !== fechaInicialLocal) {
      if (!fechaEstimadaFinLocal) {
        payload.fechaEstimadaFin = null;
      } else {
        const parsedDate = new Date(fechaEstimadaFinLocal);
        if (Number.isNaN(parsedDate.getTime())) {
          setFieldErrors({ fechaEstimadaFin: 'Ingrese una fecha y hora válida.' });
          return;
        }
        payload.fechaEstimadaFin = parsedDate.toISOString();
      }
    }

    const recursosActuales: ItemRecursoSolicitadoPrevencion[] = filasRecursos.map((f) => ({
      recursoId: f.recursoId,
      cantidad: Number(f.cantidad),
    }));
    const recursosIniciales = (evento.recursos || []).map((r) => ({
      recursoId: r.recursoId,
      cantidad: r.cantidadAsignada,
    }));

    if (
      normalizarRecursosParaComparar(recursosActuales) !==
      normalizarRecursosParaComparar(recursosIniciales)
    ) {
      payload.recursos = recursosActuales;
    }

    const validacion = editarEventoPrevencionSchema.safeParse(payload);
    if (!validacion.success) {
      const nuevosErrores: Record<string, string> = {};
      let mensajeGeneral: string | null = null;

      for (const issue of validacion.error.issues) {
        const campo = issue.path[0] ? String(issue.path[0]) : null;
        if (campo) {
          nuevosErrores[campo] = issue.message;
        } else {
          mensajeGeneral = issue.message;
        }
      }

      setFieldErrors(nuevosErrores);
      if (mensajeGeneral) {
        setErrorServidor(mensajeGeneral);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const actualizado = await editarEventoPrevencion(evento.id, validacion.data, userId);
      toast?.showToast({
        type: 'success',
        message: `Evento preventivo ${actualizado.codigo || evento.codigo} actualizado exitosamente.`,
      });
      onSuccess?.(actualizado);
      onClose();
    } catch (err: unknown) {
      if (err instanceof PrevencionServiceError) {
        setErrorServidor(err.message);
        if (err.fieldErrors) {
          setFieldErrors(err.fieldErrors);
        }
      } else {
        setErrorServidor(
          err instanceof Error
            ? err.message
            : 'Error inesperado al actualizar el evento de prevención.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Editar Preventivo — ${evento.codigo}`}
      onClose={isSubmitting ? () => {} : onClose}
      maxWidth="720px"
      actions={
        <div className={styles.actionsFooter}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-editar-evento-prevencion"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando cambios...' : 'Guardar Cambios'}
          </Button>
        </div>
      }
    >
      <form
        id="form-editar-evento-prevencion"
        onSubmit={handleSubmit}
        className={styles.formContainer}
        noValidate
      >
        <div className={styles.bannerResumen}>
          <span className={styles.bannerCodigo}>
            Código: {evento.codigo}
          </span>
          <span className={styles.bannerEstado}>
            Estado actual: {evento.estado}
          </span>
        </div>

        {errorServidor && (
          <div className={styles.alertaError} role="alert">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{errorServidor}</span>
          </div>
        )}

        <div className={styles.sectionTitle}>
          <Pencil size={16} />
          <span>Planificación y Prioridad Territorial</span>
        </div>

        <div className={styles.gridTwoCols}>
          <Input
            id="edit-prevencion-nombre"
            label="Nombre del Evento Preventivo"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setFieldErrors((prev) => ({ ...prev, nombre: '' }));
              setErrorServidor(null);
            }}
            error={fieldErrors.nombre}
            disabled={isSubmitting}
            required
          />

          <Select
            id="edit-prevencion-prioridad"
            label="Prioridad Operativa"
            value={prioridad}
            onChange={(e) => {
              setPrioridad(e.target.value as PrioridadEventoPrevencion);
              setFieldErrors((prev) => ({ ...prev, prioridad: '' }));
              setErrorServidor(null);
            }}
            options={PRIORIDADES_PREVENCION.map((p) => ({
              value: p.valor,
              label: p.label,
            }))}
            error={fieldErrors.prioridad}
            disabled={isSubmitting}
          />
        </div>

        <Textarea
          id="edit-prevencion-descripcion"
          label="Descripción de Tareas Planificadas"
          value={descripcion}
          onChange={(e) => {
            setDescripcion(e.target.value);
            setFieldErrors((prev) => ({ ...prev, descripcion: '' }));
            setErrorServidor(null);
          }}
          rows={4}
          error={fieldErrors.descripcion}
          disabled={isSubmitting}
          required
        />

        <div className={styles.sectionTitle}>
          <Calendar size={16} />
          <span>Fecha Estimada de Finalización</span>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-prevencion-fecha-fin" className={styles.fieldLabel}>
            Fecha y hora estimada de término (opcional)
          </label>
          <div className={styles.dateInputRow}>
            <input
              id="edit-prevencion-fecha-fin"
              type="datetime-local"
              className={styles.dateInput}
              value={fechaEstimadaFinLocal}
              onChange={(e) => {
                setFechaEstimadaFinLocal(e.target.value);
                setFieldErrors((prev) => ({ ...prev, fechaEstimadaFin: '' }));
                setErrorServidor(null);
              }}
              disabled={isSubmitting}
            />
            {fechaEstimadaFinLocal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setFechaEstimadaFinLocal('');
                  setFieldErrors((prev) => ({ ...prev, fechaEstimadaFin: '' }));
                }}
                disabled={isSubmitting}
                aria-label="Limpiar fecha estimada de finalización"
              >
                <X size={14} style={{ marginRight: '4px' }} />
                Limpiar
              </Button>
            )}
          </div>
          {fieldErrors.fechaEstimadaFin ? (
            <span className={styles.fieldError}>{fieldErrors.fechaEstimadaFin}</span>
          ) : (
            <span className={styles.fieldHint}>
              Se enviará en formato estándar UTC (ISO 8601) o vacío para despejar la fecha.
            </span>
          )}
        </div>

        <div className={styles.recursosHeader}>
          <div className={styles.sectionTitle} style={{ flex: 1, marginBottom: 0 }}>
            <Boxes size={16} />
            <span>Recursos Materiales Vinculados</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAgregarFilaRecurso}
            disabled={isSubmitting}
          >
            <Plus size={14} style={{ marginRight: '4px' }} />
            Agregar Recurso
          </Button>
        </div>

        {fieldErrors.recursos && (
          <span className={styles.fieldError}>{fieldErrors.recursos}</span>
        )}

        {filasRecursos.length === 0 ? (
          <div className={styles.emptyRecursos}>
            Sin recursos materiales asignados. Presione &quot;Agregar Recurso&quot; si requiere despachar insumos desde bodega.
          </div>
        ) : (
          <table className={styles.recursosTable}>
            <thead>
              <tr>
                <th>Recurso Material</th>
                <th style={{ width: '110px' }}>Cantidad</th>
                <th style={{ width: '64px', textAlign: 'center' }}>Quitar</th>
              </tr>
            </thead>
            <tbody>
              {filasRecursos.map((fila) => (
                <tr key={fila.idTemporal}>
                  <td>
                    <select
                      aria-label="Recurso material"
                      className={styles.recursoSelect}
                      value={fila.recursoId}
                      onChange={(e) => handleCambiarRecursoFila(fila.idTemporal, e.target.value)}
                      disabled={isSubmitting || cargandoInventario}
                    >
                      <option value="">
                        {cargandoInventario ? 'Cargando inventario...' : 'Seleccione un recurso...'}
                      </option>
                      {opcionesInventario.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre}
                          {item.stockInfo ? ` (${item.stockInfo})` : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      aria-label="Cantidad de recurso"
                      type="number"
                      min={1}
                      step={1}
                      className={styles.cantidadInput}
                      value={fila.cantidad}
                      onChange={(e) =>
                        handleCambiarCantidadFila(
                          fila.idTemporal,
                          parseInt(e.target.value || '1', 10)
                        )
                      }
                      disabled={isSubmitting}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminarFilaRecurso(fila.idTemporal)}
                      disabled={isSubmitting}
                      aria-label="Quitar recurso"
                    >
                      <Trash2 size={15} color="var(--color-danger, #D32F2F)" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </form>
    </Modal>
  );
};

export default ModalEditarEventoPrevencion;
