import React, { useState, useEffect } from 'react';
import { AppProvider } from './store';
import { Layout, ProtectedRoute } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { FavoritesPage } from './pages/FavoritesPage';

const AppContent: React.FC = () => {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Simple Router based on hash
  const renderPage = () => {
    if (currentHash === '#/') {
      return <LoginPage />;
    }
    
    if (currentHash.startsWith('#/admin')) {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      );
    }
    
    if (currentHash.startsWith('#/events')) {
      return (
        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
          <Layout>
            <UserDashboard />
          </Layout>
        </ProtectedRoute>
      );
    }

    if (currentHash.startsWith('#/event/')) {
       return (
        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
          <Layout>
            <EventDetailsPage />
          </Layout>
        </ProtectedRoute>
      );
    }

    if (currentHash.startsWith('#/my-tickets')) {
       return (
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <MyTicketsPage />
          </Layout>
        </ProtectedRoute>
      );
    }

    if (currentHash.startsWith('#/favorites')) {
       return (
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <FavoritesPage />
          </Layout>
        </ProtectedRoute>
      );
    }

    return <div className="p-8 text-center">Page not found</div>;
  };

  return (
    <>
      {renderPage()}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;