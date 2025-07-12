
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Key, ExternalLink } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSet: (token: string) => void;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsValidating(true);
    
    // Простая валидация токена
    if (token.startsWith('pk.')) {
      localStorage.setItem('mapbox_token', token);
      onTokenSet(token);
    } else {
      alert('Токен должен начинаться с "pk."');
    }
    
    setIsValidating(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <Key className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Настройка Mapbox
          </h2>
          <p className="text-gray-600 text-sm">
            Для работы карты необходим токен Mapbox
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Токен Mapbox
            </label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="pk.your_mapbox_token_here"
              className="w-full"
              disabled={isValidating}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!token.trim() || isValidating}
          >
            {isValidating ? 'Проверка...' : 'Сохранить токен'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">
                Как получить токен:
              </p>
              <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside">
                <li>Перейдите на mapbox.com</li>
                <li>Создайте аккаунт (бесплатно)</li>
                <li>Найдите раздел "Tokens"</li>
                <li>Скопируйте публичный токен</li>
              </ol>
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs mt-2"
              >
                Открыть Mapbox.com
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MapboxTokenInput;
