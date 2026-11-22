import type {
  DetallesEvaluacionSocialDTO,
  FamiliaAfectadaSocialDTO,
  NivelCompromisoViviendaSocial,
  PrioridadEventoSocial,
  ResumenAsistenciaSocialIncidente,
  TipoAfectacionSocial,
} from '@/types/asistenciaSocial';

export interface IncidenteResumenCompatible {
  id: string;
  codigo?: string | null;
  tipoAfectacion?: string | null;
  direccion?: string | null;
  estado?: string;
  requiereAsistenciaSocial?: boolean;
  personasAfectadas?: number | null;
  personas_afectadas?: number | null;
  verificado?: boolean;
  dictamenTerreno?: string | null;
  motivoNoAbordable?: string | null;
  asistenciaSocial?: ResumenAsistenciaSocialIncidente | null;
  ultimoReporte?: {
    personasAfectadas?: number | null;
    requiereAsistenciaSocial?: boolean | null;
    tipoReporte?: string | null;
  } | null;
  reportesEvaluacionTerreno?: ReporteTerrenoCompatible[] | null;
}

export interface EvaluacionTerrenoCompatible {
  nucleoFamiliarTotal?: number | null;
  familiasAfectadas?: number | null;
  familias?: readonly object[] | null;
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

/**
 * Determina si un reporte de terreno corresponde al informe técnico final de cuadrilla (H68).
 */
export function esReporteCierreCuadrillaCompatible(
  reporte?: ReporteTerrenoCompatible | null
): boolean {
  if (!reporte) return false;
  return (
    typeof reporte.tipoReporte === 'string' &&
    reporte.tipoReporte.trim().toUpperCase() === 'REPORTE_CUADRILLA'
  );
}

export interface ElegibilidadDerivacionSocialResult {
  esResuelto: boolean;
  personasAfectadas: number;
  requiereAsistenciaSocial: boolean;
  elegible: boolean;
  yaDerivado: boolean;
  tieneEventoPendiente: boolean;
  eventoSocial: ResumenAsistenciaSocialIncidente | null;
}

/**
 * Evalúa si un incidente en estado RESUELTO cumple los criterios de HU-25 para habilitar
 * la derivación a Asistencia Social (DGRD — Ficha FIBE):
 * - estado === 'RESUELTO'
 * - personasAfectadas > 0 OR requiereAsistenciaSocial === true
 * Consolida el conteo desde campos directos, REPORTE_CUADRILLA (H68), VERIFICACION_CIERRE (H39),
 * ultimoReporte y evaluación de prioridad (H38).
 */
export function evaluarElegibilidadDerivacionSocial(
  incidente?: IncidenteResumenCompatible | IncidenteDetalleCompatible | null
): ElegibilidadDerivacionSocialResult {
  if (!incidente) {
    return {
      esResuelto: false,
      personasAfectadas: 0,
      requiereAsistenciaSocial: false,
      elegible: false,
      yaDerivado: false,
      tieneEventoPendiente: false,
      eventoSocial: null,
    };
  }

  const esResuelto = (incidente.estado || '').trim().toUpperCase() === 'RESUELTO';
  const reportes = Array.isArray(incidente.reportesEvaluacionTerreno)
    ? [...incidente.reportesEvaluacionTerreno]
    : [];

  const reporteCuadrilla = reportes.find((r) => esReporteCierreCuadrillaCompatible(r)) || null;
  const reporteVerifCierre = reportes.find((r) => esReporteCierrePatrulla(r)) || null;
  const reportePrioridad =
    reportes.find(
      (r) => !esReporteCierreCuadrillaCompatible(r) && !esReporteCierrePatrulla(r)
    ) || null;

  const incExt = incidente as IncidenteResumenCompatible & {
    personasAfectadas?: number | null;
    personas_afectadas?: number | null;
    asistenciaSocial?: ResumenAsistenciaSocialIncidente | null;
    ultimoReporte?: {
      personasAfectadas?: number | null;
      requiereAsistenciaSocial?: boolean | null;
    } | null;
  };

  const candidatosPersonas: Array<number | null | undefined> = [
    incExt.personasAfectadas,
    incExt.personas_afectadas,
    extraerPersonasDeReporte(reporteCuadrilla),
    extraerPersonasDeReporte(reporteVerifCierre),
    incExt.ultimoReporte?.personasAfectadas,
    extraerPersonasDeReporte(reportePrioridad),
  ];

  let personasAfectadas = 0;
  for (const cand of candidatosPersonas) {
    if (typeof cand === 'number' && !Number.isNaN(cand) && cand > 0) {
      personasAfectadas = Math.trunc(cand);
      break;
    }
  }

  const requiereAsistenciaSocial = Boolean(
    incidente.requiereAsistenciaSocial ||
      reporteCuadrilla?.requiereAsistenciaSocial ||
      reporteVerifCierre?.requiereAsistenciaSocial ||
      incExt.ultimoReporte?.requiereAsistenciaSocial
  );

  const eventoSocial = incExt.asistenciaSocial ?? null;
  const estadoSocial = (eventoSocial?.estado || '').trim().toUpperCase();
  const tieneEventoPendiente = Boolean(eventoSocial && estadoSocial === 'PENDIENTE');
  const yaDerivado = Boolean(
    eventoSocial &&
      ['ASIGNADO', 'EN_EVALUACION_FIBE', 'FINALIZADO'].includes(estadoSocial)
  );

  const elegible = esResuelto && (personasAfectadas > 0 || requiereAsistenciaSocial);

  return {
    esResuelto,
    personasAfectadas,
    requiereAsistenciaSocial,
    elegible,
    yaDerivado,
    tieneEventoPendiente,
    eventoSocial,
  };
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

function leerTextoOpcional(
  obj: Record<string, unknown>,
  camel: string,
  snake: string
): string | null {
  const val = obj[camel] ?? obj[snake];
  if (typeof val !== 'string') return null;
  const limpio = val.trim();
  return limpio.length > 0 ? limpio : null;
}

export function validarCoherenciaFamiliaSocial(
  fam: FamiliaAfectadaSocialDTO
): Record<string, string> {
  const errores: Record<string, string> = {};
  const total = Math.trunc(Number(fam.nucleoFamiliarTotal) || 0);
  const ninos = Math.trunc(Number(fam.cantidadNinos) || 0);
  const adultos = Math.trunc(Number(fam.cantidadAdultosMayores) || 0);
  const discap = Math.trunc(Number(fam.personasDiscapacitadas) || 0);
  const electro = Math.trunc(Number(fam.personasElectrodependientes) || 0);

  if (total < 1) {
    errores.nucleoFamiliarTotal = 'Cada familia debe registrar al menos 1 integrante.';
  }
  if (ninos + adultos > total) {
    errores.cantidadNinos = `Niños (${ninos}) + adultos mayores (${adultos}) excede el total de integrantes (${total}).`;
  }
  if (discap > total) {
    errores.personasDiscapacitadas = `Personas con discapacidad (${discap}) no puede superar el total de integrantes (${total}).`;
  }
  if (electro > total) {
    errores.personasElectrodependientes = `Personas electrodependientes (${electro}) no puede superar el total de integrantes (${total}).`;
  }

  const rut = fam.contactoRut?.trim() || '';
  if (rut.length > 0) {
    const limpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    let rutValido = /^\d{7,8}[0-9K]$/.test(limpio);
    if (rutValido) {
      const cuerpo = limpio.slice(0, -1);
      const dvIngresado = limpio.slice(-1);
      let suma = 0;
      let mult = 2;
      for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * mult;
        mult = mult === 7 ? 2 : mult + 1;
      }
      const resto = 11 - (suma % 11);
      const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
      rutValido = dvIngresado === dvEsperado;
    }
    if (!rutValido) {
      errores.contactoRut = 'El RUT preliminar ingresado no es válido.';
    }
  }

  return errores;
}

export function calcularLimitesFamiliaSocial(fam: FamiliaAfectadaSocialDTO) {
  const total = Math.max(0, Math.trunc(Number(fam.nucleoFamiliarTotal) || 0));
  const ninos = Math.max(0, Math.trunc(Number(fam.cantidadNinos) || 0));
  const adultos = Math.max(0, Math.trunc(Number(fam.cantidadAdultosMayores) || 0));
  return {
    totalEtarios: ninos + adultos,
    cupoEtarioDisponible: Math.max(0, total - (ninos + adultos)),
  };
}

export function extraerContactoPrincipalDesdeFamilias(
  familias?: FamiliaAfectadaSocialDTO[] | null
): {
  contactoNombre: string;
  contactoTelefono: string;
  contactoRut: string;
} {
  if (!Array.isArray(familias) || familias.length === 0) {
    return { contactoNombre: '', contactoTelefono: '', contactoRut: '' };
  }
  for (const fam of familias) {
    const nombre = fam.contactoNombre?.trim() || '';
    const telefono = fam.contactoTelefono?.trim() || '';
    const rut = fam.contactoRut?.trim() || '';
    if (nombre || telefono || rut) {
      return {
        contactoNombre: nombre,
        contactoTelefono: telefono,
        contactoRut: rut,
      };
    }
  }
  return { contactoNombre: '', contactoTelefono: '', contactoRut: '' };
}

function extraerFamiliasDesglosadasDeReporte(
  reporte?: ReporteTerrenoCompatible | null,
  personasFallbackUnica?: number | null
): FamiliaAfectadaSocialDTO[] {
  if (!reporte) return [];
  const evalObj = reporte.evaluacion as Record<string, unknown> | null | undefined;
  const detObj = reporte.detallesEvaluacion as Record<string, unknown> | null | undefined;
  const fuentes = [
    reporte.evaluacion,
    evalObj?.evaluacionPrioridadPrevia as Record<string, unknown> | undefined,
    reporte.detallesEvaluacion,
    detObj?.evaluacionPrioridadPrevia as Record<string, unknown> | undefined,
  ];
  for (const fuente of fuentes) {
    if (!fuente || !Array.isArray(fuente.familias) || fuente.familias.length === 0) continue;
    const totalFamiliasFuente = fuente.familias.length;

    return fuente.familias.map((raw, idx) => {
      const f = (raw || {}) as Record<string, unknown>;
      const refRaw = typeof f.referencia === 'string' ? f.referencia.trim() : '';
      let nucleo = leerNumeroOpcional(f, 'nucleoFamiliarTotal', 'nucleo_familiar_total');
      if (
        nucleo === 0 &&
        totalFamiliasFuente === 1 &&
        typeof personasFallbackUnica === 'number' &&
        personasFallbackUnica > 0
      ) {
        nucleo = personasFallbackUnica;
      }
      const compRaw = (f.nivelCompromisoVivienda ?? f.nivel_compromiso_vivienda) as
        | string
        | undefined;
      const comp = normalizarNivelCompromiso(compRaw);
      const contactoNombre = leerTextoOpcional(f, 'contactoNombre', 'contacto_nombre');
      const contactoTelefono = leerTextoOpcional(f, 'contactoTelefono', 'contacto_telefono');
      const contactoRut = leerTextoOpcional(f, 'contactoRut', 'contacto_rut');

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
        ...(contactoNombre ? { contactoNombre } : {}),
        ...(contactoTelefono ? { contactoTelefono } : {}),
        ...(contactoRut ? { contactoRut } : {}),
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
    ...(f.contactoNombre?.trim() ? { contactoNombre: f.contactoNombre.trim() } : {}),
    ...(f.contactoTelefono?.trim() ? { contactoTelefono: f.contactoTelefono.trim() } : {}),
    ...(f.contactoRut?.trim() ? { contactoRut: f.contactoRut.trim() } : {}),
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
    const contactoNombre = leerTextoOpcional(f, 'contactoNombre', 'contacto_nombre');
    const contactoTelefono = leerTextoOpcional(f, 'contactoTelefono', 'contacto_telefono');
    const contactoRut = leerTextoOpcional(f, 'contactoRut', 'contacto_rut');

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
      ...(contactoNombre ? { contactoNombre } : {}),
      ...(contactoTelefono ? { contactoTelefono } : {}),
      ...(contactoRut ? { contactoRut } : {}),
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

  const reporteCuadrilla =
    reportes.find((r) => esReporteCierreCuadrillaCompatible(r)) || null;
  const reporteCierre = reportes.find((r) => esReporteCierrePatrulla(r)) || null;
  const reportePrioridad =
    reportes.find(
      (r) => !esReporteCierrePatrulla(r) && !esReporteCierreCuadrillaCompatible(r)
    ) || null;

  const personasCuadrilla = extraerPersonasDeReporte(reporteCuadrilla);
  const personasCierre = extraerPersonasDeReporte(reporteCierre);
  const personasDePrioridad = extraerPersonasDeReporte(reportePrioridad);
  const personasAfectadas =
    (typeof personasCuadrilla === 'number' && personasCuadrilla > 0 ? personasCuadrilla : null) ??
    personasCierre ??
    personasDePrioridad ??
    null;

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
  const familiasDesglosadasBase =
    familiasDesglosadasCierre.length > 0
      ? familiasDesglosadasCierre
      : extraerFamiliasDesglosadasDeReporte(reportePrioridad, personasAfectadas);

  const infNombre = detalle.informante?.nombre?.trim() || '';
  const infTelefono = detalle.informante?.telefono?.trim() || '';
  const infRut = detalle.informante?.rut?.trim() || '';

  const familiasDesglosadas = familiasDesglosadasBase.map((fam, idx) => {
    if (
      idx === 0 &&
      !fam.contactoNombre &&
      !fam.contactoTelefono &&
      !fam.contactoRut &&
      (infNombre || infTelefono || infRut)
    ) {
      return {
        ...fam,
        ...(infNombre ? { contactoNombre: infNombre } : {}),
        ...(infTelefono ? { contactoTelefono: infTelefono } : {}),
        ...(infRut ? { contactoRut: infRut } : {}),
      };
    }
    return fam;
  });

  const contactoDesdeFamilias = extraerContactoPrincipalDesdeFamilias(familiasDesglosadas);
  const contactoNombre =
    familiasDesglosadas.length > 0 ? contactoDesdeFamilias.contactoNombre : infNombre;
  const contactoTelefono =
    familiasDesglosadas.length > 0 ? contactoDesdeFamilias.contactoTelefono : infTelefono;
  const contactoRut =
    familiasDesglosadas.length > 0 ? contactoDesdeFamilias.contactoRut : infRut;

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
    contactoNombre,
    contactoTelefono,
    contactoRut,
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
