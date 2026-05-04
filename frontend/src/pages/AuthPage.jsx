import React, { useState } from 'react';
import { Alert, Box, Button, CardContent, Chip, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { GlassPanel, HeroOrb, PremiumCard } from '../components/premium';

export default function AuthPage({ onAuth }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ full_name: '', username: '', email: '', password: '' });

  const submitLogin = async (e) => {
    e.preventDefault();
    try { setError(''); await API.login(loginForm); const me = await API.getMe(); onAuth(me.user); navigate('/dashboard'); } catch (err) { setError(err.message); }
  };
  const submitRegister = async (e) => {
    e.preventDefault();
    try { setError(''); await API.register(registerForm); const me = await API.getMe(); onAuth(me.user); navigate('/dashboard'); } catch (err) { setError(err.message); }
  };

  const featureCards = [
    [<CameraAltRoundedIcon />, 'Pose tracker', 'Live skeleton + no-scroll controls'],
    [<GraphicEqRoundedIcon />, 'Motion scoring', 'Auto reps + manual fallback'],
    [<FitnessCenterRoundedIcon />, 'Curated sessions', 'Strength, cardio, core, mobility'],
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: { xs: 2, md: 4 }, position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at top left, rgba(215,255,63,0.30), transparent 30%), radial-gradient(circle at 88% 12%, rgba(255,176,32,0.18), transparent 24%), linear-gradient(180deg, #020202, #09111D)' }}>
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.22, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1180, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1.08fr 0.92fr' }, alignItems: 'stretch' }}>
        <PremiumCard sx={{ height: '100%' }} glow="rgba(215,255,63,0.32)" hover={false}>
          <CardContent sx={{ p: { xs: 3, md: 4.5 }, minHeight: { md: 620 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Chip label="FitFusion AI Studio" color="primary" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 68 }, lineHeight: 0.92 }}>Train like your fitness app has taste.</Typography>
              <Typography color="text.secondary" sx={{ mt: 2, fontSize: 17, maxWidth: 620 }}>A premium dark fitness dashboard with camera-first pose tracking, guided plans, exercise catalog, profile preferences, music, and history export.</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, mt: 3 }}>{featureCards.map(([icon, title, copy]) => <GlassPanel key={title} sx={{ p: 1.8, borderRadius: 3.5, height: '100%' }}><Stack spacing={1}>{icon}<Typography fontWeight={950}>{title}</Typography><Typography variant="caption" color="text.secondary">{copy}</Typography></Stack></GlassPanel>)}</Box>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'grid' }, placeItems: 'center', mt: 2 }}><HeroOrb /></Box>
          </CardContent>
        </PremiumCard>

        <PremiumCard hover={false} sx={{ height: '100%' }} glow="rgba(255,176,32,0.20)">
          <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="overline" color="text.secondary">Secure local session</Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>Welcome back</Typography>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}><Tab label="Sign in" /><Tab label="Create account" /></Tabs>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>}
            {tab === 0 ? <Box component="form" onSubmit={submitLogin} sx={{ display: 'grid', gap: 2 }}><TextField label="Email or username" value={loginForm.login} onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })} required /><TextField label="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required /><Button type="submit" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>Sign in</Button></Box> : <Box component="form" onSubmit={submitRegister} sx={{ display: 'grid', gap: 2 }}><TextField label="Full name" value={registerForm.full_name} onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })} required /><TextField label="Username" value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} required /><TextField label="Email" type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required /><TextField label="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required /><Button type="submit" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>Create account</Button></Box>}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>Camera access works on localhost, 127.0.0.1, or HTTPS. Real pose skeleton uses MediaPipe when the model can load, with a local motion fallback.</Typography>
          </CardContent>
        </PremiumCard>
      </Box>
    </Box>
  );
}
