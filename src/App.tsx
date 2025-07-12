
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from './hooks/useAuth';
import TelegramAuth from './components/TelegramAuth';
import BottomNavbar from './components/BottomNavbar';
import Home from './pages/Home';
import Map from './pages/Map';
import Forum from './pages/Forum';
import ForumTopic from './pages/ForumTopic';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Create queryClient outside of component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const AppContent: React.FC = () => {
  const { user, telegramUser, loading } = useAuth();
  const [localTelegramUser, setLocalTelegramUser] = useState<TelegramUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Проверяем сохраненного пользователя Telegram в localStorage
    const savedUser = localStorage.getItem('telegramUser');
    if (savedUser && !telegramUser) {
      try {
        setLocalTelegramUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('telegramUser');
      }
    }
    setIsInitialized(true);
  }, [telegramUser]);

  const handleAuth = (userData: TelegramUser) => {
    setLocalTelegramUser(userData);
  };

  const handleLogout = () => {
    setLocalTelegramUser(null);
    localStorage.removeItem('telegramUser');
  };

  // Показываем загрузку только если не инициализировали состояние
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Показываем TelegramAuth если нет авторизованного пользователя
  if (!user && !telegramUser && !localTelegramUser) {
    return <TelegramAuth onAuth={handleAuth} />;
  }

  const currentUser = telegramUser || localTelegramUser;

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/topic/:topicId" element={<ForumTopic />} />
        <Route path="/profile" element={<Profile user={currentUser} onLogout={handleLogout} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNavbar />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
