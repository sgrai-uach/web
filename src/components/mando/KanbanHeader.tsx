'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import ConnectionStatusBadge from '@/components/common/ConnectionStatusBadge';
import PageTitleCard from '@/components/common/PageTitleCard';
import titleCardStyles from '@/components/common/PageTitleCard.module.css';
import Button from '@/components/ui/Button';
import {
  ClipboardList,
  ShieldAlert,
  PackagePlus,
  HeartHandshake,
  Plus,
  ChevronDown,
} from 'lucide-react';
import styles from '@/styles/mando.module.css';

interface KanbanHeaderProps {
  totalIncidentesVisibles: number;
  conectado: boolean;
  userId?: string;
  setUserId?: (id: string) => void;
  onAbrirMisiones?: () => void;
  onOpenCrearPrevencion?: () => void;
  onOpenCrearRecuperacion?: () => void;
  vistaActiva?: 'kanban' | 'mapa';
  onCambiarVista?: (vista: 'kanban' | 'mapa') => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  totalIncidentesVisibles,
  conectado,
  onAbrirMisiones,
  onOpenCrearPrevencion,
  onOpenCrearRecuperacion,
  vistaActiva = 'kanban',
  onCambiarVista,
}) => {
  const [menuNuevoEventoAbierto, setMenuNuevoEventoAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuNuevoEventoAbierto(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuNuevoEventoAbierto(false);
      }
    }

    if (menuNuevoEventoAbierto) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuNuevoEventoAbierto]);

  return (
    <div className={styles.mandoHeaderWrapper}>
      {/* Breadcrumbs Institucionales */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/gestion' },
          { label: 'Operaciones' },
          { label: 'Centro de Mando' },
        ]}
      />

      {/* Tarjeta de Título Institucional */}
      <PageTitleCard
        title="Centro de Mando"
        badge={
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className={titleCardStyles.badge}>
              {`${totalIncidentesVisibles} ${totalIncidentesVisibles === 1 ? 'incidente' : 'incidentes'}`}
            </span>
            <ConnectionStatusBadge connected={conectado} />
          </div>
        }
        description={`Dirección de Gestión de Riesgos de Desastres — Tablero Táctico ICS (${totalIncidentesVisibles} ${totalIncidentesVisibles === 1 ? 'incidente cargado' : 'incidentes cargados'})`}
        actionSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {onAbrirMisiones && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onAbrirMisiones}
                title="Abrir panel de misiones operativas"
              >
                <ClipboardList size={14} style={{ marginRight: '5px' }} />
                <span>Misiones Operativas</span>
              </Button>
            )}

            {/* Menú desplegable compacto para nuevos eventos (Opción B) */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setMenuNuevoEventoAbierto((prev) => !prev)}
                aria-expanded={menuNuevoEventoAbierto}
                aria-haspopup="true"
                title="Opciones de creación de eventos operacionales"
              >
                <Plus size={14} style={{ marginRight: '4px' }} />
                <span>Nuevo Evento</span>
                <ChevronDown
                  size={14}
                  style={{
                    marginLeft: '4px',
                    transform: menuNuevoEventoAbierto ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s ease',
                  }}
                />
              </Button>

              {menuNuevoEventoAbierto && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                    boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
                    zIndex: 'var(--z-dropdown, 500)',
                    minWidth: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '4px 0',
                  }}
                >
                  {onOpenCrearPrevencion && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuNuevoEventoAbierto(false);
                        onOpenCrearPrevencion();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: 'var(--color-charcoal, #3B3F45)',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-light, #ECEFF3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <ShieldAlert size={16} color="#B45309" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>Nuevo Evento de Prevención</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                          Puntos críticos y patrulla preventiva
                        </span>
                      </div>
                    </button>
                  )}

                  {onOpenCrearRecuperacion && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuNuevoEventoAbierto(false);
                        onOpenCrearRecuperacion();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: 'var(--color-charcoal, #3B3F45)',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-light, #ECEFF3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <PackagePlus size={16} color="#1B6F7D" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>Nuevo Evento de Recuperación</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                          Despacho territorial con insumos
                        </span>
                      </div>
                    </button>
                  )}

                  <Link
                    href="/gestion/asistente-social/nuevo"
                    role="menuitem"
                    onClick={() => setMenuNuevoEventoAbierto(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      color: 'var(--color-charcoal, #3B3F45)',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-light, #ECEFF3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <HeartHandshake size={16} color="#14505A" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>Nuevo Evento Social</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                        Levantamiento y ficha FIBE
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
};
