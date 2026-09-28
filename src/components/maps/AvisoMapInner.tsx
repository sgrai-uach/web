'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AvisoMapInnerProps {
  latitud: number;
  longitud: number;
  titulo?: string;
  direccion?: string;
}

export default function AvisoMapInner({
  latitud,
  longitud,
  titulo,
  direccion,
}: AvisoMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si ya existe instancia, removerla antes de crear una nueva
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = Number(latitud);
    const lng = Number(longitud);

    // Inicializar mapa centrado en coordenadas
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    // Capa base OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Marcador SVG personalizado plano (sin problemas de rutas estáticas de Leaflet)
    const customPinSvg = `
      <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 46 17 46C17 46 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#1B6F7D"/>
        <circle cx="17" cy="17" r="7" fill="#FFFFFF"/>
        <circle cx="17" cy="17" r="4" fill="#4FAE9B"/>
      </svg>
    `;

    const pinIcon = L.divIcon({
      html: `<div style="display: flex; justify-content: center; align-items: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${customPinSvg}</div>`,
      className: 'custom-leaflet-marker',
      iconSize: [34, 46],
      iconAnchor: [17, 46],
      popupAnchor: [0, -42],
    });

    const popupContent = `
      <div style="font-family: inherit; font-size: 13px; color: #2B2B2B; padding: 2px;">
        <strong style="color: #1B6F7D; display: block; margin-bottom: 4px;">${
          titulo || 'Ubicación del Aviso'
        }</strong>
        ${
          direccion
            ? `<div style="margin-bottom: 4px; font-weight: 500;">${direccion}</div>`
            : ''
        }
        <div style="font-size: 11px; color: #555;">Coordenadas: ${lat.toFixed(
          5
        )}, ${lng.toFixed(5)}</div>
      </div>
    `;

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    marker.bindPopup(popupContent).openPopup();

    // Redimensionar después de un pequeño retraso por animaciones de modal/drawer
    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimeout);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitud, longitud, titulo, direccion]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '260px',
          backgroundColor: '#ECEFF3',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '2px 8px',
          fontSize: '11px',
          border: '1px solid #DFE3E8',
        }}
      >
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=16/${latitud}/${longitud}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-primary-teal, #1B6F7D)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ver en OpenStreetMap &rarr;
        </a>
      </div>
    </div>
  );
}
