'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, PlusCircle, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import InlineNotice from '@/components/ui/InlineNotice';
import {
  useEventoAtpForm,
  traducirCampoEventoAtp,
} from '@/hooks/useEventoAtpForm';
import {
  ESTADO_EVENTO_ATP_LABEL,
  obtenerEtiquetaNivelAlerta,
  obtenerEtiquetaTipoAmenaza,
} from '@/types/eventoAtp';
import EventoAtpDatosSection from './EventoAtpDatosSection';
import EventoAtpAlcanceSection from './EventoAtpAlcanceSection';
import styles from './EventoAtpForm.module.css';

function formatearFechaHora(valor: string): string {
  if (!valor) return 'Sin definir';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha);
}

export default function EventoAtpForm() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const panelPath = pathname.startsWith('/gestion') ? '/gestion/admin' : '/admin';

  const {
    formData,
    touched,
    clientErrors,
    serverFieldErrors,
    serverFieldErrorMap,
    isSubmitting,
    serverError,
    createdEvento,
    delegaciones,
    cargandoCatalogos,
    todasSeleccionadas,
    handleFieldChange,
    handleBlur,
    toggleDelegacion,
    seleccionarTodasDelegaciones,
    limpiarDelegaciones,
    handleReset,
    handleSubmit,
  } = useEventoAtpForm();

  const errorCodigo =
    (touched.codigo ? clientErrors.codigo : undefined) ||
    serverFieldErrorMap.codigo;
  const errorNombre =
    (touched.nombre ? clientErrors.nombre : undefined) ||
    serverFieldErrorMap.nombre;
  const errorDescripcion =
    (touched.descripcion ? clientErrors.descripcion : undefined) ||
    serverFieldErrorMap.descripcion;
  const errorTipoAmenaza =
    (touched.tipoAmenaza ? clientErrors.tipoAmenaza : undefined) ||
    serverFieldErrorMap.tipoAmenaza ||
    serverFieldErrorMap.tipo_amenaza;
  const errorNivelAlerta =
    (touched.nivelAlerta ? clientErrors.nivelAlerta : undefined) ||
    serverFieldErrorMap.nivelAlerta ||
    serverFieldErrorMap.nivel_alerta;
  const errorFechaInicio =
    (touched.fechaInicio ? clientErrors.fechaInicio : undefined) ||
    serverFieldErrorMap.fechaInicio ||
    serverFieldErrorMap.fecha_inicio;
  const errorFechaTermino =
    (touched.fechaTermino ? clientErrors.fechaTermino : undefined) ||
    serverFieldErrorMap.fechaTermino ||
    serverFieldErrorMap.fecha_termino;
  const errorDelegacionIds =
    serverFieldErrorMap.delegacionIds || serverFieldErrorMap.delegacion_ids;

  if (createdEvento) {
    return (
      <div className={styles.successCard} role="status">
        <div className={styles.successIcon}>
          <CheckCircle2
            size={36}
            color="var(--color-success, #2E7D32)"
            aria-hidden="true"
          />
        </div>

        <Heading as="h2" variant="h3" color="teal-dark" noMargin>
          Evento ATP registrado exitosamente
        </Heading>

        <p className={styles.successText}>
          El evento <strong>{createdEvento.nombre}</strong> fue persistido con el
          código oficial{' '}
          <strong style={{ color: 'var(--color-primary-teal, #1B6F7D)' }}>
            {createdEvento.codigo}
          </strong>{' '}
          y ya se encuentra activo para la coordinación operativa y la
          visualización en el mapa.
        </p>

        <div className={styles.successMeta}>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Código</span>
            <span className={styles.successMetaValue}>
              {createdEvento.codigo}
            </span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Estado</span>
            <span className={styles.successMetaValue}>
              {ESTADO_EVENTO_ATP_LABEL[createdEvento.estado]}
            </span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Amenaza</span>
            <span className={styles.successMetaValue}>
              {obtenerEtiquetaTipoAmenaza(createdEvento.tipoAmenaza)}
            </span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Nivel de alerta</span>
            <span className={styles.successMetaValue}>
              {obtenerEtiquetaNivelAlerta(createdEvento.nivelAlerta)}
            </span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Inicio</span>
            <span className={styles.successMetaValue}>
              {formatearFechaHora(createdEvento.fechaInicio)}
            </span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Término estimado</span>
            <span className={styles.successMetaValue}>
              {formatearFechaHora(createdEvento.fechaTermino)}
            </span>
          </div>
          <div className={styles.successMetaItem}>
            <span className={styles.successMetaLabel}>Alcance territorial</span>
            <span className={styles.successMetaValue}>
              {createdEvento.delegaciones.length > 0
                ? createdEvento.delegaciones
                    .map((delegacion) => delegacion.nombre)
                    .join(', ')
                : 'Comunal centralizado'}
            </span>
          </div>
        </div>

        <div className={styles.successActions}>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleReset}
          >
            <PlusCircle size={16} aria-hidden="true" />
            <span>Registrar otro Evento ATP</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => router.push(panelPath)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Volver al Panel de Administración</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
    >
      {serverError && (
        <InlineNotice
          variant="error"
          title="No fue posible registrar el Evento ATP"
        >
          <div style={{ fontWeight: 600 }}>{serverError}</div>
          {serverFieldErrors.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-danger, #D32F2F)',
                }}
              >
                Se detectaron los siguientes campos con errores o información
                inválida:
              </div>
              <ul
                style={{
                  margin: '6px 0 0 0',
                  paddingLeft: '20px',
                  fontSize: '13px',
                }}
              >
                {serverFieldErrors.map((err, index) => (
                  <li key={`${err.campo ?? 'campo'}-${index}`} style={{ marginTop: '4px' }}>
                    {err.campo ? (
                      <strong>{traducirCampoEventoAtp(err.campo)}: </strong>
                    ) : null}
                    {err.mensaje}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </InlineNotice>
      )}

      <EventoAtpDatosSection
        codigo={formData.codigo}
        nombre={formData.nombre}
        descripcion={formData.descripcion}
        tipoAmenaza={formData.tipoAmenaza}
        nivelAlerta={formData.nivelAlerta}
        fechaInicio={formData.fechaInicio}
        fechaTermino={formData.fechaTermino}
        errorCodigo={errorCodigo}
        errorNombre={errorNombre}
        errorDescripcion={errorDescripcion}
        errorTipoAmenaza={errorTipoAmenaza}
        errorNivelAlerta={errorNivelAlerta}
        errorFechaInicio={errorFechaInicio}
        errorFechaTermino={errorFechaTermino}
        onChangeCodigo={(valor) => handleFieldChange('codigo', valor)}
        onChangeNombre={(valor) => handleFieldChange('nombre', valor)}
        onChangeDescripcion={(valor) => handleFieldChange('descripcion', valor)}
        onChangeTipoAmenaza={(valor) => handleFieldChange('tipoAmenaza', valor)}
        onChangeNivelAlerta={(valor) => handleFieldChange('nivelAlerta', valor)}
        onChangeFechaInicio={(valor) => handleFieldChange('fechaInicio', valor)}
        onChangeFechaTermino={(valor) =>
          handleFieldChange('fechaTermino', valor)
        }
        onBlur={handleBlur}
      />

      <EventoAtpAlcanceSection
        delegaciones={delegaciones}
        delegacionIds={formData.delegacionIds}
        cargandoCatalogos={cargandoCatalogos}
        errorDelegacionIds={errorDelegacionIds}
        todasSeleccionadas={todasSeleccionadas}
        onToggleDelegacion={toggleDelegacion}
        onSeleccionarTodas={seleccionarTodasDelegaciones}
        onLimpiarDelegaciones={limpiarDelegaciones}
      />

      <div className={styles.actions}>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.push(panelPath)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          <Save size={16} aria-hidden="true" />
          <span>
            {isSubmitting ? 'Guardando Evento...' : 'Guardar Evento ATP'}
          </span>
        </Button>
      </div>
    </form>
  );
}
