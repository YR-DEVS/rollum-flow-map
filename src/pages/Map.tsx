
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Route } from 'lucide-react';
import MapboxMap from '@/components/MapboxMap';

const Map = () => {
  const [activeMode, setActiveMode] = useState<'view' | 'add-spot' | 'draw-route'>('view');

  return (
    <div className="h-screen bg-gray-50 pb-20 flex flex-col">
      <div className="bg-white px-6 py-4 border-b border-gray-200 z-20 relative">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Карта спотов</h1>
        
        <div className="flex space-x-2">
          <Button
            variant={activeMode === 'add-spot' ? 'default' : 'outline'}
            onClick={() => setActiveMode(activeMode === 'add-spot' ? 'view' : 'add-spot')}
            className="flex items-center space-x-2 rounded-full"
          >
            <Plus size={16} />
            <span>Добавить спот</span>
          </Button>
          
          <Button
            variant={activeMode === 'draw-route' ? 'default' : 'outline'}
            onClick={() => setActiveMode(activeMode === 'draw-route' ? 'view' : 'draw-route')}
            className="flex items-center space-x-2 rounded-full"
          >
            <Route size={16} />
            <span>Маршрут</span>
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <MapboxMap 
          activeMode={activeMode} 
          onModeChange={setActiveMode}
        />
      </div>
    </div>
  );
};

export default Map;
