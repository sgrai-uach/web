'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  obtenerTiposAfectacion,
  crearIncidenteManual,
} from '@/lib/api/incidentes-manuales';
import {
  incidenteManualSchema,
  DEFAULT_CALLCENTER_OPERADOR_ID,
  TIPOS_AFECTACION_FALLBACK,
  type OrigenReporte,
  type PrioridadIncidente,
  type DuplicadoItem,
  type IncidenteCreadoExito,
} from '@/types/incidente-manual';
import { formatearRut } from '@/lib/validations/rut';
import { useVerificarDuplicado } from '@/hooks/useVerificarDuplicado';
import LocationPickerMap from '@/components/maps/LocationPickerMap';
import DuplicadoAlertaBanner from './DuplicadoAlertaBanner';
import DuplicadosModal from './DuplicadosModal';
import IncidenteExitoCard from './IncidenteExitoCard';

interface IncidenteManualFormProps {
  operadorId?: string;
  onExito?: (datos: IncidenteCreadoExito) => void;
}

export default function IncidenteManualForm({
  operadorId = DEFAULT_CALLCENTER_OPERADOR_ID,
  onExito,
}: IncidenteManualFormProps) {
  // Catálogo dinámico de tipos de afectación
  const [tiposAfectacion, setTiposAfectacion] = useState<string[]>(TIPOS_AFECTACION_FALLBACK);
  const [cargandoTipos, setCargandoTipos] = useState(true);

  // Valores del formulario
  const [origenReporte, setOrigenReporte] = useState<OrigenReporte>('LLAMADA_TELEFONICA');
  const [tipoAfectacion, setTipoAfectacion] = useState<string>(TIPOS_AFECTACION_FALLBACK[0]);

  const [descripcion, setDescripcion] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');
  const [informanteNombre, setInformanteNombre] = useState<string>('');
  const [informanteRut, setInformanteRut] = useState<string>('');
  const [informanteTelefono, setInformanteTelefono] = useState<string>('');
  const [prioridad, setPrioridad] = useState<PrioridadIncidente>('MEDIA');
  const [coordenadas, setCoordenadas] = useState<{ latitud: number; longitud: number } | null>(null);

  // Estados de control de UI y errores
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  // Modal de duplicados (409 Conflict)
  const [modalDuplicadosAbierto, setModalDuplicadosAbierto] = useState<boolean>(false);
  const [coincidenciasConflicto, setCoincidenciasConflicto] = useState<DuplicadoItem[]>([]);
  const [mensajeConflicto, setMensajeConflicto] = useState<string>('');

  // Resultado exitoso
  const [resultadoExitoso, setResultadoExitoso] = useState<IncidenteCreadoExito | null>(null);

  // Hook de pre-verificación de duplicados (onBlur / debounce)
  const { consultando: verificandoDuplicados, coincidencias: duplicadosPreventivos } =
    useVerificarDuplicado({
      direccion,
      tipoAfectacion,
      latitud: coordenadas?.latitud,
      longitud: coordenadas?.longitud,
      operadorId,
    });

  // Cargar catálogo de tipos al montar
  useEffect(() => {
    let activo = true;
    obtenerTiposAfectacion().then((tipos) => {
      if (activo) {
        setTiposAfectacion(tipos);
        if (tipos.length > 0) {
          setTipoAfectacion(tipos[0]);
        }
        setCargandoTipos(false);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  // Formateador interactivo para RUT
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formated = formatearRut(raw, false);
    setInformanteRut(formated);
    if (errores.informanteRut) {
      setErrores((prev) => {
        const c = { ...prev };
        delete c.informanteRut;
        return c;
      });
    }
  };

  const limpiarFormulario = useCallback(() => {
    setOrigenReporte('LLAMADA_TELEFONICA');
    setDescripcion('');
    setDireccion('');
    setInformanteNombre('');
    setInformanteRut('');
    setInformanteTelefono('');
    setPrioridad('MEDIA');
    setCoordenadas(null);
    setErrores({});
    setErrorGeneral(null);
    setModalDuplicadosAbierto(false);
    setCoincidenciasConflicto([]);
    setResultadoExitoso(null);
  }, []);

  const handleSubmit = async (e?: React.FormEvent, forzar = false) => {
    if (e) e.preventDefault();

    setErrorGeneral(null);
    setErrores({});

    const datosAValidar = {
      origenReporte,
      tipoAfectacion,
      descripcion,
      direccion,
      informanteNombre,
      informanteRut,
      informanteTelefono: informanteTelefono || undefined,
      prioridad,
      requiereAsistenciaSocial: false,
      latitud: coordenadas?.latitud,
      longitud: coordenadas?.longitud,
      forzarCreacion: forzar,
    };

    const validacion = incidenteManualSchema.safeParse(datosAValidar);
    if (!validacion.success) {
      const mapaErrores: Record<string, string> = {};
      validacion.error.issues.forEach((issue) => {
        const campo = issue.path[0] as string;
        if (!mapaErrores[campo]) {
          mapaErrores[campo] = issue.message;
        }
      });
      setErrores(mapaErrores);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await crearIncidenteManual(datosAValidar, operadorId);

      if (respuesta.tipo === 'EXITO') {
        setModalDuplicadosAbierto(false);
        setResultadoExitoso(respuesta.datos);
        if (onExito) {
          onExito(respuesta.datos);
        }
      } else if (respuesta.tipo === 'DUPLICADO') {
        setCoincidenciasConflicto(respuesta.coincidencias);
        setMensajeConflicto(respuesta.mensaje);
        setModalDuplicadosAbierto(true);
      } else if (respuesta.tipo === 'ERROR_VALIDACION') {
        setErrorGeneral(respuesta.mensaje);
        if (respuesta.errores.length > 0) {
          setErrorGeneral(`${respuesta.mensaje}: ${respuesta.errores.join(', ')}`);
        }
      } else if (respuesta.tipo === 'NO_AUTORIZADO') {
        setErrorGeneral('Acceso restringido: El operador no posee el permiso crear_incidente_manual.');
      } else {
        setErrorGeneral(respuesta.mensaje);
      }
    } catch {
      setErrorGeneral('Error inesperado de red al procesar el reporte.');
    } finally {
      setEnviando(false);
    }
  };

  // Si ya se creó con éxito, mostrar la tarjeta de confirmación
  if (resultadoExitoso) {
    return (
      <IncidenteExitoCard
        datos={resultadoExitoso}
        onNuevoReporte={limpiarFormulario}
      />
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Alerta de error general */}
      {errorGeneral && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FFEBEE',
            borderLeft: '4px solid #D32F2F',
            color: '#C62828',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {errorGeneral}
        </div>
      )}

      <form
        onSubmit={(e) => handleSubmit(e, false)}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #DFE3E8',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* 1. Origen del Reporte (Llamada vs Terreno) */}
        <div>
          <label
            style={{
              display: 'block',
              fontWeight: 700,
              fontSize: '14px',
              color: '#14505A',
              marginBottom: '8px',
            }}
          >
            1. Origen del Reporte *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setOrigenReporte('LLAMADA_TELEFONICA')}
              style={{
                padding: '14px',
                border: origenReporte === 'LLAMADA_TELEFONICA' ? '2px solid #1B6F7D' : '1px solid #DFE3E8',
                backgroundColor: origenReporte === 'LLAMADA_TELEFONICA' ? '#14505A' : '#ECEFF3',
                color: origenReporte === 'LLAMADA_TELEFONICA' ? '#FFFFFF' : '#2B2B2B',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '24px' }}>📞</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Llamada Telefónica</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Informante vía Call Center 1451</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrigenReporte('FUNCIONARIO_TERRENO')}
              style={{
                padding: '14px',
                border: origenReporte === 'FUNCIONARIO_TERRENO' ? '2px solid #1B6F7D' : '1px solid #DFE3E8',
                backgroundColor: origenReporte === 'FUNCIONARIO_TERRENO' ? '#14505A' : '#ECEFF3',
                color: origenReporte === 'FUNCIONARIO_TERRENO' ? '#FFFFFF' : '#2B2B2B',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '24px' }}>👷</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>Funcionario en Terreno</div>
                <div style={{ fontSize: '12px', opacity: 0.85 }}>Aviso por patrullero o cuadrilla municipal</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Tipo de Afectación y Prioridad */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div>
            <label
              htmlFor="tipoAfectacion"
              style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
            >
              2. Tipo de Afectación *
            </label>
            <select
              id="tipoAfectacion"
              value={tipoAfectacion}
              onChange={(e) => setTipoAfectacion(e.target.value)}
              disabled={cargandoTipos}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: errores.tipoAfectacion ? '2px solid #D32F2F' : '1px solid #3B3F45',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
              }}
            >
              {tiposAfectacion.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errores.tipoAfectacion && (
              <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {errores.tipoAfectacion}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="prioridad"
              style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
            >
              Prioridad
            </label>
            <select
              id="prioridad"
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value as PrioridadIncidente)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #3B3F45',
                fontSize: '14px',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
                fontWeight: 600,
              }}
            >
              <option value="BAJA">BAJA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
              <option value="CRITICA">CRÍTICA ⚠️</option>
            </select>
          </div>
        </div>

        {/* 3. Dirección y Mini-Mapa */}
        <div>
          <label
            htmlFor="direccion"
            style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
          >
            3. Dirección o Referencia en Valdivia *
          </label>
          <input
            id="direccion"
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej: Av. Alemania 550, Picarte 2000, Isla Teja..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: errores.direccion ? '2px solid #D32F2F' : '1px solid #3B3F45',
              fontSize: '14px',
              borderRadius: 0,
              marginBottom: '10px',
            }}
          />
          {errores.direccion && (
            <span style={{ color: '#D32F2F', fontSize: '12px', marginBottom: '8px', display: 'block' }}>
              {errores.direccion}
            </span>
          )}

          {/* Banner preventivo si la pre-consulta detectó duplicados */}
          <DuplicadoAlertaBanner
            coincidencias={duplicadosPreventivos}
            consultando={verificandoDuplicados}
          />

          {/* Mini-mapa interactivo para afinar ubicación */}
          <div style={{ marginTop: '8px' }}>
            <LocationPickerMap
              latitud={coordenadas?.latitud}
              longitud={coordenadas?.longitud}
              onChange={setCoordenadas}
            />
          </div>
        </div>

        {/* 4. Descripción del Incidente */}
        <div>
          <label
            htmlFor="descripcion"
            style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: '#14505A', marginBottom: '6px' }}
          >
            4. Descripción de la Emergencia / Situación *
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            placeholder="Describe brevemente la afectación, personas o bienes en riesgo (mínimo 5 caracteres)..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: errores.descripcion ? '2px solid #D32F2F' : '1px solid #3B3F45',
              fontSize: '14px',
              borderRadius: 0,
              resize: 'vertical',
            }}
          />
          {errores.descripcion && (
            <span style={{ color: '#D32F2F', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errores.descripcion}
            </span>
          )}
        </div>

        {/* 5. Datos del Informante */}
        <div
          style={{
            backgroundColor: '#ECEFF3',
            padding: '16px',
            borderLeft: '4px solid #1B6F7D',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#14505A' }}>
            5. Identificación del Informante
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label
                htmlFor="informanteNombre"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
              >
                Nombre Completo *
              </label>
              <input
                id="informanteNombre"
                type="text"
                value={informanteNombre}
                onChange={(e) => setInformanteNombre(e.target.value)}
                placeholder="Ej: Pedro Martínez"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: errores.informanteNombre ? '2px solid #D32F2F' : '1px solid #3B3F45',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 0,
                }}
              />
              {errores.informanteNombre && (
                <span style={{ color: '#D32F2F', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                  {errores.informanteNombre}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="informanteRut"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
              >
                RUT Chileno (con DV) *
              </label>
              <input
                id="informanteRut"
                type="text"
                value={informanteRut}
                onChange={handleRutChange}
                placeholder="11111111-1"
                maxLength={12}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: errores.informanteRut ? '2px solid #D32F2F' : '1px solid #3B3F45',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 0,
                }}
              />
              {errores.informanteRut && (
                <span style={{ color: '#D32F2F', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                  {errores.informanteRut}
                </span>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="informanteTelefono"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}
            >
              Teléfono de Contacto (Opcional)
            </label>
            <input
              id="informanteTelefono"
              type="text"
              value={informanteTelefono}
              onChange={(e) => setInformanteTelefono(e.target.value)}
              placeholder="+56912345678 o 912345678"
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 10px',
                border: errores.informanteTelefono ? '2px solid #D32F2F' : '1px solid #3B3F45',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                borderRadius: 0,
              }}
            />
            {errores.informanteTelefono && (
              <span style={{ color: '#D32F2F', fontSize: '11px', marginTop: '2px', display: 'block' }}>
                {errores.informanteTelefono}
              </span>
            )}
          </div>
        </div>

        {/* Barra de botones de envío */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #ECEFF3',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={limpiarFormulario}
            disabled={enviando}
            style={{
              backgroundColor: '#ECEFF3',
              color: '#3B3F45',
              border: '1px solid #CFD8DC',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: enviando ? 'not-allowed' : 'pointer',
              borderRadius: 0,
            }}
          >
            Limpiar campos
          </button>

          <button
            type="submit"
            disabled={enviando}
            style={{
              backgroundColor: '#4FAE9B',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: enviando ? 'not-allowed' : 'pointer',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'none',
            }}
          >
            {enviando ? (
              <>
                <span>⏳</span>
                <span>Enviando reporte...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Guardar y Notificar al Encargado</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de conflicto 409 por duplicado */}
      <DuplicadosModal
        isOpen={modalDuplicadosAbierto}
        coincidencias={coincidenciasConflicto}
        mensaje={mensajeConflicto}
        enviando={enviando}
        onOmitir={() => {
          setModalDuplicadosAbierto(false);
          limpiarFormulario();
        }}
        onContinuar={() => {
          handleSubmit(undefined, true);
        }}
      />
    </div>
  );
}
