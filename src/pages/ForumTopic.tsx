
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateReplyDialog } from '@/components/forum/CreateReplyDialog';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Route, 
  Eye,
  Reply,
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const ForumTopic = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    useForumTopic, 
    useForumReplies, 
    likeTopic, 
    likeReply 
  } = useForum();
  
  const { data: topic, isLoading: topicLoading } = useForumTopic(topicId || '');
  const { data: replies, isLoading: repliesLoading } = useForumReplies(topicId || '');

  if (topicLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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

  const getAuthorName = (profile: any) => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return profile?.username || 'Аноним';
  };

  const getAuthorInitials = (profile: any) => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
    }
    return profile?.username?.[0]?.toUpperCase() || 'А';
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/forum')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к форуму
        </Button>
        
        {user && (
          <CreateReplyDialog topicId={topicId || ''}>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ответить
            </Button>
          </CreateReplyDialog>
        )}
      </div>

      {/* Topic */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={topic.app_profiles?.photo_url} />
                <AvatarFallback>
                  {getAuthorInitials(topic.app_profiles)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {getAuthorName(topic.app_profiles)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(topic.created_at), { 
                    addSuffix: true, 
                    locale: ru 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {topic.forum_categories && (
                <Badge 
                  style={{ backgroundColor: topic.forum_categories.color + '20' }}
                  className="flex items-center gap-1"
                >
                  <span>{topic.forum_categories.icon}</span>
                  {topic.forum_categories.name}
                </Badge>
              )}
              {topic.is_pinned && (
                <Badge variant="secondary">Закреплено</Badge>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>
          
          <div className="prose max-w-none mb-4">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>

          {/* Связанные спот или маршрут */}
          {topic.spots && (
            <Card className="mb-4 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Связанный спот: {topic.spots.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {topic.spots.latitude.toFixed(6)}, {topic.spots.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {topic.routes && (
            <Card className="mb-4 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Route className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Связанный маршрут: {topic.routes.name}</p>
                    {topic.routes.description && (
                      <p className="text-sm text-muted-foreground">
                        {topic.routes.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media */}
          {topic.media_urls && topic.media_urls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {topic.media_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="rounded-lg object-cover aspect-square"
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {topic.views_count || 0}
            </span>
            <button
              onClick={() => likeTopic(topic.id)}
              className="flex items-center gap-1 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              {topic.likes_count || 0}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {topic.replies_count || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Ответы ({replies?.length || 0})
          </h2>
          {user && (
            <CreateReplyDialog topicId={topicId || ''}>
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Reply className="w-4 h-4" />
                Ответить
              </Button>
            </CreateReplyDialog>
          )}
        </div>

        {repliesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : replies && replies.length > 0 ? (
          replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={reply.app_profiles?.photo_url} />
                      <AvatarFallback>
                        {getAuthorInitials(reply.app_profiles)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {getAuthorName(reply.app_profiles)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {user && (
                    <CreateReplyDialog topicId={topicId || ''}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Reply className="w-3 h-3" />
                        Ответить
                      </Button>
                    </CreateReplyDialog>
                  )}
                </div>

                <div className="prose max-w-none mb-3">
                  <p className="whitespace-pre-wrap">{reply.content}</p>
                </div>

                {/* Reply Media */}
                {reply.media_urls && reply.media_urls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {reply.media_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Reply media ${index + 1}`}
                        className="rounded-lg object-cover aspect-square"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => likeReply(reply.id)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {reply.likes_count || 0}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Пока нет ответов на эту тему
              </p>
              {user && (
                <CreateReplyDialog topicId={topicId || ''}>
                  <Button>
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
