
import React from 'react';
import TabNavigation from './TabNavigation';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-green-50/50">
      {title && (
        <header className="fixed top-0 left-0 right-0 z-10 border-b border-green-200 bg-white p-4 text-center shadow-sm">
          <h1 className="text-lg font-medium text-green-900">{title}</h1>
        </header>
      )}
      <main className={`pb-20 ${title ? 'pt-16' : ''}`}>
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <TabNavigation />
    </div>
  );
};

export default Layout;
