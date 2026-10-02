'use client';

import { useState } from 'react';
import type { EmpleadoUsuario } from '@/types/empleados';
import { useCatalogos } from '@/hooks/useCatalogos';
import { empleadosService } from '@/services/empleadosService';
import { getErrorMessage } from '@/lib/utils/errorUtils';

export interface UseEmpleadoFormProps {
  usuario: EmpleadoUsuario;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
}

export interface EmpleadoFormData {
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rolId: string;
  delegacionId: string;
  activo: boolean;
  fechaIngreso: string;
  fechaSalida: string;
  especialidad: string;
  cargo: string;
}

/**
 * Custom Hook para gestionar el formulario de modificación de empleados.
 * Conforme a docs/ARCHITECTURE.md (use{Dominio}Form.ts).
 */
export function useEmpleadoForm({ usuario, onEmpleadoActualizado }: UseEmpleadoFormProps) {
  const { catalogos, cargando: cargandoCatalogos } = useCatalogos();

  const [rut, setRut] = useState(usuario.rut);
  const [nombres, setNombres] = useState(usuario.nombres);
  const [apellidos, setApellidos] = useState(usuario.apellidos);
  const [email, setEmail] = useState(usuario.email);
  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [rolId, setRolId] = useState(usuario.rol_id);
  const [delegacionId, setDelegacionId] = useState(usuario.delegacion_id || '');
  const [activo, setActivo] = useState(usuario.usuario_activo);
  const [fechaIngreso, setFechaIngreso] = useState(usuario.fecha_ingreso ? usuario.fecha_ingreso.slice(0, 10) : '');
  const [fechaSalida, setFechaSalida] = useState(usuario.fecha_salida ? usuario.fecha_salida.slice(0, 10) : '');
  const [especialidad, setEspecialidad] = useState(usuario.especialidad || '');
  const [cargo, setCargo] = useState(usuario.cargo || '');

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar formulario si cambia el usuario seleccionado sin provocar renders en cascada
  const [prevUsuario, setPrevUsuario] = useState(usuario);
  if (usuario !== prevUsuario) {
    setPrevUsuario(usuario);
    setRut(usuario.rut);
    setNombres(usuario.nombres);
    setApellidos(usuario.apellidos);
    setEmail(usuario.email);
    setTelefono(usuario.telefono || '');
    setRolId(usuario.rol_id);
    setDelegacionId(usuario.delegacion_id || '');
    setActivo(usuario.usuario_activo);
    setFechaIngreso(usuario.fecha_ingreso ? usuario.fecha_ingreso.slice(0, 10) : '');
    setFechaSalida(usuario.fecha_salida ? usuario.fecha_salida.slice(0, 10) : '');
    setEspecialidad(usuario.especialidad || '');
    setCargo(usuario.cargo || '');
    setMensajeExito('');
    setErrorMsg('');
  }

  const rolSeleccionado = catalogos.roles.find((r) => r.id === rolId);
  const esRolTerreno = Boolean(
    rolSeleccionado
      ? ['PATRULLA_VERIFICADORA', 'DELEGADO_CUADRILLA', 'BRIGADISTA'].includes(rolSeleccionado.codigo)
      : usuario.es_personal
  );

  const formData: EmpleadoFormData = {
    rut,
    nombres,
    apellidos,
    email,
    telefono,
    rolId,
    delegacionId,
    activo,
    fechaIngreso,
    fechaSalida,
    especialidad,
    cargo,
  };

  const updateField = <K extends keyof EmpleadoFormData>(field: K, value: EmpleadoFormData[K]) => {
    switch (field) {
      case 'rut': setRut(value as string); break;
      case 'nombres': setNombres(value as string); break;
      case 'apellidos': setApellidos(value as string); break;
      case 'email': setEmail(value as string); break;
      case 'telefono': setTelefono(value as string); break;
      case 'rolId': setRolId(value as string); break;
      case 'delegacionId': setDelegacionId(value as string); break;
      case 'activo': setActivo(value as boolean); break;
      case 'fechaIngreso': setFechaIngreso(value as string); break;
      case 'fechaSalida': setFechaSalida(value as string); break;
      case 'especialidad': setEspecialidad(value as string); break;
      case 'cargo': setCargo(value as string); break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg('');
    setMensajeExito('');

    try {
      const payload = {
        rut: rut.trim(),
        nombres,
        apellidos,
        email,
        telefono: telefono.trim(),
        rol_id: rolId,
        delegacion_id: delegacionId || null,
        activo,
        fecha_ingreso: fechaIngreso || null,
        fecha_salida: fechaSalida || null,
        ...(esRolTerreno && {
          especialidad: especialidad.trim() || null,
          cargo: cargo.trim() || null,
        }),
      };

      const targetId = usuario.personal_id || usuario.usuario_id;
      const dataActualizada = await empleadosService.updateEmpleado(targetId, payload);

      setMensajeExito('Los datos han sido actualizados exitosamente en la base de datos.');
      setTimeout(() => {
        onEmpleadoActualizado({
          ...usuario,
          ...dataActualizada,
          es_personal: esRolTerreno,
        });
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al conectar con la API para actualizar los datos'));
    } finally {
      setGuardando(false);
    }
  };

  return {
    catalogos,
    cargandoCatalogos,
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
    formData,
    updateField,
    esRolTerreno,
    guardando,
    mensajeExito,
    errorMsg,
    handleSubmit,
  };
}
