import type {
  DetallesEvaluacionSocialDTO,
  FamiliaAfectadaSocialDTO,
  NivelCompromisoViviendaSocial,
  PrioridadEventoSocial,
  TipoAfectacionSocial,
} from '@/types/asistenciaSocial';

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
  familias?: Array<Record<string, unknown>> | null;
  cantidadNinos?: number | null;
  cantidadAdultosMayores?: number | null;
  personasDiscapacitadas?: number | null;
  personasElectrodependientes?: number | null;
  mascotasAfectadas?: number | null;
  nivelCompromisoVivienda?: string | null;
  danosEstimados?: string | null;
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
  danosEstimados?: string | null;
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
  familiasDesglosadas: FamiliaAfectadaSocialDTO[];
  nivelCompromisoVivienda: NivelCompromisoViviendaSocial | '';
  danosEstimados: string;
}

const PRIORIDADES_VALIDAS: PrioridadEventoSocial[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
const NIVELES_COMPROMISO_VALIDOS: NivelCompromisoViviendaSocial[] = [
  'SIN_DANO',
  'LEVE',
  'MODERADO',
  'GRAVE_INHABITABLE',
];

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

function normalizarNivelCompromiso(
  valor?: string | null
): NivelCompromisoViviendaSocial | '' {
  if (!valor || typeof valor !== 'string') return '';
  const limpio = valor.trim().toUpperCase() as NivelCompromisoViviendaSocial;
  return NIVELES_COMPROMISO_VALIDOS.includes(limpio) ? limpio : '';
}

function leerNumeroOpcional(obj: Record<string, unknown>, camel: string, snake: string): number {
  const val = obj[camel] ?? obj[snake];
  return typeof val === 'number' && !Number.isNaN(val) && val >= 0 ? Math.trunc(val) : 0;
}

function extraerFamiliasDesglosadasDeReporte(
  reporte?: ReporteTerrenoCompatible | null,
  personasFallbackUnica?: number | null
): FamiliaAfectadaSocialDTO[] {
  if (!reporte) return [];
  const fuentes = [reporte.evaluacion, reporte.detallesEvaluacion];
  for (const fuente of fuentes) {
    if (!fuente || !Array.isArray(fuente.familias) || fuente.familias.length === 0) continue;

    return fuente.familias.map((raw, idx) => {
      const f = (raw || {}) as Record<string, unknown>;
      const refRaw = typeof f.referencia === 'string' ? f.referencia.trim() : '';
      let nucleo = leerNumeroOpcional(f, 'nucleoFamiliarTotal', 'nucleo_familiar_total');
      if (
        nucleo === 0 &&
        fuente.familias?.length === 1 &&
        typeof personasFallbackUnica === 'number' &&
        personasFallbackUnica > 0
      ) {
        nucleo = personasFallbackUnica;
      }
      const compRaw = (f.nivelCompromisoVivienda ?? f.nivel_compromiso_vivienda) as
        | string
        | undefined;
      const comp = normalizarNivelCompromiso(compRaw);

      return {
        id: typeof f.id === 'string' ? f.id : `fam-precarga-${idx + 1}`,
        referencia: refRaw || undefined,
        nucleoFamiliarTotal: nucleo,
        cantidadNinos: leerNumeroOpcional(f, 'cantidadNinos', 'cantidad_ninos'),
        cantidadAdultosMayores: leerNumeroOpcional(
          f,
          'cantidadAdultosMayores',
          'cantidad_adultos_mayores'
        ),
        personasDiscapacitadas: leerNumeroOpcional(
          f,
          'personasDiscapacitadas',
          'personas_discapacitadas'
        ),
        personasElectrodependientes: leerNumeroOpcional(
          f,
          'personasElectrodependientes',
          'personas_electrodependientes'
        ),
        mascotasAfectadas: leerNumeroOpcional(f, 'mascotasAfectadas', 'mascotas_afectadas'),
        ...(comp ? { nivelCompromisoVivienda: comp } : {}),
      };
    });
  }
  return [];
}

/**
 * Construye el payload estructurado detallesEvaluacion a partir de las familias desglosadas
 * y datos habitacionales opcionales. Retorna null en modo aproximado sin detalles adicionales.
 */
export function construirDetallesEvaluacionSocial(input: {
  familias: FamiliaAfectadaSocialDTO[];
  nivelCompromisoVivienda?: NivelCompromisoViviendaSocial | string | null;
  danosEstimados?: string | null;
}): DetallesEvaluacionSocialDTO | null {
  const familiasLimpias = input.familias.map((f) => ({
    ...(f.id ? { id: f.id } : {}),
    ...(f.referencia?.trim() ? { referencia: f.referencia.trim() } : {}),
    nucleoFamiliarTotal: Math.max(0, Math.trunc(Number(f.nucleoFamiliarTotal) || 0)),
    cantidadNinos: Math.max(0, Math.trunc(Number(f.cantidadNinos) || 0)),
    cantidadAdultosMayores: Math.max(0, Math.trunc(Number(f.cantidadAdultosMayores) || 0)),
    personasDiscapacitadas: Math.max(0, Math.trunc(Number(f.personasDiscapacitadas) || 0)),
    personasElectrodependientes: Math.max(
      0,
      Math.trunc(Number(f.personasElectrodependientes) || 0)
    ),
    mascotasAfectadas: Math.max(0, Math.trunc(Number(f.mascotasAfectadas) || 0)),
    ...(f.nivelCompromisoVivienda ? { nivelCompromisoVivienda: f.nivelCompromisoVivienda } : {}),
  }));

  const compromiso = input.nivelCompromisoVivienda?.trim() || null;
  const danos = input.danosEstimados?.trim() || null;

  if (familiasLimpias.length === 0 && !compromiso && !danos) {
    return null;
  }

  if (familiasLimpias.length === 0) {
    return {
      nivelCompromisoVivienda: compromiso,
      danosEstimados: danos,
    };
  }

  const totales = familiasLimpias.reduce(
    (acc, fam) => ({
      nucleoFamiliarTotal: acc.nucleoFamiliarTotal + fam.nucleoFamiliarTotal,
      cantidadNinos: acc.cantidadNinos + (fam.cantidadNinos ?? 0),
      cantidadAdultosMayores: acc.cantidadAdultosMayores + (fam.cantidadAdultosMayores ?? 0),
      personasDiscapacitadas: acc.personasDiscapacitadas + (fam.personasDiscapacitadas ?? 0),
      personasElectrodependientes:
        acc.personasElectrodependientes + (fam.personasElectrodependientes ?? 0),
      mascotasAfectadas: acc.mascotasAfectadas + (fam.mascotasAfectadas ?? 0),
    }),
    {
      nucleoFamiliarTotal: 0,
      cantidadNinos: 0,
      cantidadAdultosMayores: 0,
      personasDiscapacitadas: 0,
      personasElectrodependientes: 0,
      mascotasAfectadas: 0,
    }
  );

  return {
    familias: familiasLimpias,
    familiasAfectadas: familiasLimpias.length,
    ...totales,
    nivelCompromisoVivienda: compromiso,
    danosEstimados: danos,
  };
}

/**
 * Normaliza defensivamente detallesEvaluacion / detalles_evaluacion desde camelCase o snake_case
 * recalculando los totales consolidados desde familias[] cuando existen familias desglosadas.
 */
export function normalizarDetallesEvaluacionSocial(
  raw: unknown
): DetallesEvaluacionSocialDTO | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const obj = raw as Record<string, unknown>;
  const familiasRaw = Array.isArray(obj.familias) ? obj.familias : [];
  const familias: FamiliaAfectadaSocialDTO[] = familiasRaw.map((item, idx) => {
    const f = (item || {}) as Record<string, unknown>;
    const refRaw = typeof f.referencia === 'string' ? f.referencia.trim() : '';
    const compRaw = (f.nivelCompromisoVivienda ?? f.nivel_compromiso_vivienda) as
      | string
      | undefined;
    const comp = normalizarNivelCompromiso(compRaw);
    const nucleo = leerNumeroOpcional(f, 'nucleoFamiliarTotal', 'nucleo_familiar_total');

    return {
      ...(typeof f.id === 'string' ? { id: f.id } : { id: `fam-norm-${idx + 1}` }),
      ...(refRaw ? { referencia: refRaw } : {}),
      nucleoFamiliarTotal: Math.max(1, nucleo),
      cantidadNinos: leerNumeroOpcional(f, 'cantidadNinos', 'cantidad_ninos'),
      cantidadAdultosMayores: leerNumeroOpcional(
        f,
        'cantidadAdultosMayores',
        'cantidad_adultos_mayores'
      ),
      personasDiscapacitadas: leerNumeroOpcional(
        f,
        'personasDiscapacitadas',
        'personas_discapacitadas'
      ),
      personasElectrodependientes: leerNumeroOpcional(
        f,
        'personasElectrodependientes',
        'personas_electrodependientes'
      ),
      mascotasAfectadas: leerNumeroOpcional(f, 'mascotasAfectadas', 'mascotas_afectadas'),
      ...(comp ? { nivelCompromisoVivienda: comp } : {}),
    };
  });

  const nivelRaw = (obj.nivelCompromisoVivienda ?? obj.nivel_compromiso_vivienda) as
    | string
    | undefined;
  const nivelCompromisoVivienda = normalizarNivelCompromiso(nivelRaw) || null;
  const danosRaw = obj.danosEstimados ?? obj.danos_estimados;
  const danosEstimados = typeof danosRaw === 'string' && danosRaw.trim() ? danosRaw.trim() : null;

  if (familias.length > 0) {
    return construirDetallesEvaluacionSocial({
      familias,
      nivelCompromisoVivienda,
      danosEstimados,
    });
  }

  const cantidadNinos = leerNumeroOpcional(obj, 'cantidadNinos', 'cantidad_ninos');
  const cantidadAdultosMayores = leerNumeroOpcional(
    obj,
    'cantidadAdultosMayores',
    'cantidad_adultos_mayores'
  );
  const personasDiscapacitadas = leerNumeroOpcional(
    obj,
    'personasDiscapacitadas',
    'personas_discapacitadas'
  );
  const personasElectrodependientes = leerNumeroOpcional(
    obj,
    'personasElectrodependientes',
    'personas_electrodependientes'
  );
  const mascotasAfectadas = leerNumeroOpcional(obj, 'mascotasAfectadas', 'mascotas_afectadas');

  const tieneContadoresSueltos =
    cantidadNinos > 0 ||
    cantidadAdultosMayores > 0 ||
    personasDiscapacitadas > 0 ||
    personasElectrodependientes > 0 ||
    mascotasAfectadas > 0;

  if (!nivelCompromisoVivienda && !danosEstimados && !tieneContadoresSueltos) {
    return null;
  }

  return {
    ...(tieneContadoresSueltos
      ? {
          cantidadNinos,
          cantidadAdultosMayores,
          personasDiscapacitadas,
          personasElectrodependientes,
          mascotasAfectadas,
        }
      : {}),
    nivelCompromisoVivienda,
    danosEstimados,
  };
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

  const familiasDesglosadasCierre = extraerFamiliasDesglosadasDeReporte(
    reporteCierre,
    personasAfectadas
  );
  const familiasDesglosadas =
    familiasDesglosadasCierre.length > 0
      ? familiasDesglosadasCierre
      : extraerFamiliasDesglosadasDeReporte(reportePrioridad, personasAfectadas);

  const nivelCompromisoVivienda =
    normalizarNivelCompromiso(reporteCierre?.evaluacion?.nivelCompromisoVivienda) ||
    normalizarNivelCompromiso(reporteCierre?.detallesEvaluacion?.nivelCompromisoVivienda) ||
    normalizarNivelCompromiso(reportePrioridad?.evaluacion?.nivelCompromisoVivienda) ||
    normalizarNivelCompromiso(reportePrioridad?.detallesEvaluacion?.nivelCompromisoVivienda) ||
    '';

  const danosEstimados =
    reporteCierre?.danosEstimados?.trim() ||
    reporteCierre?.evaluacion?.danosEstimados?.trim() ||
    reporteCierre?.detallesEvaluacion?.danosEstimados?.trim() ||
    reportePrioridad?.danosEstimados?.trim() ||
    reportePrioridad?.evaluacion?.danosEstimados?.trim() ||
    reportePrioridad?.detallesEvaluacion?.danosEstimados?.trim() ||
    '';

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
    familiasDesglosadas,
    nivelCompromisoVivienda,
    danosEstimados,
  };
}
