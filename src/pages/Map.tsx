
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Route, Map as MapIcon, List } from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';
import SpotsRoutesList from '@/components/SpotsRoutesList';

const Map = () => {
  const [activeMode, setActiveMode] = useState<'view' | 'add-spot' | 'draw-route'>('view');
  const [activeTab, setActiveTab] = useState('map');

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
            />
          </TabsContent>
          <TabsContent value="list" className="h-full m-0 overflow-y-auto">
            <SpotsRoutesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Map;
