'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import { useAsistentesSociales } from '@/hooks/useAsistentesSociales';
import styles from './SelectorAsistenteSocialDisponible.module.css';

interface SelectorAsistenteSocialDisponibleProps {
  value: string;
  onChange: (asistenteSocialId: string, nombreCompleto?: string) => void;
  disabled?: boolean;
  refreshTrigger?: number;
}

export default function SelectorAsistenteSocialDisponible({
  value,
  onChange,
  disabled = false,
  refreshTrigger = 0,
}: SelectorAsistenteSocialDisponibleProps) {
  const [busqueda, setBusqueda] = useState('');
  const prevTriggerRef = useRef(refreshTrigger);

  const { asistentes, cargando, error, recargar } = useAsistentesSociales({
    pagina: 1,
    limite: 50,
    estadoOperativo: 'disponible',
    busqueda,
  });

  useEffect(() => {
    if (refreshTrigger > 0 && refreshTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = refreshTrigger;
      void recargar();
    }
  }, [refreshTrigger, recargar]);

  const disponibles = asistentes.filter((a) => a.estadoOperativo === 'disponible');

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar asistente social disponible por nombre o RUT..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={disabled}
            aria-label="Buscar asistente social disponible"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void recargar()}
          disabled={cargando || disabled}
          title="Actualizar nómina de disponibles"
        >
          <RefreshCw size={14} />
          <span>Actualizar</span>
        </Button>
      </div>

      <div
        className={styles.listaContainer}
        role="radiogroup"
        aria-label="Asistentes sociales disponibles"
      >
        {cargando ? (
          <div className={styles.estadoMensaje}>Cargando profesionales disponibles...</div>
        ) : error ? (
          <div className={styles.estadoMensaje}>
            No se pudo obtener la nómina de asistentes sociales disponibles. Intenta actualizar.
          </div>
        ) : disponibles.length === 0 ? (
          <div className={styles.estadoMensaje}>
            No hay asistentes sociales con estado disponible en este momento.
          </div>
        ) : (
          disponibles.map((asistente) => {
            const seleccionado = value === asistente.usuarioId;
            return (
              <label
                key={asistente.usuarioId}
                className={`${styles.opcionCard} ${seleccionado ? styles.opcionCardSeleccionada : ''}`}
              >
                <input
                  type="radio"
                  name="asistenteSocialId"
                  value={asistente.usuarioId}
                  checked={seleccionado}
                  disabled={disabled}
                  onChange={() => onChange(asistente.usuarioId, asistente.nombreCompleto)}
                  className={styles.radioInput}
                />
                <div className={styles.opcionInfo}>
                  <div className={styles.opcionHeader}>
                    <span className={styles.nombreProfesional}>{asistente.nombreCompleto}</span>
                    <Chip variant="success" size="sm">
                      Disponible
                    </Chip>
                  </div>
                  <div className={styles.metaProfesional}>
                    <span>RUT: {asistente.rut}</span>
                    {asistente.delegacionNombre && (
                      <span>Delegación: {asistente.delegacionNombre}</span>
                    )}
                    <span>Casos FIBE activos: {asistente.casosFibeAsignados ?? 0}</span>
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
