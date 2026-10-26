'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Save,
  HardHat,
  Search,
  UserCheck,
  Users,
  Wrench,
  Trash2,
  Plus,
  AlertTriangle,
  AlertCircle,
  Building,
} from 'lucide-react';
import type { CuadrillaItem } from '@/types/cuadrilla';
import { useCuadrillaEditForm } from '@/hooks/useCuadrillaEditForm';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface CuadrillaEditarModalProps {
  isOpen: boolean;
  cuadrilla: CuadrillaItem | null;
  onCerrar: () => void;
  onGuardadoExitoso: (cuadrillaActualizada: CuadrillaItem) => void;
}

export default function CuadrillaEditarModal({
  isOpen,
  cuadrilla,
  onCerrar,
  onGuardadoExitoso,
}: CuadrillaEditarModalProps) {
  const {
    nombre,
    setNombre,
    delegacionId,
    setDelegacionId,
    delegadoSeleccionado,
    setDelegadoSeleccionado,
    recursosSeleccionados,
    trabajadoresSeleccionados,
    delegaciones,
    candidatosDelegados,
    personalDisponible,
    recursosDisponibles,
    cargandoCatalogos,
    guardando,
    errores,
    errorGeneral,
    estaEnMision,
    agregarTrabajador,
    removerTrabajador,
    agregarRecurso,
    removerRecurso,
    cambiarCantidadRecurso,
    handleSubmit,
  } = useCuadrillaEditForm({
    cuadrilla,
    onGuardadoExitoso,
    onCerrar,
  });

  // Estados locales para los selectores de adición
  const [busquedaDelegado, setBusquedaDelegado] = useState('');
  const [desplegableDelegadoAbierto, setDesplegableDelegadoAbierto] = useState(false);
  const delegadoDropdownRef = useRef<HTMLDivElement>(null);

  const [trabajadorSeleccionadoId, setTrabajadorSeleccionadoId] = useState('');
  const [recursoSeleccionadoId, setRecursoSeleccionadoId] = useState('');
  const [cantidadRecurso, setCantidadRecurso] = useState<number>(1);

  // Cerrar dropdown de delegado al hacer clic afuera
  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (
        delegadoDropdownRef.current &&
        !delegadoDropdownRef.current.contains(e.target as Node)
      ) {
        setDesplegableDelegadoAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  // Escuchar tecla Escape para cerrar modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !guardando) {
        onCerrar();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, guardando, onCerrar]);

  if (!isOpen || !cuadrilla) return null;

  // Filtrar candidatos a delegado según búsqueda
  const candidatosFiltrados = candidatosDelegados.filter((c) => {
    if (!busquedaDelegado.trim()) return true;
    const q = busquedaDelegado.toLowerCase();
    return (
      c.nombreCompleto.toLowerCase().includes(q) ||
      c.rut.toLowerCase().includes(q) ||
      c.rolNombre.toLowerCase().includes(q)
    );
  });

  // Filtrar trabajadores disponibles no seleccionados aún
  const idsTrabajadoresAsignados = new Set(trabajadoresSeleccionados.map((t) => t.personalId));
  const personalAptoParaAgregar = personalDisponible.filter(
    (p) => !idsTrabajadoresAsignados.has(p.id)
  );

  // Recurso actualmente seleccionado en el dropdown
  const recursoSeleccionadoObj = recursosDisponibles.find((r) => r.id === recursoSeleccionadoId);

  const handleAgregarTrabajadorClick = () => {
    if (!trabajadorSeleccionadoId) return;
    const funcionario = personalDisponible.find((p) => p.id === trabajadorSeleccionadoId);
    if (funcionario) {
      agregarTrabajador(funcionario);
      setTrabajadorSeleccionadoId('');
    }
  };

  const handleAgregarRecursoClick = () => {
    if (!recursoSeleccionadoId || !recursoSeleccionadoObj) return;
    agregarRecurso(recursoSeleccionadoObj, cantidadRecurso);
    setRecursoSeleccionadoId('');
    setCantidadRecurso(1);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal, 2010)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflowY: 'auto',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={() => !guardando && onCerrar()}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: -1,
        }}
      />

      {/* Contenedor Modal */}
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '92vh',
          backgroundColor: 'var(--color-white)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '0px',
          borderTop: '4px solid var(--color-primary-teal)',
        }}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: 'var(--color-primary-teal-dark, #14505A)',
            color: 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HardHat size={22} style={{ color: 'var(--color-accent-mint)' }} />
            <div>
              <span
                id="modal-title"
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  display: 'block',
                  color: 'var(--color-white)',
                }}
              >
                Editar Cuadrilla Operativa y Dotación
              </span>
              <span style={{ fontSize: '12px', color: '#CCD2D9' }}>
                Actualización de responsables, maquinaria y funcionarios asignados
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            aria-label="Cerrar modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-white)',
              cursor: guardando ? 'not-allowed' : 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Bloqueo si está en misión */}
          {estaEnMision && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                border: '1px solid #FFE0B2',
                color: 'var(--color-warning, #E65100)',
                fontSize: '13px',
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Modificación Bloqueada (409 Conflict):</strong> La cuadrilla se encuentra actualmente en misión activa en terreno ({cuadrilla.estado}). Para preservar la integridad de las faenas operativas, no se permite modificar su dotación hasta que sea liberada.
              </div>
            </div>
          )}

          {/* Error general */}
          {errorGeneral && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                border: '1px solid #FFCDD2',
                color: 'var(--color-danger, #D32F2F)',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>{errorGeneral}</div>
            </div>
          )}

          {/* SECCIÓN 1: DATOS GENERALES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-primary-teal)',
                borderBottom: '1px solid var(--border-color-neutral)',
                paddingBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              1. Datos de Identificación y Jurisdicción
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Nombre de la cuadrilla */}
              <div>
                <label
                  htmlFor="cuadrilla-nombre"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Nombre de la Cuadrilla <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="cuadrilla-nombre"
                  type="text"
                  value={nombre}
                  disabled={estaEnMision || guardando}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Cuadrilla Vías y Despeje Urbano"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    border: errores.nombre
                      ? '1px solid var(--color-danger)'
                      : '1px solid var(--border-color-neutral-dark)',
                    borderRadius: '0px',
                    outline: 'none',
                    backgroundColor: estaEnMision ? '#F1F3F5' : 'var(--color-white)',
                  }}
                />
                {errores.nombre && (
                  <span style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                    {errores.nombre}
                  </span>
                )}
              </div>

              {/* Delegación base */}
              <div>
                <label
                  htmlFor="cuadrilla-delegacion"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Delegación Municipal Base <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <select
                  id="cuadrilla-delegacion"
                  value={delegacionId}
                  disabled={estaEnMision || guardando}
                  onChange={(e) => setDelegacionId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    border: errores.delegacionId
                      ? '1px solid var(--color-danger)'
                      : '1px solid var(--border-color-neutral-dark)',
                    borderRadius: '0px',
                    outline: 'none',
                    backgroundColor: estaEnMision ? '#F1F3F5' : 'var(--color-white)',
                    cursor: estaEnMision ? 'not-allowed' : 'pointer',
                  }}
                >
                  <option value="">Seleccione una delegación</option>
                  {delegaciones.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
                {errores.delegacionId && (
                  <span style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '4px', display: 'block' }}>
                    {errores.delegacionId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DELEGADO RESPONSABLE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-primary-teal)',
                borderBottom: '1px solid var(--border-color-neutral)',
                paddingBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              2. Delegado Responsable de Cuadrilla
            </span>

            {delegadoSeleccionado ? (
              <div
                style={{
                  border: '1px solid var(--border-color-neutral)',
                  padding: '14px 16px',
                  backgroundColor: 'var(--color-bg-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'var(--color-primary-teal)',
                      color: 'var(--color-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '13px', display: 'block', color: 'var(--color-text-dark)' }}>
                      {delegadoSeleccionado.nombreCompleto}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {delegadoSeleccionado.email} {delegadoSeleccionado.rut && `• RUT: ${delegadoSeleccionado.rut}`}
                    </span>
                  </div>
                </div>

                {!estaEnMision && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDelegadoSeleccionado(null);
                      setDesplegableDelegadoAbierto(true);
                    }}
                  >
                    Reasignar Delegado
                  </Button>
                )}
              </div>
            ) : (
              <div ref={delegadoDropdownRef} style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar brigadista por nombre o RUT..."
                    value={busquedaDelegado}
                    onFocus={() => setDesplegableDelegadoAbierto(true)}
                    onChange={(e) => {
                      setBusquedaDelegado(e.target.value);
                      setDesplegableDelegadoAbierto(true);
                    }}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '8px 12px 8px 36px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      border: errores.usuarioDelegadoId
                        ? '1px solid var(--color-danger)'
                        : '1px solid var(--border-color-neutral-dark)',
                      borderRadius: '0px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Dropdown flotante de candidatos */}
                {desplegableDelegadoAbierto && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--border-color-neutral-dark)',
                      zIndex: 'var(--z-dropdown, 500)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    {candidatosFiltrados.length > 0 ? (
                      candidatosFiltrados.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setDelegadoSeleccionado(c);
                            setDesplegableDelegadoAbierto(false);
                            setBusquedaDelegado('');
                          }}
                          style={{
                            padding: '10px 14px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border-color-neutral)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-light)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-white)')}
                        >
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>
                              {c.nombreCompleto}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              RUT: {c.rut} • {c.delegacionNombre || 'Sin delegación'}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: '#E8F5E9',
                              color: '#2E7D32',
                              padding: '2px 6px',
                              fontWeight: 600,
                            }}
                          >
                            {c.rolNombre}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                        No se encontraron brigadistas disponibles
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {errores.usuarioDelegadoId && (
              <span style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '-8px', display: 'block' }}>
                {errores.usuarioDelegadoId}
              </span>
            )}
          </div>

          {/* SECCIÓN 3: TRABAJADORES OPERATIVOS (cuadrilla_personal) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color-neutral)', paddingBottom: '6px' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} />
                3. Dotación de Trabajadores ({trabajadoresSeleccionados.length})
              </span>
            </div>

            {/* Selector de adición de trabajadores */}
            {!estaEnMision && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={trabajadorSeleccionadoId}
                  onChange={(e) => setTrabajadorSeleccionadoId(e.target.value)}
                  aria-label="Seleccionar personal operativo disponible"
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    border: '1px solid var(--border-color-neutral-dark)',
                    borderRadius: '0px',
                    backgroundColor: 'var(--color-white)',
                  }}
                >
                  <option value="">Seleccionar funcionario operativo disponible...</option>
                  {personalAptoParaAgregar.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} {p.rut ? `(${p.rut})` : ''} — {p.cargo || 'Operario'} ({p.especialidad || 'General'})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAgregarTrabajadorClick}
                  disabled={!trabajadorSeleccionadoId}
                  icon={<Plus size={14} />}
                >
                  Añadir
                </Button>
              </div>
            )}

            {/* Lista de trabajadores asignados */}
            <div
              style={{
                border: '1px solid var(--border-color-neutral)',
                backgroundColor: 'var(--color-bg-light)',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {trabajadoresSeleccionados.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {trabajadoresSeleccionados.map((t) => (
                    <div
                      key={t.personalId}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-color-neutral)',
                        backgroundColor: 'var(--color-white)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>
                          {t.nombre}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {t.cargo || 'Operario'} {t.especialidad && `• ${t.especialidad}`} {t.rut && `• RUT: ${t.rut}`}
                        </span>
                      </div>
                      {!estaEnMision && (
                        <button
                          type="button"
                          onClick={() => removerTrabajador(t.personalId)}
                          aria-label={`Remover a ${t.nombre}`}
                          title="Remover de la cuadrilla"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-danger, #D32F2F)',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                  No hay trabajadores asignados a esta cuadrilla. Seleccione funcionarios de la lista superior.
                </div>
              )}
            </div>
            {errores.trabajadores && (
              <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>
                {errores.trabajadores}
              </span>
            )}
          </div>

          {/* SECCIÓN 4: RECURSOS Y VEHÍCULOS (cuadrilla_recurso) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color-neutral)', paddingBottom: '6px' }}>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Wrench size={16} />
                4. Recursos Materiales y Vehículos ({recursosSeleccionados.length})
              </span>
            </div>

            {/* Selector de adición de recursos */}
            {!estaEnMision && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={recursoSeleccionadoId}
                  onChange={(e) => {
                    setRecursoSeleccionadoId(e.target.value);
                    setCantidadRecurso(1);
                  }}
                  aria-label="Seleccionar recurso o vehículo disponible"
                  style={{
                    flex: 1,
                    height: '38px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    border: '1px solid var(--border-color-neutral-dark)',
                    borderRadius: '0px',
                    backgroundColor: 'var(--color-white)',
                  }}
                >
                  <option value="">Seleccionar recurso del inventario municipal...</option>
                  {recursosDisponibles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} {r.esIndividual ? '(Vehículo / Activo 1 unidad)' : `(Stock Disp: ${r.cantidadDisponible ?? r.cantidadInventario})`}
                    </option>
                  ))}
                </select>

                {/* Cantidad si no es individual */}
                {recursoSeleccionadoObj && !recursoSeleccionadoObj.esIndividual && (
                  <input
                    type="number"
                    min={1}
                    max={recursoSeleccionadoObj.cantidadInventario || 99}
                    value={cantidadRecurso}
                    onChange={(e) => setCantidadRecurso(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{
                      width: '70px',
                      height: '38px',
                      padding: '8px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color-neutral-dark)',
                      borderRadius: '0px',
                    }}
                    title="Cantidad a asignar"
                  />
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAgregarRecursoClick}
                  disabled={!recursoSeleccionadoId}
                  icon={<Plus size={14} />}
                >
                  Añadir
                </Button>
              </div>
            )}

            {/* Lista de recursos asignados */}
            <div
              style={{
                border: '1px solid var(--border-color-neutral)',
                backgroundColor: 'var(--color-bg-light)',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {recursosSeleccionados.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recursosSeleccionados.map((r) => (
                    <div
                      key={r.recursoId}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--border-color-neutral)',
                        backgroundColor: 'var(--color-white)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>
                          {r.nombre}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {r.esIndividual ? 'Activo Individual / Vehículo' : 'Insumo Logístico / Herramienta'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {r.esIndividual ? (
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              backgroundColor: 'var(--color-bg-light)',
                              padding: '2px 8px',
                              border: '1px solid var(--border-color-neutral)',
                            }}
                          >
                            1 unidad
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Cant:</span>
                            <input
                              type="number"
                              min={1}
                              disabled={estaEnMision}
                              value={r.cantidad}
                              onChange={(e) =>
                                cambiarCantidadRecurso(
                                  r.recursoId,
                                  Math.max(1, parseInt(e.target.value, 10) || 1)
                                )
                              }
                              style={{
                                width: '60px',
                                height: '28px',
                                fontSize: '12px',
                                padding: '2px 6px',
                                border: '1px solid var(--border-color-neutral-dark)',
                                borderRadius: '0px',
                              }}
                            />
                          </div>
                        )}

                        {!estaEnMision && (
                          <button
                            type="button"
                            onClick={() => removerRecurso(r.recursoId)}
                            aria-label={`Remover recurso ${r.nombre}`}
                            title="Remover de la cuadrilla"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--color-danger, #D32F2F)',
                              padding: '4px',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                  No hay recursos ni vehículos asignados a esta cuadrilla.
                </div>
              )}
            </div>
            {errores.recursos && (
              <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>
                {errores.recursos}
              </span>
            )}
          </div>
        </div>

        {/* Pie del Modal con Acciones */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--color-bg-light)',
            borderTop: '1px solid var(--border-color-neutral)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={guardando || estaEnMision}
            icon={<Save size={16} />}
            style={{
              opacity: estaEnMision ? 0.6 : 1,
              cursor: estaEnMision ? 'not-allowed' : 'pointer',
            }}
          >
            {guardando ? 'Guardando Cambios...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
