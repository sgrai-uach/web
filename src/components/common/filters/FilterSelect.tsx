'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import styles from './FilterComponents.module.css';

export interface FilterSelectOption {
  valor: string;
  etiqueta: string;
}

interface FilterSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  id: string;
  label: string;
  value: string;
  onChange: (nuevoValor: string) => void;
  options?: readonly FilterSelectOption[] | FilterSelectOption[];
  ariaLabel?: string;
  disabled?: boolean;
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  children,
  ariaLabel,
  disabled = false,
  className = '',
  ...props
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const listboxId = useId();

  // Opciones normalizadas
  const normalizedOptions: FilterSelectOption[] = React.useMemo(() => {
    if (options && options.length > 0) {
      return [...options];
    }
    // Fallback si vinieran children
    const parsed: FilterSelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const optionProps = child.props as { value?: unknown; children?: React.ReactNode };
        parsed.push({
          valor: String(optionProps.value ?? ''),
          etiqueta: String(optionProps.children ?? ''),
        });
      }
    });
    return parsed;
  }, [options, children]);

  // Mostrar buscador interno cuando haya más de 8 opciones
  const tieneBuscador = normalizedOptions.length > 8;

  // Filtrado interno para el combobox
  const opcionesFiltradas = React.useMemo(() => {
    if (!busqueda.trim()) return normalizedOptions;
    const q = busqueda.toLowerCase().trim();
    return normalizedOptions.filter((opt) => opt.etiqueta.toLowerCase().includes(q));
  }, [normalizedOptions, busqueda]);

  // Opción actualmente seleccionada
  const opcionSeleccionada = normalizedOptions.find((opt) => opt.valor === value);
  const etiquetaSeleccionada = opcionSeleccionada
    ? opcionSeleccionada.etiqueta
    : value || 'Seleccionar...';

  // Manejo de clic exterior para cerrar el dropdown
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setBusqueda('');
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Enfocar buscador al abrir si tiene buscador
  useEffect(() => {
    if (isOpen && tieneBuscador) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
    }
  }, [isOpen, tieneBuscador]);

  // Scroll al elemento destacado
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll(`li.${styles.comboboxOption}`);
      const item = items[highlightedIndex] as HTMLElement | undefined;
      if (item && typeof item.scrollIntoView === 'function') {
        item.scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSeleccionar = (nuevoValor: string) => {
    onChange(nuevoValor);
    setIsOpen(false);
    setBusqueda('');
    setHighlightedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
      const currentIndex = opcionesFiltradas.findIndex((opt) => opt.valor === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      const currentIndex = opcionesFiltradas.findIndex((opt) => opt.valor === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : opcionesFiltradas.length - 1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleListboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < opcionesFiltradas.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : opcionesFiltradas.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < opcionesFiltradas.length) {
        handleSeleccionar(opcionesFiltradas[highlightedIndex].valor);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.filterField} ref={wrapperRef}>
      <label htmlFor={id} className={styles.filterLabel}>
        {label}
      </label>

      {/* Select nativo oculto para accesibilidad de formularios y selectores de prueba */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.srOnly}
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        {...props}
      >
        {normalizedOptions.map((opt) => (
          <option key={opt.valor} value={opt.valor}>
            {opt.etiqueta}
          </option>
        ))}
      </select>

      {/* Combobox interactivo personalizado institucional */}
      <div className={`${styles.comboboxWrapper} ${className}`.trim()}>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                const currentIndex = opcionesFiltradas.findIndex((opt) => opt.valor === value);
                setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
              }
            }
          }}
          onKeyDown={handleTriggerKeyDown}
          className={`${styles.comboboxTrigger} ${isOpen ? styles.comboboxTriggerOpen : ''}`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={ariaLabel}
        >
          <span className={styles.comboboxValue}>{etiquetaSeleccionada}</span>
          <span className={isOpen ? styles.comboboxChevronOpen : styles.comboboxChevron}>
            <ChevronDown size={14} aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <div className={styles.comboboxDropdown} onKeyDown={handleListboxKeyDown}>
            {tieneBuscador && (
              <div className={styles.comboboxSearchContainer}>
                <Search size={13} color="var(--color-text-muted, #5F676E)" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder="Buscar opción..."
                  className={styles.comboboxSearchInput}
                  aria-label={`Buscar en ${label}`}
                />
              </div>
            )}

            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label={label}
              className={styles.comboboxListbox}
              tabIndex={tieneBuscador ? -1 : 0}
            >
              {opcionesFiltradas.length > 0 ? (
                opcionesFiltradas.map((opt, idx) => {
                  const seleccionada = opt.valor === value;
                  const destacada = idx === highlightedIndex;
                  return (
                    <li
                      key={opt.valor}
                      role="option"
                      aria-selected={seleccionada}
                      onClick={() => handleSeleccionar(opt.valor)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`${styles.comboboxOption} ${
                        destacada ? styles.comboboxOptionHighlighted : ''
                      } ${seleccionada ? styles.comboboxOptionSelected : ''}`}
                    >
                      <span>{opt.etiqueta}</span>
                      {seleccionada && <Check size={13} color="var(--color-primary-teal, #1B6F7D)" />}
                    </li>
                  );
                })
              ) : (
                <li className={styles.comboboxEmpty}>No se encontraron opciones</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterSelect;
