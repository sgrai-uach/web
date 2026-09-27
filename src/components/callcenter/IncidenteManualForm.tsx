'use client';

import React from 'react';
import {
  DEFAULT_CALLCENTER_OPERADOR_ID,
  type IncidenteCreadoExito,
} from '@/types/incidente-manual';
import { useIncidenteManualForm } from './useIncidenteManualForm';
import OrigenSelector from './form/OrigenSelector';
import AfectacionPrioridadFields from './form/AfectacionPrioridadFields';
import UbicacionFields from './form/UbicacionFields';
import DescripcionField from './form/DescripcionField';
import InformanteFields from './form/InformanteFields';
import FormSubmitActions from './form/FormSubmitActions';
import DuplicadosModal from './DuplicadosModal';
import IncidenteExitoCard from './IncidenteExitoCard';

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
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {form.errorGeneral && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FFEBEE',
            borderLeft: '4px solid #D32F2F',
            color: '#C62828',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {form.errorGeneral}
        </div>
      )}

      <form
        onSubmit={(e) => form.handleSubmit(e, false)}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #DFE3E8',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
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

        <FormSubmitActions
          enviando={form.enviando}
          onLimpiar={form.limpiarFormulario}
        />
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
