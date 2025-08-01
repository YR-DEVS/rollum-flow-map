
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramAuthProps {
  onAuth: (user: TelegramUser) => void;
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onAuth }) => {
  const { signInWithTelegram } = useAuth();

  useEffect(() => {
    // Загружаем Telegram Web App SDK
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    document.body.appendChild(script);

    // Инициализируем Telegram Login Widget
    const telegramScript = document.createElement('script');
    telegramScript.async = true;
    telegramScript.src = 'https://telegram.org/js/telegram-widget.js?22';
    telegramScript.setAttribute('data-telegram-login', 'antirollbatbot');
    telegramScript.setAttribute('data-size', 'large');
    telegramScript.setAttribute('data-radius', '20');
    telegramScript.setAttribute('data-request-access', 'write');
    telegramScript.setAttribute('data-userpic', 'true');
    telegramScript.setAttribute('data-onauth', 'onTelegramAuth(user)');

    const telegramContainer = document.getElementById('telegram-login');
    if (telegramContainer) {
      telegramContainer.innerHTML = ''; // Очищаем контейнер перед добавлением
      telegramContainer.appendChild(telegramScript);
    }

    // Глобальная функция для обработки авторизации
    (window as any).onTelegramAuth = async (user: TelegramUser) => {
      console.log('Telegram auth data:', user);
      
      try {
        // Авторизуемся в Supabase через наш хук
        await signInWithTelegram(user);
        
        // Вызываем callback для обновления локального состояния
        onAuth(user);
        localStorage.setItem('telegramUser', JSON.stringify(user));
        console.log('Successfully authenticated with Supabase');
      } catch (error) {
        console.error('Error during Supabase authentication:', error);
        // Всё равно продолжаем с локальной авторизацией
        onAuth(user);
        localStorage.setItem('telegramUser', JSON.stringify(user));
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onAuth, signInWithTelegram]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rollum</h1>
          <p className="text-gray-600">Форум для роллеров</p>
        </div>
        
        <div className="mb-6">
          <div id="telegram-login" className="flex justify-center"></div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Войдите через Telegram для доступа к форуму
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramAuth;
