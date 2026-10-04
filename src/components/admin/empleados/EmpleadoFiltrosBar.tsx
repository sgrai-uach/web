'use client';

import React from 'react';
import { ArrowDownAZ, ArrowUpZA, FilterX } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { CatalogoItem } from '@/types/empleados';
import { selectStyle, labelStyle } from './empleadoStyles';
import { SegmentedButtonGroup } from '@/components/common/filters/SegmentedButtonGroup';

interface EmpleadoFiltrosBarProps {
  delegacionFiltro: string;
  setDelegacionFiltro: (val: string) => void;
  rolFiltro: string;
  setRolFiltro: (val: string) => void;
  estadoOperativoFiltro?: string;
  setEstadoOperativoFiltro?: (val: string) => void;
  especialidadFiltro?: string;
  setEspecialidadFiltro?: (val: string) => void;
  ordenarPor: string;
  setOrdenarPor: (val: string) => void;
  orden: 'asc' | 'desc';
  setOrden: (val: 'asc' | 'desc') => void;
  delegaciones: CatalogoItem[];
  roles: CatalogoItem[];
  especialidades?: string[];
  onLimpiarFiltros?: () => void;
}

const OPCIONES_ESTADO_OPERATIVO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'disponible', etiqueta: 'Disponible' },
  { valor: 'en_mision', etiqueta: 'En Misión' },
  { valor: 'en_patrulla', etiqueta: 'En Patrulla' },
  { valor: 'descanso', etiqueta: 'Descanso' },
  { valor: 'licencia', etiqueta: 'Licencia' },
  { valor: 'inactivo', etiqueta: 'Inactivo' },
] as const;

export default function EmpleadoFiltrosBar({
  delegacionFiltro,
  setDelegacionFiltro,
  rolFiltro,
  setRolFiltro,
  estadoOperativoFiltro = '',
  setEstadoOperativoFiltro,
  especialidadFiltro = '',
  setEspecialidadFiltro,
  ordenarPor,
  setOrdenarPor,
  orden,
  setOrden,
  delegaciones,
  roles,
  especialidades = [],
  onLimpiarFiltros,
}: EmpleadoFiltrosBarProps) {
  // Opciones de segmentación rápida para el Encargado (Patrullas y Asistentes Sociales)
  const rolPatrulla = roles.find((r) => /patrulla/i.test(r.nombre) || /patrulla/i.test(r.codigo))?.id;
  const rolAsistente = roles.find((r) => /social/i.test(r.nombre) || /asistente/i.test(r.codigo))?.id;
  const rolCuadrilla = roles.find((r) => /cuadrilla/i.test(r.nombre) || /delegado/i.test(r.codigo))?.id;

  const quickRoleOptions = [
    { valor: '', etiqueta: 'Todos los Funcionarios' },
    ...(rolPatrulla ? [{ valor: rolPatrulla, etiqueta: 'Patrullas Verificadoras' }] : []),
    ...(rolAsistente ? [{ valor: rolAsistente, etiqueta: 'Asistentes Sociales' }] : []),
    ...(rolCuadrilla ? [{ valor: rolCuadrilla, etiqueta: 'Cuadrillas Operativas' }] : []),
  ];

  const hayFiltrosActivos = Boolean(
    delegacionFiltro ||
    rolFiltro ||
    estadoOperativoFiltro ||
    especialidadFiltro
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-bg-light, #ECEFF3)' }}>
      {/* Botonera segmentada para selección rápida de perfiles operativos de terreno */}
      {quickRoleOptions.length > 1 && (
        <SegmentedButtonGroup
          label="Perfiles Operativos Prioritarios:"
          options={quickRoleOptions}
          value={rolFiltro}
          onChange={(val) => setRolFiltro(val)}
          ariaLabel="Selección rápida de patrullas o asistentes sociales"
        />
      )}

      {/* Cuadrícula de filtros de atributos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}
      >
        <div>
          <label htmlFor="filtro-delegacion" style={labelStyle}>
            Filtrar por Delegación
          </label>
          <select
            id="filtro-delegacion"
            value={delegacionFiltro}
            onChange={(e) => setDelegacionFiltro(e.target.value)}
            style={selectStyle}
          >
            <option value="">Todas las delegaciones</option>
            {delegaciones.map((d) => (
              <option key={d.id} value={d.nombre}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-rol" style={labelStyle}>
            Filtrar por Rol
          </label>
          <select
            id="filtro-rol"
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            style={selectStyle}
          >
            <option value="">Todos los roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        {setEstadoOperativoFiltro && (
          <div>
            <label htmlFor="filtro-estado-operativo" style={labelStyle}>
              Estado Operativo
            </label>
            <select
              id="filtro-estado-operativo"
              value={estadoOperativoFiltro}
              onChange={(e) => setEstadoOperativoFiltro(e.target.value)}
              style={selectStyle}
            >
              {OPCIONES_ESTADO_OPERATIVO.map((opc) => (
                <option key={opc.valor} value={opc.valor}>
                  {opc.etiqueta}
                </option>
              ))}
            </select>
          </div>
        )}

        {setEspecialidadFiltro && especialidades.length > 0 && (
          <div>
            <label htmlFor="filtro-especialidad" style={labelStyle}>
              Especialidad
            </label>
            <select
              id="filtro-especialidad"
              value={especialidadFiltro}
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todas las especialidades</option>
              {especialidades.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="ordenar-por" style={labelStyle}>
            Ordenar lista por
          </label>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <select
              id="ordenar-por"
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            >
              <option value="apellidos">Apellidos</option>
              <option value="nombres">Nombres</option>
              <option value="rut">RUT</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOrden(orden === 'asc' ? 'desc' : 'asc')}
              title={`Orden: ${orden === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}`}
            >
              {orden === 'asc' ? <ArrowDownAZ size={16} /> : <ArrowUpZA size={16} />}
              <span>{orden === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </Button>
          </div>
        </div>
      </div>

      {hayFiltrosActivos && onLimpiarFiltros && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimpiarFiltros}
            style={{
              color: 'var(--color-primary-teal, #1B6F7D)',
              padding: '2px 6px',
              minHeight: 'auto',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
            }}
          >
            <FilterX size={12} aria-hidden="true" />
            <span>Limpiar filtros de personal</span>
          </Button>
        </div>
      )}
    </div>
  );
}
