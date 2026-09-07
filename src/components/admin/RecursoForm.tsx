'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import {
  recursoFormSchema,
  type RecursoFormInput,
  type SubtipoDetalle,
  type TipoCombustible,
} from '@/types/recurso';
import SuccessActions from './SuccessActions';

// Carga diferida del mapa Leaflet (solo cliente, sin SSR)
const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '260px',
          border: '1px solid #3B3F45',
          backgroundColor: '#ECEFF3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3B3F45',
          fontSize: '14px',
        }}
      >
        Cargando mapa de Valdivia...
      </div>
    ),
  }
);

const DEFAULT_VALDIVIA_LAT = -39.8142;
const DEFAULT_VALDIVIA_LNG = -73.2459;

interface FormState {
  nombre: string;
  descripcion: string;
  esIndividual: boolean;
  cantidadInventario: number | string;
  cantidadMinima: number | string;
  latitud: number;
  longitud: number;
  subtipoDetalle: SubtipoDetalle;
  detalles: {
    patente: string;
    numeroSerie: string;
    marca: string;
    modelo: string;
    anio: string;
    kilometraje: string;
    tipoCombustible: TipoCombustible | '';
    capacidadPasajeros: string;
    numeroChasis: string;
    capacidadCargaKg: string;
    alcanceMaximoMetros: string;
    tipoGrua: string;
    horometro: string;
    caudalMaximoLpm: string;
    diametroPulgadas: string;
    potenciaHp: string;
  };
}

const initialFormState: FormState = {
  nombre: '',
  descripcion: '',
  esIndividual: false,
  cantidadInventario: 1,
  cantidadMinima: 0,
  latitud: DEFAULT_VALDIVIA_LAT,
  longitud: DEFAULT_VALDIVIA_LNG,
  subtipoDetalle: 'GENERAL' as SubtipoDetalle,
  detalles: {
    patente: '',
    numeroSerie: '',
    marca: '',
    modelo: '',
    anio: '',
    kilometraje: '',
    tipoCombustible: '',
    capacidadPasajeros: '',
    numeroChasis: '',
    capacidadCargaKg: '',
    alcanceMaximoMetros: '',
    tipoGrua: '',
    horometro: '',
    caudalMaximoLpm: '',
    diametroPulgadas: '',
    potenciaHp: '',
  },
};

export default function RecursoForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({});
  const [createdResourceName, setCreatedResourceName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación reactiva en tiempo real con Zod
  const validationResult = useMemo(() => {
    const rawPayload: Record<string, unknown> = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || undefined,
      esIndividual: formData.esIndividual,
      cantidadInventario: formData.esIndividual ? 1 : formData.cantidadInventario,
      cantidadMinima: formData.cantidadMinima,
      latitud: formData.latitud,
      longitud: formData.longitud,
    };

    if (formData.esIndividual) {
      const d = formData.detalles;
      rawPayload.detalles = {
        patente: d.patente || undefined,
        numeroSerie: d.numeroSerie || undefined,
        marca: d.marca || undefined,
        modelo: d.modelo || undefined,
        anio: d.anio ? Number(d.anio) : undefined,
        kilometraje: d.kilometraje ? Number(d.kilometraje) : undefined,
        tipoCombustible: d.tipoCombustible || undefined,
        capacidadPasajeros: d.capacidadPasajeros ? Number(d.capacidadPasajeros) : undefined,
        numeroChasis: d.numeroChasis || undefined,
        capacidadCargaKg: d.capacidadCargaKg ? Number(d.capacidadCargaKg) : undefined,
        alcanceMaximoMetros: d.alcanceMaximoMetros ? Number(d.alcanceMaximoMetros) : undefined,
        tipoGrua: d.tipoGrua || undefined,
        horometro: d.horometro ? Number(d.horometro) : undefined,
        caudalMaximoLpm: d.caudalMaximoLpm ? Number(d.caudalMaximoLpm) : undefined,
        diametroPulgadas: d.diametroPulgadas ? Number(d.diametroPulgadas) : undefined,
        potenciaHp: d.potenciaHp ? Number(d.potenciaHp) : undefined,
      };
    }

    return recursoFormSchema.safeParse(rawPayload);
  }, [formData]);

  const clientErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!validationResult.success) {
      for (const issue of validationResult.error.issues) {
        const key = issue.path.join('.');
        if (!errs[key]) {
          errs[key] = issue.message;
        }
      }
    }
    return errs;
  }, [validationResult]);

  const isValid = validationResult.success;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleCoordsChange = ({ latitud, longitud }: { latitud: number; longitud: number }) => {
    setFormData((prev) => ({ ...prev, latitud, longitud }));
    setTouched((prev) => ({ ...prev, latitud: true, longitud: true }));
  };

  const handleCenterValdivia = () => {
    handleCoordsChange({
      latitud: DEFAULT_VALDIVIA_LAT,
      longitud: DEFAULT_VALDIVIA_LNG,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar campos como tocados
    setTouched({
      nombre: true,
      cantidadInventario: true,
      cantidadMinima: true,
      latitud: true,
      longitud: true,
    });

    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setServerFieldErrors({});

    try {
      const validData = validationResult.data as RecursoFormInput;

      // Filtrar campos vacíos de detalles si no aplican
      const payload: {
        nombre: string;
        esIndividual?: boolean;
        cantidadInventario: number;
        cantidadMinima?: number;
        latitud: number;
        longitud: number;
        descripcion?: string;
        detalles?: Record<string, unknown>;
      } = {
        nombre: validData.nombre,
        esIndividual: validData.esIndividual,
        cantidadInventario: validData.esIndividual ? 1 : validData.cantidadInventario,
        cantidadMinima: validData.cantidadMinima,
        latitud: validData.latitud,
        longitud: validData.longitud,
        descripcion: validData.descripcion || undefined,
      };

      if (validData.esIndividual && validData.detalles) {
        const cleanDetalles: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(validData.detalles)) {
          if (v !== undefined && v !== '' && !Number.isNaN(v)) {
            cleanDetalles[k] = v;
          }
        }
        if (Object.keys(cleanDetalles).length > 0) {
          payload.detalles = cleanDetalles;
        }
      }

      const { data, error, response } = await apiClient.POST('/api/recursos', {
        body: payload as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      if (response.status === 201 && data) {
        setCreatedResourceName(payload.nombre);
      } else if (error) {
        // En caso de error, NO borramos los datos ingresados (Criterio 5)
        const errorData = error as { message?: string; errors?: Array<{ campo?: string; mensaje: string }> };
        setServerError(errorData.message || 'Ocurrió un error al registrar el recurso.');
        if (Array.isArray(errorData.errors)) {
          const fieldErrs: Record<string, string> = {};
          for (const err of errorData.errors) {
            if (err.campo) {
              fieldErrs[err.campo] = err.mensaje;
            }
          }
          setServerFieldErrors(fieldErrs);
        }
      } else {
        setServerError('No fue posible completar la creación del recurso. Intente nuevamente.');
      }
    } catch (err: unknown) {
      // Error de conexión o red: NO borrar datos del formulario (Criterio 5)
      setServerError(
        err instanceof Error
          ? `Error de red: ${err.message}`
          : 'Error de conexión con el servidor. Verifique su red e intente de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setTouched({});
    setServerError(null);
    setServerFieldErrors({});
    setCreatedResourceName(null);
  };

  // Si ya se creó exitosamente, mostramos la tarjeta de éxito con las acciones
  if (createdResourceName) {
    return (
      <SuccessActions
        recursoNombre={createdResourceName}
        onReset={handleReset}
        listPath="/recursos"
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECEFF3',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* Alerta de Error de Servidor o Red (Criterio 5: sin borrar datos) */}
      {serverError && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FDE8E8',
            borderLeft: '4px solid #C81E1E',
            padding: '16px',
            color: '#9B1C1C',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '15px' }}>
            Error al procesar la solicitud
          </div>
          <div style={{ fontSize: '14px' }}>{serverError}</div>
          <div style={{ fontSize: '12px', color: '#771D1D' }}>
            Los datos ingresados se han conservado intactos. Por favor revise los campos e intente de nuevo.
          </div>
        </div>
      )}

      {/* SECCIÓN 1: Información General */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            borderBottom: '2px solid #1B6F7D',
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#1B6F7D', fontWeight: 'bold', fontSize: '18px' }}>1.</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14505A', margin: 0 }}>
            Información General
          </h2>
        </div>

        {/* Nombre del Recurso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="nombre" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
            Nombre del Recurso <span style={{ color: '#C81E1E' }}>*</span>
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
            onBlur={() => handleBlur('nombre')}
            placeholder="Ej. Sacos de arena, Motobomba 3 HP, Camioneta Rescate 4x4"
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: (touched.nombre && clientErrors.nombre) || serverFieldErrors.nombre
                ? '2px solid #C81E1E'
                : '1px solid #3B3F45',
              borderRadius: 0,
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#2B2B2B',
            }}
          />
          {((touched.nombre && clientErrors.nombre) || serverFieldErrors.nombre) && (
            <span style={{ fontSize: '12px', color: '#C81E1E', fontWeight: 500 }}>
              {clientErrors.nombre || serverFieldErrors.nombre}
            </span>
          )}
        </div>

        {/* Descripción */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="descripcion" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
            Descripción u Observaciones (Opcional)
          </label>
          <textarea
            id="descripcion"
            rows={3}
            value={formData.descripcion}
            onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Especificaciones adicionales, condiciones de uso o estado del activo..."
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid #3B3F45',
              borderRadius: 0,
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#2B2B2B',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Modelo Híbrido: Selector Fungible vs Individual */}
        <div
          style={{
            backgroundColor: '#ECEFF3',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <label style={{ fontSize: '14px', fontWeight: 700, color: '#14505A' }}>
            Naturaleza del Recurso
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#2B2B2B',
                fontWeight: !formData.esIndividual ? 700 : 400,
              }}
            >
              <input
                type="radio"
                name="esIndividual"
                checked={!formData.esIndividual}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    esIndividual: false,
                    cantidadInventario: prev.cantidadInventario === 1 ? 50 : prev.cantidadInventario,
                  }))
                }
                style={{ accentColor: '#1B6F7D', cursor: 'pointer' }}
              />
              Fungible / A Granel (Gestionado por volumen o stock acumulado)
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#2B2B2B',
                fontWeight: formData.esIndividual ? 700 : 400,
              }}
            >
              <input
                type="radio"
                name="esIndividual"
                checked={formData.esIndividual}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    esIndividual: true,
                    cantidadInventario: 1,
                  }))
                }
                style={{ accentColor: '#1B6F7D', cursor: 'pointer' }}
              />
              Activo Individual / Serializado (Camioneta, grúa, motobomba, etc.)
            </label>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: Control de Inventario y Stock */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            borderBottom: '2px solid #1B6F7D',
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#1B6F7D', fontWeight: 'bold', fontSize: '18px' }}>2.</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14505A', margin: 0 }}>
            Inventario y Stock
          </h2>
        </div>

        {formData.esIndividual ? (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#ECEFF3',
              borderLeft: '4px solid #4FAE9B',
              fontSize: '14px',
              color: '#14505A',
            }}
          >
            <strong>Cantidad fijada en 1:</strong> Al ser un activo individual, el inventario se registra por unidad única. Su estado inicial será calculado automáticamente como <code>DISPONIBLE</code>.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Cantidad Inicial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="cantidadInventario" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
                Cantidad en Inventario <span style={{ color: '#C81E1E' }}>*</span>
              </label>
              <input
                id="cantidadInventario"
                type="number"
                min="0"
                step="1"
                required
                value={formData.cantidadInventario}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cantidadInventario: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  }))
                }
                onBlur={() => handleBlur('cantidadInventario')}
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: (touched.cantidadInventario && clientErrors.cantidadInventario) || serverFieldErrors.cantidadInventario
                    ? '2px solid #C81E1E'
                    : '1px solid #3B3F45',
                  borderRadius: 0,
                  outline: 'none',
                }}
              />
              {((touched.cantidadInventario && clientErrors.cantidadInventario) || serverFieldErrors.cantidadInventario) && (
                <span style={{ fontSize: '12px', color: '#C81E1E' }}>
                  {clientErrors.cantidadInventario || serverFieldErrors.cantidadInventario}
                </span>
              )}
            </div>

            {/* Cantidad Mínima para Alerta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="cantidadMinima" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
                Cantidad Mínima (Umbral Bajo Stock)
              </label>
              <input
                id="cantidadMinima"
                type="number"
                min="0"
                step="1"
                value={formData.cantidadMinima}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cantidadMinima: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                  }))
                }
                onBlur={() => handleBlur('cantidadMinima')}
                style={{
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #3B3F45',
                  borderRadius: 0,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px', color: '#3B3F45' }}>
                Si el stock baja a este valor o menos, pasará automáticamente a estado &ldquo;BAJO_STOCK&rdquo;. (0 desactiva la alerta).
              </span>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 3: Detalles Técnicos (Solo si esIndividual == true) */}
      {formData.esIndividual && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              borderBottom: '2px solid #1B6F7D',
              paddingBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: '#1B6F7D', fontWeight: 'bold', fontSize: '18px' }}>3.</span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14505A', margin: 0 }}>
              Detalles Técnicos del Activo
            </h2>
          </div>

          {/* Selector de Tipo de Activo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="subtipoDetalle" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
              Categoría de Especificaciones
            </label>
            <select
              id="subtipoDetalle"
              value={formData.subtipoDetalle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subtipoDetalle: e.target.value as SubtipoDetalle,
                }))
              }
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #3B3F45',
                borderRadius: 0,
                outline: 'none',
                backgroundColor: '#FFFFFF',
                color: '#2B2B2B',
                maxWidth: '320px',
              }}
            >
              <option value="GENERAL">General / Serializado</option>
              <option value="VEHICULO">Vehículo / Camioneta</option>
              <option value="MAQUINARIA">Maquinaria / Grúa</option>
              <option value="MOTOBOMBA">Motobomba / Equipo de Bombeo</option>
            </select>
          </div>

          {/* Campos comunes a todos los serializados */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="patente" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                Patente
              </label>
              <input
                id="patente"
                type="text"
                value={formData.detalles.patente}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    detalles: { ...prev.detalles, patente: e.target.value },
                  }))
                }
                placeholder="Ej. AB-1234"
                style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="numeroSerie" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                Número de Serie
              </label>
              <input
                id="numeroSerie"
                type="text"
                value={formData.detalles.numeroSerie}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    detalles: { ...prev.detalles, numeroSerie: e.target.value },
                  }))
                }
                placeholder="Ej. SN-998231"
                style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="marca" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                Marca
              </label>
              <input
                id="marca"
                type="text"
                value={formData.detalles.marca}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    detalles: { ...prev.detalles, marca: e.target.value },
                  }))
                }
                placeholder="Ej. Toyota, Caterpillar, Honda"
                style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="modelo" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                Modelo
              </label>
              <input
                id="modelo"
                type="text"
                value={formData.detalles.modelo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    detalles: { ...prev.detalles, modelo: e.target.value },
                  }))
                }
                placeholder="Ej. Hilux 4x4, GX390"
                style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label htmlFor="anio" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                Año
              </label>
              <input
                id="anio"
                type="number"
                min="1950"
                max="2099"
                value={formData.detalles.anio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    detalles: { ...prev.detalles, anio: e.target.value },
                  }))
                }
                placeholder="Ej. 2024"
                style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
              />
            </div>
          </div>

          {/* Campos específicos de Vehículo */}
          {formData.subtipoDetalle === 'VEHICULO' && (
            <div
              style={{
                backgroundColor: '#ECEFF3',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="kilometraje" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Kilometraje (km)
                </label>
                <input
                  id="kilometraje"
                  type="number"
                  min="0"
                  value={formData.detalles.kilometraje}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, kilometraje: e.target.value },
                    }))
                  }
                  placeholder="0"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="tipoCombustible" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Tipo de Combustible
                </label>
                <select
                  id="tipoCombustible"
                  value={formData.detalles.tipoCombustible}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, tipoCombustible: e.target.value as TipoCombustible },
                    }))
                  }
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                >
                  <option value="">Seleccione...</option>
                  <option value="DIESEL">Diésel</option>
                  <option value="GASOLINA">Gasolina</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="ELECTRICO">Eléctrico</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="capacidadPasajeros" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Capacidad de Pasajeros
                </label>
                <input
                  id="capacidadPasajeros"
                  type="number"
                  min="1"
                  value={formData.detalles.capacidadPasajeros}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, capacidadPasajeros: e.target.value },
                    }))
                  }
                  placeholder="Ej. 5"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="numeroChasis" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Número de Chasis / VIN
                </label>
                <input
                  id="numeroChasis"
                  type="text"
                  value={formData.detalles.numeroChasis}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, numeroChasis: e.target.value },
                    }))
                  }
                  placeholder="Ej. 8AJHA00G2M0000000"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>
            </div>
          )}

          {/* Campos específicos de Maquinaria */}
          {formData.subtipoDetalle === 'MAQUINARIA' && (
            <div
              style={{
                backgroundColor: '#ECEFF3',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="capacidadCargaKg" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Capacidad de Carga (kg)
                </label>
                <input
                  id="capacidadCargaKg"
                  type="number"
                  min="1"
                  value={formData.detalles.capacidadCargaKg}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, capacidadCargaKg: e.target.value },
                    }))
                  }
                  placeholder="Ej. 5000"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="alcanceMaximoMetros" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Alcance Máximo (metros)
                </label>
                <input
                  id="alcanceMaximoMetros"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.detalles.alcanceMaximoMetros}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, alcanceMaximoMetros: e.target.value },
                    }))
                  }
                  placeholder="Ej. 18.5"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="tipoGrua" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Tipo de Grúa / Maquinaria
                </label>
                <input
                  id="tipoGrua"
                  type="text"
                  value={formData.detalles.tipoGrua}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, tipoGrua: e.target.value },
                    }))
                  }
                  placeholder="Ej. Pluma, Horquilla, Excavadora"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="horometro" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Horómetro (Horas de Uso)
                </label>
                <input
                  id="horometro"
                  type="number"
                  min="0"
                  value={formData.detalles.horometro}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, horometro: e.target.value },
                    }))
                  }
                  placeholder="Ej. 120"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>
            </div>
          )}

          {/* Campos específicos de Motobomba */}
          {formData.subtipoDetalle === 'MOTOBOMBA' && (
            <div
              style={{
                backgroundColor: '#ECEFF3',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="caudalMaximoLpm" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Caudal Máximo (Litros/min)
                </label>
                <input
                  id="caudalMaximoLpm"
                  type="number"
                  min="1"
                  value={formData.detalles.caudalMaximoLpm}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, caudalMaximoLpm: e.target.value },
                    }))
                  }
                  placeholder="Ej. 1000"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="diametroPulgadas" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Diámetro de Salida (Pulgadas)
                </label>
                <input
                  id="diametroPulgadas"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.detalles.diametroPulgadas}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, diametroPulgadas: e.target.value },
                    }))
                  }
                  placeholder="Ej. 2, 3"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label htmlFor="potenciaHp" style={{ fontSize: '13px', fontWeight: 600, color: '#2B2B2B' }}>
                  Potencia del Motor (HP)
                </label>
                <input
                  id="potenciaHp"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.detalles.potenciaHp}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      detalles: { ...prev.detalles, potenciaHp: e.target.value },
                    }))
                  }
                  placeholder="Ej. 5.5"
                  style={{ padding: '8px 10px', fontSize: '14px', border: '1px solid #3B3F45', borderRadius: 0 }}
                />
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECCIÓN 4: Geolocalización y Ubicación Inicial */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            borderBottom: '2px solid #1B6F7D',
            paddingBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#1B6F7D', fontWeight: 'bold', fontSize: '18px' }}>
              {formData.esIndividual ? '4.' : '3.'}
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#14505A', margin: 0 }}>
              Ubicación Geográfica en Valdivia
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCenterValdivia}
            style={{
              backgroundColor: '#3B3F45',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📍 Centrar en Valdivia
          </button>
        </div>

        {/* Inputs de Coordenadas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="latitud" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
              Latitud <span style={{ color: '#C81E1E' }}>*</span>
            </label>
            <input
              id="latitud"
              type="number"
              step="0.000001"
              required
              value={formData.latitud}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  latitud: parseFloat(e.target.value) || 0,
                }))
              }
              onBlur={() => handleBlur('latitud')}
              style={{
                padding: '8px 10px',
                fontSize: '14px',
                border: touched.latitud && clientErrors.latitud ? '2px solid #C81E1E' : '1px solid #3B3F45',
                borderRadius: 0,
              }}
            />
            {touched.latitud && clientErrors.latitud && (
              <span style={{ fontSize: '12px', color: '#C81E1E' }}>{clientErrors.latitud}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="longitud" style={{ fontSize: '14px', fontWeight: 600, color: '#2B2B2B' }}>
              Longitud <span style={{ color: '#C81E1E' }}>*</span>
            </label>
            <input
              id="longitud"
              type="number"
              step="0.000001"
              required
              value={formData.longitud}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  longitud: parseFloat(e.target.value) || 0,
                }))
              }
              onBlur={() => handleBlur('longitud')}
              style={{
                padding: '8px 10px',
                fontSize: '14px',
                border: touched.longitud && clientErrors.longitud ? '2px solid #C81E1E' : '1px solid #3B3F45',
                borderRadius: 0,
              }}
            />
            {touched.longitud && clientErrors.longitud && (
              <span style={{ fontSize: '12px', color: '#C81E1E' }}>{clientErrors.longitud}</span>
            )}
          </div>
        </div>

        {/* Mini-mapa interactivo de Leaflet */}
        <LocationPickerMap
          latitud={formData.latitud}
          longitud={formData.longitud}
          onChange={handleCoordsChange}
        />
      </section>

      {/* SECCIÓN 5: Barra de Acciones */}
      <div
        style={{
          borderTop: '1px solid #ECEFF3',
          paddingTop: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/recursos')}
          disabled={isSubmitting}
          style={{
            backgroundColor: '#3B3F45',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 0,
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          style={{
            backgroundColor: isValid && !isSubmitting ? '#4FAE9B' : '#ECEFF3',
            color: isValid && !isSubmitting ? '#FFFFFF' : '#3B3F45',
            border: 'none',
            borderRadius: 0,
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'background-color 150ms ease',
          }}
        >
          {isSubmitting ? 'Guardando Recurso...' : 'Guardar Recurso'}
        </button>
      </div>
    </form>
  );
}
