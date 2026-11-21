'use client';

import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  HeartHandshake,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Crosshair,
  User,
  UserCheck,
  RefreshCw,
  Info,
  Save,
  ArrowLeft,
  Link as LinkIcon,
  FileText,
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
  NIVELES_COMPROMISO_VIVIENDA,
  crearEventoAsistenciaSocialSchema,
  type CrearEventoAsistenciaSocialDTO,
  type FamiliaAfectadaSocialDTO,
  type NivelCompromisoViviendaSocial,
  type TipoAfectacionSocial,
  type PrioridadEventoSocial,
} from '@/types/asistenciaSocial';
import {
  crearEventoAsistenciaSocial,
  obtenerEventosAsistenciaSocial,
  AsistenciaSocialServiceError,
} from '@/services/asistenciaSocialService';
import { useAsistentesSociales } from '@/hooks/useAsistentesSociales';
import {
  geocodificarDireccionEnValdivia,
  geocodificacionInversaEnValdivia,
} from '@/lib/maps/geocoding';
import { incidentesService } from '@/services/incidentesService';
import {
  clasificarYOrdenarIncidentesParaVinculacion,
  construirDetallesEvaluacionSocial,
  extraerContextoSocialDesdeIncidente,
  extraerContactoPrincipalDesdeFamilias,
  validarCoherenciaFamiliaSocial,
  type ContextoSocialDesdeIncidente,
  type IncidenteDetalleCompatible,
  type IncidenteResumenCompatible,
} from '@/lib/utils/asistenciaSocialIncidenteUtils';
import FamiliasAfectadasDesgloseSection from './FamiliasAfectadasDesgloseSection';
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
  const searchParams = useSearchParams();
  const incidenteIdParam = searchParams.get('incidenteId') || '';
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
  const [familiasDesglosadas, setFamiliasDesglosadas] = useState<FamiliaAfectadaSocialDTO[]>([]);
  const [nivelCompromisoVivienda, setNivelCompromisoVivienda] = useState<
    NivelCompromisoViviendaSocial | ''
  >('');
  const [danosEstimados, setDanosEstimados] = useState('');

  // Vinculación opcional a incidente y contexto H39/H38
  const [incidenteId, setIncidenteId] = useState(() => incidenteIdParam);
  const [incidentesDisponibles, setIncidentesDisponibles] = useState<
    Array<{
      id: string;
      codigo: string;
      tipoAfectacion: string;
      direccion?: string;
      estado?: string;
      requiereAsistenciaSocial?: boolean;
      verificado?: boolean;
    }>
  >([]);
  const [cargandoIncidentes, setCargandoIncidentes] = useState(true);
  const [cargandoDetalleIncidente, setCargandoDetalleIncidente] = useState(false);
  const [contextoIncidenteH39, setContextoIncidenteH39] =
    useState<ContextoSocialDesdeIncidente | null>(null);
  const [eventoSocialDuplicado, setEventoSocialDuplicado] = useState<{
    codigo: string;
    estado: string;
  } | null>(null);

  // Asignación opcional de asistente social disponible (Opción A)
  const [asistenteSocialId, setAsistenteSocialId] = useState('');
  const {
    asistentes: asistentesDisponibles,
    cargando: cargandoAsistentes,
    recargar: recargarAsistentes,
  } = useAsistentesSociales({
    pagina: 1,
    limite: 50,
    estadoOperativo: 'disponible',
  });
  const profesionalesDisponibles = asistentesDisponibles.filter(
    (a) => a.estadoOperativo === 'disponible'
  );

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

  // Carga de incidentes disponibles para vinculación opcional (priorizando FIBE requerida y excluyendo NO_ABORDABLE sin FIBE)
  useEffect(() => {
    let activo = true;
    incidentesService
      .listar({ limit: 50 }, effectiveUserId)
      .then((res) => {
        if (activo && res.exito && res.incidentes) {
          const clasificados = clasificarYOrdenarIncidentesParaVinculacion(
            res.incidentes as IncidenteResumenCompatible[]
          );
          setIncidentesDisponibles(
            clasificados.map((inc) => ({
              id: inc.id,
              codigo: inc.codigo || inc.id.slice(0, 8),
              tipoAfectacion: inc.tipoAfectacion || 'Incidente General',
              direccion: inc.direccion || undefined,
              estado: inc.estado,
              requiereAsistenciaSocial: inc.requiereAsistenciaSocial,
              verificado: inc.verificado,
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
  }, [effectiveUserId]);

  const cargarContextoDeIncidente = useCallback(
    async (idSeleccionado: string) => {
      if (!idSeleccionado) {
        setContextoIncidenteH39(null);
        setEventoSocialDuplicado(null);
        return;
      }

      setCargandoDetalleIncidente(true);
      setEventoSocialDuplicado(null);

      try {
        const detallePromise =
          typeof incidentesService.obtenerDetalle === 'function'
            ? incidentesService.obtenerDetalle(idSeleccionado, effectiveUserId)
            : Promise.resolve({ exito: false, mensaje: '' });

        const eventosPromise = obtenerEventosAsistenciaSocial(
          { pagina: 1, limite: 50 },
          effectiveUserId
        ).catch(() => null);

        const [resDetalle, resEventos] = await Promise.all([detallePromise, eventosPromise]);

        if (resEventos && Array.isArray(resEventos.data)) {
          const existente = resEventos.data.find(
            (ev) => ev.incidenteId === idSeleccionado && ev.estado !== 'DESCARTADO'
          );
          if (existente) {
            setEventoSocialDuplicado({
              codigo: existente.codigo,
              estado: existente.estado,
            });
          }
        }

        if (resDetalle?.exito && 'datos' in resDetalle && resDetalle.datos) {
          const ctx = extraerContextoSocialDesdeIncidente(
            resDetalle.datos as IncidenteDetalleCompatible,
            DELEGACIONES_MUNICIPALES
          );
          setContextoIncidenteH39(ctx);
          setTipoAfectacion(ctx.tipoAfectacion);
          setPrioridad(ctx.prioridad);
          if (ctx.personasAfectadas !== null) {
            setPersonasAfectadas(ctx.personasAfectadas);
          }
          if (ctx.familiasAfectadas !== null) {
            setFamiliasAfectadas(ctx.familiasAfectadas);
          }
          if (ctx.descripcionSugerida) {
            setDescripcion(ctx.descripcionSugerida);
          }
          if (ctx.direccionTexto) {
            setDireccionTexto(ctx.direccionTexto);
          }
          if (ctx.latitud !== null) {
            setLatitud(ctx.latitud);
          }
          if (ctx.longitud !== null) {
            setLongitud(ctx.longitud);
          }
          if (ctx.delegacionId) {
            setDelegacionId(ctx.delegacionId);
          }
          if (ctx.contactoNombre) {
            setContactoNombre(ctx.contactoNombre);
          }
          if (ctx.contactoTelefono) {
            setContactoTelefono(ctx.contactoTelefono);
          }
          if (ctx.contactoRut) {
            setContactoRut(ctx.contactoRut);
          }
          if (ctx.nivelCompromisoVivienda) {
            setNivelCompromisoVivienda(ctx.nivelCompromisoVivienda);
          }
          if (ctx.danosEstimados) {
            setDanosEstimados(ctx.danosEstimados);
          }
          if (
            ctx.familiasDesglosadas.length > 0 &&
            ctx.familiasDesglosadas.some((f) => f.nucleoFamiliarTotal > 0)
          ) {
            const familiasNormalizadas = ctx.familiasDesglosadas.map((f) => ({
              ...f,
              nucleoFamiliarTotal: Math.max(1, f.nucleoFamiliarTotal || 1),
            }));
            setFamiliasDesglosadas(familiasNormalizadas);
            const totalPersFamilias = familiasNormalizadas.reduce(
              (acc, f) => acc + f.nucleoFamiliarTotal,
              0
            );
            setPersonasAfectadas(totalPersFamilias);
            setFamiliasAfectadas(familiasNormalizadas.length);
          } else {
            setFamiliasDesglosadas([]);
          }
          setErrores((prev) => {
            const limpio = { ...prev };
            delete limpio.tipoAfectacion;
            delete limpio.prioridad;
            delete limpio.descripcion;
            delete limpio.direccionTexto;
            delete limpio.latitud;
            delete limpio.longitud;
            return limpio;
          });
        } else {
          setContextoIncidenteH39(null);
        }
      } catch {
        setContextoIncidenteH39(null);
      } finally {
        setCargandoDetalleIncidente(false);
      }
    },
    [effectiveUserId]
  );

  // Precargar contexto automáticamente si se accede con ?incidenteId=<uuid>
  useEffect(() => {
    if (!incidenteIdParam) return;
    let activo = true;
    queueMicrotask(() => {
      if (activo) {
        void cargarContextoDeIncidente(incidenteIdParam);
      }
    });
    return () => {
      activo = false;
    };
  }, [incidenteIdParam, cargarContextoDeIncidente]);

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

  const handleCambiarFamiliasDesglosadas = useCallback(
    (nuevasFamilias: FamiliaAfectadaSocialDTO[]) => {
      setFamiliasDesglosadas(nuevasFamilias);
      if (nuevasFamilias.length > 0) {
        const totalPers = nuevasFamilias.reduce(
          (acc, f) => acc + (Number(f.nucleoFamiliarTotal) || 0),
          0
        );
        setPersonasAfectadas(totalPers);
        setFamiliasAfectadas(nuevasFamilias.length);
        setContactoNombre('');
        setContactoTelefono('');
        setContactoRut('');
      } else {
        setPersonasAfectadas('');
        setFamiliasAfectadas('');
      }
      setErrores((prev) => {
        const limpio = { ...prev };
        delete limpio.detallesEvaluacion;
        return limpio;
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    const parsedLat = latitud === '' ? NaN : Number(latitud);
    const parsedLng = longitud === '' ? NaN : Number(longitud);
    const detallesEvaluacion = construirDetallesEvaluacionSocial({
      familias: familiasDesglosadas,
      nivelCompromisoVivienda,
      danosEstimados,
    });
    const parsedPersonas =
      familiasDesglosadas.length > 0
        ? detallesEvaluacion?.nucleoFamiliarTotal ?? 0
        : personasAfectadas === ''
          ? 0
          : Number(personasAfectadas);
    const parsedFamilias =
      familiasDesglosadas.length > 0
        ? detallesEvaluacion?.familiasAfectadas ?? familiasDesglosadas.length
        : familiasAfectadas === ''
          ? 0
          : Number(familiasAfectadas);

    // Validación de coherencia demográfica y RUT por familia antes de construir payload
    for (let idx = 0; idx < familiasDesglosadas.length; idx++) {
      const erroresFam = validarCoherenciaFamiliaSocial(familiasDesglosadas[idx]);
      const primerError = Object.values(erroresFam)[0];
      if (primerError) {
        const mensaje = `Familia #${idx + 1}: ${primerError}`;
        setErrores({ detallesEvaluacion: mensaje });
        showError(mensaje, 'Incoherencia en catastro familiar');
        return;
      }
    }

    const tieneFamilias = familiasDesglosadas.length > 0;
    const contactoPrincipalFamilias = tieneFamilias
      ? extraerContactoPrincipalDesdeFamilias(familiasDesglosadas)
      : null;

    const contactoNombreFinal = tieneFamilias
      ? contactoPrincipalFamilias!.contactoNombre.trim() || null
      : contactoNombre.trim() || null;
    const contactoTelefonoFinal = tieneFamilias
      ? contactoPrincipalFamilias!.contactoTelefono.trim() || null
      : contactoTelefono.trim() || null;
    const contactoRutFinal = tieneFamilias
      ? contactoPrincipalFamilias!.contactoRut.trim() || null
      : contactoRut.trim() || null;

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
      contactoNombre: contactoNombreFinal,
      contactoTelefono: contactoTelefonoFinal,
      contactoRut: contactoRutFinal,
      delegacionId: delegacionId || null,
      incidenteId: incidenteId.trim() || null,
      asistenteSocialId: asistenteSocialId.trim() || null,
      detallesEvaluacion,
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
        contactoNombre: contactoNombreFinal,
        contactoTelefono: contactoTelefonoFinal,
        contactoRut: contactoRutFinal,
        delegacionId: delegacionId || null,
        incidenteId: incidenteId.trim() || null,
        asistenteSocialId: asistenteSocialId.trim() || null,
        detallesEvaluacion,
      };

      const creado = await crearEventoAsistenciaSocial(payload, effectiveUserId);

      if (creado.estado === 'ASIGNADO' || Boolean(creado.asistenteSocialId)) {
        showSuccess(
          `Evento social ${creado.codigo} registrado y asignado a ${
            creado.asistenteSocialNombre || 'asistente social'
          }.`,
          'Caso Social Creado y Asignado'
        );
        router.push(`${basePath}?estado=ASIGNADO`);
      } else {
        showSuccess(
          `Evento social ${creado.codigo} registrado exitosamente. Se ha incorporado a la bandeja de pendientes.`,
          'Caso Social Creado'
        );
        router.push(basePath);
      }
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        if (err.statusCode === 409) {
          setErrorServidor(err.message);
          showError(err.message, 'Conflicto de disponibilidad');
          setAsistenteSocialId('');
          await recargarAsistentes();
          return;
        }

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
              readOnly={familiasDesglosadas.length > 0}
              onChange={(e) => setPersonasAfectadas(e.target.value)}
              helperText={
                familiasDesglosadas.length > 0
                  ? 'Aproximación descartada: calculado exclusivamente desde el desglose por familia.'
                  : 'Estimación aproximada. Si añade familias abajo, este valor quedará descartado.'
              }
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
              readOnly={familiasDesglosadas.length > 0}
              onChange={(e) => setFamiliasAfectadas(e.target.value)}
              helperText={
                familiasDesglosadas.length > 0
                  ? 'Aproximación descartada: calculado exclusivamente desde el desglose por familia.'
                  : 'Estimación aproximada. Si añade familias abajo, este valor quedará descartado.'
              }
              error={errores.familiasAfectadas}
            />
          </div>
        </div>

        {/* Parámetros opcionales de vivienda y daños homologados con informe de cierre (H38/H39) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4, 16px)',
            marginTop: 'var(--space-4, 16px)',
          }}
        >
          <Select
            label="Nivel de Compromiso Habitacional (Opcional)"
            value={nivelCompromisoVivienda}
            onChange={(e) =>
              setNivelCompromisoVivienda(e.target.value as NivelCompromisoViviendaSocial | '')
            }
            options={[
              { value: '', label: 'Sin especificar (opcional)' },
              ...NIVELES_COMPROMISO_VIVIENDA.map((op) => ({
                value: op.value,
                label: op.label,
              })),
            ]}
          />

          <Input
            label="Daños Materiales Estimados (Opcional)"
            placeholder="Ej. Inundación de primer piso, pérdida de enseres..."
            value={danosEstimados}
            onChange={(e) => setDanosEstimados(e.target.value)}
          />
        </div>

        {/* Desglose demográfico opcional por familia / hogar */}
        <FamiliasAfectadasDesgloseSection
          familias={familiasDesglosadas}
          onChangeFamilias={handleCambiarFamiliasDesglosadas}
          disabled={enviando}
          errorGeneral={errores.detallesEvaluacion}
        />

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
            onChange={(e) => {
              const nuevoId = e.target.value;
              setIncidenteId(nuevoId);
              void cargarContextoDeIncidente(nuevoId);
            }}
            disabled={cargandoIncidentes || cargandoDetalleIncidente}
            options={[
              {
                value: '',
                label: cargandoIncidentes
                  ? 'Cargando incidentes disponibles...'
                  : 'Sin vincular a incidente (Caso social independiente / excepcional)',
              },
              ...incidentesDisponibles.map((inc) => ({
                value: inc.id,
                label: `${inc.requiereAsistenciaSocial ? '[FIBE Requerida] ' : ''}${inc.codigo} — ${
                  inc.tipoAfectacion
                }${inc.direccion ? ` (${inc.direccion})` : ''}${
                  inc.estado === 'NO_ABORDABLE' ? ' [No Abordable]' : ''
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
            Este campo es opcional. Al seleccionar un incidente, se precargará la información disponible del terreno y del reporte de cierre de patrulla para facilitar la derivación FIBE.
          </p>

          {cargandoDetalleIncidente && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--color-primary-teal, #1B6F7D)',
                fontWeight: 600,
              }}
            >
              Cargando contexto técnico y diagnóstico de patrulla del incidente...
            </div>
          )}

          {contextoIncidenteH39?.tieneCierrePatrulla && (
            <div
              data-testid="resumen-verificacion-h39"
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                border: '1px solid var(--color-primary-teal, #1B6F7D)',
                borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--color-text-dark, #2B2B2B)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-primary-teal-dark, #14505A)' }}>
                <Info size={15} />
                <span>
                  Diagnóstico consolidado de patrulla verificadora
                  {contextoIncidenteH39.dictamenCierre
                    ? ` (Dictamen: ${
                        contextoIncidenteH39.dictamenCierre === 'NO_ABORDABLE'
                          ? 'No Abordable'
                          : 'Requiere Cuadrilla'
                      })`
                    : ''}
                </span>
              </div>
              {contextoIncidenteH39.personasModificadasEnCierre &&
                contextoIncidenteH39.personasAfectadas !== null && (
                  <span>
                    Personas afectadas actualizadas al cierre: <strong>{contextoIncidenteH39.personasAfectadas}</strong>
                    {contextoIncidenteH39.personasPrevias !== null
                      ? ` (antes en evaluación previa: ${contextoIncidenteH39.personasPrevias})`
                      : ''}
                    .
                  </span>
                )}
              {contextoIncidenteH39.familiasRescatadasDePrioridad &&
                contextoIncidenteH39.familiasAfectadas !== null && (
                  <span>
                    Familias afectadas rescatadas de evaluación previa: <strong>{contextoIncidenteH39.familiasAfectadas}</strong>.
                  </span>
                )}
            </div>
          )}

          {contextoIncidenteH39?.esNoAbordable && (
            <div
              data-testid="alerta-incidente-no-abordable"
              role="alert"
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                border: '1px solid var(--color-warning, #E65100)',
                borderLeft: '4px solid var(--color-warning, #E65100)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--color-text-dark, #2B2B2B)',
              }}
            >
              <AlertTriangle size={16} color="var(--color-warning, #E65100)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong>Incidente cerrado en terreno como No Abordable.</strong>{' '}
                {contextoIncidenteH39.motivoNoAbordable
                  ? `Motivo informado por patrulla: ${contextoIncidenteH39.motivoNoAbordable}`
                  : 'Verifique si corresponde igualmente el levantamiento de Ficha FIBE excepcional.'}
              </div>
            </div>
          )}

          {contextoIncidenteH39?.requiereFibeVerificado === false && (
            <div
              data-testid="alerta-sin-fibe-h39"
              role="alert"
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                border: '1px solid var(--color-warning, #E65100)',
                borderLeft: '4px solid var(--color-warning, #E65100)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--color-text-dark, #2B2B2B)',
              }}
            >
              <AlertTriangle size={16} color="var(--color-warning, #E65100)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>
                La patrulla verificadora indicó en su cierre que este incidente <strong>no requiere Ficha FIBE</strong>. Confirme si corresponde crear un evento social excepcional.
              </span>
            </div>
          )}

          {eventoSocialDuplicado && (
            <div
              data-testid="alerta-evento-social-duplicado"
              role="alert"
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                border: '1px solid var(--color-warning, #E65100)',
                borderLeft: '4px solid var(--color-warning, #E65100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--color-text-dark, #2B2B2B)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="var(--color-warning, #E65100)" style={{ flexShrink: 0 }} />
                <span>
                  Ya existe un evento social vinculado a este incidente (<strong>{eventoSocialDuplicado.codigo}</strong> — estado{' '}
                  <strong>{eventoSocialDuplicado.estado}</strong>). Revise la bandeja para evitar duplicar la ficha FIBE.
                </span>
              </div>
              <Button href={basePath} variant="outline" size="sm">
                Ir a Bandeja Social
              </Button>
            </div>
          )}
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

      {/* SECCIÓN 3: Datos Preliminares de Contacto */}
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
            {familiasDesglosadas.length > 0
              ? '3. Datos Preliminares de Contacto por Familia'
              : '3. Datos Preliminares de Contacto (Opcional)'}
          </Heading>
        </div>

        {familiasDesglosadas.length > 0 ? (
          <div
            data-testid="aviso-contacto-por-familia"
            style={{
              backgroundColor: 'var(--color-info-bg, #E0F2F1)',
              border: '1px solid var(--color-primary-teal, #1B6F7D)',
              padding: '12px 14px',
              fontSize: '13px',
              color: 'var(--color-text-dark, #2B2B2B)',
              lineHeight: 1.45,
            }}
          >
            Los datos preliminares de contacto se gestionan de forma separada en cada tarjeta familiar de la Sección 1 (cualquier contacto general aproximado previo fue descartado). Estos antecedentes son preliminares y no corresponden a una FIBE formal.
          </div>
        ) : (
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
        )}
      </div>

      {/* SECCIÓN 4: Asignación Inmediata de Asistente Social (Opcional) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color-neutral, #DFE3E8)',
          padding: 'var(--space-6, 24px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-4, 16px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h2" variant="h3" color="teal">
              4. Asignación Inmediata de Asistente Social (Opcional)
            </Heading>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => recargarAsistentes()}
            disabled={cargandoAsistentes || enviando}
            title="Actualizar lista de asistentes sociales disponibles"
          >
            <RefreshCw size={14} style={{ marginRight: '5px' }} />
            <span>Actualizar Disponibilidad</span>
          </Button>
        </div>

        <Select
          label="Asistente Social Disponible (Opcional)"
          value={asistenteSocialId}
          onChange={(e) => setAsistenteSocialId(e.target.value)}
          disabled={cargandoAsistentes || enviando}
          options={[
            {
              value: '',
              label: cargandoAsistentes
                ? 'Cargando asistentes sociales disponibles...'
                : 'Dejar pendiente sin asignar (se asignará luego en la bandeja)',
            },
            ...profesionalesDisponibles.map((asistente) => ({
              value: asistente.usuarioId,
              label: `${asistente.nombreCompleto}${
                asistente.delegacionNombre ? ` — ${asistente.delegacionNombre}` : ''
              } (${asistente.casosFibeAsignados} FIBE activas)`,
            })),
          ]}
        />

        {!cargandoAsistentes && profesionalesDisponibles.length === 0 ? (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted, #5F676E)',
              marginTop: '6px',
              marginBottom: 0,
            }}
          >
            No existen asistentes sociales en estado disponible en este momento. El evento puede guardarse igualmente y quedará en estado PENDIENTE.
          </p>
        ) : (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted, #5F676E)',
              marginTop: '6px',
              marginBottom: 0,
            }}
          >
            Si selecciona un profesional disponible, el evento se registrará directamente en estado ASIGNADO. De lo contrario, quedará en la bandeja de PENDIENTES.
          </p>
        )}
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
          onClick={() => {
            for (let idx = 0; idx < familiasDesglosadas.length; idx++) {
              const erroresFam = validarCoherenciaFamiliaSocial(familiasDesglosadas[idx]);
              const primerError = Object.values(erroresFam)[0];
              if (primerError) {
                const mensaje = `Familia #${idx + 1}: ${primerError}`;
                setErrores({ detallesEvaluacion: mensaje });
                showError(mensaje, 'Incoherencia en catastro familiar');
                return;
              }
            }
            setFichaModalAbierta(true);
          }}
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
          <span>Vista Previa del Evento</span>
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
          personasAfectadas:
            familiasDesglosadas.length > 0
              ? familiasDesglosadas.reduce(
                  (acc, f) => acc + (Number(f.nucleoFamiliarTotal) || 0),
                  0
                )
              : personasAfectadas,
          familiasAfectadas:
            familiasDesglosadas.length > 0 ? familiasDesglosadas.length : familiasAfectadas,
          direccionTexto,
          latitud: latitud !== '' ? latitud : null,
          longitud: longitud !== '' ? longitud : null,
          delegacionNombre:
            DELEGACIONES_MUNICIPALES.find((d) => d.id === delegacionId)?.nombre || null,
          incidenteId: incidenteId || null,
          incidenteCodigo:
            incidentesDisponibles.find((i) => i.id === incidenteId)?.codigo || null,
          contactoNombre:
            familiasDesglosadas.length > 0
              ? extraerContactoPrincipalDesdeFamilias(familiasDesglosadas).contactoNombre
              : contactoNombre,
          contactoTelefono:
            familiasDesglosadas.length > 0
              ? extraerContactoPrincipalDesdeFamilias(familiasDesglosadas).contactoTelefono
              : contactoTelefono,
          contactoRut:
            familiasDesglosadas.length > 0
              ? extraerContactoPrincipalDesdeFamilias(familiasDesglosadas).contactoRut
              : contactoRut,
          creadoPorNombre: auth?.usuario?.nombre || usuarioActivo.nombre,
          creadoEn: new Date().toISOString(),
          estado: asistenteSocialId ? 'ASIGNADO' : 'PENDIENTE',
          asistenteSocialNombre:
            profesionalesDisponibles.find((a) => a.usuarioId === asistenteSocialId)
              ?.nombreCompleto || null,
          detallesEvaluacion: construirDetallesEvaluacionSocial({
            familias: familiasDesglosadas,
            nivelCompromisoVivienda,
            danosEstimados,
          }),
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
