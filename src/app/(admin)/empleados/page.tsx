'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import EmpleadoBuscador from '@/components/admin/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/EmpleadoFormulario';
import type { EmpleadoUsuario } from '@/types/empleados';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);
  const [versionActualizacion, setVersionActualizacion] = useState(0);

  const [notificacion, setNotificacion] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<EmpleadoUsuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    setNotificacion({
      tipo: 'exito',
      mensaje: `El empleado ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`,
    });
    setUsuarioSeleccionado(null); // Redirige al listado / buscador limpio
    setVersionActualizacion((v) => v + 1); // Forzar refresco inmediato del listado
    setTimeout(() => setNotificacion(null), 6000);
  };

  const handleConfirmarBaja = async () => {
    if (!empleadoAEliminar) return;

    setEliminando(true);
    try {
      const targetId = empleadoAEliminar.personal_id || empleadoAEliminar.usuario_id;
      const res = await fetch(`/api/personal/${targetId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No fue posible dar de baja al empleado');
      }

      setNotificacion({
        tipo: 'exito',
        mensaje: `El funcionario ${empleadoAEliminar.nombres} ${empleadoAEliminar.apellidos} ha sido dado de baja lógicamente del sistema.`,
      });

      if (usuarioSeleccionado?.usuario_id === empleadoAEliminar.usuario_id) {
        setUsuarioSeleccionado(null);
      }
      setEmpleadoAEliminar(null);
      setVersionActualizacion((v) => v + 1);
      setTimeout(() => setNotificacion(null), 6000);
    } catch (err: any) {
      setNotificacion({
        tipo: 'error',
        mensaje: err.message || 'Error al procesar la baja del empleado.',
      });
      setTimeout(() => setNotificacion(null), 6000);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Institucional de Administrador */}
      <AdminHeader />

      {/* Contenido Modular */}
      <main style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '0 1.5rem', flex: 1 }}>
        {notificacion && (
          <div
            style={{
              backgroundColor: notificacion.tipo === 'exito' ? '#E6F6ED' : '#FDE8E8',
              color: notificacion.tipo === 'exito' ? '#12633E' : '#9B1C1C',
              borderLeft: `4px solid ${
                notificacion.tipo === 'exito' ? 'var(--color-accent-mint, #4FAE9B)' : '#E02424'
              }`,
              padding: '0.875rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{notificacion.mensaje}</span>
            <button
              onClick={() => setNotificacion(null)}
              style={{
                background: 'none',
                border: 'none',
                color: notificacion.tipo === 'exito' ? '#12633E' : '#9B1C1C',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Buscador modular de usuarios */}
        <EmpleadoBuscador
          onSelectUsuario={(usr) => setUsuarioSeleccionado(usr)}
          onEliminarUsuario={(usr) => setEmpleadoAEliminar(usr)}
          usuarioSeleccionadoId={usuarioSeleccionado?.usuario_id}
          versionActualizacion={versionActualizacion}
        />

        {/* Formulario modular condicional */}
        {usuarioSeleccionado ? (
          <EmpleadoFormulario
            usuario={usuarioSeleccionado}
            onEmpleadoActualizado={handleActualizado}
            onCancelar={() => setUsuarioSeleccionado(null)}
            onDarDeBaja={() => setEmpleadoAEliminar(usuarioSeleccionado)}
          />
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px dashed #BAC7D5',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '1.0625rem',
                fontWeight: 700,
                color: 'var(--color-charcoal, #3B3F45)',
                marginBottom: '0.35rem',
              }}
            >
              Ningún usuario seleccionado
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Utilice el buscador superior para seleccionar a un funcionario por RUT, nombre o correo.
            </div>
          </div>
        )}

        {/* Modal Institucional de Confirmación de Eliminación Lógica */}
        {empleadoAEliminar && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                maxWidth: '520px',
                width: '100%',
                borderTop: '5px solid #C53030',
                padding: '1.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <h3
                style={{
                  margin: '0 0 0.75rem 0',
                  color: 'var(--color-text-dark, #2B2B2B)',
                  fontSize: '1.1875rem',
                  fontWeight: 700,
                }}
              >
                Confirmar Baja de Funcionario
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.5 }}>
                ¿Está seguro de que desea dar de baja al empleado{' '}
                <strong>
                  {empleadoAEliminar.nombres} {empleadoAEliminar.apellidos}
                </strong>{' '}
                (RUT: {empleadoAEliminar.rut})?
              </p>
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  borderLeft: '4px solid #EF4444',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.8125rem',
                  color: '#991B1B',
                  lineHeight: 1.4,
                }}
              >
                <strong>Efectos de la baja lógica:</strong>
                <ul style={{ margin: '0.35rem 0 0 1.25rem', padding: 0 }}>
                  <li>El usuario no podrá volver a iniciar sesión en el sistema.</li>
                  <li>Su estado operativo y disponibilidad territorial quedarán desactivados.</li>
                  <li>Se conservará la integridad referencial de misiones e incidentes pasados.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEmpleadoAEliminar(null)}
                  disabled={eliminando}
                  style={{
                    backgroundColor: 'var(--color-charcoal, #3B3F45)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: eliminando ? 'not-allowed' : 'pointer',
                    borderRadius: 0,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarBaja}
                  disabled={eliminando}
                  style={{
                    backgroundColor: '#C53030',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.625rem 1.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: eliminando ? 'not-allowed' : 'pointer',
                    opacity: eliminando ? 0.65 : 1,
                    borderRadius: 0,
                  }}
                >
                  {eliminando ? 'Dando de baja...' : 'Sí, dar de baja'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Institucional */}
      <footer
        style={{
          backgroundColor: 'var(--color-charcoal-dark, #24272B)',
          color: 'var(--color-text-light, #FFFFFF)',
          padding: '1.25rem 2rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          marginTop: 'auto',
        }}
      >
        Sistema de Gestión de Recursos para Atención de Incidentes (SGRAI) &bull; Municipalidad de Valdivia &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
