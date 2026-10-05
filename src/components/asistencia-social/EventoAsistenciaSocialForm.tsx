'use client';

import React, { useState, useCallback } from 'react';
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
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Heading from '@/components/ui/Heading';
import { useToast } from '@/components/ui/Toast';
import { useSimulatedSession } from '@/context/SimulatedSessionContext';
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

  // Estados del formulario
  const [descripcion, setDescripcion] = useState('');
  const [tipoAfectacion, setTipoAfectacion] = useState<TipoAfectacionSocial | ''>('VIVIENDA_ANEGADA');
  const [prioridad, setPrioridad] = useState<PrioridadEventoSocial>('MEDIA');
  const [personasAfectadas, setPersonasAfectadas] = useState<number | string>(1);
  const [familiasAfectadas, setFamiliasAfectadas] = useState<number | string>(1);

  const [direccionTexto, setDireccionTexto] = useState('');
  const [delegacionId, setDelegacionId] = useState('');
  const [latitud, setLatitud] = useState<number | string>(-39.8142);
  const [longitud, setLongitud] = useState<number | string>(-73.2459);

  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoRut, setContactoRut] = useState('');

  // Estados de control
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const handleCoordsChange = useCallback((coords: { latitud: number; longitud: number }) => {
    setLatitud(coords.latitud);
    setLongitud(coords.longitud);
    setErrores((prev) => {
      const nuevo = { ...prev };
      delete nuevo.latitud;
      delete nuevo.longitud;
      return nuevo;
    });
  }, []);

  const handleCentrarValdivia = useCallback(() => {
    setLatitud(-39.8142);
    setLongitud(-73.2459);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);

    const parsedPersonas = personasAfectadas === '' ? 0 : Number(personasAfectadas);
    const parsedFamilias = familiasAfectadas === '' ? 0 : Number(familiasAfectadas);
    const parsedLat = Number(latitud);
    const parsedLng = Number(longitud);

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
        tipoAfectacion,
        direccionTexto: direccionTexto.trim(),
        latitud: parsedLat,
        longitud: parsedLng,
        personasAfectadas: parsedPersonas,
        familiasAfectadas: parsedFamilias,
        prioridad,
        contactoNombre: contactoNombre.trim() || null,
        contactoTelefono: contactoTelefono.trim() || null,
        contactoRut: contactoRut.trim() || null,
        delegacionId: delegacionId || null,
        incidenteId: null,
      };

      const creado = await crearEventoAsistenciaSocial(payload, usuarioActivo.id);

      showSuccess(
        `Evento social ${creado.codigo} registrado exitosamente. Se ha incorporado a la bandeja de pendientes.`,
        'Caso Social Creado'
      );

      // Redirigir a la bandeja de eventos pendientes
      router.push(basePath);
    } catch (err: unknown) {
      if (err instanceof AsistenciaSocialServiceError) {
        setErrorServidor(err.message);
        if (err.fieldErrors) {
          setErrores(err.fieldErrors);
        }
        showError(err.message, 'Error al registrar evento');
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
              options={TIPOS_AFECTACION_SOCIAL.map((op) => ({
                value: op.value,
                label: op.label,
              }))}
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
              onChange={(e) => setPrioridad(e.target.value as PrioridadEventoSocial)}
              options={[
                { value: 'CRITICA', label: 'Crítica — Peligro inminente para habitantes' },
                { value: 'ALTA', label: 'Alta — Daño severo o inhabitabilidad parcial' },
                { value: 'MEDIA', label: 'Media — Afectación moderada de enseres/patio' },
                { value: 'BAJA', label: 'Baja — Requerimiento preventivo o de menor escala' },
              ]}
            />
          </div>

          <div>
            <Input
              type="number"
              label="Personas Afectadas Estimadas"
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
              value={familiasAfectadas}
              min={0}
              onChange={(e) => setFamiliasAfectadas(e.target.value)}
              error={errores.familiasAfectadas}
            />
          </div>
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
            <Input
              label="Dirección de Referencia o Calle *"
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
              error={errores.direccionTexto}
            />
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
              Haga clic sobre el mapa para fijar el punto exacto de la vivienda afectada:
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
            latitud={Number(latitud)}
            longitud={Number(longitud)}
            onChange={handleCoordsChange}
            height="320px"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4, 16px)', marginTop: '8px' }}>
            <Input
              label="Latitud"
              type="number"
              step="any"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              error={errores.latitud}
            />
            <Input
              label="Longitud"
              type="number"
              step="any"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 'var(--space-3, 12px)',
          marginTop: 'var(--space-2, 8px)',
          flexWrap: 'wrap',
        }}
      >
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
    </form>
  );
}
