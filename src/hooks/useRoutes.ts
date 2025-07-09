
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface AppRoute {
  id: string;
  name: string;
  description?: string;
  route_points?: RoutePoint[];
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  distance?: number;
  duration_minutes?: number;
  average_speed?: number;
  media_urls: string[];
  user_id?: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  comments_count: number;
}

export const useRoutes = () => {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AppRoute[];
    },
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (route: Omit<AppRoute, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('routes')
        .insert([{ ...route, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};
