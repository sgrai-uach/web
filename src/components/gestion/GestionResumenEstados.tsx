'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Heading from '@/components/ui/Heading';
import {
  Activity,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  Radio,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { incidentesService } from '@/services/incidentesService';
import { listarAvisos } from '@/services/avisosService';
import { getRecursos } from '@/services/recursosService';
import { listarRolesYPermisos } from '@/services/seguridadService';

interface MetricasMando {
  reportados: number;
  enVerificacion: number;
  enAtencion: number;
  resueltos: number;
}

interface MetricasCallCenter {
  pendientes: number;
  riesgoSla: number;
  totalHoy: number;
}

interface MetricasInventario {
  total: number;
  disponibles: number;
  asignados: number;
}

interface MetricasSeguridad {
  totalRoles: number;
  rolesActivos: number;
}

export default function GestionResumenEstados() {
  const { tieneAlgunPermiso, usuario } = useAuth();

  const puedeVerMando = tieneAlgunPermiso(['incidentes:kanban', 'misiones:asignar']);
  const puedeVerCallCenter = tieneAlgunPermiso(['incidentes:avisos:leer', 'crear_incidente_manual']);
  const puedeVerInventario = tieneAlgunPermiso(['recursos:leer', 'recursos:crear']);
  const puedeVerSeguridad = tieneAlgunPermiso(['seguridad:roles:leer', 'seguridad:roles:gestionar']);
  const puedeVerPersonal = tieneAlgunPermiso(['personal:gestionar']);

  const [metricasMando, setMetricasMando] = useState<MetricasMando>({
    reportados: 0,
    enVerificacion: 0,
    enAtencion: 0,
    resueltos: 0,
  });

  const [metricasCallCenter, setMetricasCallCenter] = useState<MetricasCallCenter>({
    pendientes: 0,
    riesgoSla: 0,
    totalHoy: 0,
  });

  const [metricasInventario, setMetricasInventario] = useState<MetricasInventario>({
    total: 0,
    disponibles: 0,
    asignados: 0,
  });

  const [metricasSeguridad, setMetricasSeguridad] = useState<MetricasSeguridad>({
    totalRoles: 0,
    rolesActivos: 0,
  });

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function cargarMetricas() {
      setCargando(true);
      const promesas: Promise<void>[] = [];

      if (puedeVerMando) {
        promesas.push(
          incidentesService
            .listar({}, usuario?.id)
            .then((res) => {
              if (cancelado || !res.exito || !res.incidentes) return;
              const rep = res.incidentes.filter((i) => i.estado === 'REPORTADO').length;
              const ver = res.incidentes.filter((i) => i.estado === 'VERIFICANDO').length;
              const ate = res.incidentes.filter((i) => i.estado === 'EN_ATENCION').length;
              const resu = res.incidentes.filter(
                (i) => i.estado === 'RESUELTO' || i.estado === 'NO_ABORDABLE'
              ).length;
              setMetricasMando({
                reportados: rep,
                enVerificacion: ver,
                enAtencion: ate,
                resueltos: resu,
              });
            })
            .catch(() => { })
        );
      }

      if (puedeVerCallCenter) {
        promesas.push(
          listarAvisos({ limit: 100 })
            .then((res) => {
              if (cancelado || !res?.data) return;
              const ahora = Date.now();
              const pendientes = res.data.filter(
                (a) => a.estado === 'NO_VERIFICADO' || a.estado === 'PENDIENTE_VERIFICACION'
              );
              const enRiesgo = pendientes.filter((a) => {
                if (typeof a.minutosEnEspera === 'number') {
                  return a.minutosEnEspera >= 15;
                }
                const creado = a.creadoEn ? new Date(a.creadoEn).getTime() : ahora;
                const minutos = (ahora - creado) / (1000 * 60);
                return minutos >= 15;
              }).length;

              setMetricasCallCenter({
                pendientes: pendientes.length,
                riesgoSla: enRiesgo,
                totalHoy: res.data.length,
              });
            })
            .catch(() => { })
        );
      }

      if (puedeVerInventario) {
        promesas.push(
          getRecursos({ pagina: 1, limite: 100 }, usuario?.id)
            .then((res) => {
              if (cancelado || !res?.data) return;
              const total = res.data.length;
              const disp = res.data.filter((r) => r.estado === 'DISPONIBLE').length;
              const asig = res.data.filter((r) => r.estado === 'ASIGNADO').length;
              setMetricasInventario({
                total,
                disponibles: disp,
                asignados: asig,
              });
            })
            .catch(() => { })
        );
      }

      if (puedeVerSeguridad) {
        promesas.push(
          listarRolesYPermisos(usuario?.id || '')
            .then((res) => {
              if (cancelado || !res?.data) return;
              const total = res.data.length;
              const activos = res.data.filter((r) => r.activo).length;
              setMetricasSeguridad({
                totalRoles: total,
                rolesActivos: activos,
              });
            })
            .catch(() => { })
        );
      }

      await Promise.allSettled(promesas);
      if (!cancelado) {
        setCargando(false);
      }
    }

    void cargarMetricas();

    return () => {
      cancelado = true;
    };
  }, [puedeVerMando, puedeVerCallCenter, puedeVerInventario, puedeVerSeguridad, usuario?.id]);

  const hayModulosConMetricas =
    puedeVerMando || puedeVerCallCenter || puedeVerInventario || puedeVerSeguridad || puedeVerPersonal;

  if (!hayModulosConMetricas) {
    return null;
  }

  return (
    <section aria-labelledby="resumen-operativo-heading" style={{ width: '100%' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} color="var(--color-primary-teal, #1B6F7D)" />
        <Heading as="h2" variant="h3" color="teal" noMargin id="resumen-operativo-heading">
          Resumen Operativo en Tiempo Real
        </Heading>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* KPI Centro de Mando */}
        {puedeVerMando && (
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '4px solid var(--color-primary-teal, #1B6F7D)',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <MapPin size={16} />
                Centro de Mando
              </span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                Ciclo ICS
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  Reportados
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-danger, #D32F2F)',
                  }}
                >
                  {cargando ? '—' : metricasMando.reportados}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  En Verificación
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-warning, #E65100)',
                  }}
                >
                  {cargando ? '—' : metricasMando.enVerificacion}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  En Atención
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-primary-teal, #1B6F7D)',
                  }}
                >
                  {cargando ? '—' : metricasMando.enAtencion}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  Resueltos
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-success, #2E7D32)',
                  }}
                >
                  {cargando ? '—' : metricasMando.resueltos}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* KPI Call Center */}
        {puedeVerCallCenter && (
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '4px solid var(--color-warning, #E65100)',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-warning, #E65100)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <PhoneCall size={16} />
                Call Center 1451
              </span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-warning-bg, #FFF3E0)',
                  color: 'var(--color-warning, #E65100)',
                  padding: '2px 8px',
                  fontWeight: 700,
                }}
              >
                Avisos
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  Pendientes
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  {cargando ? '—' : metricasCallCenter.pendientes}
                </span>
              </div>
              <div
                style={{
                  backgroundColor: 'var(--color-danger-bg, #FFEBEE)',
                  padding: '10px',
                  border: '1px solid #FFCDD2',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-danger, #D32F2F)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertTriangle size={12} />
                  Urgente (&gt;15m)
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-danger, #D32F2F)',
                  }}
                >
                  {cargando ? '—' : metricasCallCenter.riesgoSla}
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--color-text-muted, #5F676E)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={14} />
              <span>Total avisos recepcionados: {cargando ? '—' : metricasCallCenter.totalHoy}</span>
            </div>
          </div>
        )}

        {/* KPI Inventario Logístico */}
        {puedeVerInventario && (
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '4px solid var(--color-accent-mint, #4FAE9B)',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Boxes size={16} />
                Inventario Logístico
              </span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                Recursos
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}
            >
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '8px 10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  Total
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  {cargando ? '—' : metricasInventario.total}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-success-bg, #E8F5E9)', padding: '8px 10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-success, #2E7D32)', fontWeight: 600, display: 'block' }}>
                  Disponibles
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-success, #2E7D32)',
                  }}
                >
                  {cargando ? '—' : metricasInventario.disponibles}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '8px 10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  En Terreno
                </span>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-primary-teal, #1B6F7D)',
                  }}
                >
                  {cargando ? '—' : metricasInventario.asignados}
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--color-text-muted, #5F676E)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CheckCircle2 size={14} color="var(--color-success, #2E7D32)" />
              <span>Flota y maquinarias operativas</span>
            </div>
          </div>
        )}

        {/* KPI Seguridad y Roles */}
        {puedeVerSeguridad && (
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '4px solid var(--color-charcoal, #3B3F45)',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-charcoal, #3B3F45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldCheck size={16} />
                Seguridad &amp; RBAC
              </span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                Auditoría
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  Perfiles
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-charcoal, #3B3F45)',
                  }}
                >
                  {cargando ? '—' : metricasSeguridad.totalRoles}
                </span>
              </div>
              <div style={{ backgroundColor: 'var(--color-bg-light, #ECEFF3)', padding: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', display: 'block' }}>
                  Perfiles Activos
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--color-primary-teal, #1B6F7D)',
                  }}
                >
                  {cargando ? '—' : metricasSeguridad.rolesActivos}
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--color-text-muted, #5F676E)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Radio size={14} />
              <span>Matriz de autorizaciones protegida</span>
            </div>
          </div>
        )}

        {/* KPI Personal Municipal */}
        {puedeVerPersonal && (
          <div
            style={{
              backgroundColor: 'var(--color-white, #FFFFFF)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              borderTop: '4px solid var(--color-primary-teal-dark, #14505A)',
              padding: '18px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-teal-dark, #14505A)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} />
                Gestión de Personal
              </span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                Dotación
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted, #5F676E)' }}>
                  Personal y Cuadrillas
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-teal, #1B6F7D)' }}>
                  Activos
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted, #5F676E)' }}>
                Asignación de roles, delegaciones y cuadrillas operativas en terreno.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
