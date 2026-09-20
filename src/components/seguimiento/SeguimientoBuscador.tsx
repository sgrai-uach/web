'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/seguimiento.module.css';

interface SeguimientoBuscadorProps {
  codigoInicial?: string;
  onBuscar?: (codigo: string) => void;
  disabled?: boolean;
}

export const SeguimientoBuscador: React.FC<SeguimientoBuscadorProps> = ({
  codigoInicial = '',
  onBuscar,
  disabled = false,
}) => {
  const router = useRouter();
  const [codigo, setCodigo] = useState(codigoInicial);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir dígitos y hasta 8 caracteres
    const valorNumerico = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCodigo(valorNumerico);
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError('Por favor ingresa el código numérico de 8 dígitos.');
      return;
    }

    if (codigo.trim().length !== 8) {
      setError('El código debe contener exactamente 8 dígitos.');
      return;
    }

    if (onBuscar) {
      onBuscar(codigo.trim());
    } else {
      router.push(`/seguimiento/${codigo.trim()}`);
    }
  };

  return (
    <div className={styles.searchCard} role="search" aria-label="Búsqueda de reporte">
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <label htmlFor="codigo-input" className={styles.searchLabel}>
          Ingresa el Código de Seguimiento de tu Reporte
        </label>
        <div className={styles.searchInputsRow}>
          <input
            id="codigo-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            placeholder="Ej: 58291045"
            value={codigo}
            onChange={handleChange}
            disabled={disabled}
            className={styles.searchInput}
            aria-describedby={error ? 'search-error' : undefined}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={disabled || codigo.length !== 8}
            className={styles.btnPrimary}
          >
            Consultar Estado
          </button>
        </div>

        {error && (
          <p id="search-error" className={styles.searchErrorText} role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
