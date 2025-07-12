
-- Создаем таблицу для профилей пользователей приложения
CREATE TABLE public.app_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  telegram_username TEXT,
  photo_url TEXT,
  auth_date BIGINT,
  hash TEXT,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для таблицы
ALTER TABLE public.app_profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политики для таблицы app_profiles
CREATE POLICY "Everyone can view profiles" ON public.app_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.app_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.app_profiles FOR UPDATE USING (true);

-- Создаем функцию для получения или создания профиля пользователя
CREATE OR REPLACE FUNCTION public.get_or_create_app_profile(
  p_telegram_id TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_username TEXT DEFAULT NULL,
  p_telegram_username TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL,
  p_auth_date BIGINT DEFAULT NULL,
  p_hash TEXT DEFAULT NULL,
  p_supabase_user_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Пытаемся найти существующий профиль
  SELECT id INTO profile_id
  FROM public.app_profiles
  WHERE telegram_id = p_telegram_id;
  
  -- Если профиль найден, обновляем его данные
  IF profile_id IS NOT NULL THEN
    UPDATE public.app_profiles
    SET 
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      username = COALESCE(p_username, username),
      telegram_username = COALESCE(p_telegram_username, telegram_username),
      photo_url = COALESCE(p_photo_url, photo_url),
      auth_date = COALESCE(p_auth_date, auth_date),
      hash = COALESCE(p_hash, hash),
      supabase_user_id = COALESCE(p_supabase_user_id, supabase_user_id),
      updated_at = now()
    WHERE id = profile_id;
  ELSE
    -- Создаем новый профиль
    INSERT INTO public.app_profiles (
      telegram_id,
      first_name,
      last_name,
      username,
      telegram_username,
      photo_url,
      auth_date,
      hash,
      supabase_user_id
    ) VALUES (
      p_telegram_id,
      p_first_name,
      p_last_name,
      p_username,
      p_telegram_username,
      p_photo_url,
      p_auth_date,
      p_hash,
      p_supabase_user_id
    ) RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$;

-- Создаем бакеты для хранения файлов
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('spots-media', 'spots-media', true),
  ('routes-media', 'routes-media', true),
  ('user-avatars', 'user-avatars', true);

-- Создаем политики для бакетов
CREATE POLICY "Anyone can view spots media" ON storage.objects FOR SELECT USING (bucket_id = 'spots-media');
CREATE POLICY "Authenticated users can upload spots media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'spots-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own spots media" ON storage.objects FOR UPDATE USING (bucket_id = 'spots-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own spots media" ON storage.objects FOR DELETE USING (bucket_id = 'spots-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view routes media" ON storage.objects FOR SELECT USING (bucket_id = 'routes-media');
CREATE POLICY "Authenticated users can upload routes media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'routes-media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own routes media" ON storage.objects FOR UPDATE USING (bucket_id = 'routes-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own routes media" ON storage.objects FOR DELETE USING (bucket_id = 'routes-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view user avatars" ON storage.objects FOR SELECT USING (bucket_id = 'user-avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Создаем таблицу для спотов
CREATE TABLE public.spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Создаем таблицу для маршрутов
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  route_points JSONB,
  start_latitude DECIMAL(10, 8),
  start_longitude DECIMAL(11, 8),
  end_latitude DECIMAL(10, 8),
  end_longitude DECIMAL(11, 8),
  distance DECIMAL(10, 2),
  duration_minutes INTEGER,
  average_speed DECIMAL(5, 2),
  media_urls TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Создаем таблицу для комментариев к спотам
CREATE TABLE public.spot_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для комментариев к маршрутам
CREATE TABLE public.route_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для лайков спотов
CREATE TABLE public.spot_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(spot_id, user_id),
  UNIQUE(spot_id, app_user_id)
);

-- Создаем таблицу для лайков маршрутов
CREATE TABLE public.route_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(route_id, user_id),
  UNIQUE(route_id, app_user_id)
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_likes ENABLE ROW LEVEL SECURITY;

-- Создаем политики для спотов
CREATE POLICY "Everyone can view spots" ON public.spots FOR SELECT USING (true);
CREATE POLICY "Users can create spots" ON public.spots FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own spots" ON public.spots FOR UPDATE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);
CREATE POLICY "Users can delete their own spots" ON public.spots FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем политики для маршрутов
CREATE POLICY "Everyone can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Users can create routes" ON public.routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own routes" ON public.routes FOR UPDATE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);
CREATE POLICY "Users can delete their own routes" ON public.routes FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем политики для комментариев спотов
CREATE POLICY "Everyone can view spot comments" ON public.spot_comments FOR SELECT USING (true);
CREATE POLICY "Users can create spot comments" ON public.spot_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own spot comments" ON public.spot_comments FOR UPDATE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);
CREATE POLICY "Users can delete their own spot comments" ON public.spot_comments FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем политики для комментариев маршрутов
CREATE POLICY "Everyone can view route comments" ON public.route_comments FOR SELECT USING (true);
CREATE POLICY "Users can create route comments" ON public.route_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own route comments" ON public.route_comments FOR UPDATE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);
CREATE POLICY "Users can delete their own route comments" ON public.route_comments FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем политики для лайков спотов
CREATE POLICY "Everyone can view spot likes" ON public.spot_likes FOR SELECT USING (true);
CREATE POLICY "Users can like spots" ON public.spot_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike spots" ON public.spot_likes FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем политики для лайков маршрутов
CREATE POLICY "Everyone can view route likes" ON public.route_likes FOR SELECT USING (true);
CREATE POLICY "Users can like routes" ON public.route_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike routes" ON public.route_likes FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем функции для обновления счетчиков лайков
CREATE OR REPLACE FUNCTION public.update_spot_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.spots SET likes_count = likes_count + 1 WHERE id = NEW.spot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.spots SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.spot_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_route_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.routes SET likes_count = likes_count + 1 WHERE id = NEW.route_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.routes SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.route_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматического обновления счетчиков лайков
CREATE TRIGGER update_spot_likes_count_trigger
  AFTER INSERT OR DELETE ON public.spot_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_spot_likes_count();

CREATE TRIGGER update_route_likes_count_trigger
  AFTER INSERT OR DELETE ON public.route_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_route_likes_count();

-- Создаем функции для обновления счетчиков комментариев
CREATE OR REPLACE FUNCTION public.update_spot_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.spots SET comments_count = comments_count + 1 WHERE id = NEW.spot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.spots SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.spot_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_route_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.routes SET comments_count = comments_count + 1 WHERE id = NEW.route_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.routes SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.route_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматического обновления счетчиков комментариев
CREATE TRIGGER update_spot_comments_count_trigger
  AFTER INSERT OR DELETE ON public.spot_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_spot_comments_count();

CREATE TRIGGER update_route_comments_count_trigger
  AFTER INSERT OR DELETE ON public.route_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_route_comments_count();

-- Создаем таблицу для категорий форума
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '💬',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для тем форума
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES public.spots(id) ON DELETE SET NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  media_urls TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для ответов в темах
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES public.forum_replies(id) ON DELETE SET NULL,
  media_urls TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для лайков тем
CREATE TABLE public.forum_topic_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(topic_id, user_id),
  UNIQUE(topic_id, app_user_id)
);

-- Создаем таблицу для лайков ответов
CREATE TABLE public.forum_reply_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_user_id UUID REFERENCES public.app_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(reply_id, user_id),
  UNIQUE(reply_id, app_user_id)
);

-- Включаем RLS для всех таблиц форума
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Политики для категорий форума
CREATE POLICY "Everyone can view forum categories" ON public.forum_categories FOR SELECT USING (true);
CREATE POLICY "Users can create categories" ON public.forum_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update categories" ON public.forum_categories FOR UPDATE USING (true);

-- Политики для тем форума
CREATE POLICY "Everyone can view forum topics" ON public.forum_topics FOR SELECT USING (true);
CREATE POLICY "Users can create topics" ON public.forum_topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update their topics" ON public.forum_topics FOR UPDATE USING (auth.uid() = author_id OR app_user_id IS NOT NULL);
CREATE POLICY "Authors can delete their topics" ON public.forum_topics FOR DELETE USING (auth.uid() = author_id OR app_user_id IS NOT NULL);

-- Политики для ответов
CREATE POLICY "Everyone can view forum replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON public.forum_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update their replies" ON public.forum_replies FOR UPDATE USING (auth.uid() = author_id OR app_user_id IS NOT NULL);
CREATE POLICY "Authors can delete their replies" ON public.forum_replies FOR DELETE USING (auth.uid() = author_id OR app_user_id IS NOT NULL);

-- Политики для лайков тем
CREATE POLICY "Everyone can view topic likes" ON public.forum_topic_likes FOR SELECT USING (true);
CREATE POLICY "Users can like topics" ON public.forum_topic_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike topics" ON public.forum_topic_likes FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Политики для лайков ответов
CREATE POLICY "Everyone can view reply likes" ON public.forum_reply_likes FOR SELECT USING (true);
CREATE POLICY "Users can like replies" ON public.forum_reply_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can unlike replies" ON public.forum_reply_likes FOR DELETE USING (auth.uid() = user_id OR app_user_id IS NOT NULL);

-- Создаем базовые категории форума
INSERT INTO public.forum_categories (name, description, color, icon) VALUES
('Общие вопросы', 'Общие вопросы и обсуждения', '#3B82F6', '💬'),
('Техника и трюки', 'Обсуждение техники катания и трюков', '#10B981', '🛼'),
('Споты и маршруты', 'Обмен информацией о местах для катания', '#8B5CF6', '📍'),
('Снаряжение', 'Обсуждение роликов, защиты и аксессуаров', '#F59E0B', '🛡️');

-- Функции для обновления счетчиков форума
CREATE OR REPLACE FUNCTION public.update_forum_topic_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET likes_count = likes_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_forum_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_replies SET likes_count = likes_count + 1 WHERE id = NEW.reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_replies SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.reply_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_forum_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET replies_count = replies_count + 1 WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_topics SET replies_count = GREATEST(0, replies_count - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для форума
CREATE TRIGGER update_forum_topic_likes_count_trigger
  AFTER INSERT OR DELETE ON public.forum_topic_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_forum_topic_likes_count();

CREATE TRIGGER update_forum_reply_likes_count_trigger
  AFTER INSERT OR DELETE ON public.forum_reply_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_forum_reply_likes_count();

CREATE TRIGGER update_forum_replies_count_trigger
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE PROCEDURE public.update_forum_replies_count();
