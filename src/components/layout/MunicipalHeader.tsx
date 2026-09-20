'use client';

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/seguimiento.module.css';

export const MunicipalHeader: React.FC = () => {
  const newsUrl =
    process.env.NEXT_PUBLIC_NEWS_URL || 'https://munivaldivia.cl/noticias/';
  const emergencyPhone =
    process.env.NEXT_PUBLIC_EMERGENCY_PHONE || '1451';

  return (
    <header className={styles.municipalHeaderWrapper}>
      {/* Franja Superior Verde Salvia */}
      <div className={styles.topSageBar}>
        <div className={styles.topSageContainer}>
          <a
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.topSageNewsLink}
            title="Ir a las noticias oficiales de la Municipalidad de Valdivia"
          >
            Noticias oficiales — Municipalidad de Valdivia
          </a>
          <span style={{ fontSize: '0.8rem', color: '#3B3F45' }}>
            Portal Ciudadano DGRD
          </span>
        </div>
      </div>

      {/* Barra Principal Teal Oscuro */}
      <div className={styles.headerMain}>
        <div className={styles.headerMainContainer}>
          <div className={styles.headerTitleBlock}>
            <span className={styles.headerAgency}>
              Dirección de Gestión de Riesgos de Desastres
            </span>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1 className={styles.headerTitle}>
                SGRAI — Municipalidad de Valdivia
              </h1>
            </Link>
          </div>

          <a
            href={`tel:${emergencyPhone}`}
            className={styles.emergencyCallBtn}
            title={`Llamar a emergencias al ${emergencyPhone}`}
            aria-label={`Llamar a emergencias municipales al número ${emergencyPhone}`}
          >
            <span>📞</span>
            <span>Emergencias {emergencyPhone}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
