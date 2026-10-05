'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { getCatalogos } from '@/services/catalogosService';
import { getRecursos } from '@/services/recursosService';
import {
  crearEventoRecuperacion,
  RecuperacionServiceError,
  type TipoConflictoRecuperacion,
} from '@/services/recuperacionService';
import {
  PATRULLAS_OFICIALES_SEED,
  type PatrullaVerificadoraItem,
  type PrioridadRecuperacion,
  type EventoRecuperacionResponse,
  type ItemRecursoSolicitado,
  type CrearEventoRecuperacionInput,
} from '@/types/recuperacion';
import type { CatalogoItem } from '@/types/catalogos';
import type { RecursoItem } from '@/types/recurso';
import {
  PackagePlus,
  MapPin,
  Truck,
  Boxes,
  AlertTriangle,
  Trash2,
  Plus,
} from 'lucide-react';
import styles from './ModalCrearEventoRecuperacion.module.css';

interface FilaRecursoForm {
  idTemporal: string;
  recursoId: string;
  cantidad: number;
}

export interface ModalCrearEventoRecuperacionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (evento: EventoRecuperacionResponse) => void;
  userId?: string;
  patrullasDisponibles?: PatrullaVerificadoraItem[];
}

export const ModalCrearEventoRecuperacion: React.FC<ModalCrearEventoRecuperacionProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  patrullasDisponibles: patrullasProp,
}) => {
  const { showSuccess, showError } = useToast();

  // Lista de patrullas a desplegar
  const patrullas = useMemo(() => {
    return patrullasProp && patrullasProp.length > 0 ? patrullasProp : PATRULLAS_OFICIALES_SEED;
  }, [patrullasProp]);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [sector, setSector] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [direccionTexto, setDireccionTexto] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadRecuperacion>('MEDIA');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [familiasAfectadas, setFamiliasAfectadas] = useState<number>(0);
  const [delegacionId, setDelegacionId] = useState<string>('');
  const [patrullaId, setPatrullaId] = useState<string>('');
  const [latitud, setLatitud] = useState<number>(-39.8142);
  const [longitud, setLongitud] = useState<number>(-73.2459);

  // Filas dinámicas de recursos solicitados
  const [filasRecursos, setFilasRecursos] = useState<FilaRecursoForm[]>([
    { idTemporal: 'recurso-1', recursoId: '', cantidad: 1 },
  ]);

  // Catálogos e inventario
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>([]);
  const [inventario, setInventario] = useState<RecursoItem[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);
  const [mostrarSoloDisponibles, setMostrarSoloDisponibles] = useState(true);

  // Errores y estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [bannerConflicto, setBannerConflicto] = useState<{
    tipo: TipoConflictoRecuperacion;
    mensaje: string;
  } | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const patrullasFiltradas = useMemo(() => {
    if (!mostrarSoloDisponibles) return patrullas;
    return patrullas.filter((p) => p.estado === 'DISPONIBLE');
  }, [patrullas, mostrarSoloDisponibles]);

  // Carga asíncrona de catálogos e inventario al abrir
  useEffect(() => {
    let activo = true;

    if (!isOpen) return;

    // Ejecutar en microtarea para evitar setState síncrono en cuerpo del efecto
    queueMicrotask(() => {
      if (!activo) return;
      setErroresCampos({});
      setBannerConflicto(null);
      setErrorGeneral(null);

      const primeraDisponible = patrullas.find((p) => p.estado === 'DISPONIBLE');
      if (primeraDisponible) {
        setPatrullaId((prev) => (prev ? prev : primeraDisponible.id));
      } else if (patrullas.length > 0) {
        setPatrullaId((prev) => (prev ? prev : patrullas[0].id));
      }
    });

    void (async () => {
      try {
        const [resCatalogos, resRecursos] = await Promise.all([
          getCatalogos().catch(() => ({ delegaciones: [], roles: [], especialidades: [], cargos: [] })),
          getRecursos({ pagina: 1, limite: 100, estado: 'DISPONIBLE' }, userId).catch(() => ({
            data: [],
            meta: { total: 0, pagina: 1, limite: 100, totalPaginas: 1 },
          })),
        ]);

        if (!activo) return;

        if (resCatalogos?.delegaciones) {
          setDelegaciones(resCatalogos.delegaciones);
        }
        if (resRecursos?.data) {
          setInventario(resRecursos.data);
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    })();

    return () => {
      activo = false;
    };
  }, [isOpen, patrullas, userId]);

  // Diccionario rápido de recursos para consultar stock
  const inventarioMap = useMemo(() => {
    const map = new Map<string, RecursoItem>();
    inventario.forEach((item) => map.set(item.id, item));
    return map;
  }, [inventario]);

  // Manejo de filas dinámicas de recursos
  const handleAgregarFilaRecurso = () => {
    setFilasRecursos((prev) => [
      ...prev,
      { idTemporal: `recurso-${Date.now()}-${Math.random()}`, recursoId: '', cantidad: 1 },
    ]);
  };

  const handleEliminarFilaRecurso = (idTemporal: string) => {
    if (filasRecursos.length <= 1) return;
    setFilasRecursos((prev) => prev.filter((f) => f.idTemporal !== idTemporal));
  };

  const handleRecursoChange = (idTemporal: string, recursoId: string) => {
    setFilasRecursos((prev) =>
      prev.map((f) => {
        if (f.idTemporal === idTemporal) {
          return { ...f, recursoId, cantidad: 1 };
        }
        return f;
      })
    );
  };

  const handleCantidadChange = (idTemporal: string, cantidad: number) => {
    setFilasRecursos((prev) =>
      prev.map((f) => {
        if (f.idTemporal === idTemporal) {
          return { ...f, cantidad };
        }
        return f;
      })
    );
  };

  // Manejo de selección geográfica desde el mapa interactivo
  const handleLocationChange = (coords: { latitud: number; longitud: number } | null) => {
    if (coords) {
      setLatitud(coords.latitud);
      setLongitud(coords.longitud);
      if (erroresCampos.latitud || erroresCampos.longitud) {
        setErroresCampos((prev) => {
          const next = { ...prev };
          delete next.latitud;
          delete next.longitud;
          return next;
        });
      }
    }
  };

  // Validación previa al envío
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombre || nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El título del evento debe tener al menos 3 caracteres.';
    } else if (nombre.length > 150) {
      nuevosErrores.nombre = 'El título no puede exceder 150 caracteres.';
    }

    if (!sector || sector.trim().length < 2) {
      nuevosErrores.sector = 'El sector territorial es obligatorio (mínimo 2 caracteres).';
    } else if (sector.length > 150) {
      nuevosErrores.sector = 'El sector no puede exceder 150 caracteres.';
    }

    if (!patrullaId) {
      nuevosErrores.patrullaId = 'Debe seleccionar una patrulla verificadora para la entrega.';
    }

    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      nuevosErrores.latitud = 'Coordenadas geográficas fuera del rango válido.';
    }

    // Validar recursos e insumos solicitados
    if (filasRecursos.length === 0) {
      nuevosErrores.recursos = 'Debe asignar al menos un recurso o insumo logístico.';
    } else {
      let algunInvalido = false;
      const idsSeleccionados = new Set<string>();

      for (let i = 0; i < filasRecursos.length; i++) {
        const fila = filasRecursos[i];
        if (!fila.recursoId) {
          nuevosErrores[`recurso_${i}`] = 'Seleccione un insumo del catálogo.';
          algunInvalido = true;
          continue;
        }

        if (idsSeleccionados.has(fila.recursoId)) {
          nuevosErrores[`recurso_${i}`] = 'Este insumo ya fue agregado en otra fila.';
          algunInvalido = true;
        }
        idsSeleccionados.add(fila.recursoId);

        const recData = inventarioMap.get(fila.recursoId);
        const stockDisponible = recData?.cantidadDisponible ?? 0;

        if (fila.cantidad <= 0 || !Number.isInteger(fila.cantidad)) {
          nuevosErrores[`cantidad_${i}`] = 'La cantidad debe ser un número entero mayor a 0.';
          algunInvalido = true;
        } else if (fila.cantidad > stockDisponible) {
          nuevosErrores[`cantidad_${i}`] = `Excede el stock disponible en bodega (máx. ${stockDisponible}).`;
          algunInvalido = true;
        }
      }

      if (algunInvalido && !nuevosErrores.recursos) {
        nuevosErrores.recursos = 'Verifique los recursos e insumos ingresados.';
      }
    }

    setErroresCampos(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerConflicto(null);
    setErrorGeneral(null);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    const recursosLimpios: ItemRecursoSolicitado[] = filasRecursos.map((f) => ({
      recursoId: f.recursoId,
      cantidad: Math.floor(Number(f.cantidad)),
    }));

    const payload: CrearEventoRecuperacionInput = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
      sector: sector.trim(),
      direccionTexto: direccionTexto.trim() ? direccionTexto.trim() : null,
      prioridad,
      contactoNombre: contactoNombre.trim() ? contactoNombre.trim() : null,
      contactoTelefono: contactoTelefono.trim() ? contactoTelefono.trim() : null,
      latitud,
      longitud,
      delegacionId: delegacionId ? delegacionId : null,
      patrullaId,
      familiasAfectadas: familiasAfectadas >= 0 ? familiasAfectadas : 0,
      recursos: recursosLimpios,
    };

    try {
      const eventoCreado = await crearEventoRecuperacion(payload, userId);

      showSuccess(
        `Evento de recuperación registrado y patrulla despachada exitosamente. Código: ${eventoCreado.codigo}`,
        'Operación de Recuperación Despachada'
      );

      if (onSuccess) {
        onSuccess(eventoCreado);
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof RecuperacionServiceError) {
        if (err.tipoConflicto === 'PATRULLA_OCUPADA') {
          setBannerConflicto({
            tipo: 'PATRULLA_OCUPADA',
            mensaje:
              'La patrulla seleccionada acaba de ser asignada a otra tarea o no se encuentra disponible. Seleccione otra patrulla disponible.',
          });
        } else if (err.tipoConflicto === 'STOCK_INSUFICIENTE') {
          setBannerConflicto({
            tipo: 'STOCK_INSUFICIENTE',
            mensaje:
              'Stock insuficiente en bodega para uno o más de los insumos requeridos. Modifique la cantidad solicitada.',
          });
        } else if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setErroresCampos(err.fieldErrors);
          setErrorGeneral('Por favor corrija los campos indicados en el formulario.');
        } else {
          setErrorGeneral(err.message);
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Error inesperado al crear el evento de recuperación.';
        setErrorGeneral(msg);
        showError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Evento de Recuperación"
      maxWidth="780px"
      actions={
        <>
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-crear-recuperacion"
            variant="primary"
            size="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Despachando Operación...' : 'Crear y Despachar Patrulla'}
          </Button>
        </>
      }
    >
      <form id="form-crear-recuperacion" onSubmit={handleSubmit} className={styles.formContainer} noValidate>
        {/* Banner de conflicto 409 (patrulla ocupada o stock insuficiente) */}
        {bannerConflicto && (
          <div className={styles.bannerConflicto} role="alert">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>
                {bannerConflicto.tipo === 'PATRULLA_OCUPADA'
                  ? 'Conflicto Operativo: Patrulla Ocupada'
                  : 'Conflicto de Inventario: Stock Insuficiente'}
              </strong>
              <p style={{ margin: '4px 0 0 0' }}>{bannerConflicto.mensaje}</p>
            </div>
          </div>
        )}

        {/* Error general */}
        {errorGeneral && (
          <div className={styles.bannerError} role="alert">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Error al despachar evento de recuperación</strong>
              <p style={{ margin: '4px 0 0 0' }}>{errorGeneral}</p>
            </div>
          </div>
        )}

        {/* Sección 1: Información General */}
        <div className={styles.sectionTitle}>
          <PackagePlus size={16} />
          <span>Información General del Evento</span>
        </div>

        <div>
          <Input
            label="Título / Nombre del Evento"
            id="recuperacion-nombre"
            requiredIndicator
            placeholder="Ej: Entrega de frazadas y planchas de zinc en Collico"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={erroresCampos.nombre}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.gridTwoCols}>
          <Input
            label="Sector / Población Afectada"
            id="recuperacion-sector"
            requiredIndicator
            placeholder="Ej: Collico, Las Ánimas, Niebla"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            error={erroresCampos.sector}
            disabled={isSubmitting}
          />

          <Select
            label="Prioridad Operativa"
            id="recuperacion-prioridad"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadRecuperacion)}
            disabled={isSubmitting}
            options={[
              { value: 'BAJA', label: 'Baja' },
              { value: 'MEDIA', label: 'Media (Estándar)' },
              { value: 'ALTA', label: 'Alta' },
              { value: 'CRITICA', label: 'Crítica / Urgente' },
            ]}
          />
        </div>

        <div className={styles.gridTwoCols}>
          <Input
            label="Dirección de Referencia"
            id="recuperacion-direccion"
            placeholder="Ej: Pasaje Los Cipreses 450 con Balmaceda"
            value={direccionTexto}
            onChange={(e) => setDireccionTexto(e.target.value)}
            error={erroresCampos.direccionTexto}
            disabled={isSubmitting}
          />

          <Select
            label="Delegación Territorial"
            id="recuperacion-delegacion"
            value={delegacionId}
            onChange={(e) => setDelegacionId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Seleccione delegación (opcional)</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} ({d.codigo})
              </option>
            ))}
          </Select>
        </div>

        <div className={styles.gridThreeCols}>
          <Input
            label="Familias Beneficiadas"
            id="recuperacion-familias"
            type="number"
            min={0}
            value={familiasAfectadas}
            onChange={(e) => setFamiliasAfectadas(Math.max(0, parseInt(e.target.value, 10) || 0))}
            disabled={isSubmitting}
            helperText="Estimación de viviendas"
          />

          <Input
            label="Contacto / Referente Vecinal"
            id="recuperacion-contacto-nombre"
            placeholder="Ej: Sra. María González"
            value={contactoNombre}
            onChange={(e) => setContactoNombre(e.target.value)}
            disabled={isSubmitting}
          />

          <Input
            label="Teléfono Contacto"
            id="recuperacion-contacto-telefono"
            placeholder="Ej: +56987654321"
            value={contactoTelefono}
            onChange={(e) => setContactoTelefono(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Textarea
            label="Instrucciones o Justificación Operativa"
            id="recuperacion-descripcion"
            placeholder="Indique detalles de afectación, accesos o instrucciones puntuales para el equipo en terreno..."
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Sección 2: Selección Geográfica en Mapa Leaflet */}
        <div className={styles.sectionTitle}>
          <MapPin size={16} />
          <span>Ubicación Geográfica en Terreno (Valdivia)</span>
        </div>

        <div>
          <LocationPickerMap
            latitud={latitud}
            longitud={longitud}
            onChange={handleLocationChange}
            height="200px"
            ariaLabel="Mapa interactivo para situar evento de recuperación en Valdivia"
          />
          {erroresCampos.latitud && (
            <span className={styles.fieldError}>{erroresCampos.latitud}</span>
          )}
        </div>

        {/* Sección 3: Patrulla Verificadora a Despachar */}
        <div className={styles.sectionTitle}>
          <Truck size={16} />
          <span>Patrulla Verificadora a Cargo</span>
        </div>

        <div className={styles.patrullaCard}>
          <div className={styles.patrullaCardHeader}>
            <label htmlFor="recuperacion-patrulla" style={{ fontWeight: 600, fontSize: '13px' }}>
              Seleccionar Patrulla Verificadora <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
            </label>
            <label style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={mostrarSoloDisponibles}
                onChange={(e) => setMostrarSoloDisponibles(e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Mostrar solo patrullas disponibles</span>
            </label>
          </div>

          <Select
            id="recuperacion-patrulla"
            value={patrullaId}
            onChange={(e) => setPatrullaId(e.target.value)}
            error={erroresCampos.patrullaId}
            disabled={isSubmitting}
          >
            <option value="">Seleccione una patrulla verificadora...</option>
            {patrullasFiltradas.map((p) => {
              const esDisponible = p.estado === 'DISPONIBLE';
              return (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {esDisponible ? '🟢 DISPONIBLE' : `🔴 (${p.estado})`}
                  {p.delegacionNombre ? ` — ${p.delegacionNombre}` : ''}
                </option>
              );
            })}
          </Select>

          {patrullasFiltradas.length === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--color-warning, #E65100)' }}>
              No hay patrullas verificadoras en estado DISPONIBLE. Desmarque el filtro para ver todas las patrullas.
            </div>
          )}
        </div>

        {/* Sección 4: Selección Dinámica de Recursos e Insumos */}
        <div className={styles.sectionTitle}>
          <Boxes size={16} />
          <span>Insumos y Recursos Logísticos a Entregar</span>
        </div>

        {erroresCampos.recursos && (
          <span className={styles.fieldError}>{erroresCampos.recursos}</span>
        )}

        <table className={styles.recursosTable}>
          <thead>
            <tr>
              <th style={{ width: '55%' }}>Insumo / Recurso Logístico</th>
              <th style={{ width: '25%' }}>Stock en Bodega</th>
              <th style={{ width: '15%' }}>Cantidad</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {filasRecursos.map((fila, index) => {
              const recSeleccionado = inventarioMap.get(fila.recursoId);
              const disponible = recSeleccionado?.cantidadDisponible ?? null;
              const errorFila = erroresCampos[`recurso_${index}`];
              const errorCantidad = erroresCampos[`cantidad_${index}`];

              return (
                <tr key={fila.idTemporal}>
                  <td>
                    <select
                      className={styles.select}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                      value={fila.recursoId}
                      onChange={(e) => handleRecursoChange(fila.idTemporal, e.target.value)}
                      disabled={isSubmitting || cargandoCatalogos}
                      aria-label={`Seleccionar insumo para fila ${index + 1}`}
                    >
                      <option value="">Seleccionar insumo...</option>
                      {inventario.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} (Disp: {item.cantidadDisponible})
                        </option>
                      ))}
                    </select>
                    {errorFila && <span className={styles.fieldError}>{errorFila}</span>}
                  </td>
                  <td>
                    {disponible !== null ? (
                      <span
                        className={`${styles.stockBadge} ${
                          disponible > 0 ? styles.stockBadgeAvailable : styles.stockBadgeLow
                        }`}
                      >
                        {disponible > 0 ? `${disponible} unidades disponibles` : 'Sin stock disponible'}
                      </span>
                    ) : (
                      <span style={{ color: '#888', fontSize: '11px' }}>Seleccione recurso</span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={disponible ?? undefined}
                      className={styles.input}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                      value={fila.cantidad}
                      onChange={(e) =>
                        handleCantidadChange(fila.idTemporal, parseInt(e.target.value, 10) || 0)
                      }
                      disabled={isSubmitting || !fila.recursoId}
                      aria-label={`Cantidad a entregar para fila ${index + 1}`}
                    />
                    {errorCantidad && <span className={styles.fieldError}>{errorCantidad}</span>}
                  </td>
                  <td className={styles.recursoRowActions}>
                    <button
                      type="button"
                      className={styles.btnEliminarRecurso}
                      onClick={() => handleEliminarFilaRecurso(fila.idTemporal)}
                      disabled={filasRecursos.length <= 1 || isSubmitting}
                      title="Eliminar fila de recurso"
                      aria-label="Eliminar insumo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '4px' }}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAgregarFilaRecurso}
            disabled={isSubmitting || cargandoCatalogos}
          >
            <Plus size={14} style={{ marginRight: '4px' }} />
            <span>Agregar otro insumo</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalCrearEventoRecuperacion;
