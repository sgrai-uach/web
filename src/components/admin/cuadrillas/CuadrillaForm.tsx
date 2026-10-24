'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  Search,
  Info,
  ArrowLeft,
  Save,
  RotateCcw,
  X,
} from 'lucide-react';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import InlineNotice from '@/components/ui/InlineNotice';
import { cuadrillasService, CuadrillaServiceError } from '@/services/cuadrillasService';
import { getSocket } from '@/lib/socket/client';
import type {
  CuadrillaCreada,
  DelegacionResumen,
  PersonalCandidatoDelegado,
  FormErrorCuadrilla,
} from '@/types/cuadrilla';
import styles from './CuadrillaForm.module.css';

interface CuadrillaFormProps {
  onSuccess?: (cuadrilla: CuadrillaCreada) => void;
  onCancel?: () => void;
}

export default function CuadrillaForm({ onSuccess, onCancel }: CuadrillaFormProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [delegacionId, setDelegacionId] = useState('');
  const [delegadoSeleccionado, setDelegadoSeleccionado] = useState<PersonalCandidatoDelegado | null>(null);

  // Estados de catálogos y delegados
  const [delegaciones, setDelegaciones] = useState<DelegacionResumen[]>([]);
  const [candidatos, setCandidatos] = useState<PersonalCandidatoDelegado[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // Estados del buscador de delegados
  const [busquedaDelegado, setBusquedaDelegado] = useState('');
  const [desplegableAbierto, setDesplegableAbierto] = useState(false);
  const [buscandoCandidatos, setBuscandoCandidatos] = useState(false);

  // Estados de envío y retroalimentación
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<FormErrorCuadrilla>({});
  const [cuadrillaCreada, setCuadrillaCreada] = useState<CuadrillaCreada | null>(null);

  // Carga inicial de delegaciones y funcionarios de terreno
  useEffect(() => {
    let activo = true;

    async function cargarDatosIniciales() {
      try {
        setCargandoCatalogos(true);
        const [listaDelegaciones, listaCandidatos] = await Promise.all([
          cuadrillasService.obtenerDelegaciones(),
          cuadrillasService.obtenerCandidatosDelegados(),
        ]);

        if (activo) {
          setDelegaciones(listaDelegaciones);
          setCandidatos(listaCandidatos);
        }
      } catch {
        if (activo) {
          setErrores((prev) => ({
            ...prev,
            general: 'No fue posible cargar las delegaciones o el personal disponible. Recargue la página.',
          }));
        }
      } finally {
        if (activo) {
          setCargandoCatalogos(false);
        }
      }
    }

    cargarDatosIniciales();

    return () => {
      activo = false;
    };
  }, []);

  // Cierre del dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickAfuera(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setDesplegableAbierto(false);
      }
    }

    document.addEventListener('mousedown', handleClickAfuera);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, []);

  // Búsqueda dinámica con debounce hacia la API cuando el usuario escribe
  useEffect(() => {
    if (!busquedaDelegado.trim()) return;

    let cancelado = false;
    const timer = setTimeout(async () => {
      try {
        setBuscandoCandidatos(true);
        const resultados = await cuadrillasService.obtenerCandidatosDelegados(busquedaDelegado);
        if (!cancelado) {
          setCandidatos((prev) => {
            // Combinar evitando duplicados
            const idsExistentes = new Set(prev.map((p) => p.id));
            const nuevos = resultados.filter((r) => !idsExistentes.has(r.id));
            return [...resultados, ...nuevos];
          });
        }
      } finally {
        if (!cancelado) {
          setBuscandoCandidatos(false);
        }
      }
    }, 250);

    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busquedaDelegado]);

  // Suscripción WebSocket para sincronización en tiempo real
  useEffect(() => {
    try {
      const socket = getSocket();
      const handler = () => {
        // Evento recibido en la sala de operaciones
      };

      socket.on('cuadrilla:creada', handler);
      return () => {
        socket.off('cuadrilla:creada', handler);
      };
    } catch {
      // Ignorar fallo de socket en entornos de prueba o sin red
    }
  }, []);

  // Filtrado reactivo de candidatos por nombre, apellido o RUT
  const candidatosFiltrados = useMemo(() => {
    if (!busquedaDelegado.trim()) return candidatos;
    const q = busquedaDelegado.toLowerCase().trim();
    return candidatos.filter(
      (c) =>
        c.nombreCompleto.toLowerCase().includes(q) ||
        c.rut.toLowerCase().includes(q) ||
        c.rolNombre.toLowerCase().includes(q) ||
        (c.delegacionNombre && c.delegacionNombre.toLowerCase().includes(q))
    );
  }, [candidatos, busquedaDelegado]);

  // Manejo de selección de delegado
  const handleSeleccionarDelegado = useCallback((candidato: PersonalCandidatoDelegado) => {
    setDelegadoSeleccionado(candidato);
    setBusquedaDelegado('');
    setDesplegableAbierto(false);
    setErrores((prev) => ({ ...prev, usuarioDelegadoId: undefined }));
  }, []);

  // Validaciones del formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: FormErrorCuadrilla = {};

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre de la cuadrilla es obligatorio.';
    } else if (nombreLimpio.length < 3) {
      nuevosErrores.nombre = 'El nombre debe contener al menos 3 caracteres.';
    } else if (nombreLimpio.length > 100) {
      nuevosErrores.nombre = 'El nombre no puede exceder los 100 caracteres.';
    }

    if (!delegacionId) {
      nuevosErrores.delegacionId = 'Debe seleccionar una delegación municipal base.';
    }

    if (!delegadoSeleccionado) {
      nuevosErrores.usuarioDelegadoId = 'Debe asignar a un funcionario como delegado responsable.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario() || !delegadoSeleccionado) {
      return;
    }

    setGuardando(true);
    setErrores({});

    try {
      const creada = await cuadrillasService.crearCuadrilla({
        nombre: nombre.trim(),
        delegacionId,
        usuarioDelegadoId: delegadoSeleccionado.id,
      });

      setCuadrillaCreada(creada);
      if (onSuccess) {
        onSuccess(creada);
      }
    } catch (err: unknown) {
      if (err instanceof CuadrillaServiceError) {
        if (err.campo === 'nombre' || err.status === 409) {
          setErrores({
            nombre: err.message || 'Ya existe una cuadrilla operativa con este nombre.',
          });
        } else {
          setErrores({ general: err.message });
        }
      } else {
        setErrores({
          general: err instanceof Error ? err.message : 'Error inesperado al guardar la cuadrilla.',
        });
      }
    } finally {
      setGuardando(false);
    }
  };

  // Limpiar para crear otra cuadrilla
  const handleReiniciarFormulario = () => {
    setNombre('');
    setDelegacionId('');
    setDelegadoSeleccionado(null);
    setBusquedaDelegado('');
    setErrores({});
    setCuadrillaCreada(null);
  };

  // Navegación al Centro de Mando
  const handleIrAlCentroDeMando = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/gestion/centro-incidentes');
    }
  };

  // -------------------------------------------------------------
  // VISTA DE ÉXITO POST-CREACIÓN
  // -------------------------------------------------------------
  if (cuadrillaCreada) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard} role="region" aria-label="Confirmación de Cuadrilla Creada">
          <div className={styles.successHeader}>
            <CheckCircle2 size={32} className={styles.successIcon} />
            <div>
              <Heading as="h2" variant="h2" color="teal-dark" noMargin>
                Cuadrilla Operativa Registrada Exitosamente
              </Heading>
              <p className={styles.description}>
                La unidad operativa pesada ha sido ingresada al sistema y se encuentra lista para atención de emergencias.
              </p>
            </div>
          </div>

          <table className={styles.summaryTable}>
            <tbody>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}>Nombre de la Cuadrilla</td>
                <td className={styles.summaryValue}>
                  <strong>{cuadrillaCreada.nombre}</strong>
                </td>
              </tr>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}>Delegación Municipal Base</td>
                <td className={styles.summaryValue}>
                  {cuadrillaCreada.delegacion?.nombre || 'Delegación Municipal'}
                </td>
              </tr>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}>Delegado Responsable</td>
                <td className={styles.summaryValue}>
                  {cuadrillaCreada.delegado?.nombre} ({cuadrillaCreada.delegado?.rut}) — {cuadrillaCreada.delegado?.email}
                </td>
              </tr>
              <tr className={styles.summaryRow}>
                <td className={styles.summaryLabel}>Estado Inicial</td>
                <td className={styles.summaryValue}>
                  <span className={styles.badgeDisponible}>
                    {cuadrillaCreada.estado || 'DISPONIBLE'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div className={styles.noticeBox}>
            <Info size={18} className={styles.noticeIcon} />
            <div>
              El funcionario <strong>{cuadrillaCreada.delegado?.nombre}</strong> ha quedado asignado como Delegado de Cuadrilla.
              Podrá ingresar a la aplicación móvil de terreno para coordinar labores de despeje y registrar avances operativos.
            </div>
          </div>

          <div className={styles.actionBar}>
            <Button
              type="button"
              variant="outline"
              onClick={handleReiniciarFormulario}
              icon={<RotateCcw size={16} />}
            >
              Registrar Otra Cuadrilla
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleIrAlCentroDeMando}
              icon={<ArrowLeft size={16} />}
            >
              Ir al Centro de Mando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VISTA PRINCIPAL DEL FORMULARIO
  // -------------------------------------------------------------
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerSection}>
          <Heading as="h2" variant="h2" color="teal-dark" noMargin>
            Alta de Cuadrilla Operativa
          </Heading>
          <p className={styles.description}>
            Registre una nueva cuadrilla municipal para la conformación de cuadrillas de despeje, vialidad y respuesta ante eventos climáticos en la comuna de Valdivia.
          </p>
        </div>

        {errores.general && (
          <div style={{ marginBottom: '16px' }}>
            <InlineNotice variant="danger" title="Error en el formulario">
              {errores.general}
            </InlineNotice>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* 1. Nombre de la Cuadrilla */}
          <div className={styles.fieldGroup}>
            <label htmlFor="nombre-cuadrilla" className={styles.label}>
              Nombre de la Cuadrilla <span className={styles.requiredAsterisk}>*</span>
            </label>
            <Input
              id="nombre-cuadrilla"
              name="nombre"
              type="text"
              placeholder="Ej: Cuadrilla Vías y Calles, Cuadrilla Despeje Norte"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: undefined }));
              }}
              error={errores.nombre}
              maxLength={100}
              requiredIndicator={false}
              autoComplete="off"
            />
            <span className={styles.helperText}>
              Identificador único de la cuadrilla (entre 3 y 100 caracteres).
            </span>
          </div>

          {/* 2. Delegación Base */}
          <div className={styles.fieldGroup}>
            <label htmlFor="delegacion-base" className={styles.label}>
              Delegación Municipal Base <span className={styles.requiredAsterisk}>*</span>
            </label>
            <Select
              id="delegacion-base"
              name="delegacionId"
              value={delegacionId}
              onChange={(e) => {
                setDelegacionId(e.target.value);
                if (errores.delegacionId) {
                  setErrores((prev) => ({ ...prev, delegacionId: undefined }));
                }
              }}
              error={errores.delegacionId}
              disabled={cargandoCatalogos}
            >
              <option value="">
                {cargandoCatalogos ? 'Cargando delegaciones...' : '-- Seleccione una delegación territorial --'}
              </option>
              {delegaciones.map((del) => (
                <option key={del.id} value={del.id}>
                  {del.nombre}
                </option>
              ))}
            </Select>
            <span className={styles.helperText}>
              Jurisdicción comunal de Valdivia (Norte, Sur, Costa o Calle Calle) donde se basa la cuadrilla.
            </span>
          </div>

          {/* 3. Delegado de Cuadrilla (Selector con Buscador) */}
          <div className={styles.fieldGroup} ref={searchContainerRef}>
            <label className={styles.label}>
              Delegado Responsable de Cuadrilla <span className={styles.requiredAsterisk}>*</span>
            </label>

            {delegadoSeleccionado ? (
              <div className={styles.selectedCard}>
                <div className={styles.selectedInfo}>
                  <span className={styles.selectedName}>
                    {delegadoSeleccionado.nombreCompleto}
                  </span>
                  <span className={styles.selectedMeta}>
                    RUT: {delegadoSeleccionado.rut} — Cargo actual: {delegadoSeleccionado.rolNombre}
                    {delegadoSeleccionado.delegacionNombre && ` (${delegadoSeleccionado.delegacionNombre})`}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.changeBtn}
                  onClick={() => {
                    setDelegadoSeleccionado(null);
                    setBusquedaDelegado('');
                    setDesplegableAbierto(true);
                  }}
                >
                  Cambiar Delegado
                </button>
              </div>
            ) : (
              <div className={styles.searchWrapper}>
                <div className={styles.searchInputWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    id="buscar-delegado"
                    className={`${styles.searchInput} ${errores.usuarioDelegadoId ? styles.searchInputError : ''}`}
                    placeholder="Buscar funcionario por nombre, apellido o RUT..."
                    value={busquedaDelegado}
                    onFocus={() => setDesplegableAbierto(true)}
                    onChange={(e) => {
                      setBusquedaDelegado(e.target.value);
                      setDesplegableAbierto(true);
                      if (errores.usuarioDelegadoId) {
                        setErrores((prev) => ({ ...prev, usuarioDelegadoId: undefined }));
                      }
                    }}
                    autoComplete="off"
                  />
                  {busquedaDelegado && (
                    <button
                      type="button"
                      onClick={() => setBusquedaDelegado('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                      title="Limpiar búsqueda"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {errores.usuarioDelegadoId && (
                  <span className={styles.errorText} role="alert">
                    <AlertCircle size={14} /> {errores.usuarioDelegadoId}
                  </span>
                )}

                {desplegableAbierto && (
                  <ul className={styles.dropdownList} role="listbox">
                    {candidatosFiltrados.length > 0 ? (
                      candidatosFiltrados.slice(0, 20).map((candidato) => (
                        <li
                          key={candidato.id}
                          className={styles.dropdownItem}
                          role="option"
                          aria-selected={false}
                          onClick={() => handleSeleccionarDelegado(candidato)}
                        >
                          <span className={styles.dropdownItemName}>
                            {candidato.nombreCompleto}
                          </span>
                          <span className={styles.dropdownItemMeta}>
                            RUT: {candidato.rut} • Cargo actual: {candidato.rolNombre}
                            {candidato.delegacionNombre && ` • Delegación: ${candidato.delegacionNombre}`}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className={styles.dropdownEmpty}>
                        {buscandoCandidatos
                          ? 'Buscando en nómina de funcionarios...'
                          : cargandoCatalogos
                          ? 'Cargando personal disponible...'
                          : 'No se encontraron funcionarios con ese nombre o RUT.'}
                      </li>
                    )}
                  </ul>
                )}

                <span className={styles.helperText}>
                  Seleccione al funcionario a cargo de coordinar la cuadrilla en terreno.
                </span>
              </div>
            )}
          </div>

          {/* Nota Institucional amigable y no técnica */}
          <div className={styles.noticeBox}>
            <Info size={18} className={styles.noticeIcon} />
            <div>
              <strong>Asignación de Responsable:</strong> Si el funcionario seleccionado es actualmente Operario o Brigadista, al guardar la cuadrilla se le designará automáticamente como Delegado de Cuadrilla, permitiéndole coordinar la unidad en terreno desde su dispositivo móvil.
            </div>
          </div>

          {/* Barra de Acciones */}
          <div className={styles.actionBar}>
            <Button
              type="button"
              variant="outline"
              onClick={handleIrAlCentroDeMando}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={guardando}
              icon={guardando ? undefined : <Save size={16} />}
            >
              {guardando ? 'Guardando Cuadrilla...' : 'Guardar Cuadrilla'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
