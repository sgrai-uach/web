'use client';

import React from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useEmpleadoForm } from '@/hooks/useEmpleadoForm';
import EmpleadoFormHeader from './EmpleadoFormHeader';
import EmpleadoDatosBasicosSection from './EmpleadoDatosBasicosSection';
import EmpleadoCuentaRolSection from './EmpleadoCuentaRolSection';
import EmpleadoTerrenoSection from './EmpleadoTerrenoSection';
import EmpleadoFormActions from './EmpleadoFormActions';

interface EmpleadoFormularioProps {
  usuario: EmpleadoUsuario;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
  onCancelar: () => void;
}

export default function EmpleadoFormulario({
  usuario,
  onEmpleadoActualizado,
  onCancelar,
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
        backgroundColor: 'var(--color-white, #FFFFFF)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <EmpleadoFormHeader usuario={usuario} esRolTerreno={esRolTerreno} />

      {mensajeExito && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg, #E8F5E9)',
            color: 'var(--color-success, #2E7D32)',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          {mensajeExito}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
            color: 'var(--color-danger, #D32F2F)',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          {errorMsg}
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

      <EmpleadoFormActions guardando={guardando} onCancelar={onCancelar} />
    </form>
  );
}
