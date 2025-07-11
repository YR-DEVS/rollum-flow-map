
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CreateReplyDialog } from '@/components/forum/CreateReplyDialog';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Heart, MessageCircle, Eye, MapPin, Route, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const ForumTopic = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { useForumTopic, useForumReplies, likeTopic, likeReply } = useForum();
  
  const { data: topic, isLoading: topicLoading } = useForumTopic(topicId!);
  const { data: replies, isLoading: repliesLoading } = useForumReplies(topicId!);

  if (topicLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Тема не найдена</h2>
          <Button onClick={() => navigate('/forum')}>
            Вернуться к форуму
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: ru 
    });
  };

  const getAuthorName = (profile: any) => {
    if (profile?.username) return profile.username;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    return 'Аноним';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Навигация */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к форуму
        </Button>
      </div>

      {/* Основная тема */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Автор: {getAuthorName(topic.app_profiles)}</span>
                <span>{formatDate(topic.created_at)}</span>
                {topic.forum_categories && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>{topic.forum_categories.icon}</span>
                    {topic.forum_categories.name}
                  </Badge>
                )}
              </div>

              {/* Привязанный спот или маршрут */}
              {topic.spots && (
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>Спот: {topic.spots.name}</span>
                </div>
              )}
              
              {topic.routes && (
                <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                  <Route className="w-4 h-4" />
                  <span>Маршрут: {topic.routes.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose max-w-none mb-4">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>

          {/* Медиафайлы */}
          {topic.media_urls && topic.media_urls.length > 0 && (
            <div className="mb-4 space-y-2">
              {topic.media_urls.map((url, index) => (
                <div key={index} className="border rounded p-2">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {url}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Статистика и действия */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{topic.views_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{topic.replies_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{topic.likes_count}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => likeTopic(topic.id)}
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Лайк
                  </Button>
                  
                  <CreateReplyDialog topicId={topic.id}>
                    <Button size="sm">
                      <Reply className="w-4 h-4 mr-1" />
                      Ответить
                    </Button>
                  </CreateReplyDialog>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ответы */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Ответы ({replies?.length || 0})
        </h2>

        {repliesLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : replies && replies.length > 0 ? (
          replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{getAuthorName(reply.app_profiles)}</span>
                    <span>•</span>
                    <span>{formatDate(reply.created_at)}</span>
                  </div>
                </div>

                <div className="prose max-w-none mb-4">
                  <p className="whitespace-pre-wrap">{reply.content}</p>
                </div>

                {/* Медиафайлы ответа */}
                {reply.media_urls && reply.media_urls.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {reply.media_urls.map((url, index) => (
                      <div key={index} className="border rounded p-2">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>{reply.likes_count}</span>
                  </div>

                  {user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => likeReply(reply.id)}
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Лайк
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Пока нет ответов в этой теме</p>
              {user && (
                <CreateReplyDialog topicId={topic.id}>
                  <Button>
                    <Reply className="w-4 h-4 mr-1" />
                    Написать первый ответ
                  </Button>
                </CreateReplyDialog>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForumTopic;
