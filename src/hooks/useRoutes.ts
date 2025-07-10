
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface AppRoute {
  id: string;
  name: string;
  description?: string;
  route_points?: Json;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  distance?: number;
  duration_minutes?: number;
  average_speed?: number;
  media_urls?: string[];
  user_id?: string;
  app_user_id?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
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
      return data;
    },
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  const { appProfileId } = useAuth();
  
  return useMutation({
    mutationFn: async (route: {
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
      media_urls?: string[];
    }) => {
      if (!appProfileId) {
        throw new Error('User not authenticated');
      }

      const routeData = {
        ...route,
        app_user_id: appProfileId,
        route_points: route.route_points ? JSON.stringify(route.route_points) : null,
        media_urls: route.media_urls || []
      };

      const { data, error } = await supabase
        .from('routes')
        .insert([routeData])
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
