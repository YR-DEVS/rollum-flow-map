
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MapboxMapProps {
  activeMode: 'view' | 'add-spot' | 'draw-route';
  onModeChange: (mode: 'view' | 'add-spot' | 'draw-route') => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ activeMode, onModeChange }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(true);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
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
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

  if (showTokenInput) {
    return (
      <div className="h-96 bg-gray-100 flex items-center justify-center">
        <Card className="p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Настройка карты</h3>
          <p className="text-sm text-gray-600 mb-4">
            Введите ваш Mapbox Public Token для отображения карты
          </p>
          <input
            type="text"
            placeholder="pk.ey..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <Button onClick={handleTokenSubmit} className="w-full">
            Загрузить карту
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Получите токен на <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500">mapbox.com</a>
          </p>
        </Card>
      </div>
    );
  }

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
