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
import { getPuntosCriticos } from '@/services/puntosCriticosService';
import {
  crearEventoPrevencion,
  PrevencionServiceError,
  type TipoConflictoPrevencion,
} from '@/services/prevencionService';
import {
  PRIORIDADES_PREVENCION,
  type PatrullaVerificadoraItem,
  type PrioridadEventoPrevencion,
  type EventoPrevencionDTO,
  type CrearEventoPrevencionPayload,
} from '@/types/evento-prevencion';
import type { CatalogoItem } from '@/types/catalogos';
import type { PuntoCriticoItem } from '@/types/puntoCritico';
import {
  ShieldAlert,
  MapPin,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import styles from './ModalCrearEventoPrevencion.module.css';

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
}) => {
  const { showSuccess, showError } = useToast();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sector, setSector] = useState('');
  const [direccionTexto, setDireccionTexto] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadEventoPrevencion>('MEDIA');
  const [delegacionId, setDelegacionId] = useState<string>('');
  const [puntoCriticoId, setPuntoCriticoId] = useState<string>('');
  const [latitud, setLatitud] = useState<number>(-39.8142);
  const [longitud, setLongitud] = useState<number>(-73.2459);

  // Catálogos y puntos críticos
  const [delegaciones, setDelegaciones] = useState<CatalogoItem[]>([]);
  const [puntosCriticos, setPuntosCriticos] = useState<PuntoCriticoItem[]>([]);

  // Errores y estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erroresCampos, setErroresCampos] = useState<Record<string, string>>({});
  const [bannerConflicto, setBannerConflicto] = useState<{
    tipo: TipoConflictoPrevencion;
    mensaje: string;
  } | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // Carga asíncrona de catálogos y puntos críticos al abrir
  useEffect(() => {
    let activo = true;

    if (!isOpen) return;

    queueMicrotask(() => {
      if (!activo) return;
      setErroresCampos({});
      setBannerConflicto(null);
      setErrorGeneral(null);
    });

    void (async () => {
      try {
        const [resCatalogos, resPuntosCriticos] = await Promise.all([
          getCatalogos().catch(() => ({ delegaciones: [], roles: [], especialidades: [], cargos: [] })),
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
  }, [isOpen, userId]);

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

    if (latitud < -90 || latitud > 90 || longitud < -180 || longitud > 180) {
      nuevosErrores.latitud = 'Coordenadas geográficas fuera del rango válido.';
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
    };

    try {
      const eventoCreado = await crearEventoPrevencion(payload, userId);

      showSuccess(
        `Evento de prevención registrado exitosamente. Código: ${eventoCreado.codigo}`,
        'Evento Preventivo Registrado'
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
      </form>
    </Modal>
  );
};

export default ModalCrearEventoPrevencion;
