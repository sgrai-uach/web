'use client';

import React from 'react';
import { MapPin, Building2, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import { obtenerNombreDelegacion } from '@/lib/utils/delegacionUtils';
import type { DelegacionEventoAtpOption } from '@/types/eventoAtp';
import styles from './EventoAtpForm.module.css';

export interface EventoAtpAlcanceSectionProps {
  delegaciones: DelegacionEventoAtpOption[];
  delegacionIds: string[];
  cargandoCatalogos?: boolean;
  errorDelegacionIds?: string;
  todasSeleccionadas: boolean;
  onToggleDelegacion: (delegacionId: string) => void;
  onSeleccionarTodas: () => void;
  onLimpiarDelegaciones: () => void;
}

export default function EventoAtpAlcanceSection({
  delegaciones,
  delegacionIds,
  cargandoCatalogos = false,
  errorDelegacionIds,
  todasSeleccionadas,
  onToggleDelegacion,
  onSeleccionarTodas,
  onLimpiarDelegaciones,
}: EventoAtpAlcanceSectionProps) {
  const nombresSeleccionados = delegaciones
    .filter((delegacion) => delegacionIds.includes(delegacion.id))
    .map((delegacion) =>
      obtenerNombreDelegacion(delegacion.nombre || delegacion.codigo, delegacion.nombre)
    );

  return (
    <section
      className={styles.section}
      aria-labelledby="evento-atp-alcance-title"
    >
      <div className={styles.sectionHeader}>
        <MapPin
          size={20}
          color="var(--color-primary-teal, #1B6F7D)"
          aria-hidden="true"
        />
        <div className={styles.sectionHeaderText}>
          <Heading as="h2" variant="h3" color="teal-dark" noMargin>
            <span id="evento-atp-alcance-title">
              4. Alcance territorial del evento
            </span>
          </Heading>
          <p className={styles.sectionHint}>
            Seleccione una o varias delegaciones afectadas. Si no selecciona
            ninguna, el evento tendrá alcance comunal centralizado.
          </p>
        </div>
      </div>

      <div className={styles.alcanceToolbar}>
        <div className={styles.alcanceAcciones}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSeleccionarTodas}
            disabled={cargandoCatalogos || delegaciones.length === 0}
          >
            Seleccionar todas
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLimpiarDelegaciones}
            disabled={delegacionIds.length === 0}
          >
            Limpiar selección
          </Button>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
          {delegacionIds.length} de {delegaciones.length} delegaciones
          seleccionadas
        </span>
      </div>

      {cargandoCatalogos ? (
        <p className={styles.sectionHint} role="status">
          Cargando delegaciones municipales...
        </p>
      ) : (
        <div className={styles.delegaciones}>
          {delegaciones.map((delegacion) => {
            const seleccionada = delegacionIds.includes(delegacion.id);
            const nombre = obtenerNombreDelegacion(
              delegacion.nombre || delegacion.codigo,
              delegacion.nombre
            );
            return (
              <label
                key={delegacion.id}
                className={`${styles.delegacionOpcion} ${
                  seleccionada ? styles.delegacionOpcionSeleccionada : ''
                }`}
              >
                <input
                  type="checkbox"
                  value={delegacion.id}
                  checked={seleccionada}
                  onChange={() => onToggleDelegacion(delegacion.id)}
                />
                <span className={styles.delegacionTexto}>
                  <span className={styles.delegacionNombre}>{nombre}</span>
                  {delegacion.codigo && (
                    <span className={styles.delegacionCodigo}>
                      {delegacion.codigo}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {errorDelegacionIds && (
        <p className={styles.errorGeneral} role="alert">
          {errorDelegacionIds}
        </p>
      )}

      <div className={styles.alcanceResumen}>
        {todasSeleccionadas ? (
          <CheckCircle2
            size={18}
            color="var(--color-primary-teal, #1B6F7D)"
            aria-hidden="true"
          />
        ) : (
          <Building2
            size={18}
            color="var(--color-primary-teal, #1B6F7D)"
            aria-hidden="true"
          />
        )}
        <span>
          {nombresSeleccionados.length > 0 ? (
            <>
              <strong>Territorio afectado:</strong>{' '}
              {nombresSeleccionados.join(', ')}.
            </>
          ) : (
            <>
              <strong>Alcance comunal centralizado:</strong> el evento no se
              restringe a una delegación y aplica a todo el territorio de
              Valdivia.
            </>
          )}
        </span>
      </div>
    </section>
  );
}
