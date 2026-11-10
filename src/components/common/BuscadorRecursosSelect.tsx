'use client';

import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Search, X, Check, Boxes } from 'lucide-react';
import styles from './BuscadorRecursosSelect.module.css';

export interface RecursoOpcionItem {
  id: string;
  nombre: string;
  cantidadDisponible?: number;
  cantidadInventario?: number;
  cantidadEnUso?: number;
  esIndividual?: boolean;
  estado?: string;
}

export interface BuscadorRecursosSelectProps {
  recursos: RecursoOpcionItem[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export const BuscadorRecursosSelect: React.FC<BuscadorRecursosSelectProps> = ({
  recursos,
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar o seleccionar insumo...',
  ariaLabel = 'Buscar o seleccionar insumo del inventario',
}) => {
  const [abierto, setAbierto] = useState<boolean>(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Recurso actualmente seleccionado
  const recursoSeleccionado = useMemo(() => {
    return recursos.find((r) => r.id === value) || null;
  }, [recursos, value]);

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAbierto(false);
      }
    }

    if (abierto) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [abierto]);

  // Lista filtrada en tiempo real según el término ingresado
  const recursosFiltrados = useMemo(() => {
    const query = terminoBusqueda.trim().toLowerCase();
    if (!query) return recursos;

    return recursos.filter((r) => {
      const matchNombre = r.nombre.toLowerCase().includes(query);
      const matchEstado = r.estado?.toLowerCase().includes(query);
      return matchNombre || matchEstado;
    });
  }, [recursos, terminoBusqueda]);

  const handleSeleccionar = (recurso: RecursoOpcionItem, estaDeshabilitado: boolean) => {
    if (estaDeshabilitado || disabled) return;
    onChange(recurso.id);
    setTerminoBusqueda(recurso.nombre);
    setAbierto(false);
  };

  const handleLimpiar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setTerminoBusqueda('');
    setAbierto(false);
  };

  const valorDisplay = abierto ? terminoBusqueda : (recursoSeleccionado ? recursoSeleccionado.nombre : '');

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon}>
          <Search size={14} />
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={styles.input}
          placeholder={placeholder}
          aria-label={ariaLabel}
          value={valorDisplay}
          disabled={disabled}
          onFocus={() => {
            if (!disabled) {
              setTerminoBusqueda(recursoSeleccionado ? recursoSeleccionado.nombre : '');
              setAbierto(true);
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            setTerminoBusqueda(val);
            const recursoExacto = recursos.find(
              (r) => r.id === val || (val.trim() && r.nombre.toLowerCase() === val.trim().toLowerCase())
            );
            if (recursoExacto) {
              onChange(recursoExacto.id);
            } else {
              if (!abierto) setAbierto(true);
            }
          }}
        />
        {value && !disabled && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleLimpiar}
            title="Quitar selección"
            aria-label="Quitar selección de insumo"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {abierto && !disabled && (
        <ul id={listboxId} className={styles.dropdownList} role="listbox">
          {recursosFiltrados.length === 0 ? (
            <li className={styles.emptyResults}>
              No se encontraron insumos que coincidan con &quot;{terminoBusqueda}&quot;
            </li>
          ) : (
            recursosFiltrados.map((item) => {
              const stock =
                item.cantidadDisponible !== undefined
                  ? item.cantidadDisponible
                  : (item.cantidadInventario ?? 0) - (item.cantidadEnUso ?? 0);

              const estaDeshabilitado = Boolean(
                (item.esIndividual &&
                  (item.estado === 'EN_MANTENCION' || item.estado === 'NO_DISPONIBLE')) ||
                  (!item.esIndividual && stock <= 0)
              );

              const esElSeleccionado = item.id === value;

              return (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={esElSeleccionado}
                  className={`${styles.dropdownItem} ${
                    esElSeleccionado ? styles.dropdownItemSelected : ''
                  } ${estaDeshabilitado ? styles.dropdownItemDisabled : ''}`}
                  onClick={() => handleSeleccionar(item, estaDeshabilitado)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <Boxes size={14} color="#1B6F7D" style={{ flexShrink: 0 }} />
                    <span className={styles.recursoNombre} title={item.nombre}>
                      {item.nombre}
                    </span>
                    {item.esIndividual && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#3B3F45',
                          color: '#FFFFFF',
                          padding: '1px 4px',
                          textTransform: 'uppercase',
                          flexShrink: 0,
                        }}
                      >
                        Activo
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {item.esIndividual && item.estado === 'EN_MANTENCION' ? (
                      <span style={{ fontSize: '11px', color: '#D32F2F', fontWeight: 600 }}>
                        En Mantención
                      </span>
                    ) : item.esIndividual && item.estado === 'NO_DISPONIBLE' ? (
                      <span style={{ fontSize: '11px', color: '#D32F2F', fontWeight: 600 }}>
                        No Disponible
                      </span>
                    ) : (
                      <span className={styles.recursoStockBadge}>Disp: {stock}</span>
                    )}

                    {esElSeleccionado && <Check size={14} color="#1B6F7D" />}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default BuscadorRecursosSelect;
