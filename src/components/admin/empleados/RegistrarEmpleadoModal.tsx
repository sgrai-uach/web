'use client';

import React, { useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import InlineNotice from '@/components/ui/InlineNotice';
import {
  UserPlus,
  User,
  Shield,
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  RefreshCw,
  Check,
} from 'lucide-react';
import type { CatalogosResponse, EmpleadoUsuario, EstadoOperativo } from '@/types/empleados';
import { useRegistrarEmpleado } from '@/hooks/useRegistrarEmpleado';

const ETIQUETAS_ESTADO_OPERATIVO: Record<EstadoOperativo, string> = {
  disponible: 'Disponible',
  en_mision: 'En Misión',
  en_patrulla: 'En Patrulla',
  descanso: 'Descanso',
  licencia: 'Licencia',
  inactivo: 'Inactivo',
};

export interface RegistrarEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpleadoRegistrado: (nuevoEmpleado: EmpleadoUsuario) => void;
  initialCatalogos?: CatalogosResponse;
}

export default function RegistrarEmpleadoModal({
  isOpen,
  onClose,
  onEmpleadoRegistrado,
  initialCatalogos,
}: RegistrarEmpleadoModalProps) {
  const {
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
  } = useRegistrarEmpleado({
    onSuccess: (nuevo) => {
      resetForm();
      onEmpleadoRegistrado(nuevo);
    },
    initialCatalogos,
  });

  // Limpiar estado al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleClose = () => {
    if (guardando) return;
    resetForm();
    onClose();
  };

  const tieneLongitud = password.length >= 8;
  const tieneLetra = /[a-zA-Z]/.test(password);
  const tieneNumero = /\d/.test(password);

  const actions = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 'var(--space-3, 12px)',
        width: '100%',
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="md"
        onClick={handleClose}
        disabled={guardando}
      >
        Cancelar
      </Button>

      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={() => handleSubmit()}
        disabled={guardando || cargandoCatalogos}
        icon={<UserPlus size={16} />}
      >
        {guardando ? 'Registrando Funcionario...' : 'Registrar Funcionario'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Registrar Nuevo Funcionario Municipal"
      onClose={handleClose}
      actions={actions}
      maxWidth="780px"
    >
      <form
        onSubmit={(e) => handleSubmit(e)}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}
        noValidate
      >
        {/* Alerta general en caso de error de API */}
        {errorGeneral && (
          <InlineNotice variant="error">{errorGeneral}</InlineNotice>
        )}

        {/* =========================================================================
            BLOQUE 1: Identificación y Datos Personales
            ========================================================================= */}
        <section
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: 'var(--space-4, 16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4, 16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h4" variant="h4" color="teal-dark" noMargin>
              1. Identificación y Datos Personales
            </Heading>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4, 16px)',
            }}
          >
            <div>
              <Input
                id="registro-rut"
                label="RUT Chileno"
                placeholder="Ej. 12.345.678-5"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                error={errores.rut}
                helperText="Formato: 12.345.678-K. Validación automática con Módulo 11."
                requiredIndicator
                disabled={guardando}
              />
            </div>

            <div>
              <Input
                id="registro-email"
                type="email"
                label="Correo Electrónico Institucional"
                placeholder="funcionario@valdivia.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errores.email}
                helperText="Correo corporativo municipal o estándar único."
                requiredIndicator
                disabled={guardando}
              />
            </div>

            <div>
              <Input
                id="registro-nombres"
                label="Nombres"
                placeholder="Ej. Juan Carlos"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                error={errores.nombres}
                requiredIndicator
                disabled={guardando}
              />
            </div>

            <div>
              <Input
                id="registro-apellidos"
                label="Apellidos"
                placeholder="Ej. Pérez Gómez"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                error={errores.apellidos}
                requiredIndicator
                disabled={guardando}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                id="registro-telefono"
                type="tel"
                label="Teléfono de Contacto"
                placeholder="+56 9 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                error={errores.telefono}
                helperText="Teléfono chileno móvil (+569...) o de red fija municipal."
                requiredIndicator
                disabled={guardando}
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 2: Asignación Institucional (Rol y Delegación)
            ========================================================================= */}
        <section
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: 'var(--space-4, 16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4, 16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h4" variant="h4" color="teal-dark" noMargin>
              2. Asignación Institucional
            </Heading>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4, 16px)',
            }}
          >
            <div>
              <Select
                id="registro-rol"
                label="Rol Institucional"
                value={rolId}
                onChange={(e) => setRolId(e.target.value)}
                error={errores.rol_id}
                requiredIndicator
                disabled={guardando || cargandoCatalogos}
              >
                <option value="">
                  {cargandoCatalogos ? 'Cargando roles...' : 'Seleccione un rol institucional...'}
                </option>
                {catalogos.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                id="registro-delegacion"
                label="Delegación Territorial"
                value={delegacionId}
                onChange={(e) => setDelegacionId(e.target.value)}
                error={errores.delegacion_id}
                helperText="Asignación territorial obligatoria para todos los funcionarios."
                requiredIndicator
                disabled={guardando || cargandoCatalogos}
              >
                <option value="">
                  {cargandoCatalogos
                    ? 'Cargando delegaciones...'
                    : 'Seleccione una delegación municipal...'}
                </option>
                {catalogos.delegaciones.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Select
                id="registro-estado-operativo"
                label="Estado Operativo (Disponibilidad)"
                value={estadoOperativo}
                onChange={(e) => setEstadoOperativo(e.target.value as EstadoOperativo)}
                helperText="Estado inicial de disponibilidad del funcionario."
                disabled={guardando}
              >
                {(esRolTerreno
                  ? (['disponible', 'en_mision', 'en_patrulla', 'descanso', 'licencia', 'inactivo'] as EstadoOperativo[])
                  : (['disponible', 'descanso', 'licencia', 'inactivo'] as EstadoOperativo[])
                ).map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO_OPERATIVO[estado]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 3: Credenciales de Inicio de Sesión
            ========================================================================= */}
        <section
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: 'var(--space-4, 16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4, 16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h4" variant="h4" color="teal-dark" noMargin>
              3. Credenciales de Inicio de Sesión
            </Heading>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 'var(--font-size-base, 14px)',
              color: 'var(--color-text-muted, #5F676E)',
            }}
          >
            Defina la contraseña inicial con la que el funcionario podrá autenticarse en el SGRAI.
            Puede escribir una clave personalizada o autogenerar una segura.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  id="registro-password"
                  type={mostrarPassword ? 'text' : 'password'}
                  label="Contraseña Inicial"
                  placeholder="Ingrese al menos 8 caracteres alfanuméricos"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errores.password}
                  requiredIndicator
                  disabled={guardando}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setMostrarPassword((prev) => !prev)}
                  title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  disabled={guardando}
                  style={{ minWidth: '40px', padding: '0 10px' }}
                >
                  {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleGenerarPassword}
                  disabled={guardando}
                  icon={<RefreshCw size={14} />}
                >
                  Generar Contraseña Segura
                </Button>
              </div>
            </div>

            {/* Indicador de Fortaleza */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                fontSize: '12px',
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                padding: '8px 12px',
                border: '1px solid var(--border-color-neutral, #DFE3E8)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: tieneLongitud ? 'var(--color-success, #2E7D32)' : 'var(--color-text-muted, #5F676E)',
                  fontWeight: tieneLongitud ? 700 : 500,
                }}
              >
                {tieneLongitud ? <Check size={14} /> : '•'} Mínimo 8 caracteres
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: tieneLetra ? 'var(--color-success, #2E7D32)' : 'var(--color-text-muted, #5F676E)',
                  fontWeight: tieneLetra ? 700 : 500,
                }}
              >
                {tieneLetra ? <Check size={14} /> : '•'} Contiene letras
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: tieneNumero ? 'var(--color-success, #2E7D32)' : 'var(--color-text-muted, #5F676E)',
                  fontWeight: tieneNumero ? 700 : 500,
                }}
              >
                {tieneNumero ? <Check size={14} /> : '•'} Contiene números
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOQUE 4: Ficha Operativa de Terreno (Condicional según rol seleccionado)
            ========================================================================= */}
        {esRolTerreno && (
          <section
            style={{
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderLeft: '4px solid var(--color-accent-mint, #4FAE9B)',
              padding: 'var(--space-4, 16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4, 16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--color-primary-teal, #1B6F7D)" />
              <Heading as="h4" variant="h4" color="teal-dark" noMargin>
                4. Ficha Operativa de Terreno
              </Heading>
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '13px',
                color: 'var(--color-charcoal, #3B3F45)',
              }}
            >
              El rol seleccionado corresponde a personal operativo. Especifique los atributos
              técnicos requeridos para la coordinación y despacho de misiones en terreno.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--space-4, 16px)',
              }}
            >
              <div>
                <Input
                  id="registro-cargo"
                  label="Cargo Operativo"
                  list="datalist-registro-cargos"
                  placeholder="Ej. Delegado de Cuadrilla, Brigadista..."
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  disabled={guardando}
                />
                <datalist id="datalist-registro-cargos">
                  {catalogos.cargos.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <Input
                  id="registro-especialidad"
                  label="Especialidad Técnica"
                  list="datalist-registro-especialidades"
                  placeholder="Ej. Motosierrista, Conductor, Electricista..."
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  disabled={guardando}
                />
                <datalist id="datalist-registro-especialidades">
                  {catalogos.especialidades.map((esp) => (
                    <option key={esp} value={esp} />
                  ))}
                </datalist>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-charcoal, #3B3F45)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    id="registro-disponible-terreno"
                    type="checkbox"
                    checked={disponibleTerreno}
                    onChange={(e) => setDisponibleTerreno(e.target.checked)}
                    disabled={guardando}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: 0,
                      accentColor: 'var(--color-accent-mint, #4FAE9B)',
                    }}
                  />
                  Habilitado y disponible para despliegue y misiones en terreno
                </label>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea
                  id="registro-observaciones"
                  label="Observaciones Técnicas u Operativas (Opcional)"
                  placeholder="Observaciones de equipamiento, habilitaciones médicas o certificaciones..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                  disabled={guardando}
                />
              </div>
            </div>
          </section>
        )}
      </form>
    </Modal>
  );
}
