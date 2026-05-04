import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import API from '../api';
import { CategoryChip, GlassPanel, PageHero, PremiumCard, ProgressRing, getCategoryMeta } from '../components/premium';

const goals = ['General Fitness', 'Fat Loss', 'Muscle Building', 'Mobility'];
const focuses = ['Full Body', 'Strength', 'Cardio', 'Core', 'Mobility'];

export default function ProfilePage({ onUserUpdate }) {
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    API.profile().then((data) => {
      setForm({
        full_name: data.user.full_name,
        age: data.profile.age || '',
        height_cm: data.profile.height_cm || '',
        weight_kg: data.profile.weight_kg || '',
        goal: data.profile.goal || 'General Fitness',
        level: data.profile.level || 'Beginner',
        preferred_focus: data.profile.preferred_focus || 'Full Body',
        bio: data.profile.bio || '',
        voice_enabled: !!data.profile.voice_enabled,
        music_enabled: !!data.profile.music_enabled,
        tracker_enabled: data.profile.tracker_enabled === undefined ? true : !!data.profile.tracker_enabled,
        motion_sensitivity: data.profile.motion_sensitivity || 14,
      });
    });
  }, []);

  const readiness = useMemo(() => form ? Math.min(100, [form.full_name, form.age, form.height_cm, form.weight_kg, form.goal, form.level, form.preferred_focus].filter(Boolean).length * 14) : 0, [form]);
  if (!form) return null;

  const initials = (form.full_name || 'A').slice(0, 1).toUpperCase();
  const focusMeta = getCategoryMeta(form.preferred_focus);

  const submit = async (e) => {
    e.preventDefault();
    await API.updateProfile({ ...form, voice_enabled: form.voice_enabled ? 'true' : 'false', music_enabled: form.music_enabled ? 'true' : 'false', tracker_enabled: form.tracker_enabled ? 'true' : 'false', motion_sensitivity: String(form.motion_sensitivity) });
    setMessage('Profile saved successfully.');
    const me = await API.getMe();
    onUserUpdate(me.user);
  };

  return (
    <Box>
      <PageHero eyebrow="Preference center" title="Your training control panel." subtitle="Save your goal, level, preferred focus, voice coach, music, and tracker defaults so the studio opens ready for you." chip={<CategoryChip category={form.preferred_focus} active />} visual={<ProgressRing value={readiness} label={`${readiness}%`} caption="profile ready" accent={focusMeta.color} />} />
      {message && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{message}</Alert>}
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' }, alignItems: 'start' }}>
        <PremiumCard glow={focusMeta.glow} hover={false} sx={{ position: { lg: 'sticky' }, top: { lg: 90 } }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Avatar sx={{ width: 96, height: 96, mx: 'auto', mb: 2, fontSize: 42, fontWeight: 950, color: '#020202', background: `linear-gradient(135deg, ${focusMeta.color}, #FFB020)`, boxShadow: `0 0 58px ${focusMeta.glow}` }}>{initials}</Avatar>
            <Typography variant="h4">{form.full_name || 'Athlete'}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>{form.level} · {form.goal}</Typography>
            <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap><CategoryChip category={form.preferred_focus} active /><CategoryChip category={form.voice_enabled ? 'Cardio' : 'Recovery'} active={form.voice_enabled} /></Stack>
            <GlassPanel sx={{ p: 2, mt: 2.5, borderRadius: 3.5 }}><Typography variant="overline" color="text.secondary">Coach note</Typography><Typography variant="body2" sx={{ mt: 0.7 }}>Keep defaults simple: camera tracker on, music optional, voice coach on when learning new exercises.</Typography></GlassPanel>
          </CardContent>
        </PremiumCard>

        <PremiumCard hover={false}>
          <CardContent component="form" onSubmit={submit} sx={{ p: { xs: 2.5, md: 3.5 }, display: 'grid', gap: 3 }}>
            <Box><Typography variant="overline" color="text.secondary">Identity</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}><TextField fullWidth label="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /><TextField fullWidth label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></Box></Box>
            <Box><Typography variant="overline" color="text.secondary">Body metrics</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}><TextField fullWidth label="Height (cm)" type="number" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} /><TextField fullWidth label="Weight (kg)" type="number" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} /></Box></Box>
            <Box><Typography variant="overline" color="text.secondary">Training goal</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.4, mt: 1 }}>{goals.map((goal) => <GlassPanel key={goal} onClick={() => setForm({ ...form, goal })} sx={{ p: 2, cursor: 'pointer', borderColor: form.goal === goal ? 'rgba(255,176,32,0.55)' : 'rgba(255,255,255,0.10)', background: form.goal === goal ? 'linear-gradient(135deg, rgba(255,176,32,0.16), rgba(215,255,63,0.12))' : undefined }}><Typography fontWeight={950}>{goal}</Typography><Typography variant="body2" color="text.secondary">{goal === 'Fat Loss' ? 'Cardio + consistency' : goal === 'Muscle Building' ? 'Strength volume' : goal === 'Mobility' ? 'Joint-friendly flow' : 'Balanced routine'}</Typography></GlassPanel>)}</Box></Box>
            <Box><Typography variant="overline" color="text.secondary">Experience level</Typography><ToggleButtonGroup exclusive fullWidth value={form.level} onChange={(_, value) => value && setForm({ ...form, level: value })} sx={{ mt: 1, '& .MuiToggleButton-root': { color: 'text.secondary', borderColor: 'rgba(255,255,255,0.10)', py: 1.4, fontWeight: 900, '&.Mui-selected': { color: 'text.primary', background: 'linear-gradient(135deg, rgba(215,255,63,0.32), rgba(255,176,32,0.16))' } } }}>{['Beginner', 'Intermediate', 'Advanced'].map((level) => <ToggleButton key={level} value={level}>{level}</ToggleButton>)}</ToggleButtonGroup></Box>
            <Box><Typography variant="overline" color="text.secondary">Preferred focus</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>{focuses.map((focus) => <CategoryChip key={focus} category={focus} active={form.preferred_focus === focus} onClick={() => setForm({ ...form, preferred_focus: focus })} />)}</Stack></Box>
            <TextField fullWidth multiline rows={4} label="Bio / notes for your future self" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <GlassPanel sx={{ p: 2.5, borderRadius: 3.8 }}><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><SettingsSuggestRoundedIcon color="secondary" /><Typography variant="h6">Default studio preferences</Typography></Stack><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1 }}><FormControlLabel control={<Switch checked={form.voice_enabled} onChange={(e) => setForm({ ...form, voice_enabled: e.target.checked })} />} label="Voice coach" /><FormControlLabel control={<Switch checked={form.music_enabled} onChange={(e) => setForm({ ...form, music_enabled: e.target.checked })} />} label="Music controls" /><FormControlLabel control={<Switch checked={form.tracker_enabled} onChange={(e) => setForm({ ...form, tracker_enabled: e.target.checked })} />} label="Auto tracker" /></Box><Typography variant="body2" color="text.secondary" sx={{ mt: 1.6 }}>Motion sensitivity: {form.motion_sensitivity}</Typography><Slider value={Number(form.motion_sensitivity)} min={6} max={40} onChange={(_, value) => setForm({ ...form, motion_sensitivity: value })} /></GlassPanel>
            <Button type="submit" variant="contained" size="large" startIcon={<SaveRoundedIcon />}>Save profile</Button>
          </CardContent>
        </PremiumCard>
      </Box>
    </Box>
  );
}
