
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
  latitude: number;
  longitude: number;
}

const SpotDialog: React.FC<SpotDialogProps> = ({ isOpen, onClose, latitude, longitude }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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

    try {
      await createSpot.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        latitude,
        longitude,
        media_urls: [],
      });

      toast({
        title: "Успешно",
        description: "Спот создан!",
      });

      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating spot:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать спот",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить новый спот</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название спота"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание спота (необязательно)"
              rows={3}
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
          
          <div className="flex space-x-2">
            <Button type="submit" disabled={createSpot.isPending}>
              {createSpot.isPending ? 'Создание...' : 'Создать спот'}
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

export default SpotDialog;
