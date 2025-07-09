
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
CREATE TABLE public.app_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Создаем таблицу для маршрутов
CREATE TABLE public.app_routes (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0
);

-- Создаем таблицу для комментариев к спотам
CREATE TABLE public.app_spot_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES public.app_spots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для комментариев к маршрутам
CREATE TABLE public.app_route_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.app_routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для лайков спотов
CREATE TABLE public.app_spot_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES public.app_spots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(spot_id, user_id)
);

-- Создаем таблицу для лайков маршрутов
CREATE TABLE public.app_route_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.app_routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(route_id, user_id)
);

-- Создаем таблицу профилей пользователей
CREATE TABLE public.app_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  sport_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.app_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_spot_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_route_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_spot_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_route_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политики для спотов
CREATE POLICY "Everyone can view spots" ON public.app_spots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create spots" ON public.app_spots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spots" ON public.app_spots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own spots" ON public.app_spots FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для маршрутов
CREATE POLICY "Everyone can view routes" ON public.app_routes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create routes" ON public.app_routes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routes" ON public.app_routes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routes" ON public.app_routes FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для комментариев спотов
CREATE POLICY "Everyone can view spot comments" ON public.app_spot_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create spot comments" ON public.app_spot_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own spot comments" ON public.app_spot_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own spot comments" ON public.app_spot_comments FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для комментариев маршрутов
CREATE POLICY "Everyone can view route comments" ON public.app_route_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create route comments" ON public.app_route_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own route comments" ON public.app_route_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own route comments" ON public.app_route_comments FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для лайков спотов
CREATE POLICY "Everyone can view spot likes" ON public.app_spot_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like spots" ON public.app_spot_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike spots" ON public.app_spot_likes FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для лайков маршрутов
CREATE POLICY "Everyone can view route likes" ON public.app_route_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like routes" ON public.app_route_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike routes" ON public.app_route_likes FOR DELETE USING (auth.uid() = user_id);

-- Создаем политики для профилей
CREATE POLICY "Everyone can view profiles" ON public.app_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.app_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.app_profiles FOR UPDATE USING (auth.uid() = id);

-- Создаем функцию для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Создаем функции для обновления счетчиков лайков
CREATE OR REPLACE FUNCTION public.update_spot_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.app_spots SET likes_count = likes_count + 1 WHERE id = NEW.spot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.app_spots SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.spot_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_route_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.app_routes SET likes_count = likes_count + 1 WHERE id = NEW.route_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.app_routes SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.route_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматического обновления счетчиков лайков
CREATE TRIGGER update_spot_likes_count_trigger
  AFTER INSERT OR DELETE ON public.app_spot_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_spot_likes_count();

CREATE TRIGGER update_route_likes_count_trigger
  AFTER INSERT OR DELETE ON public.app_route_likes
  FOR EACH ROW EXECUTE PROCEDURE public.update_route_likes_count();

-- Создаем функции для обновления счетчиков комментариев
CREATE OR REPLACE FUNCTION public.update_spot_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.app_spots SET comments_count = comments_count + 1 WHERE id = NEW.spot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.app_spots SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.spot_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_route_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.app_routes SET comments_count = comments_count + 1 WHERE id = NEW.route_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.app_routes SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.route_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматического обновления счетчиков комментариев
CREATE TRIGGER update_spot_comments_count_trigger
  AFTER INSERT OR DELETE ON public.app_spot_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_spot_comments_count();

CREATE TRIGGER update_route_comments_count_trigger
  AFTER INSERT OR DELETE ON public.app_route_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_route_comments_count();
