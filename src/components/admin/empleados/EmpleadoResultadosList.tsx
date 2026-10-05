'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import EmpleadoResultadoItem from './EmpleadoResultadoItem';

interface EmpleadoResultadosListProps {
  resultados: EmpleadoUsuario[];
  usuarioSeleccionadoId?: string;
  cargando: boolean;
  onSelectUsuario: (usr: EmpleadoUsuario) => void;
}

export default function EmpleadoResultadosList({
  resultados,
  usuarioSeleccionadoId,
  cargando,
  onSelectUsuario,
}: EmpleadoResultadosListProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        borderTop: 'none',
        maxHeight: '260px',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
      }}
    >
      {resultados.length === 0 ? (
        <div
          style={{
            padding: '1rem',
            color: 'var(--color-text-muted, #5F676E)',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          {cargando ? 'Consultando personal municipal...' : 'No se encontraron funcionarios coincidentes.'}
        </div>
      ) : (
        resultados.map((usr) => (
          <EmpleadoResultadoItem
            key={usr.usuario_id}
            usuario={usr}
            estaSeleccionado={usr.usuario_id === usuarioSeleccionadoId}
            onSelect={() => onSelectUsuario(usr)}
          />
        ))
      )}
    </div>
  );
}
