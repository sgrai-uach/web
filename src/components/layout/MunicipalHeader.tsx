'use client';

import React from 'react';
import styles from '@/styles/chatbot.module.css';
import { EmergencyCallButton } from '@/components/chat/EmergencyCallButton';

export const MunicipalHeader: React.FC = () => {
  return (
    <header className={styles.municipalHeaderWrapper}>
      {/* 1. Franja Utilitaria Superior — Verde Salvia (Redes Sociales & Noticias) */}
      <div className={styles.topSageBar}>
        <div className={styles.topSageContainer}>
          <a
            href="https://www.valdivia.cl/noticias"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.topSageNewsLink}
            title="Ir a las noticias oficiales de la Municipalidad de Valdivia"
          >
            Revisa acá las últimas noticias de nuestro municipio
          </a>

          <div className={styles.socialIconsList} aria-label="Redes sociales institucionales">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/munivaldivia"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconLink}
              title="Facebook Municipalidad de Valdivia"
              aria-label="Facebook de la Municipalidad de Valdivia"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com/munivaldivia"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconLink}
              title="X (Twitter) Municipalidad de Valdivia"
              aria-label="X (Twitter) de la Municipalidad de Valdivia"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@MunicipalidaddeValdiviaChile"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconLink}
              title="YouTube Municipalidad de Valdivia"
              aria-label="YouTube de la Municipalidad de Valdivia"
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/munivaldivia"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialIconLink}
              title="Instagram Municipalidad de Valdivia"
              aria-label="Instagram de la Municipalidad de Valdivia"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Barra Principal Institucional — Verde Azulado Oscuro (Teal Dark) */}
      <div className={styles.header}>
        <div className={styles.headerLeftArea}>
          {/* Escudo Municipal de Valdivia */}
          <div className={styles.valdiviaBrandBlock}>
            <svg
              className={styles.valdiviaEscudoSvg}
              viewBox="0 0 60 70"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Escudo Ilustre Municipalidad de Valdivia"
            >
              {/* Corona mural superior */}
              <path d="M12 14L15 4L23 10L30 2L37 10L45 4L48 14H12Z" fill="#FFFFFF" opacity="0.9" />
              <rect x="15" y="14" width="30" height="3" fill="#FFFFFF" opacity="0.8" />
              {/* Escudo heráldico */}
              <path
                d="M14 18H46V42C46 54 30 65 30 65C30 65 14 54 14 42V18Z"
                fill="#14505A"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              {/* Cruz y ondas del escudo */}
              <path d="M30 20V62M16 35H44" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="30" cy="35" r="5" fill="#4FAE9B" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
            <div className={styles.valdiviaBrandText}>
              <span className={styles.brandTitleText}>MUNICIPALIDAD DE</span>
              <span className={styles.brandCityText}>VALDIVIA</span>
            </div>
          </div>

          {/* Distintivo CONTIGO Valdivia sí puede */}
          <div className={styles.contigoBadgeBlock}>
            <span className={styles.contigoBadgeLabel}>CONTIGO</span>
            <span className={styles.contigoBadgeSubtext}>Valdivia sí puede</span>
          </div>

          {/* Menú de Navegación Institucional */}
          <nav className={styles.headerNav} aria-label="Navegación municipal">
            <a
              href="https://www.valdivia.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerNavLink}
            >
              La Comuna <span className={styles.chevronIcon}>▾</span>
            </a>
            <a
              href="https://www.valdivia.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerNavLink}
            >
              La Municipalidad <span className={styles.chevronIcon}>▾</span>
            </a>
            <a
              href="https://www.valdivia.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerNavLink}
            >
              Direcciones Municipales <span className={styles.chevronIcon}>▾</span>
            </a>
          </nav>

          {/* Separador e Identidad del Asistente */}
          <div className={styles.headerDivider} />
          <div className={styles.headerAppTitleBlock}>
            <h1 className={styles.headerTitle}>Asistente virtual DGRD</h1>
            <p className={styles.headerSubtitle}>
              Reporte de Incidentes — Dirección de Gestión de Riesgos de Desastres
            </p>
          </div>
        </div>

        {/* Zona Derecha: Enlaces de Transparencia/Lobby + Botón Call Center */}
        <div className={styles.headerRightArea}>
          {/* Bloques de Transparencia y Lobby */}
          <div className={styles.institutionalLinks}>
            {/* Transparencia Activa */}
            <a
              href="https://www.valdivia.cl/transparencia"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.transparencyItem}
              title="Transparencia Activa — Ley de Transparencia"
            >
              <svg
                className={styles.transparencyIcon}
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v18M6 8l-4 4 4 4M18 8l4 4-4 4M2 12h20M7 21h10" />
              </svg>
              <div className={styles.transparencyText}>
                <span className={styles.transparencyLine1}>Transparencia Activa</span>
                <span className={styles.transparencyLine2}>Ley de Transparencia</span>
              </div>
            </a>

            {/* Solicitar Información - Transparencia */}
            <a
              href="https://www.valdivia.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.transparencyItem}
              title="Solicitar Información — Ley de Transparencia"
            >
              <svg
                className={styles.transparencyIcon}
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <div className={styles.transparencyText}>
                <span className={styles.transparencyLine1}>Solicitar Información</span>
                <span className={styles.transparencyLine2}>Ley de Transparencia</span>
              </div>
            </a>

            {/* Solicitar Información - Lobby */}
            <a
              href="https://www.valdivia.cl"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.transparencyItem}
              title="Solicitar Información — Ley de Lobby"
            >
              <svg
                className={styles.transparencyIcon}
                viewBox="0 0 24 24"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <div className={styles.transparencyText}>
                <span className={styles.transparencyLine1}>Solicitar Información</span>
                <span className={styles.transparencyLine2}>Ley de Lobby</span>
              </div>
            </a>
          </div>

          {/* Botón de Emergencia en la esquina superior derecha */}
          <EmergencyCallButton />
        </div>
      </div>
    </header>
  );
};
