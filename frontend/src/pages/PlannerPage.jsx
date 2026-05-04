import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { CategoryChip, GlassPanel, PageHero, PremiumCard, getCategoryMeta } from '../components/premium';

const weeklyStructure = [
  { day: 'Mon', title: 'Strength base', category: 'Strength', note: 'Controlled reps' },
  { day: 'Tue', title: 'Cardio pulse', category: 'Cardio', note: 'Short intervals' },
  { day: 'Wed', title: 'Core control', category: 'Core', note: 'Stability work' },
  { day: 'Thu', title: 'Mobility reset', category: 'Mobility', note: 'Move + breathe' },
  { day: 'Fri', title: 'Full body finish', category: 'Full Body', note: 'Clean session' },
];

function PlanCard({ plan, onStart }) {
  const meta = getCategoryMeta(plan.category);
  const difficulty = plan.category === 'Recovery' || plan.category === 'Mobility' ? 'Beginner friendly' : plan.category === 'Cardio' ? 'Intermediate' : 'All levels';
  return (
    <PremiumCard glow={meta.glow} sx={{ height: '100%', borderRadius: 4.5 }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Box sx={{ width: 66, height: 66, borderRadius: 3.6, display: 'grid', placeItems: 'center', fontSize: 32, bgcolor: `${meta.color}22`, border: `1px solid ${meta.color}42`, boxShadow: `0 0 44px ${meta.glow}` }}>{meta.icon}</Box>
          <Chip label={plan.category} sx={{ color: meta.color, bgcolor: `${meta.color}18`, borderColor: `${meta.color}44` }} />
        </Stack>
        <Typography variant="h4" sx={{ mt: 2 }}>{plan.title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>{plan.description}</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 2 }}>
          <GlassPanel sx={{ p: 1.35, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">Duration</Typography><Typography fontWeight={950}>{plan.duration}</Typography></GlassPanel>
          <GlassPanel sx={{ p: 1.35, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">Difficulty</Typography><Typography fontWeight={950}>{difficulty}</Typography></GlassPanel>
        </Box>

        <Box sx={{ mt: 2, flexGrow: 1 }}>
          <Typography variant="overline" color="text.secondary">Exercise flow</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>{plan.blocks?.map((block, index) => <Stack key={block} direction="row" spacing={1.2} alignItems="center"><Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 950, bgcolor: `${meta.color}24`, color: meta.color }}>{index + 1}</Box><Typography variant="body2" fontWeight={850}>{block}</Typography></Stack>)}</Stack>
        </Box>

        <LinearProgress variant="determinate" value={Math.min(100, (plan.blocks?.length || 1) * 22)} sx={{ my: 2, height: 8, borderRadius: 99 }} />
        <Button variant="contained" onClick={onStart} endIcon={<ArrowForwardRoundedIcon />}>Start Plan</Button>
      </CardContent>
    </PremiumCard>
  );
}

export default function PlannerPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [focus, setFocus] = useState('All');
  useEffect(() => { API.templates().then((data) => setTemplates(data.items)); }, []);
  const filtered = useMemo(() => focus === 'All' ? templates : templates.filter((item) => item.category === focus), [templates, focus]);

  return (
    <Box>
      <PageHero
        eyebrow="Session planner"
        title="Curated programs that feel like a coach built them."
        subtitle="Pick a compact plan, follow the flow, and take it into the pose-tracked Workout Studio."
        actions={[<Button key="studio" variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={() => navigate('/studio')}>Start quick session</Button>]}
        visual={<PremiumCard hover={false} sx={{ width: '100%', maxWidth: 320 }} glow="rgba(101,255,180,0.22)"><CardContent sx={{ p: 2.2 }}><Stack direction="row" spacing={1.2} alignItems="center"><CalendarMonthRoundedIcon color="secondary" /><Typography fontWeight={950}>Suggested week</Typography></Stack><Stack spacing={1.1} sx={{ mt: 1.6 }}>{weeklyStructure.slice(0, 4).map((item) => { const meta = getCategoryMeta(item.category); return <GlassPanel key={item.day} sx={{ p: 1.2, borderRadius: 3 }}><Stack direction="row" spacing={1.1} alignItems="center"><Typography fontWeight={950} color={meta.color}>{item.day}</Typography><Box sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={850}>{item.title}</Typography><Typography variant="caption" color="text.secondary">{item.note}</Typography></Box></Stack></GlassPanel>; })}</Stack></CardContent></PremiumCard>}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>{['All', 'Full Body', 'Strength', 'Cardio', 'Core', 'Mobility', 'Recovery'].map((item) => <CategoryChip key={item} category={item} active={focus === item} onClick={() => setFocus(item)} />)}</Stack>
      <Box sx={{ display: 'grid', gap: 2.3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' } }}>{filtered.map((plan) => <PlanCard key={plan.title} plan={plan} onStart={() => navigate('/studio')} />)}</Box>

      <PremiumCard sx={{ mt: 3 }} hover={false} glow="rgba(255,176,32,0.16)">
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">Suggested weekly structure</Typography>
          <Box sx={{ display: 'grid', gap: 1.5, mt: 1, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' } }}>{weeklyStructure.map((item) => { const meta = getCategoryMeta(item.category); return <GlassPanel key={item.day} sx={{ p: 1.8, height: '100%', borderRadius: 3.5, background: `linear-gradient(135deg, ${meta.glow}, rgba(255,255,255,0.035))` }}><Typography variant="h6" color={meta.color}>{item.day}</Typography><Typography fontWeight={950}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.note}</Typography></GlassPanel>; })}</Box>
        </CardContent>
      </PremiumCard>
    </Box>
  );
}
