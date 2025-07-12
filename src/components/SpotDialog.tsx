
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateSpot } from '@/hooks/useSpots';
import { useToast } from '@/hooks/use-toast';

interface SpotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: { lat: number; lng: number } | null;
}

const SpotDialog: React.FC<SpotDialogProps> = ({ isOpen, onClose, initialCoords }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const createSpot = useCreateSpot();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название спота",
        variant: "destructive",
      });
      return;
    }

    if (!initialCoords) {
      toast({
        title: "Ошибка",
        description: "Координаты не определены",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createSpot.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        latitude: initialCoords.lat,
        longitude: initialCoords.lng,
        media_urls: [],
      });

      toast({
        title: "Успешно",
        description: "Спот создан!",
      });

      setName('');
      setDescription('');
      onClose();
    } catch (error: any) {
      console.error('Error creating spot:', error);
      
      let errorMessage = "Не удалось создать спот";
      
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
          <DialogTitle>Добавить новый спот</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Название *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название спота"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание спота (необязательно)"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          {initialCoords && (
            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
              <strong>Координаты:</strong> {initialCoords.lat.toFixed(6)}, {initialCoords.lng.toFixed(6)}
            </div>
          )}
          
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !name.trim() || !initialCoords}
              className="flex-1"
            >
              {isLoading ? 'Создание...' : 'Создать спот'}
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

export default SpotDialog;
