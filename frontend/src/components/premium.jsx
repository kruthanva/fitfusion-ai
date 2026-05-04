import React from 'react';
import { Box, Button, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

export const categoryMeta = {
  Strength: { icon: '🏋️', color: '#D7FF3F', glow: 'rgba(215,255,63,0.26)', label: 'Strength' },
  Cardio: { icon: '⚡', color: '#FFB020', glow: 'rgba(255,176,32,0.24)', label: 'Cardio' },
  Core: { icon: '🔥', color: '#FF4D4D', glow: 'rgba(255,77,77,0.22)', label: 'Core' },
  Mobility: { icon: '🌀', color: '#65FFB4', glow: 'rgba(101,255,180,0.22)', label: 'Mobility' },
  Recovery: { icon: '🌙', color: '#F0D061', glow: 'rgba(240,208,97,0.20)', label: 'Recovery' },
  'Full Body': { icon: '✨', color: '#E8FF85', glow: 'rgba(232,255,133,0.24)', label: 'Full Body' },
};

export function getCategoryMeta(category = 'Full Body') {
  if (category === 'All') return categoryMeta['Full Body'];
  return categoryMeta[category] || categoryMeta['Full Body'];
}

export function PremiumCard({ children, sx = {}, glow, hover = true, ...props }) {
  return (
    <Card
      {...props}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 5,
        background: 'linear-gradient(180deg, rgba(18,17,12,0.90), rgba(8,8,6,0.76))',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 26px 80px rgba(0,0,0,0.42)',
        transition: 'transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: glow ? `radial-gradient(circle at top right, ${glow}, transparent 36%)` : 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent 42%)',
          opacity: 0.85,
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          inset: '1px',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.035), transparent 40%)',
        },
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: 'rgba(215,255,63,0.34)',
            boxShadow: '0 34px 100px rgba(0,0,0,0.52)',
          },
        }),
        ...sx,
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
    </Card>
  );
}

export function GlassPanel({ children, sx = {}, ...props }) {
  return (
    <Box
      {...props}
      sx={{
        borderRadius: 5,
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(18,17,12,0.62)',
        backdropFilter: 'blur(22px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.30)',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

export function PageHero({ eyebrow = 'FitFusion AI', title, subtitle, actions, visual, chip }) {
  return (
    <PremiumCard sx={{ mb: 3 }} glow="rgba(215,255,63,0.30)" hover={false}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch" justifyContent="space-between">
          <Box sx={{ maxWidth: 780 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
              <Chip icon={<AutoAwesomeRoundedIcon />} label={eyebrow} color="primary" />
              {chip}
            </Stack>
            <Typography variant="h3" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 0.96, maxWidth: 780 }}>
              {title}
            </Typography>
            {subtitle && <Typography color="text.secondary" sx={{ mt: 2, fontSize: { xs: 15, md: 17 }, maxWidth: 720 }}>{subtitle}</Typography>}
            {actions && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>{actions}</Stack>}
          </Box>
          {visual && <Box sx={{ minWidth: { md: 300 }, flex: '0 0 34%', display: 'grid', placeItems: 'center' }}>{visual}</Box>}
        </Stack>
      </CardContent>
    </PremiumCard>
  );
}

export function MetricCard({ label, value, note, icon, accent = '#D7FF3F', progress }) {
  return (
    <PremiumCard glow={`${accent}30`}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h3" sx={{ mt: 0.4, fontSize: { xs: 36, md: 42 } }}>{value}</Typography>
          </Box>
          <Box sx={{ width: 52, height: 52, borderRadius: 4, display: 'grid', placeItems: 'center', bgcolor: `${accent}1F`, color: accent, border: `1px solid ${accent}40`, fontSize: 24 }}>
            {icon}
          </Box>
        </Stack>
        {typeof progress === 'number' && <LinearProgress variant="determinate" value={progress} sx={{ my: 1.5, height: 8, borderRadius: 99 }} />}
        <Typography color="text.secondary" variant="body2">{note}</Typography>
      </CardContent>
    </PremiumCard>
  );
}

export function EmptyState({ title, description, action, icon = '✨', sx = {} }) {
  return (
    <GlassPanel sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', ...sx }}>
      <Box sx={{ width: 82, height: 82, mx: 'auto', mb: 2, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 38, background: 'radial-gradient(circle, rgba(215,255,63,0.35), rgba(255,176,32,0.12))', border: '1px solid rgba(255,255,255,0.14)', animation: 'floaty 5s ease-in-out infinite' }}>
        {icon}
      </Box>
      <Typography variant="h5" fontWeight={900}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 520, mx: 'auto' }}>{description}</Typography>
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </GlassPanel>
  );
}

export function CategoryChip({ category, active, onClick }) {
  const meta = getCategoryMeta(category);
  return (
    <Chip
      clickable={!!onClick}
      onClick={onClick}
      label={`${meta.icon} ${category === 'All' ? 'All' : category}`}
      sx={{
        borderColor: active ? `${meta.color}80` : 'rgba(255,255,255,0.10)',
        bgcolor: active ? `${meta.color}24` : 'rgba(255,255,255,0.05)',
        color: active ? '#fff' : 'text.secondary',
        fontWeight: 850,
      }}
    />
  );
}

export function ProgressRing({ value = 0, label, caption, size = 144, accent = '#D7FF3F' }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <Box sx={{ width: size, height: size, position: 'relative', display: 'grid', placeItems: 'center' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(${accent} ${normalized}%, rgba(255,255,255,0.09) 0)`,
          boxShadow: `0 0 46px ${accent}33`,
        }}
      />
      <Box sx={{ position: 'absolute', inset: 12, borderRadius: '50%', bgcolor: 'rgba(8,12,22,0.92)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <Stack sx={{ position: 'relative', textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={950}>{label || `${normalized}%`}</Typography>
        {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
      </Stack>
    </Box>
  );
}

export function HeroOrb({ formScore = 100 } = {}) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(formScore) || 100)));
  return (
    <Box sx={{ width: { xs: 220, md: 310 }, height: { xs: 220, md: 310 }, position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 22, borderRadius: '50%', background: 'radial-gradient(circle at 35% 25%, rgba(248,250,255,0.86), rgba(255,176,32,0.58) 18%, rgba(215,255,63,0.52) 50%, rgba(255,77,77,0.18) 72%, transparent 74%)', filter: 'drop-shadow(0 30px 80px rgba(215,255,63,0.34))', animation: 'pulseOrb 6s ease-in-out infinite' }} />
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.16)', animation: 'spinSlow 22s linear infinite', '&:before, &:after': { content: '""', position: 'absolute', borderRadius: '50%', bgcolor: '#FFB020', boxShadow: '0 0 30px rgba(255,176,32,0.9)' }, '&:before': { width: 12, height: 12, top: 38, left: '50%' }, '&:after': { width: 9, height: 9, bottom: 46, right: 42, bgcolor: '#65FFB4' } }} />
      <GlassPanel sx={{ position: 'absolute', left: 10, bottom: 26, p: 1.5, borderRadius: 4 }}>
        <Typography variant="caption" color="text.secondary">AI form score</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={950}>{normalizedScore}%</Typography>
          <ArrowForwardRoundedIcon fontSize="small" />
        </Stack>
      </GlassPanel>
    </Box>
  );
}
