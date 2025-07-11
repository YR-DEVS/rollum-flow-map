
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useForum } from '@/hooks/useForum';
import { useSpots } from '@/hooks/useSpots';
import { useRoutes } from '@/hooks/useRoutes';
import { Plus, MapPin, Route, X, Upload } from 'lucide-react';

interface CreateTopicDialogProps {
  children: React.ReactNode;
}

export const CreateTopicDialog: React.FC<CreateTopicDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedSpot, setSelectedSpot] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState('');

  const { useForumCategories, createTopic, isCreatingTopic } = useForum();
  const { data: categories } = useForumCategories();
  const { data: spots } = useSpots();
  const { data: routes } = useRoutes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    createTopic({
      title: title.trim(),
      content: content.trim(),
      category_id: categoryId || undefined,
      spot_id: selectedSpot || undefined,
      route_id: selectedRoute || undefined,
      media_urls: mediaUrls,
    });

    // Сброс формы
    setTitle('');
    setContent('');
    setCategoryId('');
    setSelectedSpot('');
    setSelectedRoute('');
    setMediaUrls([]);
    setMediaInput('');
    setOpen(false);
  };

  const addMediaUrl = () => {
    if (mediaInput.trim() && !mediaUrls.includes(mediaInput.trim())) {
      setMediaUrls([...mediaUrls, mediaInput.trim()]);
      setMediaInput('');
    }
  };

  const removeMediaUrl = (url: string) => {
    setMediaUrls(mediaUrls.filter(u => u !== url));
  };

  const selectedSpotData = spots?.find(s => s.id === selectedSpot);
  const selectedRouteData = routes?.find(r => r.id === selectedRoute);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать новую тему</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Заголовок темы"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              placeholder="Содержание темы"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Выбор спота */}
          <div>
            <Select value={selectedSpot} onValueChange={setSelectedSpot}>
              <SelectTrigger>
                <SelectValue placeholder="Привязать спот (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                {spots?.map((spot) => (
                  <SelectItem key={spot.id} value={spot.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{spot.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSpotData && (
              <Card className="mt-2">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{selectedSpotData.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSpot('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Выбор маршрута */}
          <div>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger>
                <SelectValue placeholder="Привязать маршрут (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                {routes?.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4" />
                      <span>{route.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRouteData && (
              <Card className="mt-2">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{selectedRouteData.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRoute('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Добавление медиафайлов */}
          <div>
            <div className="flex gap-2">
              <Input
                placeholder="URL фото или видео"
                value={mediaInput}
                onChange={(e) => setMediaInput(e.target.value)}
              />
              <Button type="button" onClick={addMediaUrl} size="icon">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {mediaUrls.length > 0 && (
              <div className="mt-2 space-y-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMediaUrl(url)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isCreatingTopic || !title.trim() || !content.trim()}>
              {isCreatingTopic ? 'Создание...' : 'Создать тему'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
