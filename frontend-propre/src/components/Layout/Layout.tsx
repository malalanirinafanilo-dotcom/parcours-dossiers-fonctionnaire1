import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter la taille de l'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vert-50 via-white to-emeraude-50">
      {/* Éléments décoratifs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-vert-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emeraude-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vert-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
      </div>

      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex relative">
        <Sidebar sidebarOpen={sidebarOpen} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
        
        <main 
          className={`
            flex-1 transition-all duration-300 ease-in-out mt-16
            ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-20'}
            ${isMobile ? 'ml-0' : ''}
          `}
        >
          <div className="p-4 md:p-6 lg:p-8 animate-fade-in-up">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Bouton pour remonter en haut (mobile) */}
      {isMobile && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-vert-500 to-emeraude-600 
                     text-white p-3 rounded-full shadow-lg shadow-vert-500/25 
                     hover:scale-110 transition-all duration-300 z-40"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Layout;