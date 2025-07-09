
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRoute, RoutePoint } from '@/hooks/useRoutes';
import { useToast } from '@/hooks/use-toast';

interface RouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routePoints: RoutePoint[];
  onClearRoute: () => void;
}

const RouteDialog: React.FC<RouteDialogProps> = ({ isOpen, onClose, routePoints, onClearRoute }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createRoute = useCreateRoute();
  const { toast } = useToast();

  const calculateDistance = (points: RoutePoint[]): number => {
    if (points.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      
      // Простое вычисление расстояния (приблизительное)
      const deltaLat = current.lat - prev.lat;
      const deltaLng = current.lng - prev.lng;
      const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111; // примерно км
      totalDistance += distance;
    }
    
    return Math.round(totalDistance * 100) / 100; // округляем до 2 знаков
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название маршрута",
        variant: "destructive",
      });
      return;
    }

    if (routePoints.length < 2) {
      toast({
        title: "Ошибка",
        description: "Маршрут должен содержать минимум 2 точки",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const startPoint = routePoints[0];
      const endPoint = routePoints[routePoints.length - 1];
      const distance = calculateDistance(routePoints);

      await createRoute.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        route_points: routePoints,
        start_latitude: startPoint.lat,
        start_longitude: startPoint.lng,
        end_latitude: endPoint.lat,
        end_longitude: endPoint.lng,
        distance,
        media_urls: [],
      });

      toast({
        title: "Успешно",
        description: "Маршрут создан!",
      });

      setName('');
      setDescription('');
      onClearRoute();
      onClose();
    } catch (error: any) {
      console.error('Error creating route:', error);
      
      let errorMessage = "Не удалось создать маршрут";
      
      if (error?.message?.includes('auth')) {
        errorMessage = "Необходимо войти в систему";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сохранить маршрут</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Название *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название маршрута"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание маршрута (необязательно)"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded space-y-1">
            <div><strong>Точек в маршруте:</strong> {routePoints.length}</div>
            <div><strong>Приблизительное расстояние:</strong> {calculateDistance(routePoints)} км</div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || routePoints.length < 2}
              className="flex-1"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить маршрут'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDialog;
