
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateRoute } from '@/hooks/useRoutes';
import { useToast } from '@/hooks/use-toast';
import { RoutePoint } from '@/hooks/useRoutes';

interface RouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routePoints: RoutePoint[];
  onClearRoute: () => void;
}

const RouteDialog: React.FC<RouteDialogProps> = ({ isOpen, onClose, routePoints, onClearRoute }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createRoute = useCreateRoute();
  const { toast } = useToast();

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

    try {
      const startPoint = routePoints[0];
      const endPoint = routePoints[routePoints.length - 1];

      await createRoute.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        route_points: routePoints,
        start_latitude: startPoint.lat,
        start_longitude: startPoint.lng,
        end_latitude: endPoint.lat,
        end_longitude: endPoint.lng,
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
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать маршрут",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сохранить маршрут</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название маршрута"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание маршрута (необязательно)"
              rows={3}
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Точек в маршруте: {routePoints.length}
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" disabled={createRoute.isPending}>
              {createRoute.isPending ? 'Сохранение...' : 'Сохранить маршрут'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDialog;
