import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import { GlassPanel } from './premium';

const drawerWidth = 268;
const topbarHeight = 68;

const links = [
  ['Dashboard', '/dashboard', <DashboardRoundedIcon />],
  ['Workout Studio', '/studio', <FitnessCenterRoundedIcon />],
  ['Exercise Library', '/library', <LibraryBooksRoundedIcon />],
  ['Session Planner', '/planner', <TodayRoundedIcon />],
  ['History', '/history', <HistoryRoundedIcon />],
  ['Profile', '/profile', <PersonRoundedIcon />],
];

function BrandMark() {
  return (
    <Box sx={{ width: 48, height: 48, borderRadius: 3.4, position: 'relative', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#D7FF3F,#FFB020 70%)', boxShadow: '0 18px 50px rgba(255,176,32,0.25)' }}>
      <FitnessCenterRoundedIcon sx={{ color: '#fff', transform: 'rotate(-22deg)' }} />
      <Box sx={{ position: 'absolute', inset: -4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)' }} />
    </Box>
  );
}

function Navigation({ user, onNavigate, onLogout }) {
  const initials = (user?.full_name || user?.username || 'U').slice(0, 1).toUpperCase();
  return (
    <Stack justifyContent="space-between" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
      <Box>
        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 3.2 }}>
          <BrandMark />
          <Box>
            <Typography variant="h6" fontWeight={950} lineHeight={1}>FitFusion</Typography>
            <Typography variant="caption" color="text.secondary">AI motion studio</Typography>
          </Box>
        </Stack>

        <GlassPanel sx={{ p: 1.6, mb: 2.4, borderRadius: 4, background: 'linear-gradient(135deg, rgba(215,255,63,0.20), rgba(255,176,32,0.08))' }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <AutoAwesomeRoundedIcon color="secondary" />
            <Box>
              <Typography variant="body2" fontWeight={950}>Motion AI ready</Typography>
              <Typography variant="caption" color="text.secondary">Camera, reps, voice, and history in one studio.</Typography>
            </Box>
          </Stack>
        </GlassPanel>

        <List sx={{ display: 'grid', gap: 0.65, p: 0 }}>
          {links.map(([label, path, icon]) => (
            <ListItemButton
              key={path}
              component={NavLink}
              to={path}
              onClick={onNavigate}
              sx={{
                position: 'relative',
                borderRadius: 3.4,
                color: 'text.secondary',
                minHeight: 50,
                px: 1.25,
                border: '1px solid transparent',
                transition: 'all 180ms ease',
                '&:hover': { color: 'text.primary', bgcolor: 'rgba(255,255,255,0.055)', transform: 'translateX(2px)' },
                '&.active': {
                  color: 'text.primary',
                  background: 'linear-gradient(135deg, rgba(215,255,63,0.34), rgba(255,176,32,0.14))',
                  border: '1px solid rgba(255,255,255,0.13)',
                  boxShadow: '0 12px 36px rgba(215,255,63,0.16)',
                  '&:before': { content: '""', position: 'absolute', left: 8, top: 13, bottom: 13, width: 4, borderRadius: 99, background: 'linear-gradient(180deg,#FFB020,#D7FF3F)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit', pl: 0.6 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 900 }} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box>
        <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
        <GlassPanel sx={{ p: 1.35, mb: 1.3, borderRadius: 4 }}>
          <Stack direction="row" spacing={1.1} alignItems="center">
            <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg,#65FFB4,#FFB020)', color: '#051015', fontWeight: 950 }}>{initials}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={950} noWrap>{user?.full_name || user?.username || 'Athlete'}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>Local profile synced</Typography>
            </Box>
          </Stack>
        </GlassPanel>
        <Button fullWidth variant="outlined" onClick={onLogout} startIcon={<LogoutRoundedIcon />}>Log out</Button>
      </Box>
    </Stack>
  );
}

export default function AppShell({ user, children, onLogoutDone }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = links.find(([, path]) => path === location.pathname)?.[0] || 'FitFusion Studio';
  const isStudio = location.pathname === '/studio';

  const logout = async () => {
    await API.logout();
    onLogoutDone?.();
    navigate('/login', { replace: true });
  };

  const drawerContent = <Navigation user={user} onNavigate={() => setMobileOpen(false)} onLogout={logout} />;

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden', background: 'radial-gradient(circle at 5% -8%, rgba(215,255,63,0.30), transparent 30%), radial-gradient(circle at 100% 2%, rgba(255,176,32,0.20), transparent 28%), radial-gradient(circle at 60% 110%, rgba(101,255,180,0.10), transparent 30%), linear-gradient(180deg, #020202 0%, #0B0B08 55%, #020202 100%)', '&:before': { content: '""', position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.20, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(to bottom, black, transparent 78%)' } }}>
      <Drawer variant="permanent" sx={{ width: drawerWidth, display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, p: 2, borderRight: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(9,9,7,0.97), rgba(5,5,4,0.88))', overflow: 'hidden', '&:before': { content: '""', position: 'absolute', top: -80, right: -90, width: 220, height: 220, borderRadius: '50%', background: 'rgba(215,255,63,0.20)', filter: 'blur(34px)' } } }}>
        {drawerContent}
      </Drawer>
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 300, p: 2, background: 'rgba(7,7,5,0.98)' } }}>
        {drawerContent}
      </Drawer>

      <AppBar position="sticky" elevation={0} sx={{ ml: { md: `${drawerWidth}px` }, width: { md: `calc(100% - ${drawerWidth}px)` }, background: 'rgba(5, 5, 4, 0.74)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, minHeight: `${topbarHeight}px !important` }}>
          <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { md: 'none' } }}><MenuRoundedIcon /></IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="overline" color="text.secondary">FitFusion Studio</Typography>
              <Typography variant="h6" fontWeight={950} noWrap>{active}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Chip icon={<CameraAltRoundedIcon />} label="Pose tracker" color="primary" />
            <Chip icon={<BoltRoundedIcon />} label="Voice coach" />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          ml: { md: `${drawerWidth}px` },
          p: isStudio ? { xs: 1.2, sm: 1.5, md: 2 } : { xs: 2, sm: 2.5, md: 3 },
          minHeight: `calc(100vh - ${topbarHeight}px)`,
          height: isStudio ? `calc(100vh - ${topbarHeight}px)` : 'auto',
          overflow: isStudio ? 'hidden' : 'visible',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
