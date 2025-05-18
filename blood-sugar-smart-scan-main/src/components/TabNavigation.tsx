
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Salad, Apple, User } from 'lucide-react';

const TabNavigation: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { name: "识别", path: "/", icon: Salad },
    { name: "食物", path: "/foods", icon: Apple },
    { name: "我的", path: "/profile", icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex h-16 border-t border-green-200 bg-white shadow-md">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-1 flex-col items-center justify-center transition-all ${
              isActive 
                ? "text-primary font-medium bg-green-50 border-t-2 border-primary" 
                : "text-gray-500 hover:text-green-700 hover:bg-green-50/50"
            }`}
          >
            <Icon size={20} className="mb-1" />
            <span className="text-xs">{tab.name}</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>}
          </Link>
        );
      })}
    </div>
  );
};

export default TabNavigation;
