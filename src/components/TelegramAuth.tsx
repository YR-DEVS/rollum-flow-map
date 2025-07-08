
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
      telegramContainer.appendChild(telegramScript);
    }

    // Глобальная функция для обработки авторизации
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      console.log('Telegram auth data:', user);
      onAuth(user);
      localStorage.setItem('telegramUser', JSON.stringify(user));
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [onAuth]);

  const handleManualAuth = () => {
    // Для демонстрации - создаем тестового пользователя
    const testUser: TelegramUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      auth_date: Date.now(),
      hash: 'testhash'
    };
    onAuth(testUser);
    localStorage.setItem('telegramUser', JSON.stringify(testUser));
  };

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
          <p className="text-sm text-gray-500 mb-4">
            Войдите через Telegram для доступа к форуму
          </p>
          <Button 
            onClick={handleManualAuth}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-medium"
          >
            Демо вход
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TelegramAuth;
