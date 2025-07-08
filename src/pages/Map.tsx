
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, MapPin, Route } from 'lucide-react';

const Map = () => {
  const [activeMode, setActiveMode] = useState<'view' | 'add-spot' | 'draw-route'>('view');
  
  const spots = [
    { id: 1, name: 'Парк Сокольники', type: 'Парк', rating: 4.5 },
    { id: 2, name: 'Набережная Москвы-реки', type: 'Набережная', rating: 4.8 },
    { id: 3, name: 'ВДНХ', type: 'Парк', rating: 4.3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
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

      <div className="relative">
        {/* Заглушка для карты */}
        <div className="h-96 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin size={48} className="mx-auto mb-2" />
            <p>Здесь будет карта</p>
            <p className="text-sm">Интеграция с Mapbox</p>
          </div>
        </div>

        {activeMode === 'add-spot' && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-blue-800 text-sm font-medium">
                Нажмите на карту, чтобы добавить новый спот
              </p>
            </Card>
          </div>
        )}

        {activeMode === 'draw-route' && (
          <div className="absolute top-4 left-4 right-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <p className="text-green-800 text-sm font-medium">
                Кликайте по карте, чтобы нарисовать маршрут
              </p>
            </Card>
          </div>
        )}
      </div>

      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Популярные споты</h2>
        <div className="space-y-3">
          {spots.map((spot) => (
            <Card key={spot.id} className="p-4 bg-white rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{spot.name}</h3>
                  <p className="text-sm text-gray-500">{spot.type}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{spot.rating}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Map;
