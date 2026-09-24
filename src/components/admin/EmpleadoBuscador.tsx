'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';

interface EmpleadoBuscadorProps {
  onSelectUsuario: (usuario: EmpleadoUsuario) => void;
  usuarioSeleccionadoId?: string;
}

export default function EmpleadoBuscador({
  onSelectUsuario,
  usuarioSeleccionadoId,
}: EmpleadoBuscadorProps) {
  const [termino, setTermino] = useState('');
  const [delegacionFiltro, setDelegacionFiltro] = useState('');
  const [rolFiltro, setRolFiltro] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('apellidos'); // apellidos | nombres | rut
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [catalogos, setCatalogos] = useState<{ roles: any[]; delegaciones: any[] }>({
    roles: [],
    delegaciones: [],
  });

  const [resultados, setResultados] = useState<EmpleadoUsuario[]>([]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cargar roles y delegaciones para los selectores de filtro
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const res = await fetch('/api/catalogos');
        if (res.ok) {
          const json = await res.json();
          setCatalogos({
            roles: json.data?.roles || [],
            delegaciones: json.data?.delegaciones || [],
          });
        }
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
      }
    }
    cargarCatalogos();
  }, []);

  // Consultar empleados según término y filtros
  useEffect(() => {
    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (termino.trim()) params.set('q', termino.trim());
        if (delegacionFiltro) params.set('delegacion_id', delegacionFiltro);
        if (rolFiltro) params.set('rol_id', rolFiltro);
        params.set('ordenar_por', ordenarPor);
        params.set('orden', orden);

        const res = await fetch(`/api/personal?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setResultados(json.data || []);
        }
      } catch (err) {
        console.error('Error al buscar usuarios:', err);
      } finally {
        setCargando(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [termino, delegacionFiltro, rolFiltro, ordenarPor, orden]);

  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  // Cuando usuarioSeleccionadoId pasa a estar vacío (después de guardar o cancelar), limpiar la barra
  useEffect(() => {
    if (!usuarioSeleccionadoId) {
      setTermino('');
    }
  }, [usuarioSeleccionadoId]);

  return (
    <div
      ref={contenedorRef}
      style={{
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid #DFE3E8',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
      }}
    >
      <div style={{ marginBottom: '0.5rem' }}>
        <label
          htmlFor="buscar-empleado-input"
          style={{
            display: 'block',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--color-charcoal, #3B3F45)',
            marginBottom: '0.35rem',
          }}
        >
          Seleccionar Usuario / Empleado
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            id="buscar-empleado-input"
            type="text"
            value={termino}
            onChange={(e) => {
              setTermino(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            placeholder="Buscar por RUT, Nombre, Apellidos o Correo Electrónico..."
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              border: '1px solid #BAC7D5',
              fontSize: '0.875rem',
              color: 'var(--color-text-dark, #2B2B2B)',
              outline: 'none',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
            autoComplete="off"
          />
          {termino && (
            <button
              type="button"
              onClick={() => setTermino('')}
              style={{
                position: 'absolute',
                right: cargando ? '6rem' : '0.75rem',
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
          {cargando && (
            <span
              style={{
                position: 'absolute',
                right: '0.875rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-primary-teal, #1B6F7D)',
              }}
            >
              Buscando...
            </span>
          )}
        </div>
      </div>

      {/* Controles de Filtros y Ordenamiento */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.875rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #ECEFF3',
        }}
      >
        <div>
          <label htmlFor="filtro-delegacion" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '0.2rem' }}>
            Filtrar por Delegación
          </label>
          <select
            id="filtro-delegacion"
            value={delegacionFiltro}
            onChange={(e) => setDelegacionFiltro(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.6rem',
              fontSize: '0.8125rem',
              border: '1px solid #BAC7D5',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">Todas las delegaciones</option>
            {catalogos.delegaciones.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-rol" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '0.2rem' }}>
            Filtrar por Rol
          </label>
          <select
            id="filtro-rol"
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.6rem',
              fontSize: '0.8125rem',
              border: '1px solid #BAC7D5',
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="">Todos los roles</option>
            {catalogos.roles.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ordenar-por" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#555', marginBottom: '0.2rem' }}>
            Ordenar lista por
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <select
              id="ordenar-por"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              style={{
                flex: 1,
                padding: '0.45rem 0.6rem',
                fontSize: '0.8125rem',
                border: '1px solid #BAC7D5',
                borderRadius: 0,
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="apellidos">Apellidos</option>
              <option value="nombres">Nombres</option>
              <option value="rut">RUT</option>
            </select>
            <button
              type="button"
              onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '0.45rem 0.65rem',
                border: '1px solid #BAC7D5',
                background: '#F1F4F8',
                borderRadius: 0,
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
              title={`Orden: ${orden === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}`}
            >
              {orden === 'asc' ? '▲ A-Z' : '▼ Z-A'}
            </button>
          </div>
        </div>
      </div>

      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '1.5rem',
            right: '1.5rem',
            zIndex: 40,
            backgroundColor: '#FFFFFF',
            border: '1px solid #BAC7D5',
            borderTop: 'none',
            maxHeight: '260px',
            overflowY: 'auto',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          }}
        >
          {resultados.length === 0 ? (
            <div
              style={{
                padding: '1rem',
                color: '#666',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {cargando ? 'Consultando base de datos...' : 'No se encontraron usuarios coincidentes.'}
            </div>
          ) : (
            resultados.map((usr) => {
              const estaSeleccionado = usr.usuario_id === usuarioSeleccionadoId;
              return (
                <div
                  key={usr.usuario_id}
                  onClick={() => {
                    onSelectUsuario(usr);
                    setAbierto(false);
                    setTermino(`${usr.nombres} ${usr.apellidos} (${usr.rut})`);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #ECEFF3',
                    cursor: 'pointer',
                    backgroundColor: estaSeleccionado
                      ? 'var(--color-bg-light, #ECEFF3)'
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-light, #ECEFF3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = estaSeleccionado
                      ? 'var(--color-bg-light, #ECEFF3)'
                      : 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-dark, #2B2B2B)' }}>
                      {usr.nombres} {usr.apellidos}
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {usr.es_personal ? (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            borderRadius: 0,
                          }}
                        >
                          Personal Terreno
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            backgroundColor: '#8D99A6',
                            color: '#FFFFFF',
                            textTransform: 'uppercase',
                            borderRadius: 0,
                          }}
                        >
                          Usuario General
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          backgroundColor: 'var(--color-charcoal, #3B3F45)',
                          color: '#FFFFFF',
                          textTransform: 'uppercase',
                          borderRadius: 0,
                        }}
                      >
                        {usr.rol_nombre || usr.rol_codigo}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: '#666',
                      marginTop: '0.25rem',
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>RUT: <strong>{usr.rut}</strong></span>
                    <span>Email: {usr.email}</span>
                    {usr.delegacion_nombre && <span>Delegación: {usr.delegacion_nombre}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
