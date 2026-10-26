'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Plus, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import PageTitleCard from '@/components/common/PageTitleCard';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import AccesoDenegadoState from '@/components/common/AccesoDenegadoState';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import InlineNotice from '@/components/ui/InlineNotice';
import { useToast } from '@/components/ui/Toast';
import { AuthContext } from '@/context/AuthContext';
import { SimulatedSessionContext } from '@/context/SimulatedSessionContext';
import { usePatrullas } from '@/hooks/usePatrullas';
import { PatrullasFiltros, PatrullaCard, PatrullasSkeleton } from '@/components/mando/patrullas';
import PatrullaCrearModal from './PatrullaCrearModal';
import PatrullaEditarModal from './PatrullaEditarModal';
import PatrullaDesactivarModal from './PatrullaDesactivarModal';
import PatrullaDetalleDrawer from './PatrullaDetalleDrawer';
import type { PatrullaVerificadoraDTO } from '@/types/patrullas';
import styles from './AdminPatrullas.module.css';

export default function AdminPatrullasClient() {
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [patrullaAEditar, setPatrullaAEditar] = useState<PatrullaVerificadoraDTO | null>(null);
  const [patrullaADesactivar, setPatrullaADesactivar] = useState<PatrullaVerificadoraDTO | null>(null);
  const [patrullaADetalle, setPatrullaADetalle] = useState<PatrullaVerificadoraDTO | null>(null);
  const { showSuccess } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const auth = useContext(AuthContext);
  const session = useContext(SimulatedSessionContext);

  // Control de acceso RBAC
  const puedeCrear =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['recursos:crear']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['recursos:crear']) || session.usuarioActivo.esAdmin
      : true;

  const puedeEditar =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['recursos:editar']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['recursos:editar']) || session.usuarioActivo.esAdmin
      : true;

  const puedeDesactivar =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['recursos:eliminar']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['recursos:eliminar']) || session.usuarioActivo.esAdmin
      : true;

  const puedeVer =
    auth?.usuario
      ? auth.tieneAlgunPermiso(['recursos:leer', 'recursos:crear', 'misiones:leer']) || auth.usuario.rolCodigo === 'ADMIN'
      : session?.usuarioActivo
      ? session.hasAnyPermission(['recursos:leer', 'recursos:crear', 'misiones:leer']) || session.usuarioActivo.esAdmin
      : true;

  // Apertura automática si query param ?nuevo=1
  useEffect(() => {
    if (searchParams?.get('nuevo') === '1' && puedeCrear) {
      const timer = setTimeout(() => {
        setModalCrearAbierto(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, puedeCrear]);

  const userId = auth?.usuario?.id || session?.usuarioActivo?.id;

  const {
    patrullas,
    meta,
    cargando,
    error,
    esForbidden,
    conectado,
    filtros,
    setFiltros,
    cambiarPagina,
    cambiarLimite,
    limpiarFiltros,
    recargar,
    hayFiltrosActivos,
    dotacionResumen,
  } = usePatrullas({ userId, enabled: puedeVer });

  const handlePatrullaCreada = (patrulla: PatrullaVerificadoraDTO) => {
    showSuccess(`Patrulla "${patrulla.nombre}" registrada exitosamente.`);
    recargar();
    setModalCrearAbierto(false);
    if (searchParams?.get('nuevo') === '1') {
      router.replace(pathname);
    }
  };

  const handlePatrullaActualizada = (patrullaActualizada: PatrullaVerificadoraDTO) => {
    showSuccess(`Patrulla "${patrullaActualizada.nombre}" modificada exitosamente.`);
    recargar();
    setPatrullaAEditar(null);
    if (patrullaADetalle?.id === patrullaActualizada.id) {
      setPatrullaADetalle(patrullaActualizada);
    }
  };

  const handlePatrullaDesactivada = (patrullaDesactivada: PatrullaVerificadoraDTO) => {
    showSuccess(`Patrulla "${patrullaDesactivada.nombre}" desactivada exitosamente.`);
    recargar();
    setPatrullaADesactivar(null);
    if (patrullaADetalle?.id === patrullaDesactivada.id) {
      setPatrullaADetalle(null);
    }
  };

  const handleCerrarModal = () => {
    setModalCrearAbierto(false);
    if (searchParams?.get('nuevo') === '1') {
      router.replace(pathname);
    }
  };

  if (!puedeVer) {
    const rolActual = auth?.usuario?.rolNombre || session?.usuarioActivo?.rol || 'Usuario';
    return (
      <div className={styles.pageContainer}>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/gestion' },
            { label: 'Administración' },
            { label: 'Patrullas Verificadoras' },
          ]}
        />
        <AccesoDenegadoState
          rolUsuario={rolActual}
          modulo="Patrullas Verificadoras"
          permisoRequerido="misiones:leer o recursos:leer"
          mensajePersonalizado="No dispone de los privilegios requeridos para consultar el registro de patrullas verificadoras. Solicite a un Administrador la asignación del permiso correspondiente."
        />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/gestion' },
          { label: 'Administración' },
          { label: 'Patrullas Verificadoras' },
        ]}
      />

      <PageTitleCard
        title="Patrullas Verificadoras"
        badge={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: 'rgba(27, 111, 125, 0.1)',
                color: 'var(--color-primary-teal, #1B6F7D)',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {meta.total} {meta.total === 1 ? 'patrulla' : 'patrullas'}
            </span>
            <ConnectionStatusBadge connected={conectado} />
          </div>
        }
        description="Unidades móviles de evaluación primaria, triaje rápido y verificación de avisos ciudadanos en terreno de la Municipalidad de Valdivia."
        actionSlot={
          puedeCrear ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalCrearAbierto(true)}
              icon={<Plus size={16} />}
              data-testid="btn-nueva-patrulla"
            >
              Nueva Patrulla
            </Button>
          ) : undefined
        }
      />

      {/* Resumen de Dotación */}
      <div className={styles.dotacionBanner} aria-label="Resumen de dotación de patrullas">
        <div className={styles.dotacionItems}>
          <div className={styles.dotacionStat}>
            <span>Total registradas:</span>
            <span className={styles.dotacionValor}>{dotacionResumen.total}</span>
          </div>
          <div className={styles.dotacionStat}>
            <span>Disponibles:</span>
            <span className={`${styles.dotacionValor} ${styles.dotacionValorDisponible}`}>
              {dotacionResumen.disponibles}
            </span>
          </div>
          <div className={styles.dotacionStat}>
            <span>En Misión / Verificación:</span>
            <span className={`${styles.dotacionValor} ${styles.dotacionValorMision}`}>
              {dotacionResumen.enMision}
            </span>
          </div>
          {dotacionResumen.noDisponibles > 0 && (
            <div className={styles.dotacionStat}>
              <span>No disponibles:</span>
              <span className={`${styles.dotacionValor} ${styles.dotacionValorNoDisponible}`}>
                {dotacionResumen.noDisponibles}
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Contenedor Principal: Filtros + Grid de Patrullas + Paginación */}
      <div className={styles.tableContainer}>
        <PatrullasFiltros
          filtros={filtros}
          onFiltrosChange={setFiltros}
          onLimpiarFiltros={limpiarFiltros}
          onRefrescar={recargar}
          cargando={cargando}
        />

        {error && !esForbidden && (
          <InlineNotice variant="error">{error}</InlineNotice>
        )}

        {cargando ? (
          <PatrullasSkeleton cantidad={6} />
        ) : patrullas.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck size={36} color="var(--color-primary-teal, #1B6F7D)" />}
            title={hayFiltrosActivos ? 'No se encontraron patrullas' : 'No hay patrullas registradas'}
            description={
              hayFiltrosActivos
                ? 'No existen patrullas verificadoras que coincidan con los filtros seleccionados.'
                : 'Actualmente no se registran patrullas verificadoras activas en el sistema municipal.'
            }
            action={
              hayFiltrosActivos ? (
                <Button type="button" variant="secondary" size="sm" onClick={limpiarFiltros}>
                  Limpiar Filtros
                </Button>
              ) : puedeCrear ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setModalCrearAbierto(true)}
                  icon={<Plus size={14} />}
                >
                  Registrar Primera Patrulla
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className={styles.patrullasGrid} data-testid="patrullas-grid">
            {patrullas.map((patrulla) => (
              <PatrullaCard
                key={patrulla.id}
                patrulla={patrulla}
                onSelectMision={(misionId) => {
                  router.push(`/gestion/centro-incidentes?mision=${misionId}`);
                }}
                onSelectIncidente={(incidenteId) => {
                  router.push(`/gestion/centro-incidentes?incidente=${incidenteId}`);
                }}
                onVerDetalle={(p) => setPatrullaADetalle(p)}
                onEditar={(p) => setPatrullaAEditar(p)}
                puedeEditar={puedeEditar}
                onDesactivar={(p) => setPatrullaADesactivar(p)}
                puedeDesactivar={puedeDesactivar}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        <Pagination
          pagina={meta.page}
          totalPaginas={meta.totalPages}
          total={meta.total}
          limite={meta.limit}
          onCambiarPagina={cambiarPagina}
          onCambiarLimite={cambiarLimite}
          opcionesLimite={[10, 20, 50]}
          nombreEntidad="patrullas"
        />
      </div>

      {/* Modal Institucional de Alta de Patrulla Verificadora */}
      <PatrullaCrearModal
        isOpen={modalCrearAbierto}
        onClose={handleCerrarModal}
        onPatrullaCreada={handlePatrullaCreada}
      />

      {/* Modal Institucional de Edición de Patrulla Verificadora */}
      <PatrullaEditarModal
        isOpen={Boolean(patrullaAEditar)}
        patrulla={patrullaAEditar}
        onClose={() => setPatrullaAEditar(null)}
        onPatrullaActualizada={handlePatrullaActualizada}
      />

      {/* Modal Institucional de Desactivación de Patrulla Verificadora */}
      <PatrullaDesactivarModal
        isOpen={Boolean(patrullaADesactivar)}
        patrulla={patrullaADesactivar}
        usuarioActivoId={userId}
        onClose={() => setPatrullaADesactivar(null)}
        onPatrullaDesactivada={handlePatrullaDesactivada}
      />

      {/* Drawer de Ficha Técnica / Detalle Unitario */}
      <PatrullaDetalleDrawer
        patrulla={patrullaADetalle}
        onClose={() => setPatrullaADetalle(null)}
        onEditar={(p) => {
          setPatrullaADetalle(null);
          setPatrullaAEditar(p);
        }}
        puedeEditar={puedeEditar}
        onDesactivar={(p) => {
          setPatrullaADetalle(null);
          setPatrullaADesactivar(p);
        }}
        puedeDesactivar={puedeDesactivar}
      />
    </div>
  );
}
