'use client';

import React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import styles from './MunicipalHeader.module.css';

export const MunicipalHeader: React.FC = () => {
  const newsUrl =
    process.env.NEXT_PUBLIC_NEWS_URL || 'https://munivaldivia.cl/noticias/';
  const facebookUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    'https://www.facebook.com/municipalidaddevaldivia/';
  const xUrl =
    process.env.NEXT_PUBLIC_X_URL || 'https://x.com/munivaldivia';
  const youtubeUrl =
    process.env.NEXT_PUBLIC_YOUTUBE_URL ||
    'https://www.youtube.com/channel/UCetNW4KMclDExRj9CsIyqig';
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    'https://www.instagram.com/munivaldivia';
  const emergencyPhone =
    process.env.NEXT_PUBLIC_EMERGENCY_PHONE || '1451';

  return (
    <header className={styles.headerWrapper}>
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
            Revisa acá las últimas noticias de nuestro municipio
          </a>

          <div
            className={styles.topSageSocialGroup}
            aria-label="Redes sociales institucionales"
          >
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topSageSocialLink}
              title="Facebook — Municipalidad de Valdivia"
              aria-label="Facebook oficial de la Municipalidad de Valdivia"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.356 5 15.444 5H18V0h-3.808C10.593 0 9 1.583 9 4.615V8z" />
              </svg>
            </a>

            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topSageSocialLink}
              title="X (Twitter) — Municipalidad de Valdivia"
              aria-label="X (Twitter) oficial de la Municipalidad de Valdivia"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topSageSocialLink}
              title="YouTube — Municipalidad de Valdivia"
              aria-label="YouTube oficial de la Municipalidad de Valdivia"
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topSageSocialLink}
              title="Instagram — Municipalidad de Valdivia"
              aria-label="Instagram oficial de la Municipalidad de Valdivia"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
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
            <Phone size={16} aria-hidden="true" />
            <span>Emergencias {emergencyPhone}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
