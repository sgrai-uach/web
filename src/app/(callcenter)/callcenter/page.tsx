'use client';

import React from 'react';
import AvisoDetalleModal from '@/components/callcenter/AvisoDetalleModal';
import AvisosFiltros from '@/components/callcenter/AvisosFiltros';
import AvisosHeader from '@/components/callcenter/AvisosHeader';
import AvisosTable from '@/components/callcenter/AvisosTable';
import { useAvisos } from '@/hooks/useAvisos';

export default function CallCenterPage() {
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
