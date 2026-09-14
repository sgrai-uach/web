'use client';

import React, { useEffect, useRef } from 'react';
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  LeafletMouseEvent,
  DivIcon as LeafletDivIcon,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerMapProps {
  latitud?: number | null;
  longitud?: number | null;
  onChange: (coords: { latitud: number; longitud: number } | null) => void;
  onUserSelectLocation?: (coords: { latitud: number; longitud: number }) => void;
  readOnly?: boolean;
}

export default function LocationPickerMap({
  latitud,
  longitud,
  onChange,
  onUserSelectLocation,
  readOnly = false,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);
  const pinIconRef = useRef<LeafletDivIcon | null>(null);
  const onChangeRef = useRef(onChange);
  const onUserSelectLocationRef = useRef(onUserSelectLocation);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onUserSelectLocationRef.current = onUserSelectLocation;
  }, [onUserSelectLocation]);

  const initialCoordsRef = useRef({ latitud, longitud });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    // Carga dinámica de Leaflet para compatibilidad SSR con Next.js
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      leafletModuleRef.current = L;

      // Ícono institucional plano de la Municipalidad de Valdivia (Teal con esquinas rectas)
      const pinIcon = L.divIcon({
        className: 'custom-valdivia-pin',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background-color: #1B6F7D;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="2.5"/>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      pinIconRef.current = pinIcon;

      const numLat = typeof initialCoordsRef.current.latitud === 'number' ? initialCoordsRef.current.latitud : null;
      const numLng = typeof initialCoordsRef.current.longitud === 'number' ? initialCoordsRef.current.longitud : null;
      const hasInitialCoords = numLat !== null && numLng !== null && Number.isFinite(numLat) && Number.isFinite(numLng);

      const centerLat = hasInitialCoords ? numLat : -39.81422;
      const centerLng = hasInitialCoords ? numLng : -73.24589;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap &bull; Municipalidad de Valdivia',
          maxZoom: 19,
        }).addTo(map);

        if (hasInitialCoords) {
          const marker = L.marker([numLat, numLng], {
            icon: pinIcon,
            draggable: !readOnly,
          }).addTo(map);

          if (!readOnly) {
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              const coords = {
                latitud: parseFloat(pos.lat.toFixed(6)),
                longitud: parseFloat(pos.lng.toFixed(6)),
              };
              onChangeRef.current(coords);
              onUserSelectLocationRef.current?.(coords);
            });
          }

          markerRef.current = marker;
        }

        if (!readOnly) {
          map.on('click', (e: LeafletMouseEvent) => {
            const newLat = parseFloat(e.latlng.lat.toFixed(6));
            const newLng = parseFloat(e.latlng.lng.toFixed(6));
            const coords = { latitud: newLat, longitud: newLng };

            if (!markerRef.current) {
              const marker = L.marker([newLat, newLng], {
                icon: pinIcon,
                draggable: true,
              }).addTo(map);

              marker.on('dragend', () => {
                const pos = marker.getLatLng();
                const dragCoords = {
                  latitud: parseFloat(pos.lat.toFixed(6)),
                  longitud: parseFloat(pos.lng.toFixed(6)),
                };
                onChangeRef.current(dragCoords);
                onUserSelectLocationRef.current?.(dragCoords);
              });

              markerRef.current = marker;
            } else {
              markerRef.current.setLatLng([newLat, newLng]);
            }

            onChangeRef.current(coords);
            onUserSelectLocationRef.current?.(coords);
          });
        }

        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [readOnly]);

  // Actualizar marcador reactivamente cuando las props externas cambien
  useEffect(() => {
    const numLat = typeof latitud === 'number' && Number.isFinite(latitud) ? latitud : null;
    const numLng = typeof longitud === 'number' && Number.isFinite(longitud) ? longitud : null;
    const hasValidCoords = numLat !== null && numLng !== null;

    if (mapInstanceRef.current) {
      if (hasValidCoords) {
        if (markerRef.current) {
          const currentPos = markerRef.current.getLatLng();
          if (
            Math.abs(currentPos.lat - numLat) > 0.00001 ||
            Math.abs(currentPos.lng - numLng) > 0.00001
          ) {
            markerRef.current.setLatLng([numLat, numLng]);
            mapInstanceRef.current.panTo([numLat, numLng], { animate: true });
          }
        } else if (leafletModuleRef.current && pinIconRef.current) {
          const L = leafletModuleRef.current;
          const marker = L.marker([numLat, numLng], {
            icon: pinIconRef.current,
            draggable: !readOnly,
          }).addTo(mapInstanceRef.current);

          if (!readOnly) {
            marker.on('dragend', () => {
              const pos = marker.getLatLng();
              const coords = {
                latitud: parseFloat(pos.lat.toFixed(6)),
                longitud: parseFloat(pos.lng.toFixed(6)),
              };
              onChangeRef.current(coords);
              onUserSelectLocationRef.current?.(coords);
            });
          }

          markerRef.current = marker;
          mapInstanceRef.current.panTo([numLat, numLng], { animate: true });
        }
      } else if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitud, longitud, readOnly]);

  const hasCoords = typeof latitud === 'number' && typeof longitud === 'number';

  const handleLimpiarPunto = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onChangeRef.current(null);
  };

  const handleCentrarValdivia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-39.81422, -73.24589], 14, { animate: true });
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '240px',
          border: '1px solid #3B3F45',
          backgroundColor: '#ECEFF3',
          zIndex: 1,
        }}
        aria-label="Mapa interactivo para selección de coordenadas de incidente"
      />

      <div
        style={{
          fontSize: '12px',
          color: '#3B3F45',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>
          {hasCoords
            ? 'Punto fijado. Puedes arrastrar el marcador para afinar la ubicación.'
            : 'Haz clic en el mapa para marcar el punto exacto (opcional).'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'inherit' }}>
            GPS:{' '}
            {hasCoords ? (
              <strong style={{ color: '#1B6F7D' }}>
                {latitud?.toFixed(5)}, {longitud?.toFixed(5)}
              </strong>
            ) : (
              <span style={{ color: '#666' }}>Automático por dirección</span>
            )}
          </span>

          {hasCoords && !readOnly && (
            <button
              type="button"
              onClick={handleLimpiarPunto}
              style={{
                fontFamily: 'inherit',
                backgroundColor: '#3B3F45',
                color: '#FFFFFF',
                border: '1px solid #3B3F45',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 0,
                display: 'inline-flex',
                alignItems: 'center',
                height: '28px',
              }}
            >
              Limpiar GPS
            </button>
          )}

          <button
            type="button"
            onClick={handleCentrarValdivia}
            style={{
              fontFamily: 'inherit',
              backgroundColor: '#ECEFF3',
              color: '#1B6F7D',
              border: '1px solid #1B6F7D',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 0,
              display: 'inline-flex',
              alignItems: 'center',
              height: '28px',
            }}
          >
            Centrar Valdivia
          </button>
        </div>
      </div>
    </div>
  );
}
