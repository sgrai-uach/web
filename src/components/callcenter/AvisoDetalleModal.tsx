'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AvisoMap from '@/components/maps/AvisoMap';
import { useToast } from '@/components/ui/Toast';
import {
  ApiError,
  descartarAviso,
  obtenerDetalleAviso,
  verificarAviso,
} from '@/lib/api/avisos';
import type { AvisoDetalleResponse, AvisoItem } from '@/types/api';

export interface TipoIncidenteOpcion {
  id: string;
  nombre: string;
}

// Catálogo institucional oficial sembrado en PostgreSQL por la migración 001_initial_schema.ts
export const CATALOGO_TIPOS_INCIDENTE: TipoIncidenteOpcion[] = [
  {
    id: '70889810-f3a7-438d-be2e-eaf6455b6b8d',
    nombre: 'Inundación',
  },
  {
    id: '0aabcd9a-dbd4-428a-9a9b-a137a5f951b5',
    nombre: 'Deslizamiento de tierra',
  },
  {
    id: 'eb5bda50-6a5b-4832-bb42-8a436275cf3d',
    nombre: 'Caída de árbol',
  },
  {
    id: 'cbba77de-18b2-45f5-97f7-98a64e191bd8',
    nombre: 'Anegamiento de calzada',
  },
  {
    id: 'ad42e026-751b-43b8-820e-86d4169b4806',
    nombre: 'Incendio estructural / forestal',
  },
  {
    id: '5a341800-1747-46b6-b452-913ca06e0a68',
    nombre: 'Otro',
  },
];

interface AvisoDetalleModalProps {
  aviso: AvisoItem | null;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}

interface AvisoDetalleModalContentProps {
  aviso: AvisoItem;
  operadorId: string;
  onClose: () => void;
  onAccionCompletada: () => void;
}

function AvisoDetalleModalContent({
  aviso,
  operadorId,
  onClose,
  onAccionCompletada,
}: AvisoDetalleModalContentProps) {
  const { showSuccess, showError, showWarning } = useToast();

  const [detalle, setDetalle] = useState<AvisoDetalleResponse | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(true);

  // Tipos disponibles: los de catálogo oficial + si el aviso trae un tipo preliminar válido
  const tiposDisponibles = useMemo(() => {
    const lista = [...CATALOGO_TIPOS_INCIDENTE];
    if (
      aviso.tipoPreliminarId &&
      !lista.some((t) => t.id === aviso.tipoPreliminarId)
    ) {
      lista.unshift({
        id: aviso.tipoPreliminarId,
        nombre: aviso.tipoPreliminarNombre || 'Tipo preliminar del aviso',
      });
    }
    return lista;
  }, [aviso.tipoPreliminarId, aviso.tipoPreliminarNombre]);

  // Formulario de Verificación inicializado reactivamente con UUID válido
  const [tipoIncidenteId, setTipoIncidenteId] = useState(() => {
    if (aviso.tipoPreliminarId) {
      return aviso.tipoPreliminarId;
    }
    if (aviso.tipoPreliminarNombre) {
      const match = CATALOGO_TIPOS_INCIDENTE.find((t) =>
        t.nombre.toLowerCase().includes(aviso.tipoPreliminarNombre!.toLowerCase())
      );
      if (match) return match.id;
    }
    return CATALOGO_TIPOS_INCIDENTE[0].id;
  });
  const [descripcionAjustada, setDescripcionAjustada] = useState(aviso.descripcion || '');
  const [requiereAsistenciaSocial, setRequiereAsistenciaSocial] = useState(false);
  const [procesandoVerificacion, setProcesandoVerificacion] = useState(false);

  // Formulario de Descarte
  const [modoDescarte, setModoDescarte] = useState(false);
  const [motivoDescarte, setMotivoDescarte] = useState('');
  const [procesandoDescarte, setProcesandoDescarte] = useState(false);

  // Visor de foto ampliada
  const [fotoAmpliadaUrl, setFotoAmpliadaUrl] = useState<string | null>(null);

  // Carga de detalle asíncrona
  useEffect(() => {
    let isMounted = true;

    obtenerDetalleAviso(aviso.id)
      .then((data) => {
        if (isMounted) {
          setDetalle(data);
          if (data.descripcion) {
            setDescripcionAjustada(data.descripcion);
          }
          setCargandoDetalle(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          showError(
            err instanceof Error ? err.message : 'Error al cargar el detalle del aviso',
            'Fallo de comunicación'
          );
          setCargandoDetalle(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [aviso.id, showError]);

  // Manejador de la acción: "Verificar y Enviar"
  async function handleVerificar() {
    const UUID_REGEX =
      /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

    if (!tipoIncidenteId || !UUID_REGEX.test(tipoIncidenteId)) {
      showWarning('Debe seleccionar una tipología oficial de incidente válida');
      return;
    }

    setProcesandoVerificacion(true);
    try {
      const res = await verificarAviso(
        aviso!.id,
        {
          tipoIncidenteId,
          descripcion: descripcionAjustada.trim() || undefined,
          requiereAsistenciaSocial,
        },
        operadorId
      );

      showSuccess(
        `Aviso promovido exitosamente. Folio asignado: ${res.folio || 'N/A'}. Notificado al Encargado.`,
        'Incidente Formal Creado'
      );
      onAccionCompletada();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isConflict) {
        showWarning(
          'Este aviso acaba de ser atendido o resuelto por otro operador.',
          'Conflicto de concurrencia (409)'
        );
        onAccionCompletada();
        onClose();
      } else {
        showError(
          err instanceof Error ? err.message : 'No se pudo verificar el aviso',
          'Error de verificación'
        );
      }
    } finally {
      setProcesandoVerificacion(false);
    }
  }

  // Manejador de la acción: "Descartar"
  async function handleDescartar() {
    const motivoTrim = motivoDescarte.trim();
    if (motivoTrim.length < 5) {
      showWarning('El motivo de descarte debe contener al menos 5 caracteres justificativos');
      return;
    }

    setProcesandoDescarte(true);
    try {
      await descartarAviso(
        aviso!.id,
        {
          motivoDescarte: motivoTrim,
        },
        operadorId
      );

      showSuccess('El aviso ha sido descartado correctamente.', 'Aviso Descartado');
      onAccionCompletada();
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isConflict) {
        showWarning(
          'El aviso ya fue procesado o descartado por otro operador.',
          'Aviso ya procesado (409)'
        );
        onAccionCompletada();
        onClose();
      } else {
        showError(
          err instanceof Error ? err.message : 'Error al intentar descartar el aviso',
          'Fallo de operación'
        );
      }
    } finally {
      setProcesandoDescarte(false);
    }
  }

  const datosInf = detalle?.datosInformante || {};
  const adjuntos = detalle?.adjuntos || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(20, 40, 45, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-white, #FFFFFF)',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '1px solid #DFE3E8',
          position: 'relative',
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            backgroundColor: 'var(--color-primary-teal, #1B6F7D)',
            color: '#FFFFFF',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.85 }}>
              Revisión de Aviso &bull; Call Center
            </div>
            <h2
              id="modal-titulo"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.2px',
                margin: 0,
              }}
            >
              {aviso.tipoPreliminarNombre || 'Aviso sin Clasificar'} &mdash; ID: {aviso.id.slice(0, 8)}...
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Badge de espera */}
            <div
              style={{
                backgroundColor:
                  aviso.minutosEnEspera > 30
                    ? '#D32F2F'
                    : aviso.minutosEnEspera >= 15
                    ? '#F57F17'
                    : 'var(--color-accent-mint, #4FAE9B)',
                color: '#FFFFFF',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Espera: {aviso.minutosEnEspera} min
            </div>

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '1.5rem',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '0 0.5rem',
              }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Cuerpo con Scroll */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {cargandoDetalle && !detalle && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                fontSize: '0.875rem',
                color: '#555',
                textAlign: 'center',
              }}
            >
              Cargando evidencia adjunta e información del informante...
            </div>
          )}

          {/* Grid de dos columnas: Informante + Ubicación */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Columna Izquierda: Datos del Informante y Origen */}
            <div
              style={{
                border: '1px solid #DFE3E8',
                padding: '1.25rem',
                backgroundColor: '#FAFCFD',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid var(--color-accent-mint, #4FAE9B)',
                  paddingBottom: '0.35rem',
                }}
              >
                Datos del Informante y Contacto
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.4rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#666', fontWeight: 600 }}>Nombre:</span>
                <span style={{ fontWeight: 600 }}>{datosInf.nombre || 'No registrado'}</span>

                <span style={{ color: '#666', fontWeight: 600 }}>Teléfono:</span>
                <span>
                  {datosInf.telefono ? (
                    <a
                      href={`tel:${datosInf.telefono}`}
                      style={{
                        color: 'var(--color-primary-teal, #1B6F7D)',
                        fontWeight: 700,
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      📞 {datosInf.telefono}
                    </a>
                  ) : (
                    'Sin teléfono'
                  )}
                </span>

                <span style={{ color: '#666', fontWeight: 600 }}>RUT:</span>
                <span>{datosInf.rut || 'No proporcionado'}</span>

                <span style={{ color: '#666', fontWeight: 600 }}>Dirección Ref.:</span>
                <span>{datosInf.direccionAproximada || 'No especificada'}</span>

                <span style={{ color: '#666', fontWeight: 600 }}>Canal Ingreso:</span>
                <span>{aviso.origenReporte}</span>
              </div>

              {/* Botón de llamada directa rápido */}
              {datosInf.telefono && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a
                    href={`tel:${datosInf.telefono}`}
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'var(--color-charcoal, #3B3F45)',
                      color: '#FFFFFF',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    📞 Iniciar Llamada al Informante
                  </a>
                </div>
              )}

              {/* Descripción original */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
                  Descripción original recibida:
                </div>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DFE3E8',
                    padding: '0.625rem',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                    color: '#2B2B2B',
                    lineHeight: '1.4',
                  }}
                >
                  {aviso.descripcion}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Mapa Interactivo Leaflet */}
            <div
              style={{
                border: '1px solid #DFE3E8',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid var(--color-accent-mint, #4FAE9B)',
                  paddingBottom: '0.35rem',
                }}
              >
                Ubicación Georreferenciada (Valdivia)
              </div>

              <div style={{ fontSize: '0.8125rem', color: '#666', marginBottom: '0.25rem' }}>
                Coordenadas: {aviso.latitud.toFixed(5)}, {aviso.longitud.toFixed(5)}
              </div>

              {/* Render del mapa interactivo */}
              <AvisoMap
                latitud={aviso.latitud}
                longitud={aviso.longitud}
                titulo={aviso.tipoPreliminarNombre || 'Aviso de Emergencia'}
                direccion={datosInf.direccionAproximada}
                height="220px"
              />
            </div>
          </div>

          {/* Sección Evidencia Multimedia Adjunta (si hay fotos) */}
          {adjuntos.length > 0 && (
            <div
              style={{
                border: '1px solid #DFE3E8',
                padding: '1.25rem',
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                Evidencia Multimedia Adjunta ({adjuntos.length})
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {adjuntos.map((foto) => (
                  <div
                    key={foto.id}
                    onClick={() => setFotoAmpliadaUrl(foto.url)}
                    style={{
                      border: '1px solid #BAC7D5',
                      backgroundColor: '#FFFFFF',
                      padding: '0.25rem',
                      cursor: 'pointer',
                    }}
                    title="Clic para ampliar imagen"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.url}
                      alt={foto.nombreArchivo}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        // Fallback si la URL simulada no existe en disco
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        padding: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#555',
                      }}
                    >
                      {foto.nombreArchivo}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal secundario de foto ampliada */}
          {fotoAmpliadaUrl && (
            <div
              onClick={() => setFotoAmpliadaUrl(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '2rem',
              }}
            >
              <div style={{ maxWidth: '90%', maxHeight: '90%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoAmpliadaUrl}
                  alt="Evidencia ampliada"
                  style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
                <div style={{ textAlign: 'center', marginTop: '0.5rem', color: '#FFF', fontSize: '0.875rem' }}>
                  Clic en cualquier lugar para cerrar
                </div>
              </div>
            </div>
          )}

          {/* Acciones principales: Formulario de Verificación vs Descarte */}
          {!modoDescarte ? (
            <div
              style={{
                border: '2px solid var(--color-accent-mint, #4FAE9B)',
                padding: '1.25rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Acción: Verificar y Enviar a Operaciones (Encargado)</span>
                <button
                  type="button"
                  onClick={() => setModoDescarte(true)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#D32F2F',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  &iquest;Desea descartar este aviso?
                </button>
              </div>

              {/* Selector de Clasificación Oficial */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="tipo-incidente-select"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--color-charcoal, #3B3F45)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Tipología Oficial del Incidente (Catálogo SENAPRED / Municipal):
                </label>
                <select
                  id="tipo-incidente-select"
                  value={tipoIncidenteId}
                  onChange={(e) => setTipoIncidenteId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #BAC7D5',
                    fontSize: '0.875rem',
                    borderRadius: 0,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {tiposDisponibles.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción formal ajustada */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="descripcion-ajustada"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--color-charcoal, #3B3F45)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Descripción Formal para Centro de Mando:
                </label>
                <textarea
                  id="descripcion-ajustada"
                  rows={3}
                  value={descripcionAjustada}
                  onChange={(e) => setDescripcionAjustada(e.target.value)}
                  placeholder="Ajuste o complemente la descripción para el personal de operaciones..."
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #BAC7D5',
                    fontSize: '0.875rem',
                    borderRadius: 0,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Switch / Checkbox de Asistencia Social (FIBE) */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '0.875rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
                }}
              >
                <input
                  type="checkbox"
                  id="check-fibe"
                  checked={requiereAsistenciaSocial}
                  onChange={(e) => setRequiereAsistenciaSocial(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-primary-teal, #1B6F7D)',
                  }}
                />
                <label
                  htmlFor="check-fibe"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-charcoal, #3B3F45)',
                    cursor: 'pointer',
                  }}
                >
                  Requiere Asistencia Social (Levantamiento Ficha FIBE)
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      color: '#555',
                      marginTop: '0.15rem',
                    }}
                  >
                    Activa la derivación al Panel de Asistentes Sociales según la regla de atención municipal.
                  </span>
                </label>
              </div>

              {/* Botón Verificar y Enviar */}
              <button
                type="button"
                onClick={handleVerificar}
                disabled={procesandoVerificacion}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.875rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: procesandoVerificacion ? 'not-allowed' : 'pointer',
                  opacity: procesandoVerificacion ? 0.7 : 1,
                  borderRadius: 0,
                  letterSpacing: '0.3px',
                }}
              >
                {procesandoVerificacion
                  ? 'Verificando y Promoviendo a Incidente...'
                  : '✔ Verificar y Enviar a Operaciones'}
              </button>
            </div>
          ) : (
            /* Sección de Descarte con Justificación Obligatoria */
            <div
              style={{
                border: '2px solid #D32F2F',
                padding: '1.25rem',
                backgroundColor: '#FFF8F8',
              }}
            >
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#D32F2F',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Descartar Aviso Preliminar</span>
                <button
                  type="button"
                  onClick={() => setModoDescarte(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary-teal, #1B6F7D)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Volver al flujo de verificación
                </button>
              </div>

              <p style={{ fontSize: '0.8125rem', color: '#555', marginBottom: '0.75rem' }}>
                Indique la razón fundada por la cual se descarta el aviso (ej. reporte falso comprobado,
                duplicado de aviso anterior o llamada de broma). Mínimo 5 caracteres.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <textarea
                  rows={3}
                  value={motivoDescarte}
                  onChange={(e) => setMotivoDescarte(e.target.value)}
                  placeholder="Escriba el motivo justificado del descarte (mínimo 5 caracteres)..."
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    border: '1px solid #BAC7D5',
                    fontSize: '0.875rem',
                    borderRadius: 0,
                    fontFamily: 'inherit',
                  }}
                />
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: motivoDescarte.trim().length >= 5 ? '#2E7D32' : '#D32F2F',
                    marginTop: '0.25rem',
                    textAlign: 'right',
                  }}
                >
                  {motivoDescarte.trim().length} / 5 caracteres mínimos requeridos
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleDescartar}
                  disabled={procesandoDescarte || motivoDescarte.trim().length < 5}
                  style={{
                    flex: 1,
                    backgroundColor: '#D32F2F',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor:
                      procesandoDescarte || motivoDescarte.trim().length < 5
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      procesandoDescarte || motivoDescarte.trim().length < 5 ? 0.6 : 1,
                    borderRadius: 0,
                  }}
                >
                  {procesandoDescarte ? 'Descartando...' : 'Confirmar Descarte de Aviso'}
                </button>

                <button
                  type="button"
                  onClick={() => setModoDescarte(false)}
                  style={{
                    backgroundColor: 'var(--color-charcoal, #3B3F45)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: 0,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AvisoDetalleModal(props: AvisoDetalleModalProps) {
  if (!props.aviso) return null;
  return <AvisoDetalleModalContent key={props.aviso.id} {...props} aviso={props.aviso} />;
}
