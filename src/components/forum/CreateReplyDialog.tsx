
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Upload, X } from 'lucide-react';

interface CreateReplyDialogProps {
  topicId: string;
  children: React.ReactNode;
}

export const CreateReplyDialog: React.FC<CreateReplyDialogProps> = ({ topicId, children }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState('');

  const { user } = useAuth();
  const { createReply, isCreatingReply } = useForum();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    createReply({
      content: content.trim(),
      topic_id: topicId,
      media_urls: mediaUrls,
    });

    // Сброс формы
    setContent('');
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

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ответить в теме</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Написать ответ..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
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
            <Button type="submit" disabled={isCreatingReply || !content.trim()}>
              {isCreatingReply ? 'Отправка...' : 'Отправить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
