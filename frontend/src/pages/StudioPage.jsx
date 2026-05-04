import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import API from '../api';
import { GlassPanel, PremiumCard, getCategoryMeta } from '../components/premium';

const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28], [27, 31], [28, 32], [15, 19], [16, 20],
];

const IMPORTANT_JOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 31, 32];

const formatTime = (value) => {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0');
  const seconds = (value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const trackerLabels = {
  idle: 'Tracker Idle',
  loading: 'Opening Camera',
  ready: 'Camera Ready',
  locked: 'Pose Tracker Active',
  blocked: 'Camera Blocked',
};

function CameraIdle({ onStart }) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', p: 3, background: 'radial-gradient(circle at 50% 35%, rgba(215,255,63,0.18), rgba(5,7,13,0.40) 44%, rgba(5,7,13,0.82))' }}>
      <Stack spacing={2.2} alignItems="center">
        <Box sx={{ width: 132, height: 132, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle, rgba(255,176,32,0.28), rgba(215,255,63,0.16), transparent 70%)', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 0 90px rgba(255,176,32,0.18)', animation: 'pulseOrb 4.5s ease-in-out infinite' }}>
          <CameraAltRoundedIcon sx={{ fontSize: 58 }} />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: 34, md: 46 } }}>Camera idle</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 560, mt: 1 }}>Start camera to launch the live pose skeleton, motion score, timer, and auto-rep tracker in one no-scroll workspace.</Typography>
        </Box>
        <Button size="large" variant="contained" onClick={onStart} startIcon={<CameraAltRoundedIcon />}>Start camera + tracker</Button>
      </Stack>
    </Box>
  );
}

function FormChecklist({ cues = [], mistakes = [] }) {
  return (
    <GlassPanel sx={{ p: 1.7, borderRadius: 3.5 }}>
      <Typography variant="overline" color="text.secondary">Form checklist</Typography>
      <Stack spacing={0.85} sx={{ mt: 1 }}>
        {cues.slice(0, 4).map((cue) => (
          <Stack key={cue} direction="row" spacing={1} alignItems="flex-start">
            <CheckCircleRoundedIcon color="success" fontSize="small" sx={{ mt: 0.1 }} />
            <Typography variant="body2">{cue}</Typography>
          </Stack>
        ))}
      </Stack>
      {!!mistakes.length && (
        <>
          <Divider sx={{ my: 1.35 }} />
          <Typography variant="caption" color="text.secondary">Avoid: {mistakes.slice(0, 3).join(' · ')}</Typography>
        </>
      )}
    </GlassPanel>
  );
}

function MiniStat({ label, value, icon, accent = '#FFB020' }) {
  return (
    <GlassPanel sx={{ p: 1.35, borderRadius: 3.2, minWidth: 0, background: `linear-gradient(135deg, ${accent}20, rgba(255,255,255,0.035))` }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ color: accent, display: 'grid' }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography fontWeight={950} noWrap>{value}</Typography>
        </Box>
      </Stack>
    </GlassPanel>
  );
}

export default function StudioPage() {
  const [exercises, setExercises] = useState([]);
  const [voiceTips, setVoiceTips] = useState({});
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState('Strength');
  const [title, setTitle] = useState('Focused Training Session');
  const [notes, setNotes] = useState('');
  const [intensity, setIntensity] = useState('Medium');
  const [reps, setReps] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState('Ready. Start the camera and the tracker will begin watching motion.');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('/sample/midnight');
  const [autoRepEnabled, setAutoRepEnabled] = useState(true);
  const [motionScore, setMotionScore] = useState(0);
  const [poseMode, setPoseMode] = useState('loading');
  const [trackerStatus, setTrackerStatus] = useState('idle');
  const [trackerSensitivity, setTrackerSensitivity] = useState(14);
  const [completion, setCompletion] = useState(null);

  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const analysisCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const previousFrameRef = useRef(null);
  const audioRef = useRef(new Audio());
  const objectUrlRef = useRef(null);
  const runningRef = useRef(false);
  const cameraActiveRef = useRef(false);
  const autoRepRef = useRef(true);
  const sensitivityRef = useRef(14);
  const lastRepTimeRef = useRef(0);
  const motionArmedRef = useRef(true);
  const lastUiUpdateRef = useRef(0);
  const poseLandmarkerRef = useRef(null);
  const poseModelLoadingRef = useRef(false);
  const motionCenterRef = useRef({ x: 0.5, y: 0.5 });
  const skeletonPhaseRef = useRef(0);
  const signalRef = useRef({ filtered: null, last: null, min: 1, max: 0 });
  const repStateRef = useRef({ phase: 'ready', type: 'unknown', lastSignal: null });
  const formSignalRef = useRef({ last: null, smoothed: 0 });
  const formScoreSamplesRef = useRef([]);
  const selectedExerciseRef = useRef(null);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { cameraActiveRef.current = cameraActive; }, [cameraActive]);
  useEffect(() => { autoRepRef.current = autoRepEnabled; }, [autoRepEnabled]);
  useEffect(() => { sensitivityRef.current = trackerSensitivity; }, [trackerSensitivity]);

  useEffect(() => {
    API.exercises().then((data) => {
      setExercises(data.items);
      if (data.items.length) {
        setExerciseName(data.items[0].name);
        setCategory(data.items[0].category);
        setTitle(`${data.items[0].name} Studio Session`);
      }
    }).catch((error) => setMessage(error.message));

    API.voiceTips().then(setVoiceTips).catch(() => {});
    API.profile().then((payload) => {
      if (payload.profile) {
        setVoiceEnabled(payload.profile.voice_enabled === undefined ? true : !!payload.profile.voice_enabled);
        setMusicEnabled(payload.profile.music_enabled === undefined ? true : !!payload.profile.music_enabled);
        setAutoRepEnabled(payload.profile.tracker_enabled === undefined ? true : !!payload.profile.tracker_enabled);
        setTrackerSensitivity(payload.profile.motion_sensitivity || 14);
      }
    }).catch(() => {});

    audioRef.current.loop = true;

    return () => {
      stopCamera();
      window.speechSynthesis?.cancel?.();
      audioRef.current.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let id;
    if (running) id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const selectedExercise = useMemo(() => exercises.find((item) => item.name === exerciseName), [exercises, exerciseName]);
  const cues = selectedExercise?.cues || [];
  const mistakes = selectedExercise?.mistakes || [];
  const focusText = selectedExercise?.focus?.join(' • ') || 'Full body tracking';
  const meta = getCategoryMeta(category);
  const trackerProgress = Math.min(100, Math.round((motionScore / Math.max(trackerSensitivity, 1)) * 100));

  useEffect(() => {
    selectedExerciseRef.current = selectedExercise;
    repStateRef.current = { phase: 'ready', type: 'unknown', lastSignal: null };
    signalRef.current = { filtered: null, last: null, min: 1, max: 0 };
    formSignalRef.current = { last: null, smoothed: 0 };
    formScoreSamplesRef.current = [];
    motionArmedRef.current = true;
  }, [selectedExercise]);

  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 0.96;
    window.speechSynthesis.speak(utter);
  };

  const stopCamera = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    previousFrameRef.current = null;
    streamRef.current?.getTracks()?.forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setTrackerStatus('idle');
    setMotionScore(0);
    formSignalRef.current = { last: null, smoothed: 0 };
    formScoreSamplesRef.current = [];
    setPoseMode(poseLandmarkerRef.current ? 'ready' : 'fallback');
  };

  const loadPoseModel = async () => {
    if (poseLandmarkerRef.current || poseModelLoadingRef.current) return;
    poseModelLoadingRef.current = true;
    setPoseMode('loading');
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const fileset = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm');
      poseLandmarkerRef.current = await vision.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.45,
        minPosePresenceConfidence: 0.45,
        minTrackingConfidence: 0.45,
      });
      setPoseMode('mediapipe');
      setMessage('Real pose skeleton loaded. Reps now use joint-angle logic, so head movement will not count.');
    } catch (error) {
      console.warn('Pose model fallback:', error);
      setPoseMode('fallback');
      setMessage('Camera is live. Using lightweight motion skeleton because the pose model could not load.');
    } finally {
      poseModelLoadingRef.current = false;
    }
  };

  const drawPoseSkeleton = (ctx, width, height, landmarks, score) => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(255,176,32,0.65)';
    ctx.strokeStyle = 'rgba(255,176,32,0.92)';
    ctx.lineWidth = Math.max(3, width * 0.004);

    POSE_CONNECTIONS.forEach(([a, b]) => {
      const start = landmarks[a];
      const end = landmarks[b];
      if (!start || !end) return;
      const va = start.visibility ?? 1;
      const vb = end.visibility ?? 1;
      if (va < 0.35 || vb < 0.35) return;
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    });

    IMPORTANT_JOINTS.forEach((index) => {
      const point = landmarks[index];
      if (!point || (point.visibility ?? 1) < 0.35) return;
      const x = point.x * width;
      const y = point.y * height;
      const radius = index === 0 ? 7 : 5;
      ctx.beginPath();
      ctx.fillStyle = index === 0 ? 'rgba(215,255,63,0.96)' : 'rgba(248,250,255,0.94)';
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,176,32,0.95)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.globalAlpha = Math.min(0.52, 0.10 + score / 160);
    const chest = landmarks[11] && landmarks[12] ? { x: (landmarks[11].x + landmarks[12].x) / 2 * width, y: (landmarks[11].y + landmarks[12].y) / 2 * height } : { x: width / 2, y: height / 2 };
    const pulse = 54 + score * 0.8;
    ctx.strokeStyle = 'rgba(215,255,63,0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(chest.x, chest.y, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawFallbackSkeleton = (ctx, width, height, score) => {
    const center = motionCenterRef.current;
    skeletonPhaseRef.current += 0.04 + Math.min(score, 80) / 1400;
    const phase = skeletonPhaseRef.current;
    const cx = width * (0.32 + center.x * 0.36);
    const cy = height * (0.24 + center.y * 0.30);
    const scale = Math.min(width, height) * 0.23;
    const sway = Math.sin(phase) * scale * (0.06 + score / 700);
    const head = { x: cx + sway * 0.35, y: cy - scale * 0.55 };
    const neck = { x: cx, y: cy - scale * 0.32 };
    const hip = { x: cx - sway * 0.25, y: cy + scale * 0.36 };
    const lShoulder = { x: cx - scale * 0.34, y: cy - scale * 0.26 };
    const rShoulder = { x: cx + scale * 0.34, y: cy - scale * 0.26 };
    const lElbow = { x: cx - scale * (0.52 + Math.sin(phase) * 0.12), y: cy + scale * (0.02 + Math.cos(phase) * 0.10) };
    const rElbow = { x: cx + scale * (0.52 + Math.cos(phase) * 0.12), y: cy + scale * (0.02 + Math.sin(phase) * 0.10) };
    const lHand = { x: cx - scale * (0.60 + Math.sin(phase) * 0.22), y: cy + scale * (0.31 + Math.cos(phase) * 0.12) };
    const rHand = { x: cx + scale * (0.60 + Math.cos(phase) * 0.22), y: cy + scale * (0.31 + Math.sin(phase) * 0.12) };
    const lHip = { x: hip.x - scale * 0.22, y: hip.y };
    const rHip = { x: hip.x + scale * 0.22, y: hip.y };
    const lKnee = { x: cx - scale * (0.34 + Math.cos(phase) * 0.11), y: cy + scale * (0.77 + Math.sin(phase) * 0.05) };
    const rKnee = { x: cx + scale * (0.34 + Math.sin(phase) * 0.11), y: cy + scale * (0.77 + Math.cos(phase) * 0.05) };
    const lFoot = { x: cx - scale * 0.47, y: cy + scale * 1.08 };
    const rFoot = { x: cx + scale * 0.47, y: cy + scale * 1.08 };

    const lines = [[head, neck], [lShoulder, rShoulder], [neck, hip], [lShoulder, lElbow], [lElbow, lHand], [rShoulder, rElbow], [rElbow, rHand], [lHip, rHip], [lHip, lKnee], [lKnee, lFoot], [rHip, rKnee], [rKnee, rFoot]];
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255,176,32,0.70)';
    ctx.strokeStyle = 'rgba(255,176,32,0.9)';
    ctx.lineWidth = Math.max(3, width * 0.0045);
    lines.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
    [head, neck, lShoulder, rShoulder, lElbow, rElbow, lHand, rHand, hip, lHip, rHip, lKnee, rKnee, lFoot, rFoot].forEach((p, index) => {
      ctx.beginPath();
      ctx.fillStyle = index === 0 ? 'rgba(215,255,63,0.96)' : 'rgba(248,250,255,0.94)';
      ctx.arc(p.x, p.y, index === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(215,255,63,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  };

  const drawOverlay = (ctx, width, height, score, landmarks) => {
    ctx.clearRect(0, 0, width, height);
    const now = performance.now();
    const scanY = ((now / 18) % height);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 176, 32, 0.70)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.strokeRect(width * 0.12, height * 0.08, width * 0.76, height * 0.82);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 176, 32, 0.13)';
    ctx.fillRect(0, scanY, width, 2);
    ctx.restore();

    if (landmarks?.length) drawPoseSkeleton(ctx, width, height, landmarks, score);
    else drawFallbackSkeleton(ctx, width, height, score);

    ctx.save();
    const bars = 18;
    for (let i = 0; i < bars; i += 1) {
      const barHeight = Math.max(8, (score / 58) * height * (0.032 + (i % 4) * 0.008));
      ctx.fillStyle = i % 2 ? 'rgba(255, 176, 32, 0.55)' : 'rgba(215, 255, 63, 0.55)';
      ctx.fillRect(width - 36, height - 26 - i * 12, 12, -barHeight);
    }
    ctx.restore();
  };

  const getPoseSignal = (landmarks) => {
    if (!landmarks?.length) return null;
    const avg = (indexes) => {
      const points = indexes.map((index) => landmarks[index]).filter((p) => p && (p.visibility ?? 1) > 0.35);
      if (!points.length) return null;
      return points.reduce((sum, point) => sum + point.y, 0) / points.length;
    };
    const slug = selectedExerciseRef.current?.slug || selectedExercise?.slug || '';
    if (slug.includes('squat') || slug.includes('lunge') || slug.includes('bridge') || slug.includes('wall')) return avg([23, 24]);
    if (slug.includes('curl')) return avg([15, 16]);
    if (slug.includes('jump') || slug.includes('knees') || slug.includes('skater') || slug.includes('feet')) return avg([25, 26, 27, 28]);
    return avg([11, 12, 23, 24]);
  };

  const updatePosePower = (signal) => {
    if (signal === null || signal === undefined) return 0;
    const state = signalRef.current;
    state.filtered = state.filtered === null ? signal : state.filtered * 0.74 + signal * 0.26;
    state.min = Math.min(state.min * 0.995 + state.filtered * 0.005, state.filtered);
    state.max = Math.max(state.max * 0.995 + state.filtered * 0.005, state.filtered);
    const delta = state.last === null ? 0 : Math.abs(state.filtered - state.last);
    state.last = state.filtered;
    const range = Math.max(0.04, state.max - state.min);
    return Math.min(100, Math.round((delta / range) * 70));
  };


  const visiblePoint = (point, minVisibility = 0.45) => point && (point.visibility ?? 1) >= minVisibility;

  const jointAngle = (a, b, c) => {
    if (!visiblePoint(a) || !visiblePoint(b) || !visiblePoint(c)) return null;
    const abx = a.x - b.x;
    const aby = a.y - b.y;
    const cbx = c.x - b.x;
    const cby = c.y - b.y;
    const dot = abx * cbx + aby * cby;
    const magA = Math.hypot(abx, aby);
    const magC = Math.hypot(cbx, cby);
    if (!magA || !magC) return null;
    const cosine = Math.max(-1, Math.min(1, dot / (magA * magC)));
    return Math.round((Math.acos(cosine) * 180) / Math.PI);
  };

  const averageValid = (values) => {
    const clean = values.filter((value) => Number.isFinite(value));
    if (!clean.length) return null;
    return clean.reduce((sum, value) => sum + value, 0) / clean.length;
  };

  const distance2D = (a, b) => {
    if (!visiblePoint(a) || !visiblePoint(b)) return null;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

  const bandScore = (value, min, max, softness = 20) => {
    if (!Number.isFinite(value)) return 0;
    if (value >= min && value <= max) return 100;
    const distance = value < min ? min - value : value - max;
    return clampScore(100 - (distance / Math.max(softness, 1)) * 100);
  };

  const closenessScore = (value, target, tolerance) => {
    if (!Number.isFinite(value)) return 0;
    return clampScore(100 - (Math.abs(value - target) / Math.max(tolerance, 1)) * 100);
  };

  const requiredJointsForExercise = (slug = '', exerciseCategory = '') => {
    if (slug.includes('push') || slug.includes('dip') || slug.includes('curl')) return [11, 12, 13, 14, 15, 16];
    if (slug.includes('squat') || slug.includes('lunge') || slug.includes('bridge') || slug.includes('wall')) return [11, 12, 23, 24, 25, 26, 27, 28];
    if (slug.includes('plank') || slug.includes('dead-bug') || slug.includes('mountain')) return [11, 12, 15, 16, 23, 24, 25, 26, 27, 28];
    if (exerciseCategory === 'Cardio' || slug.includes('jump') || slug.includes('knees') || slug.includes('skater')) return [11, 12, 15, 16, 23, 24, 25, 26, 27, 28];
    return [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  };

  const visibilityScoreFor = (landmarks, required) => {
    if (!landmarks?.length || !required.length) return 0;
    const visible = required.filter((index) => visiblePoint(landmarks[index], 0.5)).length;
    return clampScore((visible / required.length) * 100);
  };

  const averageBodyLineScore = (landmarks) => {
    const left = jointAngle(landmarks[11], landmarks[23], landmarks[27]);
    const right = jointAngle(landmarks[12], landmarks[24], landmarks[28]);
    return averageValid([closenessScore(left, 180, 34), closenessScore(right, 180, 34)]);
  };

  const computeLiveFormScore = (landmarks, repSignal) => {
    if (!landmarks?.length) return 0;

    const exercise = selectedExerciseRef.current || selectedExercise;
    const slug = exercise?.slug || '';
    const exerciseCategory = exercise?.category || category;
    const required = requiredJointsForExercise(slug, exerciseCategory);
    const visibility = visibilityScoreFor(landmarks, required);
    if (visibility < 58) {
      const lowScore = clampScore(visibility * 0.55);
      formSignalRef.current.smoothed = formSignalRef.current.smoothed ? formSignalRef.current.smoothed * 0.8 + lowScore * 0.2 : lowScore;
      return clampScore(formSignalRef.current.smoothed);
    }

    const leftElbow = jointAngle(landmarks[11], landmarks[13], landmarks[15]);
    const rightElbow = jointAngle(landmarks[12], landmarks[14], landmarks[16]);
    const elbowAngle = averageValid([leftElbow, rightElbow]);
    const leftKnee = jointAngle(landmarks[23], landmarks[25], landmarks[27]);
    const rightKnee = jointAngle(landmarks[24], landmarks[26], landmarks[28]);
    const kneeAngle = averageValid([leftKnee, rightKnee]);
    const elbowSymmetry = Number.isFinite(leftElbow) && Number.isFinite(rightElbow) ? clampScore(100 - Math.abs(leftElbow - rightElbow) * 2.2) : 72;
    const kneeSymmetry = Number.isFinite(leftKnee) && Number.isFinite(rightKnee) ? clampScore(100 - Math.abs(leftKnee - rightKnee) * 2.1) : 72;

    let quality = 72;
    if (slug.includes('squat') || slug.includes('lunge') || slug.includes('wall')) {
      quality = averageValid([bandScore(kneeAngle, 95, 178, 25), kneeSymmetry, visibility]) || 65;
    } else if (slug.includes('push') || slug.includes('dip') || slug.includes('curl')) {
      quality = averageValid([bandScore(elbowAngle, 55, 178, 24), elbowSymmetry, visibility]) || 65;
    } else if (slug.includes('plank')) {
      quality = averageValid([averageBodyLineScore(landmarks), visibility]) || 64;
    } else if (slug.includes('bridge')) {
      const hipY = averageValid([landmarks[23]?.y, landmarks[24]?.y]);
      const shoulderY = averageValid([landmarks[11]?.y, landmarks[12]?.y]);
      const kneeY = averageValid([landmarks[25]?.y, landmarks[26]?.y]);
      const lift = Number.isFinite(hipY) && Number.isFinite(shoulderY) && Number.isFinite(kneeY) ? Math.max(0, (kneeY - hipY) / Math.max(0.12, kneeY - shoulderY)) : null;
      quality = averageValid([bandScore(lift, 0.34, 0.70, 0.25), kneeSymmetry, visibility]) || 64;
    } else if (exerciseCategory === 'Cardio' || slug.includes('jump') || slug.includes('knees') || slug.includes('skater') || slug.includes('feet') || slug.includes('mountain')) {
      const shoulderSpread = distance2D(landmarks[11], landmarks[12]) || 0.22;
      const ankleSpread = distance2D(landmarks[27], landmarks[28]) || shoulderSpread;
      const wristSpread = distance2D(landmarks[15], landmarks[16]) || shoulderSpread;
      const amplitude = ((ankleSpread / shoulderSpread) + (wristSpread / shoulderSpread)) / 2;
      quality = averageValid([bandScore(amplitude, 0.75, 3.4, 0.8), visibility]) || 64;
    } else if (repSignal?.type === 'angle') {
      quality = averageValid([bandScore(repSignal.value, repSignal.down - 22, repSignal.up + 16, 28), visibility]) || 64;
    } else if (repSignal?.type === 'range') {
      quality = averageValid([bandScore(repSignal.value, repSignal.low * 0.65, repSignal.high * 1.35, repSignal.high || 0.5), visibility]) || 64;
    }

    const signalValue = repSignal?.value ?? averageValid([elbowAngle, kneeAngle]) ?? 0;
    const lastSignal = formSignalRef.current.last;
    const delta = lastSignal === null ? 0 : Math.abs(signalValue - lastSignal);
    formSignalRef.current.last = signalValue;
    const control = repSignal?.type === 'range' ? clampScore(100 - delta * 850) : clampScore(100 - delta * 4.2);
    const raw = visibility * 0.34 + quality * 0.46 + control * 0.20;
    const score = clampScore(raw);
    formSignalRef.current.smoothed = formSignalRef.current.smoothed ? formSignalRef.current.smoothed * 0.78 + score * 0.22 : score;
    return clampScore(formSignalRef.current.smoothed);
  };

  const getExerciseRepSignal = (landmarks) => {
    if (!landmarks?.length) return null;
    const exercise = selectedExerciseRef.current || selectedExercise;
    const slug = exercise?.slug || '';

    if (slug.includes('plank') || slug.includes('wall-sit') || slug.includes('breath') || slug.includes('child')) {
      return { type: 'hold', ready: true, value: 0, label: 'Timed hold' };
    }

    const leftElbow = jointAngle(landmarks[11], landmarks[13], landmarks[15]);
    const rightElbow = jointAngle(landmarks[12], landmarks[14], landmarks[16]);
    const elbowAngle = averageValid([leftElbow, rightElbow]);
    const leftKnee = jointAngle(landmarks[23], landmarks[25], landmarks[27]);
    const rightKnee = jointAngle(landmarks[24], landmarks[26], landmarks[28]);
    const kneeAngle = averageValid([leftKnee, rightKnee]);

    if (slug.includes('curl')) {
      return { type: 'angle', ready: elbowAngle !== null, value: elbowAngle, down: 72, up: 145, label: 'Elbow angle' };
    }

    if (slug.includes('push') || slug.includes('dip')) {
      return { type: 'angle', ready: elbowAngle !== null, value: elbowAngle, down: 108, up: 153, label: 'Elbow angle' };
    }

    if (slug.includes('squat') || slug.includes('lunge')) {
      return { type: 'angle', ready: kneeAngle !== null, value: kneeAngle, down: 118, up: 158, label: 'Knee angle' };
    }

    if (slug.includes('bridge')) {
      const hipY = averageValid([landmarks[23]?.y, landmarks[24]?.y]);
      const shoulderY = averageValid([landmarks[11]?.y, landmarks[12]?.y]);
      const kneeY = averageValid([landmarks[25]?.y, landmarks[26]?.y]);
      if (![hipY, shoulderY, kneeY].every(Number.isFinite)) return { type: 'range', ready: false };
      const lift = Math.max(0, (kneeY - hipY) / Math.max(0.12, kneeY - shoulderY));
      return { type: 'range', ready: true, value: lift, high: 0.58, low: 0.36, label: 'Hip lift' };
    }

    if (slug.includes('jumping-jacks')) {
      const wristSpread = distance2D(landmarks[15], landmarks[16]);
      const ankleSpread = distance2D(landmarks[27], landmarks[28]);
      const shoulderSpread = distance2D(landmarks[11], landmarks[12]) || 0.22;
      if (![wristSpread, ankleSpread].every(Number.isFinite)) return { type: 'range', ready: false };
      const openness = (wristSpread / shoulderSpread + ankleSpread / shoulderSpread) / 2;
      return { type: 'range', ready: true, value: openness, high: 2.45, low: 1.55, label: 'Jack openness' };
    }

    if (slug.includes('high-knees') || slug.includes('mountain-climbers')) {
      const leftLift = visiblePoint(landmarks[23]) && visiblePoint(landmarks[25]) ? landmarks[23].y - landmarks[25].y : null;
      const rightLift = visiblePoint(landmarks[24]) && visiblePoint(landmarks[26]) ? landmarks[24].y - landmarks[26].y : null;
      const kneeLift = Math.max(leftLift ?? -1, rightLift ?? -1);
      return { type: 'range', ready: kneeLift > -1, value: kneeLift, high: 0.075, low: 0.018, label: 'Knee drive' };
    }

    if (slug.includes('dead-bug')) {
      const leftReach = distance2D(landmarks[15], landmarks[26]);
      const rightReach = distance2D(landmarks[16], landmarks[25]);
      const reach = averageValid([leftReach, rightReach]);
      return { type: 'range', ready: reach !== null, value: reach, high: 0.58, low: 0.38, label: 'Opposite reach' };
    }

    if (slug.includes('russian') || slug.includes('open-book') || slug.includes('worlds-greatest') || slug.includes('hip-cars') || slug.includes('skater') || slug.includes('fast-feet')) {
      const leftAnkle = landmarks[27]?.x;
      const rightAnkle = landmarks[28]?.x;
      const leftWrist = landmarks[15]?.x;
      const rightWrist = landmarks[16]?.x;
      const lateralRange = averageValid([Math.abs((leftAnkle ?? 0) - (rightAnkle ?? 0)), Math.abs((leftWrist ?? 0) - (rightWrist ?? 0))]);
      return { type: 'range', ready: lateralRange !== null, value: lateralRange, high: 0.36, low: 0.22, label: 'Lateral range' };
    }

    if (kneeAngle !== null) return { type: 'angle', ready: true, value: kneeAngle, down: 122, up: 158, label: 'Knee angle' };
    if (elbowAngle !== null) return { type: 'angle', ready: true, value: elbowAngle, down: 108, up: 153, label: 'Elbow angle' };
    return null;
  };

  const updatePoseRepCounter = (repSignal) => {
    if (!cameraActiveRef.current || !runningRef.current || !autoRepRef.current || !repSignal?.ready) return false;
    if (repSignal.type === 'hold') return false;

    const state = repStateRef.current;
    if (state.type !== repSignal.type || state.label !== repSignal.label) {
      repStateRef.current = { phase: 'ready', type: repSignal.type, label: repSignal.label, lastSignal: repSignal.value };
      return false;
    }

    if (repSignal.type === 'angle') {
      if (state.phase === 'ready' && repSignal.value <= repSignal.down) {
        state.phase = 'loaded';
        state.lastSignal = repSignal.value;
        return false;
      }
      if (state.phase === 'loaded' && repSignal.value >= repSignal.up) {
        state.phase = 'ready';
        state.lastSignal = repSignal.value;
        triggerAutoRep('joint-angle');
        return true;
      }
    }

    if (repSignal.type === 'range') {
      if (state.phase === 'ready' && repSignal.value >= repSignal.high) {
        state.phase = 'loaded';
        state.lastSignal = repSignal.value;
        return false;
      }
      if (state.phase === 'loaded' && repSignal.value <= repSignal.low) {
        state.phase = 'ready';
        state.lastSignal = repSignal.value;
        triggerAutoRep('pose-range');
        return true;
      }
    }

    state.lastSignal = repSignal.value;
    return false;
  };

  const triggerAutoRep = (source = 'pose') => {
    const now = Date.now();
    if (!cameraActiveRef.current || !runningRef.current || !autoRepRef.current) return;
    if (now - lastRepTimeRef.current < 760 || !motionArmedRef.current) return;
    motionArmedRef.current = false;
    lastRepTimeRef.current = now;
    if (!runningRef.current) setRunning(true);
    setReps((value) => {
      const next = value + 1;
      if (next % 5 === 0) speak((voiceTips[exerciseName] || cues)[1] || 'Nice rhythm. Joint tracking looks cleaner.');
      return next;
    });
  };

  const analyseFrame = () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video || !overlay || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(analyseFrame);
      return;
    }

    const displayWidth = video.clientWidth || 960;
    const displayHeight = video.clientHeight || 540;
    if (overlay.width !== displayWidth || overlay.height !== displayHeight) {
      overlay.width = displayWidth;
      overlay.height = displayHeight;
    }

    const sampleWidth = 96;
    const sampleHeight = 54;
    if (!analysisCanvasRef.current) analysisCanvasRef.current = document.createElement('canvas');
    const analyser = analysisCanvasRef.current;
    analyser.width = sampleWidth;
    analyser.height = sampleHeight;
    const analyserCtx = analyser.getContext('2d', { willReadFrequently: true });
    analyserCtx.drawImage(video, 0, 0, sampleWidth, sampleHeight);
    const frame = analyserCtx.getImageData(0, 0, sampleWidth, sampleHeight);

    let score = 0;
    let centroidX = 0;
    let centroidY = 0;
    let centroidWeight = 0;
    if (previousFrameRef.current) {
      const previous = previousFrameRef.current.data;
      const current = frame.data;
      let diff = 0;
      for (let index = 0; index < current.length; index += 16) {
        const d = Math.abs(current[index] - previous[index]) + Math.abs(current[index + 1] - previous[index + 1]) + Math.abs(current[index + 2] - previous[index + 2]);
        diff += d;
        if (d > 34) {
          const pixel = index / 4;
          const x = pixel % sampleWidth;
          const y = Math.floor(pixel / sampleWidth);
          centroidX += x * d;
          centroidY += y * d;
          centroidWeight += d;
        }
      }
      score = Math.min(100, Math.round(diff / (current.length / 16) / 3));
      if (centroidWeight > 0) {
        const next = { x: centroidX / centroidWeight / sampleWidth, y: centroidY / centroidWeight / sampleHeight };
        motionCenterRef.current = { x: motionCenterRef.current.x * 0.82 + next.x * 0.18, y: motionCenterRef.current.y * 0.82 + next.y * 0.18 };
      }
    }
    previousFrameRef.current = frame;

    let landmarks = null;
    if (poseLandmarkerRef.current) {
      try {
        const result = poseLandmarkerRef.current.detectForVideo(video, performance.now());
        landmarks = result?.landmarks?.[0] || null;
        if (landmarks) setPoseMode('mediapipe');
      } catch (_) {
        landmarks = null;
      }
    }

    const posePower = updatePosePower(getPoseSignal(landmarks));
    const trackingScore = Math.max(score, posePower);
    const repSignal = getExerciseRepSignal(landmarks);
    const liveFormScore = computeLiveFormScore(landmarks, repSignal);
    const overlayCtx = overlay.getContext('2d');
    drawOverlay(overlayCtx, overlay.width, overlay.height, trackingScore, landmarks);

    const now = Date.now();
    if (now - lastUiUpdateRef.current > 110) {
      setMotionScore(trackingScore);
      setTrackerStatus(streamRef.current ? 'locked' : 'ready');
      lastUiUpdateRef.current = now;
    }

    if (runningRef.current && liveFormScore > 0) {
      formScoreSamplesRef.current.push(liveFormScore);
      if (formScoreSamplesRef.current.length > 420) formScoreSamplesRef.current.shift();
    }
    const countedFromPose = updatePoseRepCounter(repSignal);
    const threshold = Math.max(24, sensitivityRef.current * 1.85);
    const bodyMotionDetected = motionCenterRef.current.y > 0.36 && motionCenterRef.current.y < 0.92;
    const fallbackCategory = selectedExerciseRef.current?.category || category;
    const canUseFallbackCounter = !poseLandmarkerRef.current && fallbackCategory === 'Cardio';
    if (!landmarks && canUseFallbackCounter && trackingScore > threshold && bodyMotionDetected) triggerAutoRep('fallback-motion');
    if (trackingScore < threshold * 0.42 || countedFromPose) motionArmedRef.current = true;

    animationRef.current = requestAnimationFrame(analyseFrame);
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setTrackerStatus('blocked');
      setMessage('Camera API is not available. Open the app on localhost or HTTPS in a modern browser.');
      return;
    }

    try {
      setTrackerStatus('loading');
      setPoseMode('loading');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setRunning(true);
      setTrackerStatus('ready');
      setMessage('Camera connected. Timer started. Reps count only after full joint-angle movement while the session is running.');
      previousFrameRef.current = null;
      signalRef.current = { filtered: null, last: null, min: 1, max: 0 };
      repStateRef.current = { phase: 'ready', type: 'unknown', lastSignal: null };
      formSignalRef.current = { last: null, smoothed: 0 };
      formScoreSamplesRef.current = [];
      animationRef.current = requestAnimationFrame(analyseFrame);
      loadPoseModel();
    } catch (error) {
      stopCamera();
      setTrackerStatus('blocked');
      setPoseMode('fallback');
      setMessage(error?.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow camera access in the browser and try again.' : 'Camera could not start. Close other apps using the webcam and try again.');
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
      setRunning(false);
      setMessage('Camera stopped. Session paused.');
    } else {
      startCamera();
    }
  };

  const chooseExercise = (value) => {
    const next = exercises.find((item) => item.name === value);
    setExerciseName(value);
    if (next) {
      setCategory(next.category);
      setTitle(`${next.name} Studio Session`);
      setMessage(`${next.name} loaded. Focus: ${next.focus?.join(', ')}.`);
    }
  };

  const toggleMusic = async () => {
    if (!musicEnabled) {
      setMessage('Music controls are disabled. Enable music controls in the side panel or Profile.');
      return;
    }
    const audio = audioRef.current;
    if (!audio.src && selectedTrack.startsWith('/sample/')) audio.src = selectedTrack === '/sample/midnight' ? '/audio/midnight_pulse.wav' : '/audio/focus_drift.wav';
    if (!audio.src) { setMessage('Choose a track or upload a file first.'); return; }
    try {
      if (musicPlaying) { audio.pause(); setMusicPlaying(false); setMessage('Music paused.'); }
      else { await audio.play(); setMusicPlaying(true); setMessage('Music playing.'); }
    } catch (_) { setMessage('Browser blocked autoplay. Press Play music again after interacting with the page.'); }
  };

  const uploadMusic = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const src = URL.createObjectURL(file);
    objectUrlRef.current = src;
    audioRef.current.src = src;
    setSelectedTrack(src);
    setMusicPlaying(false);
    setMessage(`Loaded ${file.name}.`);
  };

  const resetSession = () => {
    setRunning(false);
    setSeconds(0);
    setReps(0);
    setNotes('');
    motionArmedRef.current = true;
    repStateRef.current = { phase: 'ready', type: 'unknown', lastSignal: null };
    formSignalRef.current = { last: null, smoothed: 0 };
    formScoreSamplesRef.current = [];
    lastRepTimeRef.current = 0;
    setMessage('Session reset.');
  };

  const saveSession = async () => {
    try {
      const averageFormScore = formScoreSamplesRef.current.length
        ? Math.round(formScoreSamplesRef.current.reduce((sum, value) => sum + value, 0) / formScoreSamplesRef.current.length)
        : 0;
      const payload = { title, category, exercise_name: exerciseName, reps, duration_seconds: seconds, intensity, notes, form_score: averageFormScore };
      const res = await API.saveSession(payload);
      setCompletion({ calories: res.calories, reps, seconds, title });
      setMessage(`Session saved. Estimated calories: ${res.calories}`);
      speak('Session saved. Nice work today.');
      setRunning(false);
      setSeconds(0);
      setReps(0);
      formScoreSamplesRef.current = [];
    } catch (error) { setMessage(error.message); }
  };

  const primaryAction = () => {
    const nextRunning = !running;
    setRunning(nextRunning);
    setMessage(nextRunning ? 'Session started. Joint-angle tracker and timer are live.' : 'Session paused. Camera stays open.');
    if (nextRunning) speak(`Starting ${exerciseName}. Keep the movement clean and controlled.`);
  };

  const manualRep = () => {
    setReps((value) => value + 1);
    speak((voiceTips[exerciseName] || cues)[0] || 'Good rep. Stay controlled.');
  };

  return (
    <Box sx={{ height: '100%', position: 'relative', pb: { xs: 10, lg: 9 } }}>
      <Box sx={{ height: '100%', display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(330px, 390px)' }, gridTemplateRows: { xs: 'minmax(640px, 1fr) minmax(520px, auto)', lg: 'minmax(0, 1fr)' }, overflow: { xs: 'auto', lg: 'hidden' }, pr: { xs: 0, lg: 0.5 } }}>
        <PremiumCard hover={false} glow={cameraActive ? meta.glow : 'rgba(255,176,32,0.15)'} sx={{ height: '100%', minHeight: 0, overflow: 'hidden', borderRadius: 4.5 }}>
          <CardContent sx={{ p: { xs: 1.4, md: 1.7 }, height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Box sx={{ position: 'relative', borderRadius: 4, overflow: 'hidden', border: cameraActive ? '1px solid rgba(255,176,32,0.46)' : '1px solid rgba(255,255,255,0.12)', bgcolor: 'rgba(255,255,255,0.03)', flex: 1, minHeight: 0, boxShadow: cameraActive ? 'inset 0 0 120px rgba(0,0,0,0.34), 0 0 64px rgba(255,176,32,0.17)' : 'inset 0 0 90px rgba(0,0,0,0.36)' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none', transform: 'scaleX(-1)' }} />
              <canvas ref={overlayRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }} />
              {!cameraActive && <CameraIdle onStart={toggleCamera} />}

              {trackerStatus === 'blocked' && <Alert severity="error" sx={{ position: 'absolute', left: 16, right: 16, top: 16, borderRadius: 3 }}>{message}</Alert>}

              <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(5,7,13,0.66) 0%, transparent 25%, transparent 67%, rgba(5,7,13,0.75) 100%)' }} />

              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ position: 'absolute', top: 16, left: 16, right: 16, pointerEvents: 'none' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="text.secondary">Camera-first studio</Typography>
                  <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 44 }, lineHeight: 0.95 }}>{exerciseName || 'Select exercise'}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.55, maxWidth: 620 }} noWrap>{focusText}</Typography>
                </Box>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap justifyContent="flex-end" sx={{ maxWidth: 520 }}>
                  <Chip icon={<SensorsRoundedIcon />} label={trackerLabels[trackerStatus]} color={trackerStatus === 'locked' ? 'secondary' : trackerStatus === 'blocked' ? 'error' : 'default'} sx={{ bgcolor: 'rgba(7,7,5,0.72)' }} />
                  <Chip label={poseMode === 'mediapipe' ? 'Real skeleton' : poseMode === 'loading' ? 'Loading skeleton' : 'Motion skeleton'} sx={{ bgcolor: 'rgba(7,7,5,0.72)' }} />
                  <Chip icon={<TimerRoundedIcon />} label={formatTime(seconds)} sx={{ bgcolor: 'rgba(7,7,5,0.72)' }} />
                </Stack>
              </Stack>

              <GlassPanel sx={{ position: 'absolute', left: 16, bottom: 16, p: 1.5, borderRadius: 4, minWidth: { xs: 220, sm: 300 }, background: 'rgba(7,7,5,0.78)' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">Auto reps</Typography>
                    <Typography variant="h2" lineHeight={0.9}>{reps}</Typography>
                  </Box>
                  <Divider flexItem orientation="vertical" />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">Motion score</Typography><Typography variant="caption" fontWeight={900}>{motionScore}</Typography></Stack>
                    <LinearProgress variant="determinate" value={trackerProgress} sx={{ mt: 0.8, height: 8, borderRadius: 99 }} />
                    <Typography variant="caption" color="text.secondary">{autoRepEnabled ? 'Auto-rep enabled' : 'Manual reps only'}</Typography>
                  </Box>
                </Stack>
              </GlassPanel>

              <Box sx={{ position: 'absolute', right: 16, bottom: 16 }}>
                <Chip size="small" label={running ? 'Session Live' : 'Paused'} color={running ? 'success' : 'default'} sx={{ bgcolor: running ? undefined : 'rgba(7,7,5,0.78)' }} />
              </Box>
            </Box>
          </CardContent>
        </PremiumCard>

        <PremiumCard hover={false} glow="rgba(215,255,63,0.18)" sx={{ height: '100%', minHeight: 0, overflow: 'hidden', borderRadius: 4.5 }}>
          <CardContent sx={{ p: 0, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="overline" color="text.secondary">Control panel</Typography>
              <Typography variant="h5">Session setup</Typography>
              <Alert severity={trackerStatus === 'blocked' ? 'error' : 'info'} sx={{ mt: 1.4, borderRadius: 3 }}>{message}</Alert>
            </Box>

            <Stack spacing={1.45} sx={{ p: 2, overflow: 'auto', minHeight: 0 }}>
              <TextField select label="Exercise" value={exerciseName} onChange={(e) => chooseExercise(e.target.value)} fullWidth>
                {exercises.map((exercise) => <MenuItem key={exercise.name} value={exercise.name}>{exercise.name} · {exercise.category}</MenuItem>)}
              </TextField>
              <TextField label="Session title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                <TextField select label="Intensity" value={intensity} onChange={(e) => setIntensity(e.target.value)} fullWidth>{['Low', 'Medium', 'High'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
                <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth>{['Strength', 'Cardio', 'Core', 'Mobility', 'Recovery', 'Full Body'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                <MiniStat label="Reps" value={reps} icon={<FitnessCenterRoundedIcon />} accent="#D7FF3F" />
                <MiniStat label="Timer" value={formatTime(seconds)} icon={<TimerRoundedIcon />} accent="#FFB020" />
                <MiniStat label="Motion" value={motionScore} icon={<GraphicEqRoundedIcon />} accent="#65FFB4" />
                <MiniStat label="Tracker" value={poseMode === 'mediapipe' ? 'Pose' : 'Motion'} icon={<CenterFocusStrongRoundedIcon />} accent="#F0D061" />
              </Box>

              <GlassPanel sx={{ p: 1.8, borderRadius: 3.6 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography fontWeight={950}>Auto-rep tracker</Typography>
                    <Typography variant="body2" color="text.secondary">Counts reps from joint angles while the session is running, not from random head movement.</Typography>
                  </Box>
                  <Switch checked={autoRepEnabled} onChange={(e) => setAutoRepEnabled(e.target.checked)} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}><Typography variant="body2" color="text.secondary">Sensitivity</Typography><Typography variant="body2" fontWeight={950}>{trackerSensitivity}</Typography></Stack>
                <Slider value={trackerSensitivity} min={6} max={40} onChange={(_, value) => setTrackerSensitivity(value)} />
              </GlassPanel>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2 }}>
                <GlassPanel sx={{ p: 1.35, borderRadius: 3.2 }}><FormControlLabel control={<Switch checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.target.checked)} />} label={<Stack><Typography fontWeight={900}>Voice</Typography><Typography variant="caption" color="text.secondary">Spoken cues</Typography></Stack>} /></GlassPanel>
                <GlassPanel sx={{ p: 1.35, borderRadius: 3.2 }}><FormControlLabel control={<Switch checked={musicEnabled} onChange={(e) => setMusicEnabled(e.target.checked)} />} label={<Stack><Typography fontWeight={900}>Music</Typography><Typography variant="caption" color="text.secondary">Local audio</Typography></Stack>} /></GlassPanel>
              </Box>

              <GlassPanel sx={{ p: 1.75, borderRadius: 3.6 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}><MusicNoteRoundedIcon color="secondary" /><Typography fontWeight={950}>Music controls</Typography></Stack>
                <TextField select size="small" label="Track" value={selectedTrack.startsWith('blob:') ? 'custom' : selectedTrack} onChange={(e) => { setSelectedTrack(e.target.value); audioRef.current.pause(); audioRef.current.src = ''; setMusicPlaying(false); }} fullWidth sx={{ mb: 1.2 }}>
                  <MenuItem value="/sample/midnight">Midnight Pulse</MenuItem>
                  <MenuItem value="/sample/focus">Focus Drift</MenuItem>
                  <MenuItem value="custom" disabled>Custom upload loaded</MenuItem>
                </TextField>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" onClick={toggleMusic} startIcon={musicPlaying ? <PauseRoundedIcon /> : <VolumeUpRoundedIcon />}>{musicPlaying ? 'Pause' : 'Play'}</Button>
                  <Button variant="outlined" component="label">Upload<input hidden type="file" accept="audio/*" onChange={uploadMusic} /></Button>
                </Stack>
              </GlassPanel>

              <FormChecklist cues={cues} mistakes={mistakes} />
              <TextField label="Session notes" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What felt strong? What needs work?" />
              <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={resetSession}>Reset session</Button>
            </Stack>
          </CardContent>
        </PremiumCard>
      </Box>

      <GlassPanel sx={{ position: 'absolute', zIndex: 10, left: 0, right: 0, bottom: 0, p: { xs: 1, sm: 1.15 }, borderRadius: 999, background: 'rgba(7,7,5,0.86)' }}>
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button variant={running ? 'outlined' : 'contained'} onClick={primaryAction} startIcon={running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}>{running ? 'Pause' : 'Start'}</Button>
            <Button variant="outlined" onClick={manualRep}>+ Rep</Button>
            <Button variant="outlined" onClick={() => setReps((value) => Math.max(0, value - 1))}>− Rep</Button>
            <Chip label={`${motionScore} motion`} sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Tooltip title="Save this workout to history"><Button variant="contained" color="success" onClick={saveSession} startIcon={<SaveRoundedIcon />}>Save Session</Button></Tooltip>
            <Button variant="outlined" onClick={toggleCamera} startIcon={cameraActive ? <StopRoundedIcon /> : <CameraAltRoundedIcon />}>{cameraActive ? 'Stop Camera' : 'Start Camera'}</Button>
          </Stack>
        </Stack>
      </GlassPanel>

      <Dialog open={!!completion} onClose={() => setCompletion(null)} fullWidth maxWidth="xs">
        <DialogTitle>Workout saved 🎉</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Typography color="text.secondary">Nice work. Your session has been added to History.</Typography>
            <GlassPanel sx={{ p: 2, borderRadius: 4 }}>
              <Stack direction="row" justifyContent="space-between"><Typography>Reps</Typography><Typography fontWeight={950}>{completion?.reps}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography>Duration</Typography><Typography fontWeight={950}>{formatTime(completion?.seconds || 0)}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography>Calories</Typography><Typography fontWeight={950}>{completion?.calories}</Typography></Stack>
            </GlassPanel>
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setCompletion(null)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
