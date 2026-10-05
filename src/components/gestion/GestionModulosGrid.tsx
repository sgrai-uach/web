'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import {
  Boxes,
  FilePlus2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Users,
  ClipboardList,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface ModuloConfig {
  id: string;
  titulo: string;
  descripcion: string;
  href: string;
  icon: ComponentType<LucideProps>;
  requiredPermissions: string[];
  disabled?: boolean;
  badge?: string;
  accionPrimaria: string;
  accionSecundaria?: {
    label: string;
    href: string;
    permiso?: string;
  };
}

const MODULOS_SISTEMA: ModuloConfig[] = [
  {
    id: 'centro-incidentes',
    titulo: 'Centro de Mando Táctico',
    descripcion:
      'Monitoreo táctico georreferenciado, ciclo ICS de incidentes y asignación en tiempo real de cuadrillas y patrullas de terreno.',
    href: '/gestion/centro-incidentes',
    icon: MapPin,
    requiredPermissions: ['incidentes:kanban', 'misiones:asignar'],
    accionPrimaria: 'Abrir Tablero Kanban',
  },
  {
    id: 'callcenter',
    titulo: 'Bandeja de Call Center',
    descripcion:
      'Recepción, triaje y verificación de avisos telefónicos (1451) o ciudadanos. Verificación de duplicados y despacho a terreno.',
    href: '/gestion/callcenter',
    icon: PhoneCall,
    requiredPermissions: ['incidentes:avisos:leer'],
    accionPrimaria: 'Ver Bandeja de Avisos',
    accionSecundaria: {
      label: '+ Ingreso Manual',
      href: '/gestion/callcenter/manual',
      permiso: 'crear_incidente_manual',
    },
  },
  {
    id: 'callcenter-manual',
    titulo: 'Ingreso Manual de Reportes',
    descripcion:
      'Registro asistido de avisos de emergencia reportados por operadores de call center o personal municipal en terreno.',
    href: '/gestion/callcenter/manual',
    icon: FilePlus2,
    requiredPermissions: ['crear_incidente_manual'],
    accionPrimaria: 'Registrar Incidente Manual',
  },
  {
    id: 'recursos',
    titulo: 'Inventario Logístico',
    descripcion:
      'Control de equipamiento, motobombas, vehículos de emergencia, generadores y dotación de recursos asignados por delegación.',
    href: '/gestion/admin/recursos',
    icon: Boxes,
    requiredPermissions: ['recursos:leer', 'recursos:crear'],
    accionPrimaria: 'Explorar Inventario',
  },
  {
    id: 'empleados',
    titulo: 'Gestión de Personal',
    descripcion:
      'Administración del personal municipal, asignación de cargos, cuadrillas operativas, delegaciones y especialidades técnicas.',
    href: '/gestion/admin/empleados',
    icon: Users,
    requiredPermissions: [
      'personal:gestionar',
      'personal:crear',
      'personal:leer',
      'seguridad:roles:gestionar',
    ],
    accionPrimaria: 'Gestionar Personal',
    accionSecundaria: {
      label: '+ Nuevo Funcionario',
      href: '/gestion/admin/empleados?nuevo=1',
      permiso: 'personal:crear',
    },
  },
  {
    id: 'roles-permisos',
    titulo: 'Roles y Seguridad (RBAC)',
    descripcion:
      'Auditoría y administración de perfiles de usuario, matriz de privilegios y asignación de permisos de acceso al SGRAI.',
    href: '/gestion/admin/roles-permisos',
    icon: ShieldCheck,
    requiredPermissions: ['seguridad:roles:leer', 'seguridad:roles:gestionar'],
    accionPrimaria: 'Configurar Permisos',
  },
  {
    id: 'puntos-criticos',
    titulo: 'Puntos Críticos',
    descripcion:
      'Catastro comunal y edición geoespacial interactiva de sectores vulnerables ante inundaciones, anegamientos y remoción en masa.',
    href: '/gestion/admin/puntos-criticos',
    icon: AlertTriangle,
    requiredPermissions: ['puntos_criticos:leer'],
    accionPrimaria: 'Ver Puntos Críticos',
  },
  {
    id: 'asistente-social',
    titulo: 'Fichas FIBE (Asistencia Social)',
    descripcion:
      'Levantamiento y seguimiento de Fichas Básicas de Emergencia (FIBE) para familias y viviendas afectadas por incidentes.',
    href: '/gestion/asistente-social',
    icon: ClipboardList,
    requiredPermissions: ['asistencia_social:fibe:gestionar', 'fibe:gestionar'],
    disabled: true,
    badge: 'Próximamente',
    accionPrimaria: 'Módulo en Desarrollo',
  },
  {
    id: 'dashboard',
    titulo: 'Dashboard Estratégico',
    descripcion:
      'Métricas consolidadas de respuesta, estadísticas temporales de incidentes y generación de reportes normativos para SENAPRED.',
    href: '/gestion/dashboard',
    icon: BarChart3,
    requiredPermissions: ['dashboard:estadisticas:leer', 'reportes:senapred:exportar'],
    disabled: true,
    badge: 'Próximamente',
    accionPrimaria: 'Módulo en Desarrollo',
  },
];

export default function GestionModulosGrid() {
  const { tieneAlgunPermiso, tienePermiso } = useAuth();

  // Filtrar módulos según los permisos del usuario activo
  const modulosAutorizados = MODULOS_SISTEMA.filter((mod) =>
    tieneAlgunPermiso(mod.requiredPermissions)
  );

  return (
    <section aria-labelledby="modulos-autorizados-heading" style={{ width: '100%' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={20} color="var(--color-primary-teal, #1B6F7D)" />
        <Heading as="h2" variant="h3" color="teal" noMargin id="modulos-autorizados-heading">
          Módulos y Operaciones Disponibles
        </Heading>
      </div>

      {modulosAutorizados.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            padding: '36px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShieldAlert size={40} color="var(--color-warning, #E65100)" />
          <Heading as="h3" variant="h4" color="charcoal-dark" noMargin>
            Sin Módulos Operativos Asignados
          </Heading>
          <p
            style={{
              margin: 0,
              maxWidth: '480px',
              fontSize: '14px',
              color: 'var(--color-text-muted, #5F676E)',
            }}
          >
            Su cuenta no cuenta con permisos activos para operar módulos en este portal. Comuníquese
            con el administrador del sistema para solicitar la asignación de su perfil de rol.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {modulosAutorizados.map((modulo) => {
            const Icon = modulo.icon;
            const tienePermisoAccionSecundaria =
              modulo.accionSecundaria &&
              (!modulo.accionSecundaria.permiso || tienePermiso(modulo.accionSecundaria.permiso));

            return (
              <div
                key={modulo.id}
                style={{
                  backgroundColor: 'var(--color-white, #FFFFFF)',
                  border: '1px solid var(--border-color-neutral, #DFE3E8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.08))',
                  position: 'relative',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        backgroundColor: modulo.disabled
                          ? 'var(--color-bg-light, #ECEFF3)'
                          : 'var(--color-primary-teal, #1B6F7D)',
                        color: modulo.disabled
                          ? 'var(--color-text-muted, #5F676E)'
                          : 'var(--color-white, #FFFFFF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    {modulo.badge && (
                      <span
                        style={{
                          backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                          color: 'var(--color-text-muted, #5F676E)',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {modulo.badge}
                      </span>
                    )}
                  </div>

                  <Heading as="h3" variant="h4" color="teal" noMargin>
                    {modulo.titulo}
                  </Heading>

                  <p
                    style={{
                      margin: '10px 0 20px 0',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: 'var(--color-text-muted, #5F676E)',
                    }}
                  >
                    {modulo.descripcion}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--color-bg-light, #ECEFF3)',
                  }}
                >
                  <Button
                    variant={modulo.disabled ? 'outline' : 'primary'}
                    size="sm"
                    href={modulo.disabled ? undefined : modulo.href}
                    disabled={modulo.disabled}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{modulo.accionPrimaria}</span>
                    {!modulo.disabled && <ArrowRight size={14} />}
                  </Button>

                  {modulo.accionSecundaria && tienePermisoAccionSecundaria && (
                    <Button
                      variant="outline"
                      size="sm"
                      href={modulo.accionSecundaria.href}
                    >
                      {modulo.accionSecundaria.label}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
