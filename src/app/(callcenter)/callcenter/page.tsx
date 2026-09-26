'use client';

import React from 'react';
import AvisoDetalleModal from '@/components/callcenter/AvisoDetalleModal';
import AvisosFiltros from '@/components/callcenter/AvisosFiltros';
import AvisosHeader from '@/components/callcenter/AvisosHeader';
import AvisosTable from '@/components/callcenter/AvisosTable';
import { ToastProvider } from '@/components/ui/Toast';
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
    cargarAvisos,
    handleRefrescarManual,
    isConnected,
    metricas,
  } = useAvisos();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-light, #ECEFF3)',
        paddingBottom: '3rem',
      }}
    >
      <AvisosHeader
        socketConnected={isConnected}
        operadorActivo={operadorActivo}
        onCambiarOperador={setOperadorActivo}
        metricas={metricas}
      />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
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
      </main>

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
    <ToastProvider>
      <CallCenterContent />
    </ToastProvider>
  );
}
