
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Heart, MessageSquare, MapPin, Route, Send, Upload, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'sonner';

const ForumTopic = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [replyContent, setReplyContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaInput, setMediaInput] = useState('');
  
  const { useForumTopic, useForumReplies, createReply, likeTopic, likeReply, isCreatingReply } = useForum();
  
  const { data: topic, isLoading: topicLoading } = useForumTopic(topicId!);
  const { data: replies, isLoading: repliesLoading } = useForumReplies(topicId!);

  const getAuthorDisplayName = (profile: any) => {
    if (profile?.username) return profile.username;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    return 'Аноним';
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Введите текст ответа');
      return;
    }

    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    createReply({
      content: replyContent.trim(),
      topic_id: topicId!,
      media_urls: mediaUrls,
    });

    // Сброс формы
    setReplyContent('');
    setMediaUrls([]);
    setMediaInput('');
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

  if (topicLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <p>Загрузка темы...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <p>Тема не найдена</p>
          <Button onClick={() => navigate('/forum')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к форуму
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Кнопка назад */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/forum')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад к форуму
      </Button>

      {/* Основная тема */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-10 h-10">
                <AvatarImage src={topic.app_profiles?.photo_url || ''} />
                <AvatarFallback>
                  {getAuthorDisplayName(topic.app_profiles).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{getAuthorDisplayName(topic.app_profiles)}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ru })}</span>
                </div>
              </div>
            </div>
            {topic.forum_categories && (
              <Badge 
                variant="secondary"
                style={{ backgroundColor: `${topic.forum_categories.color}20`, color: topic.forum_categories.color }}
              >
                <span className="mr-1">{topic.forum_categories.icon}</span>
                {topic.forum_categories.name}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-base leading-relaxed mb-4">{topic.content}</p>

          {/* Медиафайлы */}
          {topic.media_urls && topic.media_urls.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {topic.media_urls.map((url, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt="Media" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Привязанные спот или маршрут */}
          {topic.spots && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700">
                Спот: {topic.spots.name}
              </span>
            </div>
          )}

          {topic.routes && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
              <Route className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-700">
                Маршрут: {topic.routes.name}
              </span>
            </div>
          )}

          {/* Статистика и лайк */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{topic.views_count} просмотров</span>
              <span>{topic.replies_count} ответов</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => likeTopic(topic.id)}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span>{topic.likes_count}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ответы */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">
          Ответы ({topic.replies_count})
        </h2>
        
        {repliesLoading ? (
          <div className="text-center py-4">
            <p>Загрузка ответов...</p>
          </div>
        ) : replies && replies.length > 0 ? (
          replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={reply.app_profiles?.photo_url || ''} />
                    <AvatarFallback>
                      {getAuthorDisplayName(reply.app_profiles).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{getAuthorDisplayName(reply.app_profiles)}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: ru })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">{reply.content}</p>
                    
                    {/* Медиафайлы в ответе */}
                    {reply.media_urls && reply.media_urls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {reply.media_urls.map((url, index) => (
                          <div key={index} className="aspect-video bg-muted rounded overflow-hidden">
                            <img 
                              src={url} 
                              alt="Media" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => likeReply(reply.id)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Heart className="w-3 h-3" />
                      <span>{reply.likes_count}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Пока нет ответов. Будьте первым!</p>
          </div>
        )}
      </div>

      {/* Форма для добавления ответа */}
      {user ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <Textarea
                placeholder="Ваш ответ..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
                required
              />

              {/* Добавление медиафайлов */}
              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder="URL фото или видео"
                    value={mediaInput}
                    onChange={(e) => setMediaInput(e.target.value)}
                  />
                  <Button type="button" onClick={addMediaUrl} size="icon" variant="outline">
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isCreatingReply || !replyContent.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {isCreatingReply ? 'Отправка...' : 'Отправить ответ'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Войдите в систему, чтобы оставить ответ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ForumTopic;
