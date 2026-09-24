'use client';

import React, { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import EmpleadoBuscador from '@/components/admin/EmpleadoBuscador';
import EmpleadoFormulario from '@/components/admin/EmpleadoFormulario';
import type { EmpleadoUsuario } from '@/types/empleados';

export default function AdminEmpleadosPage() {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<EmpleadoUsuario | null>(null);

  const [notificacion, setNotificacion] = useState<string | null>(null);

  const handleActualizado = (actualizado: EmpleadoUsuario) => {
    setNotificacion(`El empleado ${actualizado.nombres} ${actualizado.apellidos} fue actualizado con éxito.`);
    setUsuarioSeleccionado(null); // Redirige al listado / buscador limpio
    setTimeout(() => setNotificacion(null), 6000);
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
              backgroundColor: '#E6F6ED',
              color: '#12633E',
              borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
              padding: '0.875rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{notificacion}</span>
            <button
              onClick={() => setNotificacion(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#12633E',
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
          usuarioSeleccionadoId={usuarioSeleccionado?.usuario_id}
        />

        {/* Formulario modular condicional */}
        {usuarioSeleccionado ? (
          <EmpleadoFormulario
            usuario={usuarioSeleccionado}
            onEmpleadoActualizado={handleActualizado}
            onCancelar={() => setUsuarioSeleccionado(null)}
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
