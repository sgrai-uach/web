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
import { getPuntosCriticos } from '@/services/puntosCriticosService';
import {
  crearEventoPrevencion,
  PrevencionServiceError,
  type TipoConflictoPrevencion,
} from '@/services/prevencionService';
import {
  PATRULLAS_OFICIALES_SEED,
  PRIORIDADES_PREVENCION,
  type PatrullaVerificadoraItem,
  type PrioridadEventoPrevencion,
  type EventoPrevencionDTO,
  type ItemRecursoSolicitadoPrevencion,
  type CrearEventoPrevencionPayload,
} from '@/types/evento-prevencion';
import type { CatalogoItem } from '@/types/catalogos';
import type { RecursoItem } from '@/types/recurso';
import type { PuntoCriticoItem } from '@/types/puntoCritico';
import {
  ShieldAlert,
  MapPin,
  Truck,
  Boxes,
  AlertTriangle,
  Trash2,
  Plus,
  Compass,
} from 'lucide-react';
import styles from './ModalCrearEventoPrevencion.module.css';

interface FilaRecursoForm {
  idTemporal: string;
  recursoId: string;
  cantidad: number;
}

export interface ModalCrearEventoPrevencionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (evento: EventoPrevencionDTO) => void;
  userId?: string;
  patrullasDisponibles?: PatrullaVerificadoraItem[];
}

export const ModalCrearEventoPrevencion: React.FC<ModalCrearEventoPrevencionProps> = ({
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
  const [descripcion, setDescripcion] = useState('');
  const [sector, setSector] = useState('');
  const [direccionTexto, setDireccionTexto] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadEventoPrevencion>('MEDIA');
  const [delegacionId, setDelegacionId] = useState<string>('');
  const [puntoCriticoId, setPuntoCriticoId] = useState<string>('');
  const [patrullaId, setPatrullaId] = useState<string>('');
  const [latitud, setLatitud] = useState<number>(-39.8142);
  const [longitud, setLongitud] = useState<number>(-73.2459);

  // Filas dinámicas de recursos solicitados (opcional en prevención)
  const [filasRecursos, setFilasRecursos] = useState<FilaRecursoForm[]>([]);

  // Catálogos, inventario y puntos críticos
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>([]);
  const [puntosCriticos, setPuntosCriticos] = useState<PuntoCriticoItem[]>([]);
  const [inventario, setInventario] = useState<RecursoItem[]>([]);
  const [mostrarSoloDisponibles, setMostrarSoloDisponibles] = useState(true);

  // Errores y estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [bannerConflicto, setBannerConflicto] = useState<{
    tipo: TipoConflictoPrevencion;
    mensaje: string;
  } | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const patrullasFiltradas = useMemo(() => {
    if (!mostrarSoloDisponibles) return patrullas;
    return patrullas.filter((p) => p.estado === 'DISPONIBLE');
  }, [patrullas, mostrarSoloDisponibles]);

  // Carga asíncrona de catálogos, puntos críticos e inventario al abrir
  useEffect(() => {
    let activo = true;

    if (!isOpen) return;

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
        const [resCatalogos, resRecursos, resPuntosCriticos] = await Promise.all([
          getCatalogos().catch(() => ({ delegaciones: [], roles: [], especialidades: [], cargos: [] })),
          getRecursos({ pagina: 1, limite: 100, estado: 'DISPONIBLE' }, userId).catch(() => ({
            data: [],
            meta: { total: 0, pagina: 1, limite: 100, totalPaginas: 1 },
          })),
          getPuntosCriticos({ pagina: 1, limite: 100, activo: true }, userId).catch(() => ({
            data: [],
            meta: { total: 0, pagina: 1, limite: 100, totalPaginas: 1 },
          })),
        ]);

        if (!activo) return;

        if (resCatalogos?.delegaciones && resCatalogos.delegaciones.length > 0) {
          setDelegaciones(resCatalogos.delegaciones);
          setDelegacionId((prev) => (prev ? prev : resCatalogos.delegaciones[0].id));
        }
        if (resRecursos?.data) {
          setInventario(resRecursos.data);
        }
        if (resPuntosCriticos?.data) {
          setPuntosCriticos(resPuntosCriticos.data);
        }
      } catch {
        // Ignorar fallas silenciosas en precarga
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

  // Punto crítico seleccionado actualmente
  const puntoCriticoSeleccionado = useMemo(() => {
    if (!puntoCriticoId) return null;
    return puntosCriticos.find((pc) => pc.id === puntoCriticoId) || null;
  }, [puntoCriticoId, puntosCriticos]);

  // Cambio de punto crítico desde el selector
  const handlePuntoCriticoChange = (id: string) => {
    setPuntoCriticoId(id);
    if (!id) return;

    const pc = puntosCriticos.find((p) => p.id === id);
    if (pc) {
      setLatitud(pc.latitud);
      setLongitud(pc.longitud);

      if (pc.delegacion?.id) {
        setDelegacionId(pc.delegacion.id);
      }

      if (!sector) {
        setSector(pc.nombre);
      }

      if (erroresCampos.latitud || erroresCampos.longitud || erroresCampos.delegacionId) {
        setErroresCampos((prev) => {
          const next = { ...prev };
          delete next.latitud;
          delete next.longitud;
          delete next.delegacionId;
          return next;
        });
      }
    }
  };

  // Manejo de filas dinámicas de recursos
  const handleAgregarFilaRecurso = () => {
    setFilasRecursos((prev) => [
      ...prev,
      { idTemporal: `recurso-${Date.now()}-${Math.random()}`, recursoId: '', cantidad: 1 },
    ]);
  };

  const handleEliminarFilaRecurso = (idTemporal: string) => {
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
      nuevosErrores.nombre = 'El título de la labor preventiva debe tener al menos 3 caracteres.';
    } else if (nombre.length > 150) {
      nuevosErrores.nombre = 'El título no puede exceder 150 caracteres.';
    }

    if (!descripcion || descripcion.trim().length < 5) {
      nuevosErrores.descripcion = 'Las instrucciones tácticas son obligatorias (mínimo 5 caracteres).';
    } else if (descripcion.length > 1000) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 1000 caracteres.';
    }

    if (!delegacionId) {
      nuevosErrores.delegacionId = 'Debe seleccionar la delegación territorial correspondiente.';
    }

    if (!patrullaId) {
      nuevosErrores.patrullaId = 'Debe seleccionar una patrulla verificadora disponible.';
    }

    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      nuevosErrores.latitud = 'Coordenadas geográficas fuera del rango válido.';
    }

    // Validar recursos si fueron agregados
    if (filasRecursos.length > 0) {
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

    const recursosLimpios: ItemRecursoSolicitadoPrevencion[] = filasRecursos
      .filter((f) => Boolean(f.recursoId))
      .map((f) => ({
        recursoId: f.recursoId,
        cantidad: Math.floor(Number(f.cantidad)),
      }));

    const payload: CrearEventoPrevencionPayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      sector: sector.trim() ? sector.trim() : null,
      direccionTexto: direccionTexto.trim() ? direccionTexto.trim() : null,
      prioridad,
      delegacionId,
      puntoCriticoId: puntoCriticoId ? puntoCriticoId : null,
      latitud,
      longitud,
      patrullaId,
      recursos: recursosLimpios.length > 0 ? recursosLimpios : undefined,
    };

    try {
      const eventoCreado = await crearEventoPrevencion(payload, userId);

      showSuccess(
        `Evento de prevención registrado y patrulla despachada exitosamente. Código: ${eventoCreado.codigo}`,
        'Operación Preventiva Despachada'
      );

      if (onSuccess) {
        onSuccess(eventoCreado);
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof PrevencionServiceError) {
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
        const msg = err instanceof Error ? err.message : 'Error inesperado al crear el evento de prevención.';
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
      title="Nuevo Evento de Prevención"
      maxWidth="820px"
      actions={
        <>
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-crear-prevencion"
            variant="primary"
            size="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Despachando Operación...' : 'Crear y Despachar Patrulla'}
          </Button>
        </>
      }
    >
      <form id="form-crear-prevencion" onSubmit={handleSubmit} className={styles.formContainer} noValidate>
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
              <strong>Error al despachar evento de prevención</strong>
              <p style={{ margin: '4px 0 0 0' }}>{errorGeneral}</p>
            </div>
          </div>
        )}

        {/* Sección 1: Información General de la Labor Preventiva */}
        <div className={styles.sectionTitle}>
          <ShieldAlert size={16} />
          <span>Información General de la Operación Preventiva</span>
        </div>

        <div>
          <Input
            label="Título / Nombre de la Labor Preventiva"
            id="prevencion-nombre"
            requiredIndicator
            placeholder="Ej: Inspección preventiva y limpieza de sumideros en Angachilla"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={erroresCampos.nombre}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.gridTwoCols}>
          <Select
            label="Prioridad Operativa"
            id="prevencion-prioridad"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadEventoPrevencion)}
            disabled={isSubmitting}
            options={PRIORIDADES_PREVENCION.map((p) => ({
              value: p.valor,
              label: p.label,
            }))}
          />

          <Select
            label="Delegación Territorial Municipal"
            id="prevencion-delegacion"
            requiredIndicator
            value={delegacionId}
            onChange={(e) => setDelegacionId(e.target.value)}
            disabled={isSubmitting}
            error={erroresCampos.delegacionId}
            options={
              delegaciones.length > 0
                ? delegaciones.map((d) => ({
                    value: d.id,
                    label: d.nombre,
                  }))
                : [
                    { value: '30000000-0000-4000-8000-000000000001', label: 'Delegación Norte' },
                    { value: '30000000-0000-4000-8000-000000000002', label: 'Delegación Sur' },
                    { value: '30000000-0000-4000-8000-000000000003', label: 'Delegación Costa' },
                    { value: '30000000-0000-4000-8000-000000000004', label: 'Delegación Calle Calle' },
                  ]
            }
          />
        </div>

        <div>
          <Textarea
            label="Instrucciones Tácticas y Detalle de Mitigación"
            id="prevencion-descripcion"
            requiredIndicator
            rows={3}
            placeholder="Describa las acciones preventivas a ejecutar por la patrulla (ej. revisión de cauce, despeje de sumideros, verificación de talud o monitoreo preventivo ante alerta meteorológica)..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            error={erroresCampos.descripcion}
            disabled={isSubmitting}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: '#5F676E', marginTop: '2px' }}>
            <span>{descripcion.length}/1000 caracteres (mínimo 5)</span>
          </div>
        </div>

        {/* Sección 2: Ubicación y Georreferenciación (Puntos Críticos) */}
        <div className={styles.sectionTitle}>
          <MapPin size={16} />
          <span>Georreferenciación y Punto Crítico Territorial</span>
        </div>

        <div>
          <Select
            label="Punto Crítico Preexistente (Catálogo Municipal)"
            id="prevencion-punto-critico"
            value={puntoCriticoId}
            onChange={(e) => handlePuntoCriticoChange(e.target.value)}
            disabled={isSubmitting}
            options={[
              { value: '', label: '-- Ninguno (Ingreso libre en mapa o coordenadas) --' },
              ...puntosCriticos.map((pc) => ({
                value: pc.id,
                label: `${pc.codigo} — ${pc.nombre} (${pc.delegacion?.nombre || 'Valdivia'})`,
              })),
            ]}
          />
        </div>

        {puntoCriticoSeleccionado && (
          <div className={styles.puntoCriticoCard}>
            <div className={styles.puntoCriticoBadge}>
              <Compass size={14} />
              <span>Punto Crítico Vinculado: {puntoCriticoSeleccionado.codigo}</span>
            </div>
            <div>
              <strong>{puntoCriticoSeleccionado.nombre}</strong>
            </div>
            {puntoCriticoSeleccionado.descripcion && (
              <p style={{ margin: 0, color: 'var(--color-text-muted, #5F676E)' }}>
                {puntoCriticoSeleccionado.descripcion}
              </p>
            )}
            <div style={{ fontSize: '12px', color: 'var(--color-primary-teal, #1B6F7D)' }}>
              Riesgo: <strong>{puntoCriticoSeleccionado.tipoRiesgo}</strong> | Coordenadas fijadas automáticamente.
            </div>
          </div>
        )}

        <div className={styles.gridTwoCols}>
          <Input
            label="Sector / Barrio de Referencia"
            id="prevencion-sector"
            placeholder="Ej: Humedal Angachilla / Collico"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            error={erroresCampos.sector}
            disabled={isSubmitting}
          />

          <Input
            label="Dirección / Calle o Hito de Encuentro"
            id="prevencion-direccion"
            placeholder="Ej: Av. Simpson con Los Robles"
            value={direccionTexto}
            onChange={(e) => setDireccionTexto(e.target.value)}
            error={erroresCampos.direccionTexto}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 600,
              fontSize: 'var(--font-size-sm, 13px)',
              color: 'var(--color-charcoal, #3B3F45)',
            }}
          >
            Fijar Punto en Mapa Interactivo de Valdivia <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
          </label>
          <LocationPickerMap
            latitud={latitud}
            longitud={longitud}
            onChange={handleLocationChange}
            height="220px"
          />
          {(erroresCampos.latitud || erroresCampos.longitud) && (
            <span className={styles.fieldError}>
              {erroresCampos.latitud || erroresCampos.longitud}
            </span>
          )}
        </div>

        {/* Sección 3: Asignación de Patrulla Verificadora */}
        <div className={styles.sectionTitle}>
          <Truck size={16} />
          <span>Despacho de Patrulla Verificadora</span>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <label
              htmlFor="prevencion-patrulla"
              style={{
                fontWeight: 600,
                fontSize: 'var(--font-size-sm, 13px)',
                color: 'var(--color-charcoal, #3B3F45)',
              }}
            >
              Patrulla Asignada <span style={{ color: 'var(--color-danger, #D32F2F)' }}>*</span>
            </label>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--color-text-muted, #5F676E)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={mostrarSoloDisponibles}
                onChange={(e) => setMostrarSoloDisponibles(e.target.checked)}
              />
              <span>Mostrar solo patrullas disponibles</span>
            </label>
          </div>

          <Select
            id="prevencion-patrulla"
            value={patrullaId}
            onChange={(e) => setPatrullaId(e.target.value)}
            disabled={isSubmitting}
            error={erroresCampos.patrullaId}
            options={
              patrullasFiltradas.length > 0
                ? patrullasFiltradas.map((p) => ({
                    value: p.id,
                    label: `${p.nombre} [${p.estado}] ${p.delegacionNombre ? `(${p.delegacionNombre})` : ''}`,
                  }))
                : [{ value: '', label: '-- No hay patrullas disponibles en este momento --' }]
            }
          />
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', marginTop: '4px' }}>
            La patrulla seleccionada cambiará inmediatamente a estado <strong>EN_PREVENCION</strong> y recibirá una notificación en tiempo real.
          </div>
        </div>

        {/* Sección 4: Asignación Opcional de Recursos Logísticos */}
        <div className={styles.sectionTitle}>
          <Boxes size={16} />
          <span>Recursos Logísticos e Insumos en Terreno (Opcional)</span>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
              Asigne herramientas, sacos de arena o equipamiento necesario desde bodega si la labor lo requiere.
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAgregarFilaRecurso}
              disabled={isSubmitting}
            >
              <Plus size={14} style={{ marginRight: '4px' }} />
              <span>Agregar Insumo</span>
            </Button>
          </div>

          {erroresCampos.recursos && (
            <span className={styles.fieldError} style={{ marginTop: '6px' }}>
              {erroresCampos.recursos}
            </span>
          )}

          {filasRecursos.length === 0 ? (
            <div className={styles.emptyRecursosNotice}>
              Sin insumos asignados. La patrulla verificadora acudirá con su equipamiento táctico estándar.
            </div>
          ) : (
            <table className={styles.recursosTable}>
              <thead>
                <tr>
                  <th style={{ width: '55%' }}>Insumo / Recurso</th>
                  <th style={{ width: '25%' }}>Stock Bodega</th>
                  <th style={{ width: '15%' }}>Cantidad</th>
                  <th style={{ width: '5%', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filasRecursos.map((fila, idx) => {
                  const recData = inventarioMap.get(fila.recursoId);
                  const stockDisponible = recData?.cantidadDisponible ?? 0;
                  const errRec = erroresCampos[`recurso_${idx}`];
                  const errCant = erroresCampos[`cantidad_${idx}`];

                  return (
                    <tr key={fila.idTemporal}>
                      <td>
                        <select
                          value={fila.recursoId}
                          onChange={(e) => handleRecursoChange(fila.idTemporal, e.target.value)}
                          disabled={isSubmitting}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: errRec ? '1px solid var(--color-danger, #D32F2F)' : '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12px',
                          }}
                        >
                          <option value="">-- Seleccionar Recurso --</option>
                          {inventario.map((r) => (
                            <option key={r.id} value={r.id} disabled={r.cantidadDisponible <= 0}>
                              {r.nombre} ({r.tipo}) {r.cantidadDisponible <= 0 ? '— Sin Stock' : ''}
                            </option>
                          ))}
                        </select>
                        {errRec && <span className={styles.fieldError}>{errRec}</span>}
                      </td>

                      <td>
                        {fila.recursoId && recData ? (
                          <span
                            className={`${styles.stockBadge} ${
                              stockDisponible > 5
                                ? styles.stockBadgeAvailable
                                : stockDisponible > 0
                                ? styles.stockBadgeLow
                                : ''
                            }`}
                          >
                            {stockDisponible} un.
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted, #5F676E)', fontSize: '11px' }}>—</span>
                        )}
                      </td>

                      <td>
                        <input
                          type="number"
                          min={1}
                          max={stockDisponible > 0 ? stockDisponible : 9999}
                          value={fila.cantidad}
                          onChange={(e) => handleCantidadChange(fila.idTemporal, parseInt(e.target.value, 10) || 0)}
                          disabled={isSubmitting || !fila.recursoId}
                          style={{
                            width: '70px',
                            padding: '6px 8px',
                            border: errCant ? '1px solid var(--color-danger, #D32F2F)' : '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12px',
                          }}
                        />
                        {errCant && <span className={styles.fieldError}>{errCant}</span>}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={styles.btnEliminarRecurso}
                          onClick={() => handleEliminarFilaRecurso(fila.idTemporal)}
                          title="Eliminar fila"
                          disabled={isSubmitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalCrearEventoPrevencion;
