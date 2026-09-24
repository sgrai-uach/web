'use client';

import React, { useState, useEffect } from 'react';
import type { EmpleadoUsuario, CatalogosResponse } from '@/types/empleados';

interface EmpleadoFormularioProps {
  usuario: EmpleadoUsuario;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
  onCancelar: () => void;
}

export default function EmpleadoFormulario({
  usuario,
  onEmpleadoActualizado,
  onCancelar,
}: EmpleadoFormularioProps) {
  const [catalogos, setCatalogos] = useState<CatalogosResponse>({
    roles: [],
    delegaciones: [],
    especialidades: [],
    cargos: [],
  });

  // Campos de usuario general
  const [nombres, setNombres] = useState(usuario.nombres);
  const [apellidos, setApellidos] = useState(usuario.apellidos);
  const [email, setEmail] = useState(usuario.email);
  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [rolId, setRolId] = useState(usuario.rol_id);
  const [delegacionId, setDelegacionId] = useState(usuario.delegacion_id || '');
  const [activo, setActivo] = useState(usuario.usuario_activo);
  const [fechaIngreso, setFechaIngreso] = useState(
    usuario.fecha_ingreso ? usuario.fecha_ingreso.slice(0, 10) : ''
  );
  const [fechaSalida, setFechaSalida] = useState(
    usuario.fecha_salida ? usuario.fecha_salida.slice(0, 10) : ''
  );

  // Determinar si el rol seleccionado corresponde a labores operativas de terreno
  const rolSeleccionado = catalogos.roles.find((r) => r.id === rolId);
  const esRolTerreno = Boolean(
    usuario.es_personal ||
    (rolSeleccionado &&
      ['PATRULLA_VERIFICADORA', 'DELEGADO_CUADRILLA', 'BRIGADISTA'].includes(
        rolSeleccionado.codigo
      ))
  );

  // Campos de personal operativo de terreno
  const [especialidad, setEspecialidad] = useState(usuario.especialidad || '');
  const [cargo, setCargo] = useState(usuario.cargo || '');
  const [estadoOperativo, setEstadoOperativo] = useState(
    usuario.estado_operativo || 'disponible'
  );
  const [disponibleTerreno, setDisponibleTerreno] = useState(
    usuario.disponible_terreno ?? true
  );
  const [observaciones, setObservaciones] = useState(usuario.observaciones || '');

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar catálogos de base de datos para autocompletar y prevenir inconsistencias
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const res = await fetch(`/api/catalogos`);
        if (res.ok) {
          const json = await res.json();
          setCatalogos(json.data);
        }
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
      }
    }
    cargarCatalogos();
  }, []);

  useEffect(() => {
    setNombres(usuario.nombres);
    setApellidos(usuario.apellidos);
    setEmail(usuario.email);
    setTelefono(usuario.telefono || '');
    setRolId(usuario.rol_id);
    setDelegacionId(usuario.delegacion_id || '');
    setActivo(usuario.usuario_activo);
    setFechaIngreso(usuario.fecha_ingreso ? usuario.fecha_ingreso.slice(0, 10) : '');
    setFechaSalida(usuario.fecha_salida ? usuario.fecha_salida.slice(0, 10) : '');

    setEspecialidad(usuario.especialidad || '');
    setCargo(usuario.cargo || '');
    setEstadoOperativo(usuario.estado_operativo || 'disponible');
    setDisponibleTerreno(usuario.disponible_terreno ?? true);
    setObservaciones(usuario.observaciones || '');
    setMensajeExito('');
    setErrorMsg('');
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg('');
    setMensajeExito('');

    try {
      const payload: Record<string, unknown> = {
        nombres,
        apellidos,
        email,
        telefono: telefono.trim() ? telefono.trim() : null,
        rol_id: rolId,
        delegacion_id: delegacionId ? delegacionId : null,
        activo,
        fecha_ingreso: fechaIngreso ? fechaIngreso : null,
        fecha_salida: fechaSalida ? fechaSalida : null,
      };

      if (esRolTerreno) {
        payload.especialidad = especialidad.trim() ? especialidad.trim() : null;
        payload.cargo = cargo.trim() ? cargo.trim() : null;
        payload.estado_operativo = estadoOperativo;
        payload.disponible_terreno = disponibleTerreno;
        payload.observaciones = observaciones.trim() ? observaciones.trim() : null;
      }

      const targetId = usuario.personal_id || usuario.usuario_id;
      const res = await fetch(`/api/personal/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar los datos');
      }

      setMensajeExito('Los datos han sido actualizados exitosamente en la base de datos.');
      setTimeout(() => {
        onEmpleadoActualizado({
          ...usuario,
          ...data.data,
          es_personal: esRolTerreno,
        });
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al conectar con la API');
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #BAC7D5',
    fontSize: '0.875rem',
    color: 'var(--color-text-dark, #2B2B2B)',
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'var(--color-charcoal, #3B3F45)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '0.35rem',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      {/* Cabecera de la ficha */}
      <div
        style={{
          borderBottom: '2px solid var(--color-bg-light, #ECEFF3)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.1875rem',
              fontWeight: 800,
              color: 'var(--color-primary-teal-dark, #14505A)',
              margin: 0,
            }}
          >
            Ficha de Modificación: {usuario.nombres} {usuario.apellidos}
          </h2>
          <div style={{ fontSize: '0.8125rem', color: '#666', marginTop: '0.2rem' }}>
            RUT: <strong>{usuario.rut}</strong> &bull; ID Usuario: {usuario.usuario_id}
          </div>
        </div>

        <div>
          {esRolTerreno ? (
            <span
              style={{
                backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRadius: 0,
              }}
            >
              Personal de Terreno
            </span>
          ) : (
            <span
              style={{
                backgroundColor: 'var(--color-charcoal, #3B3F45)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.75rem',
                padding: '0.35rem 0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderRadius: 0,
              }}
            >
              Usuario General
            </span>
          )}
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div
          style={{
            backgroundColor: '#E6F6ED',
            color: '#12633E',
            borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          {mensajeExito}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#FDF1F1',
            color: '#A92525',
            borderLeft: '4px solid #D32F2F',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* SECCIÓN 1: DATOS DE USUARIO GENERAL */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.275rem',
            fontWeight: 700,
            color: 'var(--color-primary-teal, #1B6F7D)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '1rem',
          }}
        >
          1. Datos del Personal Municipal
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <label htmlFor="form-nombres" style={labelStyle}>Nombres</label>
            <input
              id="form-nombres"
              type="text"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="form-apellidos" style={labelStyle}>Apellidos</label>
            <input
              id="form-apellidos"
              type="text"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="form-email" style={labelStyle}>Correo Institucional</label>
            <input
              id="form-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="form-telefono" style={labelStyle}>Teléfono</label>
            <input
              id="form-telefono"
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+569..."
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="form-rol" style={labelStyle}>Rol y Permisos</label>
            <select
              id="form-rol"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              style={inputStyle}
              required
            >
              {catalogos.roles.map((r: { id: string; nombre: string; codigo: string }) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({r.codigo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="form-delegacion" style={labelStyle}>Delegación Asignada</label>
            <select
              id="form-delegacion"
              value={delegacionId}
              onChange={(e) => setDelegacionId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Sin Delegación --</option>
              {catalogos.delegaciones.map((d: { id: string; nombre: string; codigo: string }) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} ({d.codigo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="form-fecha-ingreso" style={labelStyle}>Fecha de Ingreso Municipal</label>
            <input
              id="form-fecha-ingreso"
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => {
                  const nuevoActivo = e.target.checked;
                  setActivo(nuevoActivo);
                  if (!nuevoActivo && !fechaSalida) {
                    setFechaSalida(new Date().toISOString().slice(0, 10));
                  } else if (nuevoActivo) {
                    setFechaSalida('');
                  }
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-teal, #1B6F7D)', borderRadius: 0 }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
                Cuenta de Usuario Activa
              </span>
            </label>
          </div>

          {/* Fecha de salida: sólo visible si el usuario se encuentra inactivo */}
          {!activo && (
            <div>
              <label htmlFor="form-fecha-salida" style={labelStyle}>
                Fecha de Salida / Desvinculación
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFF2F2',
                  border: '1px solid #E0B4B4',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.875rem',
                  color: '#9F3A38',
                  fontWeight: 600,
                  gap: '0.5rem',
                }}
              >
                <span>📅 Registrada: <strong>{fechaSalida || new Date().toISOString().slice(0, 10)}</strong></span>
                <input
                  type="date"
                  value={fechaSalida || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setFechaSalida(e.target.value)}
                  style={{
                    marginLeft: 'auto',
                    border: '1px solid #BAC7D5',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.8125rem',
                    backgroundColor: '#FFFFFF',
                    color: '#2B2B2B',
                  }}
                  title="Modificar fecha de salida si es diferente a hoy"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: DATOS CONDICIONALES PARA PERSONAL DE TERRENO */}
      {esRolTerreno && (
        <div
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #D1D9E2',
            borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h3
              style={{
                fontSize: '1.275rem',
                fontWeight: 800,
                color: 'var(--color-primary-teal-dark, #14505A)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: 0,
              }}
            >
              2. Opciones para el personal de terreno.
            </h3>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                color: '#FFFFFF',
                padding: '0.15rem 0.4rem',
                fontWeight: 700,
                borderRadius: 0,
              }}
            >
              Opciones Extendidas
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Especialidad con datalist sugerido de la DB para evitar inconsistencias */}
            <div>
              <label htmlFor="form-especialidad" style={labelStyle}>Especialidad Operativa</label>
              <input
                id="form-especialidad"
                type="text"
                list="datalist-especialidades"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej. Motosierrista, Conductor, Verificador..."
                style={inputStyle}
              />
              <datalist id="datalist-especialidades">
                {catalogos.especialidades.map((esp: string) => (
                  <option key={esp} value={esp} />
                ))}
              </datalist>
            </div>

            {/* Cargo con datalist sugerido de la DB */}
            <div>
              <label htmlFor="form-cargo" style={labelStyle}>Cargo en Terreno</label>
              <input
                id="form-cargo"
                type="text"
                list="datalist-cargos"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej. Delegado de Cuadrilla, Brigadista..."
                style={inputStyle}
              />
              <datalist id="datalist-cargos">
                {catalogos.cargos.map((cg: string) => (
                  <option key={cg} value={cg} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="form-estado-operativo" style={labelStyle}>Estado Operativo</label>
              <select
                id="form-estado-operativo"
                value={estadoOperativo}
                onChange={(e) => setEstadoOperativo(e.target.value as any)}
                style={inputStyle}
              >
                <option value="disponible">Disponible (Para asignación)</option>
                <option value="en_mision">En Misión</option>
                <option value="en_patrulla">En Patrulla</option>
                <option value="descanso">En Descanso</option>
                <option value="licencia">Licencia / Permiso</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={disponibleTerreno}
                  onChange={(e) => setDisponibleTerreno(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent-mint, #4FAE9B)', borderRadius: 0 }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)' }}>
                  Apto para Despacho a Terreno
                </span>
              </label>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="form-observaciones" style={labelStyle}>Observaciones Operativas</label>
              <textarea
                id="form-observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={2}
                placeholder="Notas de terreno, restricciones operativas o certificaciones especiales..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción planos con esquinas rectas */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          borderTop: '1px solid #DFE3E8',
          paddingTop: '1rem',
        }}
      >
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          style={{
            backgroundColor: 'var(--color-charcoal, #3B3F45)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: guardando ? 'not-allowed' : 'pointer',
            borderRadius: 0,
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          style={{
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: guardando ? 'not-allowed' : 'pointer',
            opacity: guardando ? 0.65 : 1,
            borderRadius: 0,
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
