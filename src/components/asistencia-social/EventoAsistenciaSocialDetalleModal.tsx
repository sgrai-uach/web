'use client';

import React, { useState } from 'react';
import {
  HeartHandshake,
  MapPin,
  Users,
  Home,
  User,
  Phone,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Link as LinkIcon,
  Building2,
  Calendar,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/ui/Button';
import Heading from '@/components/ui/Heading';
import {
  TIPOS_AFECTACION_SOCIAL,
  NIVELES_COMPROMISO_VIVIENDA,
} from '@/types/asistenciaSocial';
import { normalizarDetallesEvaluacionSocial } from '@/lib/utils/asistenciaSocialIncidenteUtils';
import type {
  DetallesEvaluacionSocialDTO,
  PrioridadEventoSocial,
  TipoAfectacionSocial,
} from '@/types/asistenciaSocial';

export interface DatosFichaAsistenciaSocial {
  codigo?: string;
  descripcion: string;
  tipoAfectacion: TipoAfectacionSocial | string;
  prioridad: PrioridadEventoSocial | string;
  personasAfectadas?: number | string;
  familiasAfectadas?: number | string;
  direccionTexto: string;
  latitud?: number | string | null;
  longitud?: number | string | null;
  delegacionNombre?: string | null;
  incidenteId?: string | null;
  incidenteCodigo?: string | null;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoRut?: string | null;
  creadoPorNombre?: string | null;
  creadoEn?: string | null;
  actualizadoEn?: string | null;
  estado?: string;
  asistenteSocialNombre?: string | null;
  detallesEvaluacion?: DetallesEvaluacionSocialDTO | null;
}

interface EventoAsistenciaSocialDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  datos: DatosFichaAsistenciaSocial | null;
  esVistaPrevia?: boolean;
  onConfirmarGuardado?: () => void;
  guardando?: boolean;
}

const PRIORIDAD_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  CRITICA: {
    bg: 'var(--color-danger-bg, #FFEBEE)',
    color: 'var(--color-danger, #D32F2F)',
    border: '1px solid var(--color-danger, #D32F2F)',
    label: 'Crítica — Inminente',
  },
  ALTA: {
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
    border: '1px solid #FFB74D',
    label: 'Alta — Daño severo',
  },
  MEDIA: {
    bg: 'var(--color-info-bg, #E0F2F1)',
    color: 'var(--color-primary-teal, #1B6F7D)',
    border: '1px solid var(--color-accent-mint, #4FAE9B)',
    label: 'Media — Moderada',
  },
  BAJA: {
    bg: 'var(--color-bg-light, #ECEFF3)',
    color: 'var(--color-charcoal, #3B3F45)',
    border: '1px solid var(--border-color-neutral, #DFE3E8)',
    label: 'Baja — Preventiva',
  },
};

const COMPROMISO_VIVIENDA_STYLES: Record<
  string,
  { bg: string; color: string; border: string; label: string }
> = {
  SIN_DANO: {
    bg: 'var(--color-success-bg, #E8F5E9)',
    color: 'var(--color-success, #2E7D32)',
    border: '1px solid #A5D6A7',
    label: 'Sin daño estructural',
  },
  LEVE: {
    bg: 'var(--color-info-bg, #E0F2F1)',
    color: 'var(--color-primary-teal, #1B6F7D)',
    border: '1px solid #80CBC4',
    label: 'Daño leve (habitable)',
  },
  MODERADO: {
    bg: 'var(--color-warning-bg, #FFF3E0)',
    color: 'var(--color-warning, #E65100)',
    border: '1px solid #FFB74D',
    label: 'Daño moderado (afectación parcial)',
  },
  GRAVE_INHABITABLE: {
    bg: 'var(--color-danger-bg, #FFEBEE)',
    color: 'var(--color-danger, #D32F2F)',
    border: '1px solid var(--color-danger, #D32F2F)',
    label: 'Daño grave / Inhabitable',
  },
};

function getEstadoBadgeStyle(estado?: string) {
  switch (estado) {
    case 'ASIGNADO':
      return {
        backgroundColor: 'var(--color-info-bg, #E0F2F1)',
        color: 'var(--color-primary-teal, #1B6F7D)',
        border: '1px solid #80CBC4',
      };
    case 'EN_EVALUACION_FIBE':
      return {
        backgroundColor: '#E8EAF6',
        color: '#283593',
        border: '1px solid #9FA8DA',
      };
    case 'FINALIZADO':
      return {
        backgroundColor: 'var(--color-success-bg, #E8F5E9)',
        color: 'var(--color-success, #2E7D32)',
        border: '1px solid #A5D6A7',
      };
    case 'DESCARTADO':
      return {
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        color: 'var(--color-text-muted, #5F676E)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
      };
    case 'PENDIENTE':
    default:
      return {
        backgroundColor: '#FFF8E1',
        color: '#F57F17',
        border: '1px solid #FFE082',
      };
  }
}

export default function EventoAsistenciaSocialDetalleModal({
  isOpen,
  onClose,
  datos,
  esVistaPrevia = false,
  onConfirmarGuardado,
  guardando = false,
}: EventoAsistenciaSocialDetalleModalProps) {
  const [copiado, setCopiado] = useState(false);

  if (!isOpen || !datos) return null;

  const tipoInfo = TIPOS_AFECTACION_SOCIAL.find((t) => t.value === datos.tipoAfectacion);
  const tipoLabel = tipoInfo?.label || (datos.tipoAfectacion ? datos.tipoAfectacion.replace(/_/g, ' ') : 'Sin especificar');
  const prioridadInfo = PRIORIDAD_STYLES[datos.prioridad] || {
    bg: 'var(--color-bg-light, #ECEFF3)',
    color: 'var(--color-text-muted, #5F676E)',
    border: '1px solid var(--border-color-neutral, #DFE3E8)',
    label: datos.prioridad || 'Sin seleccionar',
  };

  const tieneCoordenadas =
    datos.latitud !== null &&
    datos.latitud !== undefined &&
    datos.latitud !== '' &&
    !isNaN(Number(datos.latitud)) &&
    datos.longitud !== null &&
    datos.longitud !== undefined &&
    datos.longitud !== '' &&
    !isNaN(Number(datos.longitud));

  const handleCopiarCoordenadas = async () => {
    if (!tieneCoordenadas) return;
    const texto = `${datos.latitud}, ${datos.longitud}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Ignorar fallback
    }
  };

  const detallesNorm = normalizarDetallesEvaluacionSocial(datos.detallesEvaluacion);
  const familiasLista = detallesNorm?.familias ?? [];
  const tieneDesgloseFamilias = familiasLista.length > 0;
  const totalPersonasMostrado = tieneDesgloseFamilias
    ? detallesNorm?.nucleoFamiliarTotal ??
      familiasLista.reduce((acc, f) => acc + (Number(f.nucleoFamiliarTotal) || 0), 0)
    : datos.personasAfectadas !== undefined && datos.personasAfectadas !== ''
      ? datos.personasAfectadas
      : '0';
  const totalFamiliasMostrado = tieneDesgloseFamilias
    ? familiasLista.length
    : datos.familiasAfectadas !== undefined && datos.familiasAfectadas !== ''
      ? datos.familiasAfectadas
      : '0';

  const tieneContadoresVulnerables =
    tieneDesgloseFamilias ||
    (detallesNorm?.cantidadNinos ?? 0) > 0 ||
    (detallesNorm?.cantidadAdultosMayores ?? 0) > 0 ||
    (detallesNorm?.personasDiscapacitadas ?? 0) > 0 ||
    (detallesNorm?.personasElectrodependientes ?? 0) > 0 ||
    (detallesNorm?.mascotasAfectadas ?? 0) > 0;

  const compromisoInmuebleStyle = detallesNorm?.nivelCompromisoVivienda
    ? COMPROMISO_VIVIENDA_STYLES[detallesNorm.nivelCompromisoVivienda] || {
        bg: 'var(--color-bg-light, #ECEFF3)',
        color: 'var(--color-charcoal, #3B3F45)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        label:
          NIVELES_COMPROMISO_VIVIENDA.find(
            (n) => n.value === detallesNorm.nivelCompromisoVivienda
          )?.label || detallesNorm.nivelCompromisoVivienda,
      }
    : {
        bg: '#FFFFFF',
        color: 'var(--color-text-muted, #5F676E)',
        border: '1px solid var(--border-color-neutral, #DFE3E8)',
        label: 'No especificado',
      };

  const urlMapa = tieneCoordenadas
    ? `https://www.openstreetmap.org/?mlat=${datos.latitud}&mlon=${datos.longitud}#map=16/${datos.latitud}/${datos.longitud}`
    : null;

  const actions = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', flexWrap: 'wrap' }}>
      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={onClose}
        disabled={guardando}
      >
        Cerrar Ficha
      </Button>

      {esVistaPrevia && onConfirmarGuardado && (
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onConfirmarGuardado}
          disabled={guardando}
          style={{
            backgroundColor: 'var(--color-accent-mint, #4FAE9B)',
            color: 'var(--color-white, #FFFFFF)',
          }}
        >
          {guardando ? 'Guardando Evento...' : 'Confirmar y Guardar Evento'}
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      title={esVistaPrevia ? 'Ficha de Evento Social (Vista Previa)' : 'Ficha de Asistencia Social FIBE'}
      onClose={onClose}
      actions={actions}
      maxWidth="800px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5, 20px)' }}>
        {/* Encabezado del caso */}
        <div
          style={{
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-teal, #1B6F7D)',
                  letterSpacing: '0.5px',
                }}
              >
                Código del Evento
              </span>
              {esVistaPrevia && (
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    border: '1px solid #FDE68A',
                  }}
                >
                  Borrador en Pantalla
                </span>
              )}
            </div>
            <Heading as="h4" variant="h3" color="charcoal" noMargin>
              {datos.codigo || 'AS-BORRADOR'}
            </Heading>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted, #5F676E)', marginTop: '2px' }}>
              {tipoLabel}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Badge de Prioridad */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: prioridadInfo.bg,
                color: prioridadInfo.color,
                border: prioridadInfo.border,
                textTransform: 'uppercase',
              }}
            >
              <ShieldAlert size={14} />
              {prioridadInfo.label}
            </span>

            {/* Badge de Estado */}
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                ...getEstadoBadgeStyle(datos.estado),
              }}
            >
              {datos.estado ? datos.estado.replace(/_/g, ' ') : 'PENDIENTE FIBE'}
            </span>
          </div>
        </div>

        {/* 1. Caracterización del Caso y Daño */}
        <div
          style={{
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HeartHandshake size={18} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h4" variant="h4" color="teal" noMargin>
              1. Caracterización del Caso y Daño
            </Heading>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
              Descripción de la Excepcionalidad Social
            </span>
            <p
              style={{
                marginTop: '4px',
                fontSize: '14px',
                lineHeight: 1.5,
                color: 'var(--color-text-dark, #2B2B2B)',
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                padding: '12px',
                borderLeft: '3px solid var(--color-primary-teal, #1B6F7D)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {datos.descripcion || 'Sin descripción ingresada.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-light, #ECEFF3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>
                  PERSONAS AFECTADAS
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                  {totalPersonasMostrado}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-light, #ECEFF3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Home size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>
                  HOGARES / FAMILIAS
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                  {totalFamiliasMostrado}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-light, #ECEFF3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LinkIcon size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>
                  INCIDENTE VINCULADO
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-dark, #2B2B2B)' }}>
                  {datos.incidenteCodigo
                    ? datos.incidenteCodigo
                    : datos.incidenteId
                    ? 'Incidente Asociado'
                    : 'Caso Independiente'}
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: 'var(--color-bg-light, #ECEFF3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={20} color="var(--color-primary-teal, #1B6F7D)" />
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)', fontWeight: 600 }}>
                  ASISTENTE SOCIAL ASIGNADO
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-dark, #2B2B2B)' }}>
                  {datos.asistenteSocialNombre || 'Sin asignar (Pendiente)'}
                </div>
              </div>
            </div>
          </div>

          <div
            data-testid="ficha-desglose-demografico"
            style={{
              marginTop: '14px',
              padding: '12px',
              backgroundColor: 'var(--color-bg-light, #ECEFF3)',
              border: '1px solid var(--border-color-neutral, #DFE3E8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-primary-teal-dark, #14505A)',
                  textTransform: 'uppercase',
                }}
              >
                Evaluación Demográfica y Condición Habitacional
              </div>

              {tieneDesgloseFamilias ? (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    backgroundColor: 'var(--color-info-bg, #E0F2F1)',
                    color: 'var(--color-primary-teal-dark, #14505A)',
                    border: '1px solid #80CBC4',
                  }}
                >
                  Desglose por Familia ({familiasLista.length}{' '}
                  {familiasLista.length === 1 ? 'hogar' : 'hogares'})
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-muted, #5F676E)',
                    border: '1px solid var(--border-color-neutral-dark, #CCD2D9)',
                  }}
                >
                  Estimación Aproximada (Sin desglose por familia)
                </span>
              )}
            </div>

            {tieneDesgloseFamilias && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted, #5F676E)' }}>
                Totales calculados desde el desglose familiar (aproximación descartada).
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color-neutral, #DFE3E8)',
                padding: '10px 12px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted, #5F676E)',
                    fontWeight: 600,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Compromiso Habitacional
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: compromisoInmuebleStyle.bg,
                    color: compromisoInmuebleStyle.color,
                    border: compromisoInmuebleStyle.border,
                  }}
                >
                  {compromisoInmuebleStyle.label}
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-muted, #5F676E)',
                    fontWeight: 600,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Daños Materiales Estimados
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: detallesNorm?.danosEstimados
                      ? 'var(--color-text-dark, #2B2B2B)'
                      : 'var(--color-text-muted, #5F676E)',
                    fontStyle: detallesNorm?.danosEstimados ? 'normal' : 'italic',
                  }}
                >
                  {detallesNorm?.danosEstimados || 'No especificados'}
                </div>
              </div>
            </div>

            {tieneContadoresVulnerables && (
              <div
                data-testid="ficha-resumen-grupos-vulnerables"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                }}
              >
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color-neutral, #DFE3E8)', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                    Niños / Adolescentes
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {detallesNorm?.cantidadNinos ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color-neutral, #DFE3E8)', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                    Adultos Mayores
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {detallesNorm?.cantidadAdultosMayores ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color-neutral, #DFE3E8)', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                    Discapacidad
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {detallesNorm?.personasDiscapacitadas ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color-neutral, #DFE3E8)', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                    Electrodependientes
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {detallesNorm?.personasElectrodependientes ?? 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color-neutral, #DFE3E8)', padding: '8px 10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                    Mascotas Afectadas
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-dark, #2B2B2B)' }}>
                    {detallesNorm?.mascotasAfectadas ?? 0}
                  </div>
                </div>
              </div>
            )}

            {tieneDesgloseFamilias && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {familiasLista.map((fam, idx) => {
                  const famStyle = fam.nivelCompromisoVivienda
                    ? COMPROMISO_VIVIENDA_STYLES[fam.nivelCompromisoVivienda] || {
                        bg: 'var(--color-bg-light, #ECEFF3)',
                        color: 'var(--color-primary-teal, #1B6F7D)',
                        border: '1px solid var(--border-color-neutral, #DFE3E8)',
                        label:
                          NIVELES_COMPROMISO_VIVIENDA.find(
                            (n) => n.value === fam.nivelCompromisoVivienda
                          )?.label || fam.nivelCompromisoVivienda,
                      }
                    : null;
                  return (
                    <div
                      key={fam.id || idx}
                      data-testid={`ficha-familia-item-${idx}`}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-color-neutral, #DFE3E8)',
                        borderLeft: '3px solid var(--color-primary-teal, #1B6F7D)',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                          <Users size={13} color="var(--color-primary-teal, #1B6F7D)" />
                          <span>
                            Familia #{idx + 1}
                            {fam.referencia?.trim() ? ` — ${fam.referencia.trim()}` : ''}
                          </span>
                        </span>
                        {famStyle && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              backgroundColor: famStyle.bg,
                              color: famStyle.color,
                              border: famStyle.border,
                            }}
                          >
                            {famStyle.label}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', color: 'var(--color-charcoal, #3B3F45)' }}>
                        <span>
                          <strong>Integrantes:</strong> {fam.nucleoFamiliarTotal}
                        </span>
                        <span>
                          <strong>Niños/Adolescentes:</strong> {fam.cantidadNinos ?? 0}
                        </span>
                        <span>
                          <strong>Adultos mayores:</strong> {fam.cantidadAdultosMayores ?? 0}
                        </span>
                        <span>
                          <strong>Discapacidad:</strong> {fam.personasDiscapacitadas ?? 0}
                        </span>
                        <span>
                          <strong>Electrodependientes:</strong> {fam.personasElectrodependientes ?? 0}
                        </span>
                        <span>
                          <strong>Mascotas:</strong> {fam.mascotasAfectadas ?? 0}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Ubicación Georreferenciada */}
        <div
          style={{
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MapPin size={18} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h4" variant="h4" color="teal" noMargin>
              2. Ubicación Georreferenciada
            </Heading>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                Dirección / Calle de Referencia
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)', marginTop: '2px' }}>
                {datos.direccionTexto || 'Sin dirección ingresada'}
              </div>
            </div>

            {datos.delegacionNombre && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-charcoal, #3B3F45)' }}>
                <Building2 size={15} color="var(--color-primary-teal, #1B6F7D)" />
                <span><strong>Delegación Territorial:</strong> {datos.delegacionNombre}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'var(--color-bg-light, #ECEFF3)',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>Coordenadas: </span>
                {tieneCoordenadas ? (
                  <span style={{ fontWeight: 700, color: 'var(--color-charcoal, #3B3F45)', fontFamily: 'monospace' }}>
                    {datos.latitud}, {datos.longitud}
                  </span>
                ) : (
                  <span style={{ fontStyle: 'italic', color: '#888' }}>No fijadas en el mapa</span>
                )}
              </div>

              {tieneCoordenadas && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopiarCoordenadas}
                    style={{ border: '1px solid var(--border-color-neutral, #DFE3E8)', padding: '3px 8px' }}
                  >
                    {copiado ? <Check size={13} color="green" /> : <Copy size={13} />}
                    <span style={{ marginLeft: '4px' }}>{copiado ? 'Copiado' : 'Copiar'}</span>
                  </Button>

                  {urlMapa && (
                    <a
                      href={urlMapa}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: 'var(--color-primary-teal, #1B6F7D)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      <ExternalLink size={13} />
                      <span>Ver mapa OSM</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Datos Preliminares de Contacto */}
        <div
          style={{
            padding: 'var(--space-4, 16px)',
            backgroundColor: 'var(--color-white, #FFFFFF)',
            border: '1px solid var(--border-color-neutral, #DFE3E8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <User size={18} color="var(--color-primary-teal, #1B6F7D)" />
            <Heading as="h4" variant="h4" color="teal" noMargin>
              3. Datos Preliminares de Contacto
            </Heading>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                Nombre de Contacto / Jefe Hogar
              </span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)', marginTop: '2px' }}>
                {datos.contactoNombre || 'No especificado'}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                Teléfono de Contacto
              </span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {datos.contactoTelefono ? (
                  <>
                    <Phone size={13} color="var(--color-primary-teal, #1B6F7D)" />
                    <span>{datos.contactoTelefono}</span>
                  </>
                ) : (
                  'No especificado'
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted, #5F676E)', textTransform: 'uppercase' }}>
                RUT
              </span>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-dark, #2B2B2B)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {datos.contactoRut ? (
                  <>
                    <FileText size={13} color="var(--color-primary-teal, #1B6F7D)" />
                    <span>{datos.contactoRut}</span>
                  </>
                ) : (
                  'No especificado'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Trazabilidad Institucional */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-bg-light, #ECEFF3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--color-text-muted, #5F676E)',
          }}
        >
          <div>
            <strong>Registrado por: </strong>
            <span>{datos.creadoPorNombre || 'Usuario en sesión'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} />
              <span>
                <strong>Creado: </strong>
                {datos.creadoEn
                  ? new Date(datos.creadoEn).toLocaleString('es-CL')
                  : new Date().toLocaleString('es-CL')}
              </span>
            </div>
            {datos.actualizadoEn && (
              <div>
                <strong>Última actualización: </strong>
                <span>{new Date(datos.actualizadoEn).toLocaleString('es-CL')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
