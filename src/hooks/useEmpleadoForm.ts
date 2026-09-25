'use client';

import { useState, useEffect } from 'react';
import type { EmpleadoUsuario, UpdatePersonalDTO } from '@/types/empleados';
import { useCatalogos } from './useCatalogos';
import { updatePersonal } from '@/services/empleadosService';
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
 * Custom Hook para gestionar el estado, sincronización, validación y envío del formulario de empleados.
 */
export function useEmpleadoForm({ usuario, onEmpleadoActualizado }: UseEmpleadoFormProps) {
  const { catalogos, cargando: cargandoCatalogos } = useCatalogos();

  const [formData, setFormData] = useState<EmpleadoFormData>({
    rut: usuario.rut,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    email: usuario.email,
    telefono: usuario.telefono || '',
    rolId: usuario.rol_id,
    delegacionId: usuario.delegacion_id || '',
    activo: usuario.usuario_activo,
    fechaIngreso: usuario.fecha_ingreso ? usuario.fecha_ingreso.slice(0, 10) : '',
    fechaSalida: usuario.fecha_salida ? usuario.fecha_salida.slice(0, 10) : '',
    especialidad: usuario.especialidad || '',
    cargo: usuario.cargo || '',
  });

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar formulario cada vez que cambia el usuario seleccionado
  useEffect(() => {
    setFormData({
      rut: usuario.rut,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono || '',
      rolId: usuario.rol_id,
      delegacionId: usuario.delegacion_id || '',
      activo: usuario.usuario_activo,
      fechaIngreso: usuario.fecha_ingreso ? usuario.fecha_ingreso.slice(0, 10) : '',
      fechaSalida: usuario.fecha_salida ? usuario.fecha_salida.slice(0, 10) : '',
      especialidad: usuario.especialidad || '',
      cargo: usuario.cargo || '',
    });
    setMensajeExito('');
    setErrorMsg('');
  }, [usuario]);

  // Actualizador universal de campos del formulario
  const updateField = <K extends keyof EmpleadoFormData>(field: K, value: EmpleadoFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Determinar si el rol actual requiere campos operativos de terreno
  const rolSeleccionado = catalogos.roles.find((r) => r.id === formData.rolId);
  const esRolTerreno = Boolean(
    rolSeleccionado
      ? ['PATRULLA_VERIFICADORA', 'DELEGADO_CUADRILLA', 'BRIGADISTA'].includes(rolSeleccionado.codigo)
      : usuario.es_personal
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg('');
    setMensajeExito('');

    try {
      const payload: UpdatePersonalDTO = {
        rut: formData.rut.trim(),
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono.trim(),
        rol_id: formData.rolId,
        delegacion_id: formData.delegacionId ? formData.delegacionId : null,
        activo: formData.activo,
        fecha_ingreso: formData.fechaIngreso ? formData.fechaIngreso : null,
        fecha_salida: formData.fechaSalida ? formData.fechaSalida : null,
      };

      if (esRolTerreno) {
        payload.especialidad = formData.especialidad.trim() ? formData.especialidad.trim() : null;
        payload.cargo = formData.cargo.trim() ? formData.cargo.trim() : null;
      }

      const targetId = usuario.personal_id || usuario.usuario_id;
      const updatedData = await updatePersonal(targetId, payload);

      setMensajeExito('Los datos han sido actualizados exitosamente en la base de datos.');
      setTimeout(() => {
        onEmpleadoActualizado({
          ...usuario,
          ...updatedData,
          es_personal: esRolTerreno,
        });
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al conectar con la API'));
    } finally {
      setGuardando(false);
    }
  };

  return {
    formData,
    updateField,
    catalogos,
    cargandoCatalogos,
    esRolTerreno,
    guardando,
    mensajeExito,
    errorMsg,
    handleSubmit,
  };
}
