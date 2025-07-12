
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Route, Map as MapIcon, List } from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';
import MapboxTokenInput from '@/components/MapboxTokenInput';
import SpotsRoutesList from '@/components/SpotsRoutesList';
import { useSearchParams } from 'react-router-dom';

const Map = () => {
  const [activeMode, setActiveMode] = useState<'view' | 'add-spot' | 'draw-route'>('view');
  const [activeTab, setActiveTab] = useState('map');
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [focusData, setFocusData] = useState<{
    type: 'spot' | 'route' | null;
    id: string | null;
    lat?: number;
    lng?: number;
  }>({ type: null, id: null });
  
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Проверяем сохраненный токен
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  useEffect(() => {
    // Проверяем URL параметры для фокуса на споте или маршруте
    const focus = searchParams.get('focus');
    const id = searchParams.get('id');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (focus && id) {
      if (focus === 'spot' && lat && lng) {
        setFocusData({
          type: 'spot',
          id,
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        });
        setActiveTab('map');
      } else if (focus === 'route') {
        setFocusData({
          type: 'route',
          id
        });
        setActiveTab('map');
      }
    }
  }, [searchParams]);

  const handleSpotClick = (spotId: string, lat: number, lng: number) => {
    setFocusData({ type: 'spot', id: spotId, lat, lng });
    setActiveTab('map');
  };

  const handleRouteClick = (routeId: string) => {
    setFocusData({ type: 'route', id: routeId });
    setActiveTab('map');
  };

  const handleTokenSet = (token: string) => {
    setMapboxToken(token);
  };

  // Если токен не установлен, показываем экран ввода токена
  if (!mapboxToken) {
    return <MapboxTokenInput onTokenSet={handleTokenSet} />;
  }

  return (
    <div className="h-screen bg-gray-50 pb-20 flex flex-col">
      <div className="bg-white px-6 py-4 border-b border-gray-200 z-20 relative">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Карта спотов</h1>
        
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeMode === 'add-spot' ? 'default' : 'outline'}
            onClick={() => setActiveMode(activeMode === 'add-spot' ? 'view' : 'add-spot')}
            className="flex items-center space-x-2 rounded-full"
            disabled={activeTab !== 'map'}
          >
            <Plus size={16} />
            <span>Добавить спот</span>
          </Button>
          
          <Button
            variant={activeMode === 'draw-route' ? 'default' : 'outline'}
            onClick={() => setActiveMode(activeMode === 'draw-route' ? 'view' : 'draw-route')}
            className="flex items-center space-x-2 rounded-full"
            disabled={activeTab !== 'map'}
          >
            <Route size={16} />
            <span>Маршрут</span>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <MapIcon size={16} />
              <span>Карта</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center space-x-2">
              <List size={16} />
              <span>Список</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="map" className="h-full m-0">
            <MapboxMap 
              activeMode={activeMode} 
              onModeChange={setActiveMode}
              focusData={focusData}
              onFocusComplete={() => setFocusData({ type: null, id: null })}
              mapboxToken={mapboxToken}
            />
          </TabsContent>
          <TabsContent value="list" className="h-full m-0 overflow-y-auto">
            <SpotsRoutesList 
              onSpotClick={handleSpotClick}
              onRouteClick={handleRouteClick}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Map;
