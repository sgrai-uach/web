'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useEmpleadoForm } from '@/hooks/useEmpleadoForm';
import EmpleadoFormHeader from './EmpleadoFormHeader';
import EmpleadoDatosBasicosSection from './EmpleadoDatosBasicosSection';
import EmpleadoCuentaRolSection from './EmpleadoCuentaRolSection';
import EmpleadoTerrenoSection from './EmpleadoTerrenoSection';
import EmpleadoFormActions from './EmpleadoFormActions';
import InlineNotice from '@/components/ui/InlineNotice';

interface EmpleadoFormularioProps {
  usuario: EmpleadoUsuario;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
  onCancelar: () => void;
  onDarDeBaja?: () => void;
  isModal?: boolean;
}

export default function EmpleadoFormulario({
  usuario,
  onEmpleadoActualizado,
  onCancelar,
  onDarDeBaja,
  isModal = false,
}: EmpleadoFormularioProps) {
  const {
    catalogos,
    rut,
    setRut,
    nombres,
    setNombres,
    apellidos,
    setApellidos,
    email,
    setEmail,
    telefono,
    setTelefono,
    rolId,
    setRolId,
    delegacionId,
    setDelegacionId,
    activo,
    setActivo,
    fechaIngreso,
    setFechaIngreso,
    fechaSalida,
    setFechaSalida,
    especialidad,
    setEspecialidad,
    cargo,
    setCargo,
    esRolTerreno,
    guardando,
    mensajeExito,
    errorMsg,
    handleSubmit,
  } = useEmpleadoForm({ usuario, onEmpleadoActualizado });

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: isModal ? 'transparent' : 'var(--color-white, #FFFFFF)',
        border: isModal ? 'none' : '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: isModal ? 0 : '1.5rem',
        marginBottom: isModal ? 0 : '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4, 16px)',
      }}
    >
      <EmpleadoFormHeader
        usuario={usuario}
        esRolTerreno={esRolTerreno}
        mostrarTitulo={!isModal}
      />

      {!isModal && mensajeExito && (
        <div style={{ marginBottom: '1rem' }}>
          <InlineNotice variant="success">{mensajeExito}</InlineNotice>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginBottom: '1rem' }}>
          <InlineNotice variant="error">{errorMsg}</InlineNotice>
        </div>
      )}

      <EmpleadoDatosBasicosSection
        rut={rut}
        setRut={setRut}
        nombres={nombres}
        setNombres={setNombres}
        apellidos={apellidos}
        setApellidos={setApellidos}
        email={email}
        setEmail={setEmail}
        telefono={telefono}
        setTelefono={setTelefono}
      />

      <EmpleadoCuentaRolSection
        rolId={rolId}
        setRolId={setRolId}
        delegacionId={delegacionId}
        setDelegacionId={setDelegacionId}
        fechaIngreso={fechaIngreso}
        setFechaIngreso={setFechaIngreso}
        activo={activo}
        setActivo={setActivo}
        fechaSalida={fechaSalida}
        setFechaSalida={setFechaSalida}
        roles={catalogos.roles}
        delegaciones={catalogos.delegaciones}
      />

      {esRolTerreno && (
        <EmpleadoTerrenoSection
          especialidad={especialidad}
          setEspecialidad={setEspecialidad}
          cargo={cargo}
          setCargo={setCargo}
          especialidades={catalogos.especialidades}
          cargos={catalogos.cargos}
        />
      )}

      <EmpleadoFormActions
        guardando={guardando}
        onCancelar={onCancelar}
        onDarDeBaja={onDarDeBaja}
        deshabilitarBaja={!usuario.usuario_activo || !activo}
      />
    </form>
  );
}
