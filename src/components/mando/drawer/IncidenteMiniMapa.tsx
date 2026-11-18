'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface IncidenteMiniMapaProps {
  latitud: number;
  longitud: number;
  direccion: string;
  codigo: string;
  prioridad?: string;
}

function createPinSvg(prioridad?: string): string {
  const color =
    prioridad === 'CRITICA'
      ? '#D32F2F'
      : prioridad === 'ALTA'
      ? '#E65100'
      : prioridad === 'MEDIA'
      ? '#1B6F7D'
      : '#5F676E';

  return `
    <svg width="28" height="38" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16344 0 0 7.16344 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/>
      <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
      <circle cx="16" cy="16" r="3" fill="${color}"/>
    </svg>
  `;
}

export default function IncidenteMiniMapa({
  latitud,
  longitud,
  direccion,
  codigo,
  prioridad,
}: IncidenteMiniMapaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitud, longitud],
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: createPinSvg(prioridad),
      className: '',
      iconSize: [28, 38],
      iconAnchor: [14, 38],
      popupAnchor: [0, -34],
    });

    const marker = L.marker([latitud, longitud], { icon }).addTo(map);
    marker.bindPopup(`<strong>${codigo}</strong><br/>${direccion}`);

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [latitud, longitud, direccion, codigo, prioridad]);

  return (
    <div
      ref={containerRef}
      data-testid="incidente-mini-mapa-leaflet"
      style={{
        width: '100%',
        height: '220px',
        borderRadius: 'var(--radius-none, 0px)',
        border: '1px solid #CBD5E1',
        overflow: 'hidden',
      }}
    />
  );
}

