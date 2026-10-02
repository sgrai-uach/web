'use client';

import React, { Suspense } from 'react';
import AvisoDetalleModal from '@/components/callcenter/AvisoDetalleModal';
import AvisosFiltros from '@/components/callcenter/AvisosFiltros';
import AvisosHeader from '@/components/callcenter/AvisosHeader';
import AvisosTable from '@/components/callcenter/AvisosTable';
import { useAvisos } from '@/hooks/useAvisos';

function CallCenterContent() {
  const {
    avisos,
    cargando,
    refrescando,
    paginaActual,
    setPaginaActual,
    limite,
    setLimite,
    totalItems,
    totalPaginas,
    operadorActivo,
    setOperadorActivo,
    avisoSeleccionado,
    setAvisoSeleccionado,
    busqueda,
    setBusqueda,
    filtroOrigen,
    setFiltroOrigen,
    filtroSemaforo,
    setFiltroSemaforo,
    filtroDelegacion,
    setFiltroDelegacion,
    filtroEstado,
    setFiltroEstado,
    hayFiltrosActivos,
    limpiarFiltros,
    cargarAvisos,
    handleRefrescarManual,
    isConnected,
    metricas,
  } = useAvisos();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6, 24px)' }}>
      <AvisosHeader
        socketConnected={isConnected}
        operadorActivo={operadorActivo}
        onCambiarOperador={setOperadorActivo}
        metricas={metricas}
      />

      <AvisosFiltros
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroOrigen={filtroOrigen}
        onFiltroOrigenChange={setFiltroOrigen}
        filtroSemaforo={filtroSemaforo}
        onFiltroSemaforoChange={setFiltroSemaforo}
        filtroDelegacion={filtroDelegacion}
        onFiltroDelegacionChange={setFiltroDelegacion}
        filtroEstado={filtroEstado}
        onFiltroEstadoChange={setFiltroEstado}
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={limpiarFiltros}
        onRefrescar={handleRefrescarManual}
        cargando={refrescando}
      />

      <AvisosTable
        avisos={avisos}
        cargando={cargando}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalItems}
        limite={limite}
        hayFiltrosActivos={hayFiltrosActivos}
        onLimpiarFiltros={limpiarFiltros}
        onCambiarPagina={setPaginaActual}
        onCambiarLimite={(l) => {
          setLimite(l);
          setPaginaActual(1);
        }}
        onSeleccionarAviso={setAvisoSeleccionado}
      />

      <AvisoDetalleModal
        aviso={avisoSeleccionado}
        operadorId={operadorActivo.id}
        onClose={() => setAvisoSeleccionado(null)}
        onAccionCompletada={() => cargarAvisos(true)}
      />
    </div>
  );
}

export default function CallCenterPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-charcoal, #3B3F45)' }}>
          Cargando Centro de Atención Call Center...
        </div>
      }
    >
      <CallCenterContent />
    </Suspense>
  );
}
