'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CatalogosResponse, EmpleadoUsuario, EstadoOperativo } from '@/types/empleados';
import { empleadosService, EmpleadosServiceError } from '@/services/empleadosService';
import { validarRutChileno, formatearRut } from '@/lib/validations/rut';
import { validarTelefonoChileno, normalizarTelefonoParaEnvio } from '@/lib/validations/telefono';
import { validarFortalezaPassword, generarPasswordSegura } from '@/lib/utils/passwordUtils';

export interface UseRegistrarEmpleadoOptions {
  onSuccess?: (nuevoEmpleado: EmpleadoUsuario) => void;
  initialCatalogos?: CatalogosResponse;
}

export function useRegistrarEmpleado({
  onSuccess,
  initialCatalogos,
}: UseRegistrarEmpleadoOptions = {}) {
  const [catalogos, setCatalogos] = useState<CatalogosResponse>(
    initialCatalogos || {
      roles: [],
      delegaciones: [],
      especialidades: [],
      cargos: [],
    }
  );
  const [cargandoCatalogos, setCargandoCatalogos] = useState(!initialCatalogos);

  // Bloque 1: Identificación y Contacto
  const [rut, setRutState] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  // Bloque 2: Asignación Institucional
  const [rolId, setRolId] = useState('');
  const [delegacionId, setDelegacionId] = useState('');

  // Bloque 3: Credenciales de Inicio de Sesión
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Bloque 4: Ficha Operativa de Terreno
  const [cargo, setCargo] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [disponibleTerreno, setDisponibleTerreno] = useState(true);
  const [observaciones, setObservaciones] = useState('');

  // H11: disponibilidad inicial (reside en `usuario.estado_operativo`)
  const [estadoOperativo, setEstadoOperativo] = useState<EstadoOperativo>('disponible');

  // Estados de control y error
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // Carga reactiva de catálogos si no se suministraron inicialmente
  useEffect(() => {
    if (initialCatalogos) return;
    let cancelado = false;
    empleadosService
      .getCatalogos()
      .then((data) => {
        if (!cancelado) {
          setCatalogos(data);
          setCargandoCatalogos(false);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          console.error('Error cargando catálogos:', err);
          setCargandoCatalogos(false);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [initialCatalogos]);

  // Detección de perfil de terreno según catálogo
  const rolSeleccionado = catalogos.roles.find((r) => r.id === rolId);
  const esRolTerreno = Boolean(
    rolSeleccionado &&
      ['PATRULLA_VERIFICADORA', 'DELEGADO_CUADRILLA', 'BRIGADISTA'].includes(rolSeleccionado.codigo)
  );

  // Manejo de cambio de RUT con formateo automático
  const setRut = useCallback((valor: string) => {
    const formateado = formatearRut(valor, true);
    setRutState(formateado);
    setErrores((prev) => {
      const rest = { ...prev };
      delete rest.rut;
      return rest;
    });
  }, []);

  // Generador aleatorio de contraseña
  const handleGenerarPassword = useCallback(() => {
    const nuevaPassword = generarPasswordSegura();
    setPassword(nuevaPassword);
    setMostrarPassword(true);
    setErrores((prev) => {
      const rest = { ...prev };
      delete rest.password;
      return rest;
    });
  }, []);

  const validarFormulario = useCallback((): boolean => {
    const nuevosErrores: Record<string, string> = {};

    // 1. RUT
    const rutTrim = rut.trim();
    if (!rutTrim) {
      nuevosErrores.rut = 'El RUT es obligatorio';
    } else if (!validarRutChileno(rutTrim)) {
      nuevosErrores.rut = 'El RUT ingresado no es válido (verifique cuerpo y dígito verificador)';
    }

    // 2. Nombres y Apellidos
    if (!nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios';
    }
    if (!apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios';
    }

    // 3. Email
    const emailTrim = email.trim();
    if (!emailTrim) {
      nuevosErrores.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      nuevosErrores.email = 'Formato de correo electrónico no válido';
    }

    // 4. Teléfono
    const telTrim = telefono.trim();
    if (!telTrim) {
      nuevosErrores.telefono = 'El teléfono de contacto es obligatorio';
    } else if (!validarTelefonoChileno(telTrim)) {
      nuevosErrores.telefono = 'Número de teléfono inválido (debe ser un teléfono chileno válido)';
    }

    // 5. Rol
    if (!rolId) {
      nuevosErrores.rol_id = 'Debe seleccionar un rol institucional';
    }

    // 6. Delegación (estrictamente obligatoria)
    if (!delegacionId) {
      nuevosErrores.delegacion_id = 'Debe seleccionar una delegación municipal';
    }

    // 7. Contraseña
    if (!password) {
      nuevosErrores.password = 'La contraseña inicial es obligatoria';
    } else {
      const valPass = validarFortalezaPassword(password);
      if (!valPass.esValida) {
        nuevosErrores.password = valPass.errores.join('. ');
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [rut, nombres, apellidos, email, telefono, rolId, delegacionId, password]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setErrorGeneral(null);

      if (!validarFormulario()) {
        return;
      }

      setGuardando(true);
      try {
        const payload = {
          rut: rut.trim(),
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          email: email.trim().toLowerCase(),
          telefono: normalizarTelefonoParaEnvio(telefono.trim()),
          password,
          rol_id: rolId,
          delegacion_id: delegacionId,
          // H11: la disponibilidad se envía siempre
          estado_operativo: estadoOperativo,
          ...(esRolTerreno && {
            cargo: cargo.trim() || null,
            especialidad: especialidad.trim() || null,
            // La capacidad de terreno sólo aplica al perfil de terreno
            disponible_terreno: disponibleTerreno,
            observaciones: observaciones.trim() || null,
          }),
        };

        const nuevo = await empleadosService.createEmpleado(payload);
        if (onSuccess) {
          onSuccess(nuevo);
        }
      } catch (err: unknown) {
        if (err instanceof EmpleadosServiceError) {
          if (err.detalles && err.detalles.length > 0) {
            const fieldErrors: Record<string, string> = {};
            for (const d of err.detalles) {
              fieldErrors[d.campo] = d.mensaje;
            }
            setErrores((prev) => ({ ...prev, ...fieldErrors }));
          } else {
            setErrorGeneral(err.message);
          }
        } else {
          setErrorGeneral(
            err instanceof Error ? err.message : 'Error inesperado al registrar funcionario.'
          );
        }
      } finally {
        setGuardando(false);
      }
    },
    [
      validarFormulario,
      rut,
      nombres,
      apellidos,
      email,
      telefono,
      password,
      rolId,
      delegacionId,
      esRolTerreno,
      cargo,
      especialidad,
      disponibleTerreno,
      observaciones,
      estadoOperativo,
      onSuccess,
    ]
  );

  const resetForm = useCallback(() => {
    setRutState('');
    setNombres('');
    setApellidos('');
    setEmail('');
    setTelefono('');
    setPassword('');
    setMostrarPassword(false);
    setRolId('');
    setDelegacionId('');
    setCargo('');
    setEspecialidad('');
    setDisponibleTerreno(true);
    setObservaciones('');
    setEstadoOperativo('disponible');
    setErrores({});
    setErrorGeneral(null);
  }, []);

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
    password,
    setPassword,
    mostrarPassword,
    setMostrarPassword,
    rolId,
    setRolId,
    delegacionId,
    setDelegacionId,
    cargo,
    setCargo,
    especialidad,
    setEspecialidad,
    disponibleTerreno,
    setDisponibleTerreno,
    observaciones,
    setObservaciones,
    estadoOperativo,
    setEstadoOperativo,
    esRolTerreno,
    guardando,
    errores,
    errorGeneral,
    handleGenerarPassword,
    handleSubmit,
    resetForm,
  };
}
