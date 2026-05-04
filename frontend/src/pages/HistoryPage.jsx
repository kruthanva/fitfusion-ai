import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { EmptyState, GlassPanel, MetricCard, PageHero, PremiumCard, ProgressRing, getCategoryMeta } from '../components/premium';

const defaultManual = { title: '', category: 'Strength', exercise_name: '', reps: 0, duration_seconds: 600, intensity: 'Medium', notes: '' };

function SessionCard({ item, onDelete }) {
  const meta = getCategoryMeta(item.category);
  return (
    <GlassPanel sx={{ p: 1.9, borderRadius: 3.8, background: `linear-gradient(135deg, ${meta.glow}, rgba(255,255,255,0.035))` }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Stack direction="row" spacing={1.35} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ width: 50, height: 50, borderRadius: 3.4, display: 'grid', placeItems: 'center', fontSize: 24, bgcolor: `${meta.color}22`, border: `1px solid ${meta.color}44` }}>{meta.icon}</Box>
          <Box sx={{ minWidth: 0 }}><Typography variant="h6" noWrap>{item.title}</Typography><Typography color="text.secondary" variant="body2">{item.createdLabel} · {item.exercise_name} · {item.category}</Typography></Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Box><Typography fontWeight={950}>{item.reps}</Typography><Typography variant="caption" color="text.secondary">reps</Typography></Box>
          <Box><Typography fontWeight={950}>{Math.max(1, Math.round((item.duration_seconds || 0) / 60))}</Typography><Typography variant="caption" color="text.secondary">min</Typography></Box>
          <Box><Typography fontWeight={950}>{item.calories}</Typography><Typography variant="caption" color="text.secondary">kcal</Typography></Box>
          <Button variant="outlined" color="error" size="small" startIcon={<DeleteRoundedIcon />} onClick={() => onDelete(item.id)}>Delete</Button>
        </Stack>
      </Stack>
      {item.notes && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.3 }}>{item.notes}</Typography>}
    </GlassPanel>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [manual, setManual] = useState(defaultManual);
  const [message, setMessage] = useState('');
  const load = () => API.history().then((data) => setItems(data.items));
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalSessions = items.length;
    const totalReps = items.reduce((sum, item) => sum + Number(item.reps || 0), 0);
    const totalMinutes = Math.round(items.reduce((sum, item) => sum + Number(item.duration_seconds || 0), 0) / 60);
    const calories = Math.round(items.reduce((sum, item) => sum + Number(item.calories || 0), 0));
    const activeDays = new Set(items.map((item) => item.created_at?.slice(0, 10))).size;
    return { totalSessions, totalReps, totalMinutes, calories, activeDays };
  }, [items]);

  const submitManual = async (e) => { e.preventDefault(); await API.createManual(manual); setManual(defaultManual); setMessage('Manual workout saved to history.'); load(); };
  const deleteItem = async (id) => { await API.deleteSession(id); setMessage('Workout removed.'); load(); };

  return (
    <Box>
      <PageHero eyebrow="History & progress" title="Your workout log should feel rewarding." subtitle="Saved sessions become lifetime stats, activity cards, CSV exports, and proof that you are stacking reps over time." actions={[<Button key="start" variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={() => navigate('/studio')}>Start Workout</Button>, <Button key="export" variant="outlined" startIcon={<DownloadRoundedIcon />} href="/api/history/export">Export CSV</Button>]} visual={<ProgressRing value={Math.min(100, stats.totalSessions * 12)} label={stats.totalSessions} caption="sessions" accent="#FFB020" />} />
      {message && <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>{message}</Alert>}
      <Box sx={{ display: 'grid', gap: 2.2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, mb: 3 }}>
        <MetricCard label="Lifetime reps" value={stats.totalReps} note="Total tracked workload." icon="💪" accent="#D7FF3F" />
        <MetricCard label="Total sessions" value={stats.totalSessions} note="Every saved workout counts." icon="📈" accent="#FFB020" />
        <MetricCard label="Active minutes" value={stats.totalMinutes} note="Training time banked." icon="⏱️" accent="#65FFB4" />
        <MetricCard label="Calories" value={stats.calories} note="Estimated burn from sessions." icon="🔥" accent="#F0D061" />
      </Box>
      <Box sx={{ display: 'grid', gap: 2.4, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.55fr) minmax(330px, 0.8fr)' }, alignItems: 'start' }}>
        <PremiumCard hover={false} glow="rgba(215,255,63,0.16)"><CardContent sx={{ p: 3 }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}><Box><Typography variant="overline" color="text.secondary">Session cards</Typography><Typography variant="h4">Saved workouts</Typography></Box><Button variant="outlined" startIcon={<DownloadRoundedIcon />} href="/api/history/export">Export CSV</Button></Stack>{items.length ? <Stack spacing={1.4}>{items.map((item) => <SessionCard key={item.id} item={item} onDelete={deleteItem} />)}</Stack> : <EmptyState icon="🏁" title="No workouts saved yet" description="Open the Workout Studio, complete a short session, and save it. Your timeline, totals, and export will appear here." action={<Button variant="contained" onClick={() => navigate('/studio')}>Start your first session</Button>} />}</CardContent></PremiumCard>
        <PremiumCard glow="rgba(101,255,180,0.18)" hover={false} sx={{ position: { lg: 'sticky' }, top: { lg: 90 } }}><CardContent component="form" onSubmit={submitManual} sx={{ p: 3, display: 'grid', gap: 1.5 }}><Stack direction="row" spacing={1} alignItems="center"><AddRoundedIcon color="secondary" /><Typography variant="h5">Add manual session</Typography></Stack><TextField label="Session title" value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} required /><TextField select label="Category" value={manual.category} onChange={(e) => setManual({ ...manual, category: e.target.value })}>{['Strength', 'Cardio', 'Core', 'Mobility', 'Recovery', 'Full Body'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField><TextField label="Exercise" value={manual.exercise_name} onChange={(e) => setManual({ ...manual, exercise_name: e.target.value })} required /><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}><TextField fullWidth label="Reps" type="number" value={manual.reps} onChange={(e) => setManual({ ...manual, reps: e.target.value })} /><TextField fullWidth label="Seconds" type="number" value={manual.duration_seconds} onChange={(e) => setManual({ ...manual, duration_seconds: e.target.value })} /></Box><TextField select label="Intensity" value={manual.intensity} onChange={(e) => setManual({ ...manual, intensity: e.target.value })}>{['Low', 'Medium', 'High'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}</TextField><TextField label="Notes" multiline rows={3} value={manual.notes} onChange={(e) => setManual({ ...manual, notes: e.target.value })} /><Button type="submit" variant="contained">Save manual session</Button></CardContent></PremiumCard>
      </Box>
    </Box>
  );
}
