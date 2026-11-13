'use client';

import React from 'react';
import { ClipboardList, Clock, ExternalLink, User, Wrench } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { obtenerVarianteChipPrioridad } from '@/lib/utils/chipVariants';
import { formatearPrioridad, formatearCompromisoVivienda } from '@/lib/utils/estadoUtils';
import type { IncidenteDetalle } from '@/services/incidentesService';
import { DrawerSectionHeader } from './DrawerSectionHeader';
import styles from '@/styles/mando.module.css';

interface IncidenteUltimoReporteSectionProps {
  detalle: IncidenteDetalle;
  onVerDetalleReporte: (misionId: string, reporteId: string) => void;
}

function esResumenAutogeneradoEvaluacion(texto?: string | null): boolean {
  if (!texto) return false;
  return /^Evaluaci[oó]n en Terreno #\d+/i.test(texto.trim());
}

export const IncidenteUltimoReporteSection: React.FC<IncidenteUltimoReporteSectionProps> = ({
  detalle,
  onVerDetalleReporte,
}) => {
  // Buscar el reporte de evaluación más reciente para enriquecer datos básicos y acciones realizadas
  const reporteTerrenoReciente = React.useMemo(() => {
    const lista = detalle.reportesEvaluacionTerreno || [];
    if (lista.length === 0) return null;
    if (detalle.ultimoReporte?.origen === 'REPORTE_TERRENO') {
      const porId = lista.find((r) => r.id === detalle.ultimoReporte?.reporteId);
      if (porId) return porId;
    }
    const ordenados = [...lista].sort((a, b) => {
      const tB = new Date(b.creadoEn).getTime();
      const tA = new Date(a.creadoEn).getTime();
      if (tB !== tA) return tB - tA;
      return Number(b.versionReporte ?? 0) - Number(a.versionReporte ?? 0);
    });
    return ordenados[0];
  }, [detalle]);

  // Resolver el último reporte desde el campo consolidado del backend o como fallback desde reportesEvaluacionTerreno
  const ultimoReporte = React.useMemo(() => {
    if (detalle.ultimoReporte) {
      return detalle.ultimoReporte;
    }

    if (reporteTerrenoReciente) {
      const top = reporteTerrenoReciente;
      const misionRef = detalle.misiones.find((m) => m.id === top.misionId);
      const textoBase = top.accionesRealizadas || top.observaciones || top.resumenTecnico;
      return {
        origen: 'REPORTE_TERRENO' as const,
        reporteId: top.id,
        misionId: top.misionId,
        misionCodigo: misionRef?.codigo || '',
        evaluadorNombre: top.evaluador.nombre,
        creadoEn: top.creadoEn,
        resumen: textoBase,
        prioridadAsignada: top.prioridadAsignada ?? null,
        versionReporte: top.versionReporte,
        esRectificacion: top.esRectificacion,
      };
    }

    if (detalle.reclasificacionTipologia) {
      const r = detalle.reclasificacionTipologia;
      return {
        origen: 'RECLASIFICACION' as const,
        reporteId: `reclasificacion-${r.hitoId}`,
        misionId: r.misionId,
        misionCodigo: r.misionCodigo,
        evaluadorNombre: r.registradoPor || 'Patrulla Verificadora',
        creadoEn: r.creadoEn,
        resumen: r.justificacion,
        prioridadAsignada: null,
        versionReporte: null,
        esRectificacion: false,
      };
    }

    return null;
  }, [detalle, reporteTerrenoReciente]);

  const etiquetaTipo = React.useMemo(() => {
    if (!ultimoReporte) return '';
    if (ultimoReporte.origen === 'RECLASIFICACION') {
      return 'Reclasificación en Terreno';
    }
    const ver = ultimoReporte.versionReporte ?? 1;
    return ultimoReporte.esRectificacion || ver > 1
      ? `Reporte #${ver} (Rectificación)`
      : 'Reporte #1 (Inicial)';
  }, [ultimoReporte]);

  const fechaLegible = React.useMemo(() => {
    if (!ultimoReporte?.creadoEn) return '';
    try {
      return new Date(ultimoReporte.creadoEn).toLocaleString('es-CL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return ultimoReporte.creadoEn;
    }
  }, [ultimoReporte]);

  // Extraer información básica estructurada y acciones realizadas sin texto redundante
  const datosBasicosYAcciones = React.useMemo(() => {
    if (!ultimoReporte) return null;

    if (ultimoReporte.origen === 'RECLASIFICACION' && detalle.reclasificacionTipologia) {
      const r = detalle.reclasificacionTipologia;
      return {
        itemsBasicos: [
          {
            etiqueta: 'Tipología constatada',
            valor: r.tipoAnterior ? `${r.tipoAnterior} → ${r.tipoNuevo}` : r.tipoNuevo,
          },
        ],
        accionesTexto: r.justificacion || ultimoReporte.resumen || null,
        etiquetaAcciones: 'Constatación en terreno',
      };
    }

    const evalData = (reporteTerrenoReciente?.evaluacion || {}) as Record<string, unknown>;
    const personas =
      typeof evalData.nucleoFamiliarTotal === 'number'
        ? evalData.nucleoFamiliarTotal
        : reporteTerrenoReciente?.personasAfectadas;
    const familiasRaw = Array.isArray(evalData.familias)
      ? (evalData.familias as Record<string, unknown>[])
      : undefined;
    const familiasCount =
      familiasRaw && familiasRaw.length > 0
        ? familiasRaw.length
        : typeof evalData.familiasAfectadas === 'number'
          ? evalData.familiasAfectadas
          : undefined;
    const viviendas =
      typeof evalData.viviendasAfectadas === 'number' ? evalData.viviendasAfectadas : undefined;
    const compromiso =
      typeof evalData.nivelCompromisoVivienda === 'string'
        ? evalData.nivelCompromisoVivienda
        : undefined;

    const itemsBasicos: Array<{ etiqueta: string; valor: string }> = [];
    if (typeof personas === 'number') {
      itemsBasicos.push({
        etiqueta: 'Personas afectadas',
        valor: `${personas} ${personas === 1 ? 'persona' : 'personas'}`,
      });
    }
    if (familiasCount !== undefined) {
      itemsBasicos.push({
        etiqueta: 'Familias afectadas',
        valor: `${familiasCount} ${familiasCount === 1 ? 'familia' : 'familias'}`,
      });
    }
    if (compromiso || viviendas !== undefined) {
      const textoViv =
        viviendas !== undefined
          ? `${viviendas} ${viviendas === 1 ? 'vivienda' : 'viviendas'}`
          : '';
      const textoComp = compromiso ? formatearCompromisoVivienda(compromiso) : '';
      itemsBasicos.push({
        etiqueta: 'Afectación habitacional',
        valor: [textoViv, textoComp].filter(Boolean).join(' · '),
      });
    }

    const familiasDesglose =
      familiasRaw &&
      familiasRaw.length > 0 &&
      (familiasRaw.length > 1 || Boolean(familiasRaw[0].referencia))
        ? familiasRaw.map((f, i) => {
            const refLimpia = typeof f.referencia === 'string' ? f.referencia.trim() : '';
            const nombre = refLimpia
              ? refLimpia.toLowerCase().startsWith('familia')
                ? refLimpia
                : `Familia ${refLimpia}`
              : `Familia #${i + 1}`;
            return {
              nombre,
              personas: typeof f.nucleoFamiliarTotal === 'number' ? f.nucleoFamiliarTotal : 0,
              compromiso:
                typeof f.nivelCompromisoVivienda === 'string'
                  ? f.nivelCompromisoVivienda
                  : undefined,
              requiereFibe: Boolean(f.requiereAsistenciaSocial),
            };
          })
        : null;

    const accionesDirectas =
      reporteTerrenoReciente?.accionesRealizadas?.trim() ||
      reporteTerrenoReciente?.observaciones?.trim() ||
      (typeof evalData.detallesAdicionales === 'string'
        ? evalData.detallesAdicionales.trim()
        : '') ||
      reporteTerrenoReciente?.justificacionPrioridad?.trim() ||
      '';

    const resumenLimpio = !esResumenAutogeneradoEvaluacion(ultimoReporte.resumen)
      ? ultimoReporte.resumen?.trim() || ''
      : '';

    return {
      itemsBasicos,
      familiasDesglose,
      accionesTexto: accionesDirectas || resumenLimpio || null,
      etiquetaAcciones: reporteTerrenoReciente?.accionesRealizadas?.trim()
        ? 'Acciones realizadas'
        : 'Observaciones / Acciones en terreno',
    };
  }, [ultimoReporte, detalle.reclasificacionTipologia, reporteTerrenoReciente]);

  return (
    <div className={styles.drawerSection} data-testid="incidente-ultimo-reporte-section">
      <DrawerSectionHeader
        icono={<ClipboardList size={18} />}
        titulo="Último Reporte de Terreno"
      />

      {!ultimoReporte ? (
        <p
          style={{
            color: 'var(--color-text-muted, #5F676E)',
            fontSize: '0.85rem',
            margin: 0,
          }}
        >
          Aún no se han registrado reportes desde las misiones asignadas a este incidente.
        </p>
      ) : (
        <div
          style={{
            padding: '0.75rem 0.9rem',
            backgroundColor: 'var(--color-bg-light, #F8FAFC)',
            border: '1px solid #DFE3E8',
            borderLeft: '4px solid var(--color-primary-teal, #1B6F7D)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
          }}
        >
          {/* 1. Cabecera: Chips de identificación y fecha */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <Chip variant="teal" size="sm">
                {etiquetaTipo}
              </Chip>
              {ultimoReporte.misionCodigo && (
                <Chip variant="neutral" size="sm">
                  {ultimoReporte.misionCodigo}
                </Chip>
              )}
              {ultimoReporte.prioridadAsignada && (
                <Chip
                  variant={obtenerVarianteChipPrioridad(ultimoReporte.prioridadAsignada)}
                  size="sm"
                >
                  Prioridad asignada: {formatearPrioridad(ultimoReporte.prioridadAsignada)}
                </Chip>
              )}
            </div>

            {fechaLegible && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted, #5F676E)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock size={12} aria-hidden="true" />
                <span>{fechaLegible}</span>
              </span>
            )}
          </div>

          {/* 2. Información básica ordenada */}
          {datosBasicosYAcciones && datosBasicosYAcciones.itemsBasicos.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.4rem 0.75rem',
                padding: '0.4rem 0.6rem',
                backgroundColor: 'var(--color-white, #FFFFFF)',
                border: '1px solid #E2E8F0',
              }}
            >
              {datosBasicosYAcciones.itemsBasicos.map((item) => (
                <div key={item.etiqueta}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted, #5F676E)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.etiqueta}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-charcoal-dark, #24272B)',
                    }}
                  >
                    {item.valor}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 2.1 Desglose de familias cuando hay detalle individual */}
          {datosBasicosYAcciones?.familiasDesglose && datosBasicosYAcciones.familiasDesglose.length > 0 && (
            <div
              data-testid="incidente-ultimo-reporte-familias-desglose"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                marginTop: '0.1rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-teal-dark, #14505A)',
                  letterSpacing: '0.02em',
                }}
              >
                {datosBasicosYAcciones.familiasDesglose.length > 1
                  ? `Hogares afectados (${datosBasicosYAcciones.familiasDesglose.length}):`
                  : 'Hogar afectado:'}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {datosBasicosYAcciones.familiasDesglose.map((f, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'var(--color-white, #FFFFFF)',
                      border: '1px solid #DFE3E8',
                      borderLeft: '3px solid var(--color-primary-teal, #1B6F7D)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '4px',
                    }}
                  >
                    <span>
                      <strong>{f.nombre}:</strong> {f.personas} pers.
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      {f.compromiso && (
                        <span style={{ color: 'var(--color-text-muted, #5F676E)' }}>
                          {formatearCompromisoVivienda(f.compromiso)}
                        </span>
                      )}
                      {f.requiereFibe && (
                        <Chip variant="warning" size="sm">
                          FIBE
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Acciones realizadas / Observaciones puntuales */}
          {datosBasicosYAcciones?.accionesTexto && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal, #3B3F45)' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-teal-dark, #14505A)',
                  marginBottom: '2px',
                }}
              >
                <Wrench size={11} aria-hidden="true" />
                <span>{datosBasicosYAcciones.etiquetaAcciones}:</span>
              </span>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.82rem',
                  color: 'var(--color-charcoal, #3B3F45)',
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {datosBasicosYAcciones.accionesTexto}
              </p>
            </div>
          )}

          {/* 4. Evaluador y botón Ver detalle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginTop: '0.1rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted, #5F676E)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <User size={12} aria-hidden="true" />
              <span>{ultimoReporte.evaluadorNombre}</span>
            </span>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              data-testid="btn-ver-detalle-ultimo-reporte"
              onClick={() =>
                onVerDetalleReporte(ultimoReporte.misionId, ultimoReporte.reporteId)
              }
              aria-label={`Ver detalle del último reporte en misión ${ultimoReporte.misionCodigo || ultimoReporte.misionId}`}
            >
              <span>Ver detalle</span>
              <ExternalLink size={13} style={{ marginLeft: '5px' }} aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
