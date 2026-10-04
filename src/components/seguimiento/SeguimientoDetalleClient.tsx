'use client';

import React, { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/seguimiento.module.css';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import { MunicipalHeader } from '@/components/layout/MunicipalHeader';
import AppFooter from '@/components/layout/AppFooter';
import { SeguimientoStepper } from './SeguimientoStepper';
import { SeguimientoResumenCard } from './SeguimientoResumenCard';
import { SeguimientoErrorCard } from './SeguimientoErrorCard';
import { SeguimientoSkeleton } from './SeguimientoSkeleton';
import {
  consultarSeguimientoIncidente,
  type DatosSeguimiento,
} from '@/services/seguimientoService';
import {
  useSeguimientoSocket,
  type EstadoActualizadoPayload,
} from '@/hooks/useSeguimientoSocket';

interface SeguimientoDetalleClientProps {
  codigo: string;
}

export const SeguimientoDetalleClient: React.FC<SeguimientoDetalleClientProps> = ({
  codigo,
}) => {
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [datos, setDatos] = useState<DatosSeguimiento | null>(null);
  const [recargarTrigger, setRecargarTrigger] = useState(0);

  const reintentar = useCallback(() => {
    setCargando(true);
    setErrorMensaje(null);
    setRecargarTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelado = false;

    async function ejecutarConsulta() {
      const res = await consultarSeguimientoIncidente(codigo);
      if (cancelado) return;

      if (res.exito && res.datos) {
        setDatos(res.datos);
        setErrorMensaje(null);
      } else {
        setErrorMensaje(res.mensaje);
        setDatos(null);
      }
      setCargando(false);
    }

    ejecutarConsulta();

    return () => {
      cancelado = true;
    };
  }, [codigo, recargarTrigger]);

  const handleEstadoActualizado = useCallback((payload: EstadoActualizadoPayload) => {
    setDatos((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        estado: payload.estado,
        estadoEtiqueta: payload.estadoEtiqueta,
        estadoDescripcion: payload.estadoDescripcion,
        actualizadoEn: payload.actualizadoEn,
      };
    });
  }, []);

  const { actualizadoEnVivo } = useSeguimientoSocket({
    codigo,
    onEstadoActualizado: handleEstadoActualizado,
  });

  return (
    <div className={styles.pageWrapper}>
      <MunicipalHeader />

      <main className={styles.mainContainer}>
        <div className={styles.sectionTitleBlock}>
          <Heading as="h2" variant="h2" color="teal-dark" noMargin>
            Seguimiento de Incidente
          </Heading>
          <p className={styles.sectionSubtitle}>
            Consulta en tiempo real del estado de atención gestionado por la central municipal y cuadrillas en terreno.
          </p>
        </div>

        {cargando && <SeguimientoSkeleton />}

        {!cargando && errorMensaje && (
          <SeguimientoErrorCard
            codigo={codigo}
            mensaje={errorMensaje}
            onReintentar={reintentar}
          />
        )}

        {!cargando && datos && (
          <>
            <SeguimientoStepper estado={datos.estado} />
            <SeguimientoResumenCard
              datos={datos}
              actualizadoEnVivo={actualizadoEnVivo}
            />

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <Button href="/ciudadania" variant="secondary">
                ← Consultar otro código
              </Button>
              <Button href="/ciudadania/reportar" variant="primary">
                + Ingresar nuevo reporte
              </Button>
            </div>
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
};
