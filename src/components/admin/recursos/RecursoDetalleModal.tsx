'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { RecursoItem } from '@/types/recurso';
import BadgeEstado from './BadgeEstado';

// Carga diferida del mini-mapa en modo solo lectura
const LocationPickerMap = dynamic(
  () => import('@/components/maps/LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#ECEFF3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3B3F45',
          fontSize: '13px',
        }}
      >
        Cargando mapa de ubicación...
      </div>
    ),
  }
);

interface RecursoDetalleModalProps {
  recurso: RecursoItem | null;
  onCerrar: () => void;
}

export default function RecursoDetalleModal({
  recurso,
  onCerrar,
}: RecursoDetalleModalProps) {
  // Manejo de tecla Escape para cerrar modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCerrar]);

  if (!recurso) return null;

  const d = recurso.detalles || {};
  const tieneDetallesVehiculo =
    d.patente || d.marca || d.modelo || d.anio || d.kilometraje || d.tipoCombustible || d.capacidadPasajeros;
  const tieneDetallesMaquinaria =
    d.capacidadCargaKg || d.alcanceMaximoMetros || d.tipoGrua || d.horometro;
  const tieneDetallesBombas =
    d.caudalMaximoLpm || d.diametroPulgadas || d.potenciaHp || d.potenciaKva;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(36, 39, 43, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-recurso-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '5px solid #14505A',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #D5DCE4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#1B6F7D',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Ficha Técnica del Recurso
            </span>
            <h2
              id="modal-recurso-titulo"
              style={{
                margin: '2px 0 0 0',
                fontSize: '20px',
                fontWeight: 800,
                color: '#14505A',
              }}
            >
              {recurso.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            title="Cerrar ventana"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#3B3F45',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal (Scrollable) */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Banner de Estado, Tipo y Delegación */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              backgroundColor: '#ECEFF3',
              padding: '12px 16px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: '#3B3F45', display: 'block' }}>
                Disponibilidad Operativa
              </span>
              <BadgeEstado estado={recurso.estado} />
            </div>

            <div style={{ height: '32px', width: '1px', backgroundColor: '#D5DCE4' }} />

            <div>
              <span style={{ fontSize: '11px', color: '#3B3F45', display: 'block' }}>
                Clasificación
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#14505A' }}>
                {recurso.tipo} ({recurso.esIndividual ? 'Individual' : 'A granel'})
              </span>
            </div>

            <div style={{ height: '32px', width: '1px', backgroundColor: '#D5DCE4' }} />

            <div>
              <span style={{ fontSize: '11px', color: '#3B3F45', display: 'block' }}>
                Procedencia Territorial
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#24272B' }}>
                {recurso.delegacion ? recurso.delegacion.nombre : 'Reserva Central'}
              </span>
            </div>
          </div>

          {/* Grilla de Stock y Disponibilidad */}
          <div>
            <h4
              style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                fontWeight: 700,
                color: '#14505A',
                borderBottom: '1px solid #ECEFF3',
                paddingBottom: '4px',
              }}
            >
              Control de Stock e Inventario
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#E8F5E9',
                  border: '1px solid #A5D6A7',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#2E7D32' }}>
                  DISPONIBLE
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1B5E20' }}>
                  {recurso.cantidadDisponible}
                </div>
                <div style={{ fontSize: '11px', color: '#2E7D32' }}>Listo para despacho</div>
              </div>

              <div
                style={{
                  backgroundColor: '#E3F2FD',
                  border: '1px solid #90CAF9',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1565C0' }}>
                  EN TERRENO / USO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0D47A1' }}>
                  {recurso.cantidadEnUso}
                </div>
                <div style={{ fontSize: '11px', color: '#1565C0' }}>Asignado a misión</div>
              </div>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #D5DCE4',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#3B3F45' }}>
                  TOTAL INVENTARIO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#24272B' }}>
                  {recurso.cantidadInventario}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Capacidad registrada</div>
              </div>

              <div
                style={{
                  backgroundColor:
                    recurso.cantidadMinima > 0 && recurso.cantidadDisponible <= recurso.cantidadMinima
                      ? '#FFFDE7'
                      : '#F8FAFC',
                  border:
                    recurso.cantidadMinima > 0 && recurso.cantidadDisponible <= recurso.cantidadMinima
                      ? '1px solid #FFF59D'
                      : '1px solid #D5DCE4',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color:
                      recurso.cantidadMinima > 0 && recurso.cantidadDisponible <= recurso.cantidadMinima
                        ? '#F57F17'
                        : '#3B3F45',
                  }}
                >
                  STOCK MÍNIMO
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#24272B' }}>
                  {recurso.cantidadMinima}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Umbral de alerta</div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {recurso.descripcion && (
            <div>
              <h4
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#14505A',
                }}
              >
                Descripción y Uso Logístico
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#3B3F45',
                  backgroundColor: '#F8FAFC',
                  padding: '12px 16px',
                  border: '1px solid #ECEFF3',
                  lineHeight: '1.5',
                }}
              >
                {recurso.descripcion}
              </p>
            </div>
          )}

          {/* Especificaciones Técnicas Detalladas */}
          {(tieneDetallesVehiculo || tieneDetallesMaquinaria || tieneDetallesBombas || d.numeroSerie) && (
            <div>
              <h4
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#14505A',
                  borderBottom: '1px solid #ECEFF3',
                  paddingBottom: '4px',
                }}
              >
                Especificaciones Técnicas del Activo
              </h4>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  border: '1px solid #ECEFF3',
                }}
              >
                {d.patente && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Patente / Placa
                    </span>
                    <strong style={{ fontSize: '14px', color: '#14505A' }}>{d.patente}</strong>
                  </div>
                )}

                {d.marca && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Marca</span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>{d.marca}</strong>
                  </div>
                )}

                {d.modelo && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Modelo</span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>{d.modelo}</strong>
                  </div>
                )}

                {d.anio && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Año Fabricación
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>{d.anio}</strong>
                  </div>
                )}

                {d.tipoCombustible && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Tipo Combustible
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.tipoCombustible}
                    </strong>
                  </div>
                )}

                {d.kilometraje !== undefined && d.kilometraje !== null && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Kilometraje
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.kilometraje.toLocaleString()} km
                    </strong>
                  </div>
                )}

                {d.capacidadPasajeros && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Capacidad Pasajeros
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.capacidadPasajeros} personas
                    </strong>
                  </div>
                )}

                {d.numeroSerie && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Número de Serie
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>{d.numeroSerie}</strong>
                  </div>
                )}

                {d.horometro !== undefined && d.horometro !== null && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Horómetro
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.horometro} hrs
                    </strong>
                  </div>
                )}

                {d.capacidadCargaKg && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Capacidad de Carga
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.capacidadCargaKg.toLocaleString()} kg
                    </strong>
                  </div>
                )}

                {d.alcanceMaximoMetros && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Alcance Máximo
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.alcanceMaximoMetros} metros
                    </strong>
                  </div>
                )}

                {d.caudalMaximoLpm && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Caudal Máximo
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.caudalMaximoLpm.toLocaleString()} L/min
                    </strong>
                  </div>
                )}

                {d.diametroPulgadas && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Diámetro de Conexión
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>
                      {d.diametroPulgadas}&Prime; pulgadas
                    </strong>
                  </div>
                )}

                {d.potenciaHp && (
                  <div>
                    <span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>
                      Potencia Motor
                    </span>
                    <strong style={{ fontSize: '14px', color: '#24272B' }}>{d.potenciaHp} HP</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ubicación Geográfica con Mini-Mapa */}
          <div>
            <h4
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 700,
                color: '#14505A',
              }}
            >
              Ubicación Georreferenciada del Activo
            </h4>
            <div
              style={{
                fontSize: '12px',
                color: '#3B3F45',
                marginBottom: '8px',
                display: 'flex',
                gap: '16px',
              }}
            >
              <span>
                <strong>Latitud:</strong> {recurso.latitud}
              </span>
              <span>
                <strong>Longitud:</strong> {recurso.longitud}
              </span>
            </div>

            <div style={{ width: '100%', border: '1px solid #D5DCE4', overflow: 'hidden' }}>
              <LocationPickerMap
                latitud={recurso.latitud}
                longitud={recurso.longitud}
                onChange={() => {}}
                readOnly={true}
                height="220px"
              />
            </div>
          </div>

          {/* Metadatos de Auditoría */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid #ECEFF3',
              fontSize: '11px',
              color: '#6B7280',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <span>
              <strong>ID:</strong> {recurso.id}
            </span>
            <span>
              <strong>Registrado:</strong> {new Date(recurso.creadoEn).toLocaleString('es-CL')}
            </span>
            <span>
              <strong>Última actualización:</strong>{' '}
              {new Date(recurso.actualizadoEn).toLocaleString('es-CL')}
            </span>
          </div>
        </div>

        {/* Pie del Modal */}
        <div
          style={{
            padding: '14px 24px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #D5DCE4',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onCerrar}
            style={{
              backgroundColor: '#3B3F45',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 0,
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
