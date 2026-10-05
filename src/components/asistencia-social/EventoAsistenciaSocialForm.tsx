'use client';

import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  HeartHandshake,
  MapPin,
  AlertCircle,
  Crosshair,
  User,
  Save,
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Heading from '@/components/ui/Heading';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
import { AuthContext } from '@/context/AuthContext';
import { DELEGACIONES_MUNICIPALES } from '@/hooks/usePuntosCriticos';
import {
  TIPOS_AFECTACION_SOCIAL,
  crearEventoAsistenciaSocialSchema,
  type CrearEventoAsistenciaSocialDTO,
  type TipoAfectacionSocial,
  type PrioridadEventoSocial,
} from '@/types/asistenciaSocial';
import {
  crearEventoAsistenciaSocial,
  AsistenciaSocialServiceError,
} from '@/services/asistenciaSocialService';
import {
  geocodificarDireccionEnValdivia,
  geocodificacionInversaEnValdivia,
} from '@/lib/maps/geocoding';
import { incidentesService } from '@/services/incidentesService';
import EventoAsistenciaSocialDetalleModal from './EventoAsistenciaSocialDetalleModal';

// Carga dinámica de Leaflet para evitar problemas de SSR en Next.js
const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '320px',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted, #5F676E)',
          fontSize: '14px',
        }}
      >
        Cargando cartografía comunal de Valdivia...
      </div>
    ),
  }
);

interface EventoAsistenciaSocialFormProps {
  basePath?: string;
}

export default function EventoAsistenciaSocialForm({
  basePath = '/gestion/asistente-social',
}: EventoAsistenciaSocialFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { usuarioActivo } = useSimulatedSession();
  const auth = useContext(AuthContext);
  const effectiveUserId = auth?.usuario?.id || usuarioActivo.id;

  // Estados del formulario — todos inician sin selección previa por defecto
  const [descripcion, setDescripcion] = useState('');
  const [tipoAfectacion, setTipoAfectacion] = useState<TipoAfectacionSocial | ''>('');
  const [prioridad, setPrioridad] = useState<PrioridadEventoSocial | ''>('');
  const [personasAfectadas, setPersonasAfectadas] = useState<number | string>('');
  const [familiasAfectadas, setFamiliasAfectadas] = useState<number | string>('');

  // Vinculación opcional a incidente
  const [incidenteId, setIncidenteId] = useState('');
  const [incidentesDisponibles, setIncidentesDisponibles] = useState<
    Array<{ id: string; codigo: string; tipoAfectacion: string; direccion?: string }>
  >([]);
  const [cargandoIncidentes, setCargandoIncidentes] = useState(false);

  // Ubicación y sincronización bidireccional mapa-dirección
  const [direccionTexto, setDireccionTexto] = useState('');
  const [delegacionId, setDelegacionId] = useState('');
  const [latitud, setLatitud] = useState<number | string>('');
  const [longitud, setLongitud] = useState<number | string>('');
  const [geocodificandoMapa, setGeocodificandoMapa] = useState(false);
  const [resolviendoDireccion, setResolviendoDireccion] = useState(false);

  // Contacto preliminar
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoRut, setContactoRut] = useState('');

  // Estados de control
  const [enviando, setEnviando] = useState(false);
  const [fichaModalAbierta, setFichaModalAbierta] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  // Carga de incidentes disponibles para vinculación opcional
  useEffect(() => {
    let activo = true;
    setCargandoIncidentes(true);
    incidentesService
      .listar({ limit: 50 })
      .then((res) => {
        if (activo && res.exito && res.incidentes) {
          setIncidentesDisponibles(
            res.incidentes.map((inc) => ({
              id: inc.id,
              codigo: inc.codigo || inc.id.slice(0, 8),
              tipoAfectacion: inc.tipoAfectacion || 'Incidente General',
              direccion: inc.direccion,
            }))
          );
        }
      })
      .catch(() => {
        // Silencioso ante contingencia offline o mock
      })
      .finally(() => {
        if (activo) setCargandoIncidentes(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  // 1. Sincronización del mapa hacia el texto de dirección (geocodificación inversa)
  const handleUserSelectLocation = useCallback(
    async (coords: { latitud: number; longitud: number }) => {
      setLatitud(coords.latitud);
      setLongitud(coords.longitud);
      setErrores((prev) => {
        const nuevo = { ...prev };
        delete nuevo.latitud;
        delete nuevo.longitud;
        return nuevo;
      });

      setResolviendoDireccion(true);
      try {
        const direccionResuelta = await geocodificacionInversaEnValdivia(
          coords.latitud,
          coords.longitud
        );
        if (direccionResuelta) {
          setDireccionTexto(direccionResuelta);
          setErrores((prev) => {
            const nuevo = { ...prev };
            delete nuevo.direccionTexto;
            return nuevo;
          });
        }
      } catch {
        // En caso de fallo de red se mantienen las coordenadas fijadas sin bloquear
      } finally {
        setResolviendoDireccion(false);
      }
    },
    []
  );

  const handleCoordsChange = useCallback(
    (coords: { latitud: number; longitud: number }) => {
      handleUserSelectLocation(coords);
    },
    [handleUserSelectLocation]
  );

  // 2. Sincronización de la dirección hacia el mapa (geocodificación directa)
  const handleSincronizarMapaConDireccion = useCallback(async () => {
    if (direccionTexto.trim().length < 3) return;
    setGeocodificandoMapa(true);
    try {
      const coords = await geocodificarDireccionEnValdivia(direccionTexto.trim());
      if (coords) {
        setLatitud(coords.latitud);
        setLongitud(coords.longitud);
        setErrores((prev) => {
          const nuevo = { ...prev };
          delete nuevo.latitud;
          delete nuevo.longitud;
          return nuevo;
        });
      }
    } catch {
      // Mantener coordenadas si la resolución falla
    } finally {
      setGeocodificandoMapa(false);
    }
  }, [direccionTexto]);

  const handleCentrarValdivia = useCallback(() => {
    const valdiviaCoords = { latitud: -39.8142, longitud: -73.2459 };
    handleUserSelectLocation(valdiviaCoords);
  }, [handleUserSelectLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    const parsedPersonas = personasAfectadas === '' ? 0 : Number(personasAfectadas);
    const parsedFamilias = familiasAfectadas === '' ? 0 : Number(familiasAfectadas);
    const parsedLat = latitud === '' ? NaN : Number(latitud);
    const parsedLng = longitud === '' ? NaN : Number(longitud);

    // Validación cliente Zod
    const validacion = crearEventoAsistenciaSocialSchema.safeParse({
      descripcion,
      tipoAfectacion,
      direccionTexto,
      latitud: parsedLat,
      longitud: parsedLng,
      personasAfectadas: parsedPersonas,
      familiasAfectadas: parsedFamilias,
      prioridad,
      contactoNombre: contactoNombre.trim() || null,
      contactoTelefono: contactoTelefono.trim() || null,
      contactoRut: contactoRut.trim() || null,
      delegacionId: delegacionId || null,
      incidenteId: incidenteId.trim() || null,
    });

    if (!validacion.success) {
      const fieldErrors: Record<string, string> = {};
      const issues = validacion.error.issues;
      issues.forEach((err) => {
        const campo = err.path[0];
        if (campo && typeof campo === 'string') {
          fieldErrors[campo] = err.message;
        }
      });
      setErrores(fieldErrors);
      showError('Por favor complete los campos obligatorios requeridos.', 'Validación incompleta');
      return;
    }

    setErrores({});
    setEnviando(true);

    try {
      const payload: CrearEventoAsistenciaSocialDTO = {
        descripcion: descripcion.trim(),
        tipoAfectacion: tipoAfectacion as TipoAfectacionSocial,
        direccionTexto: direccionTexto.trim(),
        latitud: parsedLat,
        longitud: parsedLng,
        personasAfectadas: parsedPersonas,
        familiasAfectadas: parsedFamilias,
        prioridad: prioridad as PrioridadEventoSocial,
        contactoNombre: contactoNombre.trim() || null,
        contactoTelefono: contactoTelefono.trim() || null,
        contactoRut: contactoRut.trim() || null,
        delegacionId: delegacionId || null,
        incidenteId: incidenteId.trim() || null,
      };

      const creado = await crearEventoAsistenciaSocial(payload, effectiveUserId);

      showSuccess(
        `Evento social ${creado.codigo} registrado exitosamente. Se ha incorporado a la bandeja de pendientes.`,
        'Caso Social Creado'
      );

      // Redirigir a la bandeja de eventos pendientes
      router.push(basePath);
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        let msg = err.message;
        if (
          err.statusCode === 403 ||
          msg.includes('asistencia_social:') ||
          msg.toLowerCase().includes('permiso requerido')
        ) {
          msg = 'No cuenta con los permisos requeridos para registrar eventos de asistencia social.';
        }
        setErrorServidor(msg);
        if (err.fieldErrors) {
          setErrores(err.fieldErrors);
        }
        showError(msg, 'Error al registrar evento');
      } else {
        const msg = 'No fue posible registrar el evento social debido a un error inesperado.';
        setErrorServidor(msg);
        showError(msg, 'Error del Sistema');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6, 24px)',
        maxWidth: '100%',
      }}
    >
      {/* Banner de Error Servidor */}
      {errorServidor && (
        <div
          role="alert"
          style={{
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            border: '1px solid var(--color-danger, #D32F2F)',
            color: 'var(--color-danger, #D32F2F)',
            padding: 'var(--space-4, 16px)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3, 12px)',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{errorServidor}</span>
        </div>
      )}

      {/* SECCIÓN 1: Clasificación del Daño y Afectación */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: 'var(--space-6, 24px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4, 16px)' }}>
          <HeartHandshake size={20} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h2" variant="h3" color="teal">
            1. Caracterización del Caso y Clasificación de Daño
          </Heading>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4, 16px)' }}>
          <div>
            <Select
              label="Tipo de Afectación Social *"
              value={tipoAfectacion}
              onChange={(e) => {
                setTipoAfectacion(e.target.value as TipoAfectacionSocial);
                setErrores((prev) => {
                  const nuevo = { ...prev };
                  delete nuevo.tipoAfectacion;
                  return nuevo;
                });
              }}
              options={[
                { value: '', label: 'Seleccionar tipo de afectación *' },
                ...TIPOS_AFECTACION_SOCIAL.map((op) => ({
                  value: op.value,
                  label: op.label,
                })),
              ]}
              error={errores.tipoAfectacion}
            />
            {tipoAfectacion && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted, #5F676E)', marginTop: '4px' }}>
                {TIPOS_AFECTACION_SOCIAL.find((t) => t.value === tipoAfectacion)?.descripcion}
              </p>
            )}
          </div>

          <div>
            <Select
              label="Prioridad de Atención *"
              value={prioridad}
              onChange={(e) => {
                setPrioridad(e.target.value as PrioridadEventoSocial);
                setErrores((prev) => {
                  const nuevo = { ...prev };
                  delete nuevo.prioridad;
                  return nuevo;
                });
              }}
              options={[
                { value: '', label: 'Seleccionar prioridad de atención *' },
                { value: 'CRITICA', label: 'Crítica — Peligro inminente para habitantes' },
                { value: 'ALTA', label: 'Alta — Daño severo o inhabitabilidad parcial' },
                { value: 'MEDIA', label: 'Media — Afectación moderada de enseres/patio' },
                { value: 'BAJA', label: 'Baja — Requerimiento preventivo o de menor escala' },
              ]}
              error={errores.prioridad}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Personas Afectadas Estimadas"
              placeholder="0"
              value={personasAfectadas}
              min={0}
              onChange={(e) => setPersonasAfectadas(e.target.value)}
              error={errores.personasAfectadas}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Familias / Hogares Afectados"
              placeholder="0"
              value={familiasAfectadas}
              min={0}
              onChange={(e) => setFamiliasAfectadas(e.target.value)}
              error={errores.familiasAfectadas}
            />
          </div>
        </div>

        {/* Campo no obligatorio: Vinculación a Incidente */}
        <div style={{ marginTop: 'var(--space-4, 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <LinkIcon size={16} color="var(--color-primary-teal, #1B6F7D)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)' }}>
              Vincular a Incidente en Curso (Opcional)
            </span>
          </div>
          <Select
            label=""
            value={incidenteId}
            onChange={(e) => setIncidenteId(e.target.value)}
            disabled={cargandoIncidentes}
            options={[
              {
                value: '',
                label: cargandoIncidentes
                  ? 'Cargando incidentes disponibles...'
                  : 'Sin vincular a incidente (Caso social independiente / excepcional)',
              },
              ...incidentesDisponibles.map((inc) => ({
                value: inc.id,
                label: `${inc.codigo} — ${inc.tipoAfectacion}${
                  inc.direccion ? ` (${inc.direccion})` : ''
                }`,
              })),
            ]}
          />
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted, #5F676E)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Este campo es opcional. Permite asociar este levantamiento de FIBE a un incidente operacional registrado previamente, o conservarlo independiente sin vínculo a la entidad Incidente.
          </p>
        </div>

        <div style={{ marginTop: 'var(--space-4, 16px)' }}>
          <Textarea
            label="Descripción de la Excepcionalidad Social *"
            placeholder="Detalle la situación de vulnerabilidad o requerimiento de FIBE (mínimo 5 caracteres)..."
            rows={3}
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              setErrores((prev) => {
                const nuevo = { ...prev };
                delete nuevo.descripcion;
                return nuevo;
              });
            }}
            error={errores.descripcion}
          />
        </div>
      </div>

      {/* SECCIÓN 2: Georreferenciación y Ubicación Territorial */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: 'var(--space-6, 24px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4, 16px)' }}>
          <MapPin size={20} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h2" variant="h3" color="teal">
            2. Ubicación Georreferenciada y Sector Territorial
          </Heading>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4, 16px)', marginBottom: 'var(--space-4, 16px)' }}>
          <div>
            <label
              htmlFor="direccion-texto-input"
              style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--color-text-dark, #2B2B2B)',
                marginBottom: '6px',
              }}
            >
              Dirección de Referencia o Calle *
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="direccion-texto-input"
                type="text"
                placeholder="Ej. Calle Los Alerces 1420, Sector Collico"
                value={direccionTexto}
                onChange={(e) => {
                  setDireccionTexto(e.target.value);
                  setErrores((prev) => {
                    const nuevo = { ...prev };
                    delete nuevo.direccionTexto;
                    return nuevo;
                  });
                }}
                onBlur={handleSincronizarMapaConDireccion}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSincronizarMapaConDireccion();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  border: errores.direccionTexto
                    ? '2px solid var(--color-danger, #D32F2F)'
                    : '1px solid var(--border-color-neutral, #DFE3E8)',
                  borderRadius: 0,
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSincronizarMapaConDireccion}
                disabled={geocodificandoMapa || direccionTexto.trim().length < 3}
                title="Ubicar la dirección escrita en el mapa interactivo"
                style={{ whiteSpace: 'nowrap' }}
              >
                <MapPin size={16} style={{ marginRight: '4px' }} />
                <span>{geocodificandoMapa ? 'Buscando...' : 'Ubicar en mapa'}</span>
              </Button>
            </div>
            {errores.direccionTexto && (
              <span
                style={{
                  color: 'var(--color-danger, #D32F2F)',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                {errores.direccionTexto}
              </span>
            )}
            {resolviendoDireccion && (
              <span
                style={{
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                Obteniendo dirección a partir del punto seleccionado en el mapa...
              </span>
            )}
            <p
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted, #5F676E)',
                marginTop: '4px',
                marginBottom: 0,
              }}
            >
              Escriba una dirección y presione &quot;Ubicar en mapa&quot; (o Enter/Tab) para centrar el mapa, o marque directamente en la cartografía para escribir la dirección automáticamente.
            </p>
          </div>

          <div>
            <Select
              label="Delegación Territorial"
              value={delegacionId}
              onChange={(e) => setDelegacionId(e.target.value)}
              options={[
                { value: '', label: 'Seleccionar delegación (opcional)' },
                ...DELEGACIONES_MUNICIPALES.map((d) => ({
                  value: d.id,
                  label: d.nombre,
                })),
              ]}
            />
          </div>
        </div>

        {/* Mapa Interactivo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-charcoal, #3B3F45)' }}>
              Haga clic o arrastre el marcador sobre el mapa para fijar el punto exacto de la vivienda afectada:
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCentrarValdivia}
              title="Centrar en el radio urbano de Valdivia"
              style={{ border: '1px solid var(--border-color-neutral, #DFE3E8)' }}
            >
              <Crosshair size={14} style={{ marginRight: '4px' }} />
              <span>Centrar en Valdivia</span>
            </Button>
          </div>

          <LocationPickerMap
            latitud={latitud !== '' ? Number(latitud) : null}
            longitud={longitud !== '' ? Number(longitud) : null}
            onChange={handleCoordsChange}
            onUserSelectLocation={handleUserSelectLocation}
            height="320px"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4, 16px)', marginTop: '8px' }}>
            <Input
              label="Latitud *"
              type="number"
              step="any"
              placeholder="Ej. -39.8142"
              value={latitud}
              onChange={(e) => {
                setLatitud(e.target.value);
                const num = Number(e.target.value);
                if (!isNaN(num) && e.target.value !== '') {
                  handleUserSelectLocation({ latitud: num, longitud: longitud !== '' ? Number(longitud) : -73.2459 });
                }
              }}
              error={errores.latitud}
            />
            <Input
              label="Longitud *"
              type="number"
              step="any"
              placeholder="Ej. -73.2459"
              value={longitud}
              onChange={(e) => {
                setLongitud(e.target.value);
                const num = Number(e.target.value);
                if (!isNaN(num) && e.target.value !== '') {
                  handleUserSelectLocation({ latitud: latitud !== '' ? Number(latitud) : -39.8142, longitud: num });
                }
              }}
              error={errores.longitud}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Datos Preliminares de Contacto (Opcionales) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: 'var(--space-6, 24px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4, 16px)' }}>
          <User size={20} color="var(--color-primary-teal, #1B6F7D)" />
          <Heading as="h2" variant="h3" color="teal">
            3. Datos Preliminares de Contacto (Opcional)
          </Heading>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4, 16px)' }}>
          <div>
            <Input
              label="Nombre de Contacto / Jefe de Hogar"
              placeholder="Ej. María González"
              value={contactoNombre}
              onChange={(e) => setContactoNombre(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="Teléfono de Contacto"
              placeholder="Ej. +56912345678"
              value={contactoTelefono}
              onChange={(e) => setContactoTelefono(e.target.value)}
            />
          </div>

          <div>
            <Input
              label="RUT (si se conoce)"
              placeholder="Ej. 12.345.678-9"
              value={contactoRut}
              onChange={(e) => setContactoRut(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3, 12px)',
          marginTop: 'var(--space-2, 8px)',
          flexWrap: 'wrap',
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setFichaModalAbierta(true)}
          disabled={enviando}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-primary-teal, #1B6F7D)',
            color: 'var(--color-primary-teal, #1B6F7D)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={18} />
          <span>Desplegar Ficha del Caso</span>
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3, 12px)', flexWrap: 'wrap' }}>
          <Button
            href={basePath}
            variant="secondary"
            size="lg"
            disabled={enviando}
          >
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            <span>Cancelar</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={enviando}
          >
            <Save size={16} style={{ marginRight: '6px' }} />
            <span>{enviando ? 'Guardando Evento...' : 'Guardar Evento de Asistencia Social'}</span>
          </Button>
        </div>
      </div>

      {/* Modal de Ficha Resumen / Vista Previa */}
      <EventoAsistenciaSocialDetalleModal
        isOpen={fichaModalAbierta}
        onClose={() => setFichaModalAbierta(false)}
        datos={{
          codigo: 'AS-BORRADOR',
          descripcion,
          tipoAfectacion,
          prioridad,
          personasAfectadas,
          familiasAfectadas,
          direccionTexto,
          latitud: latitud !== '' ? latitud : null,
          longitud: longitud !== '' ? longitud : null,
          delegacionNombre:
            DELEGACIONES_MUNICIPALES.find((d) => d.id === delegacionId)?.nombre || null,
          incidenteId: incidenteId || null,
          incidenteCodigo:
            incidentesDisponibles.find((i) => i.id === incidenteId)?.codigo || null,
          contactoNombre,
          contactoTelefono,
          contactoRut,
          creadoPorNombre: auth?.usuario?.nombre || usuarioActivo.nombre,
          creadoEn: new Date().toISOString(),
          estado: 'PENDIENTE',
        }}
        esVistaPrevia={true}
        onConfirmarGuardado={() => {
          setFichaModalAbierta(false);
          const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
          handleSubmit(syntheticEvent);
        }}
        guardando={enviando}
      />
    </form>
  );
}
