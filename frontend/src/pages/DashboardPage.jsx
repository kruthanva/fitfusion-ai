import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import TimelapseRoundedIcon from '@mui/icons-material/TimelapseRounded';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { EmptyState, GlassPanel, HeroOrb, MetricCard, PageHero, PremiumCard, ProgressRing, getCategoryMeta } from '../components/premium';

function WeeklyBars({ labels = [], values = [] }) {
  const maxValue = Math.max(...values, 1);
  const total = values.reduce((sum, value) => sum + value, 0);
  return (
    <PremiumCard sx={{ height: '100%' }} glow="rgba(255,176,32,0.22)">
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Weekly workload</Typography>
            <Typography variant="h4">Reps by day</Typography>
          </Box>
          <Chip label={`${total} reps`} color={total ? 'secondary' : 'default'} />
        </Stack>
        <Stack direction="row" spacing={1.2} alignItems="end" sx={{ minHeight: 214 }}>
          {values.map((value, index) => {
            const height = Math.max(8, Math.round((value / maxValue) * 100));
            return (
              <Box key={`${labels[index]}-${index}`} sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
                <Box sx={{ height: 178, borderRadius: 3.2, display: 'flex', alignItems: 'end', bgcolor: 'rgba(255,255,255,0.045)', p: 0.75, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ width: '100%', height: `${height}%`, borderRadius: 2.5, backgroundImage: value ? 'linear-gradient(180deg, #FFB020, #D7FF3F)' : 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))', boxShadow: value ? '0 0 24px rgba(255,176,32,0.20)' : 'none' }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{labels[index]}</Typography>
              </Box>
            );
          })}
        </Stack>
        {!total && <Typography color="text.secondary" sx={{ mt: 2 }}>Your graph lights up after the first saved workout.</Typography>}
      </CardContent>
    </PremiumCard>
  );
}

function RecommendedPlans({ plans = [], onStart }) {
  return (
    <PremiumCard sx={{ height: '100%' }} glow="rgba(215,255,63,0.22)">
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Today’s recommended plan</Typography>
            <Typography variant="h4">Smart session queue</Typography>
          </Box>
          <Chip label="AI pick" color="secondary" />
        </Stack>
        <Stack spacing={1.35}>
          {plans.map((plan, index) => {
            const meta = getCategoryMeta(plan.category);
            return (
              <GlassPanel key={plan.title} sx={{ p: 1.8, borderRadius: 3.5, background: `linear-gradient(135deg, ${meta.glow}, rgba(255,255,255,0.035))` }}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: `${meta.color}24`, border: `1px solid ${meta.color}44`, fontSize: 22 }}>{meta.icon}</Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={950}>{plan.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{plan.duration} · {plan.category} · {plan.blocks?.length || 0} moves</Typography>
                    </Box>
                  </Stack>
                  <Button variant={index === 0 ? 'contained' : 'outlined'} onClick={onStart} endIcon={<ArrowForwardRoundedIcon />}>Start</Button>
                </Stack>
              </GlassPanel>
            );
          })}
        </Stack>
      </CardContent>
    </PremiumCard>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    API.dashboard().then(setData);
    API.getMe().then((payload) => setUser(payload.user)).catch(() => {});
  }, []);

  const stats = useMemo(() => {
    if (!data) return [];
    const icons = [<CalendarMonthRoundedIcon />, <FitnessCenterRoundedIcon />, <TimelapseRoundedIcon />, <LocalFireDepartmentRoundedIcon />];
    const accents = ['#D7FF3F', '#FFB020', '#65FFB4', '#F0D061'];
    return data.highlights.map((item, index) => ({ ...item, icon: icons[index], accent: accents[index] }));
  }, [data]);

  if (!data) return null;

  const totalSessions = Number(data.highlights?.[0]?.value || 0);
  const firstName = (user?.full_name || 'Athlete').split(' ')[0];
  const dashboardFormScore = Number(data.recentFormScore || 0) || 100;
  const momentum = Math.min(100, Math.round((totalSessions / 5) * 100));

  return (
    <Box>
      <PageHero
        eyebrow="AI fitness command center"
        title={`Ready to train, ${firstName}?`}
        subtitle={`Current focus: ${data.focus}. Start a pose-tracked workout, follow a curated plan, or explore the library.`}
        chip={<Chip label={totalSessions ? `${data.avgSession} avg reps/session` : 'Fresh start mode'} />}
        actions={[<Button key="start" variant="contained" size="large" startIcon={<PlayArrowRoundedIcon />} onClick={() => navigate('/studio')}>Start Workout</Button>, <Button key="plan" variant="outlined" size="large" onClick={() => navigate('/planner')}>View Plan</Button>, <Button key="library" variant="outlined" size="large" onClick={() => navigate('/library')}>Explore Library</Button>]}
        visual={<HeroOrb formScore={dashboardFormScore} />}
      />

      <Box sx={{ display: 'grid', gap: 2.3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, mb: 2.3 }}>
        {stats.map((item) => <MetricCard key={item.label} label={item.label} value={item.value} note={item.note} icon={item.icon} accent={item.accent} progress={item.label === 'Sessions logged' ? momentum : undefined} />)}
      </Box>

      <Box sx={{ display: 'grid', gap: 2.3, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.45fr) minmax(360px, 1fr)' }, alignItems: 'stretch' }}>
        <WeeklyBars labels={data.weekLabels} values={data.weekValues} />
        <RecommendedPlans plans={data.recommended} onStart={() => navigate('/studio')} />

        <PremiumCard glow="rgba(101,255,180,0.18)">
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="overline" color="text.secondary">Current focus</Typography>
                <Typography variant="h4">Build consistency before complexity.</Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 620 }}>Log three short sessions this week. FitFusion turns reps, active minutes, and focus into a cleaner training rhythm.</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap><Chip label="Pose skeleton" /><Chip label="Voice coaching" /><Chip label="Export-ready history" /></Stack>
              </Box>
              <ProgressRing value={momentum} label={`${momentum}%`} caption="5-session goal" accent="#65FFB4" />
            </Stack>
          </CardContent>
        </PremiumCard>

        <PremiumCard sx={{ height: '100%' }} glow="rgba(255,77,77,0.16)">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary">Recent activity</Typography>
            <Typography variant="h4" sx={{ mb: 2 }}>Training log</Typography>
            <Stack spacing={1.3}>
              {data.latest?.length ? data.latest.map((item) => {
                const meta = getCategoryMeta(item.category);
                return <GlassPanel key={`${item.id}-${item.created_at}`} sx={{ p: 1.6, borderRadius: 3.5 }}><Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center"><Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}><Box sx={{ width: 38, height: 38, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: `${meta.color}22` }}>{meta.icon}</Box><Box sx={{ minWidth: 0 }}><Typography fontWeight={900} noWrap>{item.exercise_name}</Typography><Typography variant="body2" color="text.secondary" noWrap>{item.created_label} · {item.category}</Typography></Box></Stack><Stack alignItems="flex-end"><Typography fontWeight={950}>{item.reps}</Typography><Typography variant="caption" color="text.secondary">reps</Typography></Stack></Stack></GlassPanel>;
              }) : <EmptyState icon="🚀" title="No sessions yet" description="Start with a 10-minute session. Once saved, this area becomes your progress feed." action={<Button variant="contained" onClick={() => navigate('/studio')}>Start first workout</Button>} sx={{ p: 3 }} />}
            </Stack>
          </CardContent>
        </PremiumCard>
      </Box>
    </Box>
  );
}
