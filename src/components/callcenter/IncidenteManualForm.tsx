'use client';

import React from 'react';
import {
  DEFAULT_CALLCENTER_OPERADOR_ID,
  type IncidenteCreadoExito,
} from '@/types/incidente-manual';
import { useIncidenteManualForm } from '@/hooks/useIncidenteManualForm';
import OrigenSelector from './form/OrigenSelector';
import AfectacionPrioridadFields from './form/AfectacionPrioridadFields';
import UbicacionFields from './form/UbicacionFields';
import DescripcionField from './form/DescripcionField';
import InformanteFields from './form/InformanteFields';
import FormSubmitActions from './form/FormSubmitActions';
import DuplicadosModal from './DuplicadosModal';
import IncidenteExitoCard from './IncidenteExitoCard';
import InlineNotice from '@/components/ui/InlineNotice';
import styles from './IncidenteManualForm.module.css';

interface IncidenteManualFormProps {
  operadorId?: string;
  onExito?: (datos: IncidenteCreadoExito) => void;
}

export default function IncidenteManualForm({
  operadorId = DEFAULT_CALLCENTER_OPERADOR_ID,
  onExito,
}: IncidenteManualFormProps) {
  const form = useIncidenteManualForm({ operadorId, onExito });

  if (form.resultadoExitoso) {
    return (
      <IncidenteExitoCard
        datos={form.resultadoExitoso}
        onNuevoReporte={form.limpiarFormulario}
      />
    );
  }

  return (
    <div className={styles.container}>
      {form.errorGeneral && (
        <div className={styles.noticeWrapper}>
          <InlineNotice variant="error">
            {form.errorGeneral}
          </InlineNotice>
        </div>
      )}

      <form
        onSubmit={(e) => form.handleSubmit(e, false)}
        className={styles.form}
      >
        {/* Columna Izquierda: Origen, Clasificación e Identificación del Informante */}
        <div className={styles.column}>
          <OrigenSelector
            origenReporte={form.origenReporte}
            onSelect={form.setOrigenReporte}
          />

          <AfectacionPrioridadFields
            tipoAfectacion={form.tipoAfectacion}
            setTipoAfectacion={form.setTipoAfectacion}
            prioridad={form.prioridad}
            setPrioridad={form.setPrioridad}
            tiposAfectacion={form.tiposAfectacion}
            cargandoTipos={form.cargandoTipos}
            errorTipo={form.errores.tipoAfectacion}
          />

          <InformanteFields
            informanteNombre={form.informanteNombre}
            setInformanteNombre={form.setInformanteNombre}
            informanteRut={form.informanteRut}
            onRutChange={form.handleRutChange}
            informanteTelefono={form.informanteTelefono}
            setInformanteTelefono={form.setInformanteTelefono}
            errorNombre={form.errores.informanteNombre}
            errorRut={form.errores.informanteRut}
            errorTelefono={form.errores.informanteTelefono}
          />
        </div>

        {/* Columna Derecha: Ubicación con Mapa interactivo y Descripción de la Emergencia */}
        <div className={styles.column}>
          <UbicacionFields
            direccion={form.direccion}
            setDireccion={form.setDireccion}
            coordenadas={form.coordenadas}
            setCoordenadas={form.setCoordenadas}
            onUserSelectLocation={form.handleUserSelectLocation}
            onSincronizarMapaConDireccion={form.handleSincronizarMapaConDireccion}
            geocodificandoMapa={form.geocodificandoMapa}
            duplicadosPreventivos={form.duplicadosPreventivos}
            verificandoDuplicados={form.verificandoDuplicados}
            errorDireccion={form.errores.direccion}
          />

          <DescripcionField
            descripcion={form.descripcion}
            setDescripcion={form.setDescripcion}
            errorDescripcion={form.errores.descripcion}
          />
        </div>

        {/* Pie: Acciones del Formulario abarcando todo el ancho */}
        <div className={styles.fullWidth}>
          <FormSubmitActions
            enviando={form.enviando}
            onLimpiar={form.limpiarFormulario}
          />
        </div>
      </form>

      <DuplicadosModal
        isOpen={form.modalDuplicadosAbierto}
        coincidencias={form.coincidenciasConflicto}
        mensaje={form.mensajeConflicto}
        enviando={form.enviando}
        onOmitir={() => {
          form.setModalDuplicadosAbierto(false);
          form.limpiarFormulario();
        }}
        onContinuar={() => {
          form.handleSubmit(undefined, true);
        }}
      />
    </div>
  );
}
