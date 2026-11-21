import type { PrioridadEventoSocial, TipoAfectacionSocial } from '@/types/asistenciaSocial';

export interface IncidenteResumenCompatible {
  id: string;
  codigo?: string | null;
  tipoAfectacion?: string | null;
  direccion?: string | null;
  estado?: string;
  requiereAsistenciaSocial?: boolean;
  verificado?: boolean;
  dictamenTerreno?: string | null;
  motivoNoAbordable?: string | null;
}

export interface EvaluacionTerrenoCompatible {
  nucleoFamiliarTotal?: number | null;
  familiasAfectadas?: number | null;
  familias?: Array<unknown> | null;
  requiereAsistenciaSocial?: boolean | null;
}

export interface ReporteTerrenoCompatible {
  id?: string;
  misionId?: string;
  tipoReporte?: string | null;
  dictamen?: string | null;
  motivoNoAbordable?: string | null;
  requiereAsistenciaSocial?: boolean | null;
  personasAfectadas?: number | null;
  personasAfectadasPrevias?: number | null;
  personasAfectadasModificadas?: boolean | null;
  resumenTecnico?: string | null;
  observaciones?: string | null;
  versionReporte?: number | null;
  creadoEn?: string | null;
  evaluacion?: EvaluacionTerrenoCompatible | null;
  detallesEvaluacion?: EvaluacionTerrenoCompatible | null;
}

export interface IncidenteDetalleCompatible {
  id: string;
  codigo?: string;
  tipoAfectacion?: string | null;
  descripcion?: string | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  estado?: string;
  prioridad?: string | null;
  requiereAsistenciaSocial?: boolean;
  verificado?: boolean;
  dictamenTerreno?: string | null;
  motivoNoAbordable?: string | null;
  fechaCierre?: string | null;
  informante?: {
    id?: string;
    rut?: string | null;
    nombre?: string | null;
    telefono?: string | null;
  } | null;
  delegacion?: {
    id?: string | null;
    nombre?: string | null;
  } | null;
  reportesEvaluacionTerreno?: ReporteTerrenoCompatible[] | null;
}

export interface ContextoSocialDesdeIncidente {
  tipoAfectacion: TipoAfectacionSocial;
  prioridad: PrioridadEventoSocial;
  personasAfectadas: number | null;
  personasPrevias: number | null;
  personasModificadasEnCierre: boolean;
  familiasAfectadas: number | null;
  familiasRescatadasDePrioridad: boolean;
  descripcionSugerida: string;
  direccionTexto: string;
  latitud: number | null;
  longitud: number | null;
  delegacionId: string | null;
  contactoNombre: string;
  contactoTelefono: string;
  contactoRut: string;
  tieneCierrePatrulla: boolean;
  dictamenCierre: 'REQUIERE_CUADRILLA' | 'NO_ABORDABLE' | null;
  esNoAbordable: boolean;
  motivoNoAbordable: string | null;
  requiereFibeVerificado: boolean | null;
  resumenCierrePatrulla: string | null;
}

const PRIORIDADES_VALIDAS: PrioridadEventoSocial[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

/**
 * Normaliza un texto eliminando tildes, pasando a minúsculas y colapsando espacios.
 */
export function normalizarTextoComparacion(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Mapea las tipologías textuales de incidentes (H37/H39) al enum de afectación social (H28).
 */
export function mapearTipoAfectacionIncidenteASocial(
  tipoIncidente?: string | null
): TipoAfectacionSocial {
  if (!tipoIncidente || typeof tipoIncidente !== 'string') {
    return 'OTRO_EXCEPCIONAL';
  }

  const norm = normalizarTextoComparacion(tipoIncidente);

  if (norm.includes('incendio') || norm.includes('fuego')) {
    return 'INCENDIO_HABITACIONAL';
  }
  if (norm.includes('inundac') || norm.includes('anegam')) {
    return 'VIVIENDA_ANEGADA';
  }
  if (
    norm.includes('estructural') ||
    norm.includes('techumbre') ||
    norm.includes('techo') ||
    norm.includes('muro')
  ) {
    return 'DANO_ESTRUCTURAL';
  }
  if (
    norm.includes('deslizam') ||
    norm.includes('remocion') ||
    norm.includes('derrumbe') ||
    norm.includes('socavon')
  ) {
    return 'REMOCION_MASA';
  }
  if (
    norm.includes('aislam') ||
    norm.includes('inaccesib') ||
    norm.includes('corte de camino') ||
    norm.includes('corte de acceso')
  ) {
    return 'AISLAMIENTO_HOGAR';
  }

  return 'OTRO_EXCEPCIONAL';
}

/**
 * Resuelve el UUID de delegación comparando primero por ID exacto y luego por nombre normalizado.
 */
export function resolverDelegacionDesdeIncidente(
  delegacion: { id?: string | null; nombre?: string | null } | null | undefined,
  catalogo: Array<{ id: string; nombre: string }>
): string | null {
  if (!delegacion) return null;

  if (delegacion.id) {
    const matchId = catalogo.find((d) => d.id === delegacion.id);
    if (matchId) return matchId.id;
  }

  if (delegacion.nombre) {
    const nombreNorm = normalizarTextoComparacion(delegacion.nombre);
    if (nombreNorm) {
      const matchNombre = catalogo.find((d) => {
        const catNorm = normalizarTextoComparacion(d.nombre);
        return (
          catNorm === nombreNorm ||
          catNorm.includes(nombreNorm) ||
          nombreNorm.includes(catNorm)
        );
      });
      if (matchNombre) return matchNombre.id;
    }
  }

  return delegacion.id ?? null;
}

/**
 * Excluye incidentes NO_ABORDABLE sin FIBE y prioriza casos con FIBE requerida (y verificados).
 */
export function clasificarYOrdenarIncidentesParaVinculacion<T extends IncidenteResumenCompatible>(
  incidentes: T[]
): T[] {
  const filtrados = incidentes.filter(
    (inc) => !(inc.estado === 'NO_ABORDABLE' && !inc.requiereAsistenciaSocial)
  );

  return filtrados
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const fibeA = a.item.requiereAsistenciaSocial ? 1 : 0;
      const fibeB = b.item.requiereAsistenciaSocial ? 1 : 0;
      if (fibeA !== fibeB) return fibeB - fibeA;

      if (fibeA === 1) {
        const verA = a.item.verificado ? 1 : 0;
        const verB = b.item.verificado ? 1 : 0;
        if (verA !== verB) return verB - verA;
      }

      return a.idx - b.idx;
    })
    .map(({ item }) => item);
}

/**
 * Determina si un reporte de terreno corresponde al informe técnico de verificación y cierre (H39).
 */
export function esReporteCierrePatrulla(reporte?: ReporteTerrenoCompatible | null): boolean {
  if (!reporte) return false;
  if (
    typeof reporte.tipoReporte === 'string' &&
    reporte.tipoReporte.trim().toUpperCase() === 'VERIFICACION_CIERRE'
  ) {
    return true;
  }
  if (typeof reporte.dictamen === 'string') {
    const dictNorm = reporte.dictamen.trim().toUpperCase();
    return dictNorm === 'REQUIERE_CUADRILLA' || dictNorm === 'NO_ABORDABLE';
  }
  return false;
}

function extraerFamiliasDeReporte(reporte?: ReporteTerrenoCompatible | null): number | null {
  if (!reporte) return null;
  const fuentes = [reporte.evaluacion, reporte.detallesEvaluacion];
  for (const fuente of fuentes) {
    if (!fuente) continue;
    if (Array.isArray(fuente.familias) && fuente.familias.length > 0) {
      return fuente.familias.length;
    }
    if (typeof fuente.familiasAfectadas === 'number' && !Number.isNaN(fuente.familiasAfectadas)) {
      return fuente.familiasAfectadas;
    }
  }
  return null;
}

function extraerPersonasDeReporte(reporte?: ReporteTerrenoCompatible | null): number | null {
  if (!reporte) return null;
  if (typeof reporte.personasAfectadas === 'number' && !Number.isNaN(reporte.personasAfectadas)) {
    return reporte.personasAfectadas;
  }
  const nucleoEval = reporte.evaluacion?.nucleoFamiliarTotal;
  if (typeof nucleoEval === 'number' && !Number.isNaN(nucleoEval)) {
    return nucleoEval;
  }
  const nucleoDet = reporte.detallesEvaluacion?.nucleoFamiliarTotal;
  if (typeof nucleoDet === 'number' && !Number.isNaN(nucleoDet)) {
    return nucleoDet;
  }
  return null;
}

function normalizarDictamen(
  valor?: string | null
): 'REQUIERE_CUADRILLA' | 'NO_ABORDABLE' | null {
  if (!valor || typeof valor !== 'string') return null;
  const limpio = valor.trim().toUpperCase();
  if (limpio === 'REQUIERE_CUADRILLA' || limpio === 'NO_ABORDABLE') {
    return limpio;
  }
  return null;
}

/**
 * Consolida el contexto social desde un incidente integrando el informe de cierre H39 y
 * la evaluación previa de prioridad H38 sin romper compatibilidad con incidentes sin reportes.
 */
export function extraerContextoSocialDesdeIncidente(
  detalle: IncidenteDetalleCompatible,
  catalogoDelegaciones: Array<{ id: string; nombre: string }>
): ContextoSocialDesdeIncidente {
  const reportes = Array.isArray(detalle.reportesEvaluacionTerreno)
    ? [...detalle.reportesEvaluacionTerreno]
    : [];

  reportes.sort((a, b) => {
    const verA = Number(a.versionReporte ?? 0);
    const verB = Number(b.versionReporte ?? 0);
    if (verA !== verB) return verB - verA;
    const tA = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
    const tB = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
    return tB - tA;
  });

  const reporteCierre = reportes.find((r) => esReporteCierrePatrulla(r)) || null;
  const reportePrioridad = reportes.find((r) => !esReporteCierrePatrulla(r)) || null;

  const personasCierre = extraerPersonasDeReporte(reporteCierre);
  const personasDePrioridad = extraerPersonasDeReporte(reportePrioridad);
  const personasAfectadas = personasCierre ?? personasDePrioridad ?? null;

  const personasPrevias =
    typeof reporteCierre?.personasAfectadasPrevias === 'number'
      ? reporteCierre.personasAfectadasPrevias
      : personasDePrioridad;

  const personasModificadasEnCierre = Boolean(
    reporteCierre?.personasAfectadasModificadas ||
      (reporteCierre &&
        personasAfectadas !== null &&
        personasPrevias !== null &&
        personasAfectadas !== personasPrevias)
  );

  const familiasCierre = extraerFamiliasDeReporte(reporteCierre);
  const familiasPrioridad = extraerFamiliasDeReporte(reportePrioridad);
  const familiasAfectadas = familiasCierre ?? familiasPrioridad ?? null;
  const familiasRescatadasDePrioridad =
    familiasCierre === null && familiasPrioridad !== null;

  const dictamenCierre =
    normalizarDictamen(reporteCierre?.dictamen) ??
    normalizarDictamen(detalle.dictamenTerreno) ??
    (detalle.estado === 'NO_ABORDABLE' ? 'NO_ABORDABLE' : null);

  const esNoAbordable =
    detalle.estado === 'NO_ABORDABLE' || dictamenCierre === 'NO_ABORDABLE';

  const motivoNoAbordable =
    reporteCierre?.motivoNoAbordable?.trim() ||
    detalle.motivoNoAbordable?.trim() ||
    null;

  let requiereFibeVerificado: boolean | null = null;
  if (reporteCierre || detalle.verificado) {
    if (typeof reporteCierre?.requiereAsistenciaSocial === 'boolean') {
      requiereFibeVerificado = reporteCierre.requiereAsistenciaSocial;
    } else if (typeof detalle.requiereAsistenciaSocial === 'boolean') {
      requiereFibeVerificado = detalle.requiereAsistenciaSocial;
    } else {
      requiereFibeVerificado = false;
    }
  } else if (detalle.requiereAsistenciaSocial) {
    requiereFibeVerificado = true;
  }

  const resumenCierrePatrulla =
    reporteCierre?.resumenTecnico?.trim() ||
    reporteCierre?.observaciones?.trim() ||
    null;

  const descripcionSugerida =
    resumenCierrePatrulla || detalle.descripcion?.trim() || '';

  const prioridadRaw = (detalle.prioridad || '').toUpperCase() as PrioridadEventoSocial;
  const prioridad: PrioridadEventoSocial = PRIORIDADES_VALIDAS.includes(prioridadRaw)
    ? prioridadRaw
    : 'MEDIA';

  return {
    tipoAfectacion: mapearTipoAfectacionIncidenteASocial(detalle.tipoAfectacion),
    prioridad,
    personasAfectadas,
    personasPrevias,
    personasModificadasEnCierre,
    familiasAfectadas,
    familiasRescatadasDePrioridad,
    descripcionSugerida,
    direccionTexto: detalle.direccion?.trim() || '',
    latitud:
      typeof detalle.latitud === 'number' && !Number.isNaN(detalle.latitud)
        ? detalle.latitud
        : null,
    longitud:
      typeof detalle.longitud === 'number' && !Number.isNaN(detalle.longitud)
        ? detalle.longitud
        : null,
    delegacionId: resolverDelegacionDesdeIncidente(detalle.delegacion, catalogoDelegaciones),
    contactoNombre: detalle.informante?.nombre?.trim() || '',
    contactoTelefono: detalle.informante?.telefono?.trim() || '',
    contactoRut: detalle.informante?.rut?.trim() || '',
    tieneCierrePatrulla: Boolean(reporteCierre) || esNoAbordable,
    dictamenCierre,
    esNoAbordable,
    motivoNoAbordable,
    requiereFibeVerificado,
    resumenCierrePatrulla,
  };
}
