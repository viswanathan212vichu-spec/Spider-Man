import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store'; // Keeping existing store if needed for other things
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute'; // Using NEW ProtectedRoute
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { FavoritesPage } from './pages/FavoritesPage';

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/events" element={
        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
          <Layout>
            <UserDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/event/:id" element={
        <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
          <Layout>
            <EventDetailsPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/my-tickets" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <MyTicketsPage />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/favorites" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <FavoritesPage />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/events" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
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