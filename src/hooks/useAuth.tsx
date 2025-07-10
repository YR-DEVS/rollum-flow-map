
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface AuthContextType {
  user: User | null;
  telegramUser: TelegramUser | null;
  signInWithTelegram: (telegramUser: TelegramUser) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем текущую сессию
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          console.log('Found existing session:', session.user);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      }
      setLoading(false);
    };

    getSession();

    // Проверяем сохраненного пользователя Telegram
    const savedTelegramUser = localStorage.getItem('telegramUser');
    if (savedTelegramUser) {
      try {
        const parsedUser = JSON.parse(savedTelegramUser);
        setTelegramUser(parsedUser);
        console.log('Found saved Telegram user:', parsedUser);
        // Пытаемся автоматически войти в Supabase если еще не вошли
        if (!user) {
          signInWithTelegram(parsedUser).catch(console.error);
        }
      } catch (error) {
        console.error('Error parsing saved Telegram user:', error);
        localStorage.removeItem('telegramUser');
      }
    }

    // Слушаем изменения авторизации в Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithTelegram = async (telegramUserData: TelegramUser) => {
    try {
      setLoading(true);
      
      // Создаем уникальный email на основе Telegram ID
      const email = `telegram_${telegramUserData.id}@rollum.app`;
      const password = `telegram_${telegramUserData.id}_${telegramUserData.auth_date}`;

      console.log('Attempting to sign in with:', email);

      // Сначала пробуем войти
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Если пользователь не найден, создаем нового
      if (error && error.message.includes('Invalid login credentials')) {
        console.log('User not found, creating new user...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              telegram_id: telegramUserData.id.toString(),
              first_name: telegramUserData.first_name,
              last_name: telegramUserData.last_name,
              username: telegramUserData.username,
              telegram_username: telegramUserData.username,
              avatar_url: telegramUserData.photo_url,
              telegram_photo_url: telegramUserData.photo_url,
            },
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          throw signUpError;
        }

        data = signUpData;
      } else if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        setTelegramUser(telegramUserData);
        localStorage.setItem('telegramUser', JSON.stringify(telegramUserData));
        console.log('Successfully signed in:', data.user);
      }
    } catch (error) {
      console.error('Error in signInWithTelegram:', error);
      // Не пробрасываем ошибку дальше, чтобы не блокировать локальную авторизацию
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTelegramUser(null);
      localStorage.removeItem('telegramUser');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    telegramUser,
    signInWithTelegram,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
