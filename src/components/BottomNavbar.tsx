
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MapPin, Users, User } from 'lucide-react';

const BottomNavbar = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/map', icon: MapPin, label: 'Карта' },
    { to: '/forum', icon: Users, label: 'Форум' },
    { to: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={24} className="mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
