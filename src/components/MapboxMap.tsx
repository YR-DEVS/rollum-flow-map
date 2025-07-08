
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface MapboxMapProps {
  activeMode: 'view' | 'add-spot' | 'draw-route';
  onModeChange: (mode: 'view' | 'add-spot' | 'draw-route') => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ activeMode, onModeChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoieXVuZ3JlemFjIiwiYSI6ImNtOW10ZzJ6bDBjNHUyanI3ejc5eXo1d2MifQ._tryk9cXjfReUGLGnNkm6Q';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [37.6176, 55.7558], // Москва
      zoom: 12,
    });

    // Добавляем элементы управления
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Обработчик клика для добавления спотов
    map.current.on('click', (e) => {
      if (activeMode === 'add-spot') {
        const popup = new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="padding: 10px;">
              <h3 style="margin: 0 0 10px 0; font-weight: bold;">Новый спот</h3>
              <p style="margin: 0; color: #666;">Координаты: ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}</p>
            </div>
          `)
          .addTo(map.current!);

        // Добавляем маркер
        new mapboxgl.Marker({ color: '#3b82f6' })
          .setLngLat(e.lngLat)
          .setPopup(popup)
          .addTo(map.current!);

        onModeChange('view');
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [activeMode, onModeChange]);

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-96 rounded-lg" />
      
      {activeMode === 'add-spot' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-blue-800 text-sm font-medium">
              Нажмите на карту, чтобы добавить новый спот
            </p>
          </Card>
        </div>
      )}

      {activeMode === 'draw-route' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-green-800 text-sm font-medium">
              Кликайте по карте, чтобы нарисовать маршрут
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
