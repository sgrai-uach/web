import { useState, useEffect } from 'react';
import type { EmpleadoUsuario, CatalogosResponse } from '@/types/empleados';
import { empleadosService } from '@/services/empleadosService';

interface UseEmpleadoFormProps {
  usuario: EmpleadoUsuario;
  onEmpleadoActualizado: (empleado: EmpleadoUsuario) => void;
}

export function useEmpleadoForm({ usuario, onEmpleadoActualizado }: UseEmpleadoFormProps) {
  const [catalogos, setCatalogos] = useState<CatalogosResponse>({
    roles: [],
    delegaciones: [],
    especialidades: [],
    cargos: [],
  });

  const [rut, setRut] = useState(usuario.rut);
  const [nombres, setNombres] = useState(usuario.nombres);
  const [apellidos, setApellidos] = useState(usuario.apellidos);
  const [email, setEmail] = useState(usuario.email);
  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [rolId, setRolId] = useState(usuario.rol_id);
  const [delegacionId, setDelegacionId] = useState(usuario.delegacion_id || '');
  const [activo, setActivo] = useState(usuario.usuario_activo);
  const [fechaIngreso, setFechaIngreso] = useState(usuario.fecha_ingreso?.slice(0, 10) || '');
  const [fechaSalida, setFechaSalida] = useState(usuario.fecha_salida?.slice(0, 10) || '');
  const [especialidad, setEspecialidad] = useState(usuario.especialidad || '');
  const [cargo, setCargo] = useState(usuario.cargo || '');

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelado = false;
    empleadosService.getCatalogos()
      .then((data) => { if (!cancelado) setCatalogos(data); })
      .catch((err) => console.error('Error cargando catálogos:', err));
    return () => { cancelado = true; };
  }, []);

  const rolSeleccionado = catalogos.roles.find((r) => r.id === rolId);
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
        onEmpleadoActualizado({ ...usuario, ...dataActualizada, es_personal: esRolTerreno });
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al conectar con la API');
    } finally {
      setGuardando(false);
    }
  };

  return {
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
  };
}
