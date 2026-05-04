import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import API from './api';
import AppShell from './components/AppShell';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';
import PlannerPage from './pages/PlannerPage';
import StudioPage from './pages/StudioPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

function Protected({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    API.getMe().then((data) => setUser(data.user || null)).catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage onAuth={setUser} />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/dashboard" element={<Protected user={user}><AppShell user={user} onLogoutDone={() => setUser(null)}><DashboardPage /></AppShell></Protected>} />
      <Route path="/library" element={<Protected user={user}><AppShell user={user} onLogoutDone={() => setUser(null)}><LibraryPage /></AppShell></Protected>} />
      <Route path="/planner" element={<Protected user={user}><AppShell user={user} onLogoutDone={() => setUser(null)}><PlannerPage /></AppShell></Protected>} />
      <Route path="/studio" element={<Protected user={user}><AppShell user={user} onLogoutDone={() => setUser(null)}><StudioPage /></AppShell></Protected>} />
      <Route path="/history" element={<Protected user={user}><AppShell user={user} onLogoutDone={() => setUser(null)}><HistoryPage /></AppShell></Protected>} />
      <Route path="/profile" element={<Protected user={user}><AppShell user={user} onLogoutDone={() => setUser(null)}><ProfilePage onUserUpdate={setUser} /></AppShell></Protected>} />
    </Routes>
  );
}
