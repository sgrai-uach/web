'use client';

import React from 'react';
import { CalendarClock, FileText, Tags } from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import {
  NIVELES_ALERTA_EVENTO_ATP,
  TIPOS_AMENAZA_EVENTO_ATP,
  type NivelAlertaEventoAtp,
  type TipoAmenazaEventoAtp,
} from '@/types/eventoAtp';
import styles from './EventoAtpForm.module.css';

export interface EventoAtpDatosSectionProps {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoAmenaza: TipoAmenazaEventoAtp;
  nivelAlerta: NivelAlertaEventoAtp;
  fechaInicio: string;
  fechaTermino: string;
  errorCodigo?: string;
  errorNombre?: string;
  errorDescripcion?: string;
  errorTipoAmenaza?: string;
  errorNivelAlerta?: string;
  errorFechaInicio?: string;
  errorFechaTermino?: string;
  onChangeCodigo: (valor: string) => void;
  onChangeNombre: (valor: string) => void;
  onChangeDescripcion: (valor: string) => void;
  onChangeTipoAmenaza: (valor: TipoAmenazaEventoAtp) => void;
  onChangeNivelAlerta: (valor: NivelAlertaEventoAtp) => void;
  onChangeFechaInicio: (valor: string) => void;
  onChangeFechaTermino: (valor: string) => void;
  onBlur: (campo: string) => void;
}

const opcionesTipoAmenaza = TIPOS_AMENAZA_EVENTO_ATP.map((tipo) => ({
  value: tipo.value,
  label: tipo.label,
}));

export default function EventoAtpDatosSection({
  codigo,
  nombre,
  descripcion,
  tipoAmenaza,
  nivelAlerta,
  fechaInicio,
  fechaTermino,
  errorCodigo,
  errorNombre,
  errorDescripcion,
  errorTipoAmenaza,
  errorNivelAlerta,
  errorFechaInicio,
  errorFechaTermino,
  onChangeCodigo,
  onChangeNombre,
  onChangeDescripcion,
  onChangeTipoAmenaza,
  onChangeNivelAlerta,
  onChangeFechaInicio,
  onChangeFechaTermino,
  onBlur,
}: EventoAtpDatosSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="evento-atp-datos-title">
      <div className={styles.sectionHeader}>
        <FileText
          size={20}
          color="var(--color-primary-teal, #1B6F7D)"
          aria-hidden="true"
        />
        <div className={styles.sectionHeaderText}>
          <Heading as="h2" variant="h3" color="teal-dark" noMargin>
            <span id="evento-atp-datos-title">
              1. Identificación y clasificación del fenómeno
            </span>
          </Heading>
          <p className={styles.sectionHint}>
            Registre el marco oficial del evento. Los campos marcados con
            asterisco son obligatorios.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <Input
          id="evento-atp-codigo"
          label="Código identificador"
          value={codigo}
          onChange={(event) => onChangeCodigo(event.target.value)}
          onBlur={() => onBlur('codigo')}
          placeholder="ATP-2026-0001"
          maxLength={30}
          error={errorCodigo}
          helperText="Opcional. Si se deja vacío, el sistema generará el correlativo ATP-AAAA-####."
        />

        <Input
          id="evento-atp-nombre"
          label="Nombre del evento"
          value={nombre}
          onChange={(event) => onChangeNombre(event.target.value)}
          onBlur={() => onBlur('nombre')}
          placeholder="Ej: Sistema Frontal Mayo 2026"
          maxLength={150}
          requiredIndicator
          error={errorNombre}
          helperText={`${nombre.length}/150 caracteres`}
        />

        <Select
          id="evento-atp-tipo-amenaza"
          label="Tipo de amenaza"
          value={tipoAmenaza}
          onChange={(event) =>
            onChangeTipoAmenaza(event.target.value as TipoAmenazaEventoAtp)
          }
          onBlur={() => onBlur('tipoAmenaza')}
          options={opcionesTipoAmenaza}
          requiredIndicator
          error={errorTipoAmenaza}
          helperText="Clasificación principal del fenómeno que motiva la alerta."
        />

        <div className={styles.fullWidth}>
          <Textarea
            id="evento-atp-descripcion"
            label="Descripción del evento"
            value={descripcion}
            onChange={(event) => onChangeDescripcion(event.target.value)}
            onBlur={() => onBlur('descripcion')}
            placeholder="Describa el fenómeno, su extensión esperada, los impactos probables y las recomendaciones iniciales para la comunidad."
            rows={4}
            maxLength={2000}
            requiredIndicator
            error={errorDescripcion}
            helperText={`${descripcion.length}/2000 caracteres. Mínimo 10 caracteres.`}
          />
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <Tags
          size={20}
          color="var(--color-primary-teal, #1B6F7D)"
          aria-hidden="true"
        />
        <div className={styles.sectionHeaderText}>
          <Heading as="h2" variant="h3" color="teal-dark" noMargin>
            2. Nivel de alerta comunal
          </Heading>
          <p className={styles.sectionHint}>
            Seleccione el nivel oficial de alerta decretado para el territorio.
          </p>
        </div>
      </div>

      <fieldset
        style={{ border: 0, margin: 0, padding: 0 }}
        aria-describedby={
          errorNivelAlerta ? 'evento-atp-nivel-alerta-error' : undefined
        }
      >
        <legend
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Nivel de alerta comunal
        </legend>
        <div className={styles.alertas}>
          {NIVELES_ALERTA_EVENTO_ATP.map((nivel) => {
            const seleccionado = nivelAlerta === nivel.value;
            return (
              <label
                key={nivel.value}
                className={`${styles.alertaOpcion} ${
                  seleccionado ? styles.alertaOpcionSeleccionada : ''
                }`}
              >
                <input
                  type="radio"
                  name="evento-atp-nivel-alerta"
                  value={nivel.value}
                  checked={seleccionado}
                  onChange={() => onChangeNivelAlerta(nivel.value)}
                  onBlur={() => onBlur('nivelAlerta')}
                />
                <span className={styles.alertaTexto}>
                  <span className={styles.alertaLabel}>
                    Alerta {nivel.label}
                  </span>
                  <span className={styles.alertaDescripcion}>
                    {nivel.descripcion}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errorNivelAlerta && (
          <p
            id="evento-atp-nivel-alerta-error"
            className={styles.errorGeneral}
            role="alert"
          >
            {errorNivelAlerta}
          </p>
        )}
      </fieldset>

      <div className={styles.sectionHeader}>
        <CalendarClock
          size={20}
          color="var(--color-primary-teal, #1B6F7D)"
          aria-hidden="true"
        />
        <div className={styles.sectionHeaderText}>
          <Heading as="h2" variant="h3" color="teal-dark" noMargin>
            3. Vigencia estimada del evento
          </Heading>
          <p className={styles.sectionHint}>
            La fecha y hora de término debe ser igual o posterior a la fecha y
            hora de inicio.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <Input
          id="evento-atp-fecha-inicio"
          type="datetime-local"
          label="Fecha y hora de inicio"
          value={fechaInicio}
          onChange={(event) => onChangeFechaInicio(event.target.value)}
          onBlur={() => onBlur('fechaInicio')}
          requiredIndicator
          error={errorFechaInicio}
        />

        <Input
          id="evento-atp-fecha-termino"
          type="datetime-local"
          label="Fecha y hora estimada de término"
          value={fechaTermino}
          onChange={(event) => onChangeFechaTermino(event.target.value)}
          onBlur={() => onBlur('fechaTermino')}
          requiredIndicator
          error={errorFechaTermino}
        />
      </div>
    </section>
  );
}
