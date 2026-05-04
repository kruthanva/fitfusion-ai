import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CardContent,
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { CategoryChip, EmptyState, GlassPanel, PageHero, PremiumCard, getCategoryMeta } from '../components/premium';

const categories = ['All', 'Strength', 'Cardio', 'Core', 'Mobility', 'Recovery'];
const levels = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

function ExerciseCard({ exercise, onStart }) {
  const meta = getCategoryMeta(exercise.category);
  return (
    <PremiumCard glow={meta.glow} sx={{ height: '100%', borderRadius: 4.5 }}>
      <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ p: 2.2, minHeight: 132, background: `radial-gradient(circle at 18% 10%, ${meta.color}4A, transparent 46%), linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))`, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ width: 58, height: 58, borderRadius: 3.4, display: 'grid', placeItems: 'center', fontSize: 30, background: `linear-gradient(135deg, ${meta.color}33, rgba(255,255,255,0.05))`, border: `1px solid ${meta.color}55`, boxShadow: `0 0 42px ${meta.glow}` }}>{meta.icon}</Box>
            <Chip label={exercise.category} sx={{ color: meta.color, bgcolor: `${meta.color}18`, borderColor: `${meta.color}44` }} />
          </Stack>
        </Box>
        <Box sx={{ p: 2.2, display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Typography variant="h5" sx={{ lineHeight: 1 }}>{exercise.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.85 }}>{exercise.duration} · {exercise.level}</Typography>
          <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            {exercise.focus?.slice(0, 4).map((focus) => <Chip key={focus} label={focus} size="small" />)}
          </Stack>
          <GlassPanel sx={{ p: 1.45, borderRadius: 3, mt: 1.7, flexGrow: 1 }}>
            <Typography variant="caption" color="text.secondary">Primary cue</Typography>
            <Typography variant="body2" fontWeight={800} sx={{ mt: 0.45 }}>{exercise.cues?.[0] || 'Move with control and clean breathing.'}</Typography>
          </GlassPanel>
          <Accordion disableGutters elevation={0} sx={{ mt: 1.4, bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}><Typography fontWeight={900}>Form details</Typography></AccordionSummary>
            <AccordionDetails>
              <Stack component="ul" sx={{ pl: 2.2, my: 0 }} spacing={0.6}>{exercise.cues?.map((cue) => <Typography component="li" variant="body2" key={cue}>{cue}</Typography>)}</Stack>
              <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>{exercise.mistakes?.map((mistake) => <Chip key={mistake} label={mistake} size="small" color="warning" variant="outlined" />)}</Stack>
            </AccordionDetails>
          </Accordion>
          <Button variant="contained" sx={{ mt: 1.6 }} startIcon={<PlayArrowRoundedIcon />} onClick={() => onStart(exercise)}>Start this exercise</Button>
        </Box>
      </CardContent>
    </PremiumCard>
  );
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All levels');

  useEffect(() => { API.exercises().then((data) => setItems(data.items)); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !q || [item.name, item.category, item.level, ...(item.focus || [])].join(' ').toLowerCase().includes(q);
      const matchesCategory = category === 'All' || item.category === category;
      const levelText = (item.level || '').toLowerCase();
      const matchesLevel = level === 'All levels' || levelText.includes(level.toLowerCase()) || levelText.includes('all');
      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [items, query, category, level]);

  return (
    <Box>
      <PageHero
        eyebrow="Premium movement library"
        title="A cleaner catalog built for quick decisions."
        subtitle="Search, filter, scan the cue, and jump straight into the camera tracker. Details stay tucked away until you need them."
        actions={[<Button key="studio" variant="contained" onClick={() => navigate('/studio')} startIcon={<PlayArrowRoundedIcon />}>Open Workout Studio</Button>]}
        visual={<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, width: '100%', maxWidth: 340 }}>{['Strength', 'Cardio', 'Core', 'Mobility'].map((name) => { const meta = getCategoryMeta(name); return <GlassPanel key={name} sx={{ p: 1.5, borderRadius: 3.5, background: `linear-gradient(135deg, ${meta.glow}, rgba(255,255,255,0.035))` }}><Typography fontSize={28}>{meta.icon}</Typography><Typography fontWeight={950}>{name}</Typography><Typography variant="caption" color="text.secondary">{items.filter((i) => i.category === name).length || '—'} moves</Typography></GlassPanel>; })}</Box>}
      />

      <PremiumCard hover={false} sx={{ mb: 3, borderRadius: 4 }}>
        <CardContent sx={{ p: 2.2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) 220px minmax(320px, auto)' }, gap: 1.6, alignItems: 'center' }}>
            <TextField fullWidth placeholder="Search exercises, muscles, categories..." value={query} onChange={(e) => setQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }} />
            <TextField fullWidth select label="Level" value={level} onChange={(e) => setLevel(e.target.value)}>{levels.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent={{ md: 'flex-end' }}>{categories.map((item) => <CategoryChip key={item} category={item} active={category === item} onClick={() => setCategory(item)} />)}</Stack>
          </Box>
        </CardContent>
      </PremiumCard>

      {filtered.length ? <Box sx={{ display: 'grid', gap: 2.2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' } }}>{filtered.map((exercise) => <ExerciseCard key={exercise.slug || exercise.name} exercise={exercise} onStart={() => navigate('/studio')} />)}</Box> : <EmptyState icon="🔎" title="No exercises found" description="Try a different category, level, or search term." action={<Button variant="outlined" onClick={() => { setQuery(''); setCategory('All'); setLevel('All levels'); }}>Clear filters</Button>} />}
    </Box>
  );
}
