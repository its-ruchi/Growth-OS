/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Calendar, 
  PenTool, 
  ShieldCheck, 
  Zap,
  Package, 
  Users, 
  UserCheck, 
  MessageSquare, 
  BarChart3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  Send,
  ExternalLink,
  Copy,
  Quote,
  RefreshCw,
  FileText,
  Sparkles,
  User,
  Briefcase,
  Target,
  Type,
  Volume2,
  Share2,
  Ruler,
  Brain,
  Bell,
  Mail,
  AlertTriangle,
  CreditCard,
  ArrowUpCircle,
  ShieldAlert,
  Settings,
  Linkedin,
  ImagePlus,
  LogOut,
  Eye,
  EyeOff,
  X,
  Lightbulb,
  TrendingUp,
  BookOpen,
  Flame,
  MoreHorizontal,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { groqService } from './services/groqService';
import * as authService from './services/authService';
import { AgentId, AgentResponse, Workspace } from './types';

const DEFAULT_SETTINGS: NonNullable<Workspace['settings']> = {
  profile: { fullName: '', role: '', bio: '', targetAudience: [] },
  content: {
    frequency: 'Weekly',
    style: ['Storytelling'],
    tone: 'Professional',
    platforms: ['LinkedIn'],
  },
  ai: { autoGenerate: false, draftLength: 'Medium', creativity: 70 },
  notifications: { emailAlerts: true, weeklyReminder: true, leadAlerts: false },
  billing: { plan: 'Free', usage: { postsGenerated: 0, strategyRuns: 0 } },
};

const createDefaultOnboardingData = () => ({
  user: {
    fullName: '',
    role: '',
    coreOffer: '',
  },
  // 4-step intake after "Define Your Voice" (one question at a time)
  intake: {
    who_are_you: '',
    target_audience: '',
    primary_goal: '',
    content_style: '',
    raw_material: '',
  },
  // Optional writing samples (step 5)
  writing_samples: ['', '', ''],
  // LinkedIn profile URL (step 6)
  linkedin_profile: '',
  constraints: {
    taboo_phrases: ['game-changer', 'crush it', 'level up', 'excited to share'],
  },
});

const getSafeWorkspace = (): Workspace => {
  try {
    const saved = localStorage.getItem('growth-os-workspace');
    if (!saved) {
      return {
        settings: DEFAULT_SETTINGS,
        isLinkedinConnected: false,
      };
    }

    const parsed = JSON.parse(saved) as Workspace;
    return {
      ...parsed,
      settings: parsed.settings || DEFAULT_SETTINGS,
      isLinkedinConnected: parsed.isLinkedinConnected ?? false,
    };
  } catch {
    return {
      settings: DEFAULT_SETTINGS,
      isLinkedinConnected: false,
    };
  }
};

// --- Components ---

// --- Components ---

const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <motion.div 
    whileHover={onClick ? { y: -2 } : undefined}
    whileTap={onClick ? { scale: 0.99 } : undefined}
    onClick={onClick}
    className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${className} ${onClick ? 'cursor-pointer hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5' : ''}`}
  >
    {children}
  </motion.div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  className = "",
  fullWidth = false,
  type = "button",
  size = "md",
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
  type?: "button" | "submit";
  size?: "sm" | "md" | "lg";
  icon?: React.ElementType;
  key?: React.Key;
}) => {
  const baseStyles = `relative overflow-hidden font-sans font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''}`;
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-4 text-base rounded-2xl"
  };

  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/20 active:scale-[0.98]",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className} group`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
        <>
          {Icon && <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} transition-transform group-hover:scale-110`} />}
          {children}
        </>
      )}
    </button>
  );
};

const Badge = ({ children, variant = 'neutral', className = "" }: { children: React.ReactNode; variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info'; className?: string }) => {
  const variants = {
    neutral: "bg-slate-100 text-slate-600 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    error: "bg-red-50 text-red-700 border border-red-100",
    info: "bg-blue-50 text-blue-700 border border-blue-100"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const FloatingInput = ({ label, helperText, ...props }: { label: string; helperText?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;

  return (
    <div className="space-y-1.5">
      <div className="relative group">
        <input
          {...props}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-4 pt-6 pb-2 text-slate-900 outline-none transition-all duration-300 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder-transparent ${props.className || ""}`}
        />
        <label
          className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold tracking-tight ${
            focused || hasValue 
              ? "top-2 text-[10px] text-accent uppercase tracking-widest" 
              : "top-4 text-sm text-slate-400"
          }`}
        >
          {label}
        </label>
      </div>
      {helperText && <p className="text-[10px] text-slate-400 px-1 font-medium italic">{helperText}</p>}
    </div>
  );
};

const FloatingTextarea = ({ label, helperText, ...props }: { label: string; helperText?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleContainerClick = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-1.5">
      <div 
        onClick={handleContainerClick}
        className={`relative group w-full border rounded-2xl overflow-hidden transition-all duration-300 cursor-text ${
          focused 
            ? 'bg-white border-accent ring-4 ring-accent/5' 
            : 'bg-slate-50/50 border-slate-200'
        }`}
      >
        <label
          className={`absolute left-4 transition-all duration-300 pointer-events-none font-semibold tracking-tight z-10 ${
            focused || hasValue 
              ? "top-2 text-[10px] text-accent uppercase tracking-widest" 
              : "top-4 text-sm text-slate-400"
          }`}
        >
          {label}
        </label>
        <div className="pt-7 px-4 pb-2 h-full flex flex-col">
          <textarea
            {...props}
            ref={textareaRef}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            className={`w-full bg-transparent text-slate-900 outline-none placeholder-transparent resize-none ${props.className || "min-h-[100px]"}`}
          />
        </div>
      </div>
      {helperText && <p className="text-[10px] text-slate-400 px-1 font-medium italic">{helperText}</p>}
    </div>
  );
};

// --- Settings Components ---

const SettingsSection = ({ title, description, icon: Icon, children }: { title: string; description: string; icon: any; children: React.ReactNode }) => (
  <Card className="p-0 border-slate-100 overflow-hidden">
    <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/30">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6 md:p-8 space-y-8">
      {children}
    </div>
  </Card>
);

const Toggle = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: (val: boolean) => void; label: string; description?: string }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="space-y-0.5">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      {description && <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${enabled ? 'bg-accent' : 'bg-slate-200'}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

const SegmentedControl = ({ options, value, onChange, label }: { options: string[]; value: string; onChange: (val: any) => void; label?: string }) => (
  <div className="space-y-3">
    {label && <p className="text-sm font-bold text-slate-900">{label}</p>}
    <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${value === opt ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const Slider = ({ value, onChange, min = 0, max = 100, step = 1, label }: { value: number; onChange: (val: number) => void; min?: number; max?: number; step?: number; label?: string }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <span className="text-xs font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-md">{value}%</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-accent"
    />
  </div>
);

type QuickDraftPhoto = {
  name: string;
  type: string;
  size: number;
};

const QuickDraft = ({
  onGenerate,
}: {
  onGenerate: (topic: string, voice?: string, photo?: QuickDraftPhoto | null) => void;
}) => {
  const [topic, setTopic] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const voices = ["Storyteller", "Opinionated", "Framework", "Fact-Based", "Personal Brand"];

  return (
    <Card className="p-0 border-slate-100 shadow-sm relative overflow-hidden bg-white">
      <div className="p-6 md:p-7 flex flex-col space-y-5">
        <div>
          <h3 className="font-display font-bold text-slate-900 text-lg tracking-tight">
            What happened today?
          </h3>
          <p className="text-slate-400 text-sm mt-0.5">Share a lesson, insight, achievement, story, framework, or opinion...</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              placeholder="Start writing here..."
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 3000))}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-slate-300 font-medium min-h-[180px] resize-none"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-300 font-semibold">{topic.length} / 3000</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Choose your voice
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {voices.map(voice => (
                  <button
                    key={voice}
                    onClick={() => setSelectedVoice(voice === selectedVoice ? null : voice)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                      selectedVoice === voice
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-accent/30 hover:bg-accent/5'
                    }`}
                  >
                    {voice}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onGenerate(topic, selectedVoice || undefined, null)}
              disabled={!topic.trim()}
              className="inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-accent/20 active:scale-[0.98] shrink-0 self-end sm:self-auto"
            >
              Write the post
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Auth Modal ---

const AuthModal = ({
  isOpen,
  onClose,
  onAuthSuccess,
  canClose = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
  canClose?: boolean;
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(false);
    setAuthSuccess(false);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    setAuthLoading(true);

    try {
      const result = mode === 'login'
        ? await authService.login(email, password)
        : await authService.signUp(email, password);

      if (result.ok && result.email) {
        setAuthSuccess(true);
        setTimeout(() => {
          onAuthSuccess(result.email!);
          resetForm();
        }, 800);
      } else if (result.info) {
        setAuthInfo(result.info);
      } else {
        setAuthError(result.error || 'Something went wrong.');
      }
    } catch {
      setAuthError('An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 auth-backdrop"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && canClose) {
          onClose();
          resetForm();
        }
      }}
    >
      <div className="auth-modal w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="relative p-8 pb-2">
          {canClose && (
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                {mode === 'login' ? 'Log in to access your dashboard' : 'Sign up to get started'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-5">
          <AnimatePresence mode="wait">
            {authSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center gap-4"
              >
                <div className="auth-success-ring w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-display font-bold text-lg text-slate-900">
                    {mode === 'login' ? 'Logged in!' : 'Account created!'}
                  </p>
                  <p className="text-sm text-slate-400 font-medium">Redirecting to your dashboard...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block pl-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      autoFocus
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block pl-1">Password</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                      required
                      minLength={mode === 'signup' ? 6 : 1}
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl"
                  >
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-600 font-semibold">{authInfo}</p>
                  </motion.div>
                )}

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600 font-semibold">{authError}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-accent/25 active:scale-[0.98]"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Log In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer toggle */}
        {!authSuccess && (
          <div className="px-8 pb-8 pt-0">
            <div className="text-center">
              <span className="text-xs text-slate-400 font-medium">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setAuthError(null);
                }}
                className="text-xs text-accent font-bold hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<'auth' | 'onboarding' | 'dashboard' | 'agent-run'>(
    'auth'
  );
  const [workspace, setWorkspace] = useState<Workspace>(() => getSafeWorkspace());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<AgentId | null>(null);
  const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);
  const [lastAgentPayload, setLastAgentPayload] = useState<any>(null);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [draftHistory, setDraftHistory] = useState<AgentResponse[]>([]);
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [editedPostBody, setEditedPostBody] = useState('');

  const AGENT_LOADING_STEPS: Record<AgentId, string[]> = {
    onboarding: [
      "Analyzing writing samples...",
      "Extracting voice signature...",
      "Profiling target ICP...",
      "Positioning core offer...",
      "Finalizing Growth Engine..."
    ],
    weekly_strategy: [
      "Reviewing ICP pain points...",
      "Mapping content angles...",
      "Sequencing post types...",
      "Optimizing for conversion...",
      "Generating weekly plan..."
    ],
    post_drafter: [
      "Applying voice card...",
      "Drafting scroll-stopping hooks...",
      "Injecting concrete specifics...",
      "Optimizing CTA clarity...",
      "Finalizing LinkedIn draft..."
    ],
    post_refiner: [
      "Analyzing current draft...",
      "Removing AI filler patterns...",
      "Humanizing sentence rhythm...",
      "Sharpening the hook...",
      "Polishing for LinkedIn..."
    ],
    publish_pack: [
      "Preparing API request...",
      "Formatting for LinkedIn...",
      "Generating manual steps...",
      "Finalizing publish pack..."
    ],
    engagement_queue: [
      "Scanning target accounts...",
      "Analyzing post context...",
      "Drafting substantive comments...",
      "Prioritizing engagement queue..."
    ],
    lead_creator: [
      "Processing engagement events...",
      "Scoring ICP alignment...",
      "Deduplicating lead records...",
      "Updating conversion stages..."
    ],
    dm_assistant: [
      "Analyzing lead context...",
      "Selecting sequence playbook...",
      "Drafting personalized messages...",
      "Setting stop conditions..."
    ],
    reporting: [
      "Aggregating weekly metrics...",
      "Identifying winning patterns...",
      "Analyzing experiment results...",
      "Drafting next-week actions..."
    ]
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex(prev => (prev + 1) % 5);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Sync editable draft whenever a new agent result arrives
  useEffect(() => {
    if (agentResult?.data?.post?.body) {
      setEditedPostBody(agentResult.data.post.body);
    }
  }, [agentResult]);
  const [linkedinFlowStatus, setLinkedinFlowStatus] = useState<'idle' | 'connecting' | 'preparing' | 'success' | 'error'>('idle');
  const [linkedinFlowError, setLinkedinFlowError] = useState<string | null>(null);

  // Onboarding Form State
  const [onboardingData, setOnboardingData] = useState(createDefaultOnboardingData);

  const [onboardingStep, setOnboardingStep] = useState(1);

  const [activeTab, setActiveTab] = useState<'strategy' | 'history' | 'settings'>('strategy');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const rawDisplayName = workspace.settings?.profile?.fullName || 'Growth Leader';
  const displayName = rawDisplayName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const displayRole =
    workspace.settings?.profile?.role || 'Founder';

  const normalizeSettings = (s?: Workspace['settings']): NonNullable<Workspace['settings']> => ({
    ...DEFAULT_SETTINGS,
    ...s,
    profile: { ...DEFAULT_SETTINGS.profile, ...(s?.profile || {}) },
    content: { ...DEFAULT_SETTINGS.content, ...(s?.content || {}) },
    ai: { ...DEFAULT_SETTINGS.ai, ...(s?.ai || {}) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(s?.notifications || {}) },
    billing: {
      ...DEFAULT_SETTINGS.billing,
      ...(s?.billing || {}),
      usage: {
        ...DEFAULT_SETTINGS.billing.usage,
        ...(s?.billing?.usage || {}),
      },
    },
  });

  const [draftSettings, setDraftSettings] = useState<NonNullable<Workspace['settings']>>(() =>
    normalizeSettings(getSafeWorkspace().settings),
  );
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsSaveStatus, setSettingsSaveStatus] = useState<'idle' | 'saved'>('idle');

  // On mount: check for existing session and restore workspace
  // A user has "completed onboarding" if we have their AI-generated profile data
  // OR they've at minimum filled in their name from the Define Your Voice step.
  const hasCompletedOnboarding = (ws: any): boolean => !!(
    ws?.voice_card ||
    ws?.icp_profile ||
    ws?.settings?.profile?.fullName
  );

  useEffect(() => {
    (async () => {
      const session = await authService.getCurrentUser();

      if (session?.email) {
        setCurrentUser(session.email);

        // First try Supabase workspace.
        const savedWorkspace = await authService.loadUserWorkspace();
        if (savedWorkspace && hasCompletedOnboarding(savedWorkspace)) {
          setWorkspace({
            ...savedWorkspace,
            settings: savedWorkspace.settings || DEFAULT_SETTINGS,
            isLinkedinConnected: savedWorkspace.isLinkedinConnected ?? false,
          });
          setStep('dashboard');
          return;
        }

        // Fall back to the global workspace (completed before logging in) and migrate it.
        const globalWorkspace = getSafeWorkspace();
        if (hasCompletedOnboarding(globalWorkspace)) {
          setWorkspace({
            ...globalWorkspace,
            settings: globalWorkspace.settings || DEFAULT_SETTINGS,
            isLinkedinConnected: globalWorkspace.isLinkedinConnected ?? false,
          });
          void authService.saveUserWorkspace(globalWorkspace);
          setStep('dashboard');
          return;
        }

        setStep('onboarding');
        return;
      }

      setCurrentUser(null);
      setWorkspace({ settings: DEFAULT_SETTINGS, isLinkedinConnected: false });
      setStep('auth');
      setShowAuthModal(true);
    })();
  }, []);

  useEffect(() => {
    // Persist workspace changes — save to both global and per-user storage.
    try {
      localStorage.setItem('growth-os-workspace', JSON.stringify(workspace));
      // Also save to per-user storage if logged in
      if (currentUser) {
        void authService.saveUserWorkspace(workspace);
      }
    } catch (storageError) {
      console.warn('Failed to persist workspace', storageError);
    }
  }, [workspace, currentUser]);

  useEffect(() => {
    // When entering Settings (or after a reset), sync the draft form with saved settings.
    if (activeTab !== 'settings') return;
    const base = normalizeSettings(workspace.settings);
    if (!base.profile.bio) {
      base.profile.bio =
        (workspace as any).offer_positioning?.one_liner ||
        (workspace as any).icp_profile?.primary_pain ||
        '';
    }
    setDraftSettings(base);
    setSettingsDirty(false);
  }, [activeTab, workspace.settings, (workspace as any).offer_positioning]);

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Steps 1–5: advance to the next step
    // Step 1: Define Your Voice
    // Step 2: Target audience
    // Step 3: Primary goal
    // Step 4: Communication style
    // Step 5: Writing samples (optional)
    // Step 6: LinkedIn profile URL → triggers AI run
    if (onboardingStep >= 1 && onboardingStep <= 5) {
      // Carry fullName, role, coreOffer from step 1 into intake.who_are_you
      if (onboardingStep === 1) {
        setOnboardingData((prev: any) => ({
          ...prev,
          intake: {
            ...prev.intake,
            who_are_you: `${prev.user.coreOffer}`.trim(),
          },
        }));
      }
      setOnboardingStep(onboardingStep + 1);
      return;
    }
    
    // Step 6 = LinkedIn profile — trigger AI run
    setLoading(true);
    setError(null);

    try {
      const cleanedSamples = (onboardingData.writing_samples || [])
        .map((s: string) => (s || '').trim())
        .filter((s: string) => s && s.toLowerCase() !== 'skip');

      const onboardingPayload = {
        ...onboardingData,
        intake: {
          ...onboardingData.intake,
          who_are_you: onboardingData.user.coreOffer
            ? `I'm ${onboardingData.user.fullName}, ${onboardingData.user.role}. ${onboardingData.user.coreOffer}`.trim()
            : onboardingData.intake.who_are_you,
        },
        writing_samples: cleanedSamples,
      };

      const response = await groqService.runAgent<any>('onboarding', onboardingPayload);
      if (response.ok) {
        const nextSettings = {
          ...DEFAULT_SETTINGS,
          profile: {
            ...DEFAULT_SETTINGS.profile,
            fullName: onboardingData.user.fullName || '',
            role: onboardingData.user.role || '',
            bio: (response.data as any)?.offer_positioning?.one_liner || onboardingData.user.coreOffer || '',
          },
          billing: {
            ...DEFAULT_SETTINGS.billing,
            usage: {
              ...DEFAULT_SETTINGS.billing.usage,
              strategyRuns: 1,
            },
          },
        };
        const newWorkspace = {
          ...workspace,
          ...(response.data as any),
          writing_samples: cleanedSamples,
          settings: nextSettings,
        };
        setWorkspace(newWorkspace);
        // Save to per-user storage on onboarding complete
        if (currentUser) {
          void authService.saveUserWorkspace(newWorkspace);
        }
        setStep('dashboard');
      } else {
        setError(response.error?.message || "Onboarding failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePostOnLinkedin = async (postBody: string) => {
    setLinkedinFlowError(null);

    // Open a window early to reduce popup-blocker issues.
    // We cannot auto-fill LinkedIn's textbox from our site (cross-origin browser security),
    // so we copy the post and the user pastes it into the composer.
    const linkedinWindow = window.open('about:blank', '_blank');
    
    if (!workspace.isLinkedinConnected) {
      setLinkedinFlowStatus('connecting');
      try {
        // Simulate LinkedIn Auth Flow
        await new Promise(resolve => setTimeout(resolve, 2000));
        setWorkspace(prev => ({ ...prev, isLinkedinConnected: true }));
        setLinkedinFlowStatus('idle');
        // After connecting, we don't auto-post, we let user click again or we can proceed.
        // The prompt says "after successful connection, continue to posting handoff flow"
      } catch (err) {
        setLinkedinFlowStatus('error');
        setLinkedinFlowError("Failed to connect LinkedIn account.");
        return;
      }
    }

    setLinkedinFlowStatus('preparing');
    try {
      // Simulate preparation (e.g. generating shortlinks, preparing media)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Copy to clipboard
      await navigator.clipboard.writeText(postBody);
      
      setLinkedinFlowStatus('success');
      
      // Open LinkedIn share intent with pre-filled post text so user can review before publishing.
      const encodedText = encodeURIComponent(postBody);
      const targetUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
      if (linkedinWindow && !linkedinWindow.closed) {
        linkedinWindow.location.href = targetUrl;
      } else {
        window.open(targetUrl, '_blank');
      }
      
      // Reset status after a delay
      setTimeout(() => setLinkedinFlowStatus('idle'), 5000);
    } catch (err) {
      setLinkedinFlowStatus('error');
      const message = err instanceof Error ? err.message : "Failed to prepare LinkedIn post.";
      setLinkedinFlowError(message);
    }
  };

  const runAgent = async (agentId: AgentId, payload: any, isRegenerating = false) => {
    if (agentId === 'weekly_strategy' && (!workspace.voice_card || !workspace.icp_profile)) {
      setError('Complete onboarding first so strategy can use your voice and ICP profile.');
      return;
    }

    setLoading(true);
    setError(null);
    
    // If regenerating a post draft, switch to post_refiner for better results
    const actualAgentId = (isRegenerating && agentId === 'post_drafter') ? 'post_refiner' : agentId;
    
    setCurrentAgent(actualAgentId);
    setLastAgentPayload(payload);
    
    if (!isRegenerating) {
      setStep('agent-run');
      setAgentResult(null);
      setDraftHistory([]);
      setCurrentDraftIndex(0);
    }

    try {
      // Add context for refinement if regenerating
      const finalPayload = isRegenerating
        ? {
            ...payload,
            regeneration_mode: true,
            current_draft: agentResult?.data?.post?.body,
            original_context: payload, // preserve original strategy context
          }
        : payload;

      const dayForDraft = String((finalPayload as any)?.day || '');

      const response = await groqService.runAgent<any>(actualAgentId, finalPayload);
      
      if (response.ok) {
        // Transform Storyteller prompt format to standard format if needed
        if ((actualAgentId === 'post_drafter' || actualAgentId === 'post_refiner') && response.data && !response.data.post && response.data.body) {
          const raw: any = response.data;

          const canon = (s: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
          const hookText = canon(String(raw.hook || ''));
          const bodyText = canon(String(raw.body || ''));
          const includeHook = !!hookText && !!bodyText && !bodyText.startsWith(hookText);

          // Key line varies by voice: Storyteller→realization_line, Opinionator→reframe_line,
          // Fact Presenter→implication_line, Frameworker→power_ending, F-Bomber→truth_bomb_line
          const keyLine = raw.realization_line || raw.reframe_line || raw.implication_line || raw.power_ending || raw.truth_bomb_line;

          const combinedBody = [
            includeHook ? raw.hook : null,
            raw.body,
            keyLine,
            raw.landing_line,  // F-Bomber only — human ending after truth bomb
            raw.cta,
          ]
            .filter(Boolean)
            .join('\n\n');

          response.data = {
            ...raw,
            post: {
              body: combinedBody,
              word_count: raw.word_count || combinedBody.trim().split(/\s+/).length,
              specifics_used: []
            }
          };
        }

        setAgentResult(response);
        setDraftHistory(prev => [...prev, response]);
        setCurrentDraftIndex(prev => isRegenerating ? prev + 1 : 0);

          const data = response.data as any;
          // Update workspace based on agent output
          setWorkspace(prev => {
            const mergedSettings = {
              ...DEFAULT_SETTINGS,
              ...prev.settings,
              billing: {
                ...DEFAULT_SETTINGS.billing,
                ...prev.settings?.billing,
                usage: {
                  ...DEFAULT_SETTINGS.billing.usage,
                  ...prev.settings?.billing?.usage,
                },
              },
            };

            if (actualAgentId === 'weekly_strategy') {
              return {
                ...prev,
                week_plan: data.week_plan,
                week_posts: data.posts || prev.week_posts,
                settings: {
                  ...mergedSettings,
                  billing: {
                    ...mergedSettings.billing,
                    usage: {
                      ...mergedSettings.billing.usage,
                      strategyRuns: mergedSettings.billing.usage.strategyRuns + 1,
                    },
                  },
                },
              };
            }

            if (actualAgentId === 'post_drafter' || actualAgentId === 'post_refiner') {
              const nextWeekPosts = dayForDraft
                ? [
                    ...(prev.week_posts || []).filter((p: any) => String(p?.day || '') !== dayForDraft),
                    { day: dayForDraft, post: data?.post ? data.post : { body: data?.post?.body || '' } },
                  ]
                : prev.week_posts;

              return {
                ...prev,
                current_post_draft: data,
                week_posts: nextWeekPosts,
                // Append to persistent history
                post_history: [
                  {
                    id: `draft-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    topic: (finalPayload as any)?.post_brief?.topic || '',
                    voice: (finalPayload as any)?.post_brief?.voice || '',
                    body: data?.post?.body || '',
                    hook: data?.post?.hook || '',
                    wordCount: data?.post?.word_count || 0,
                  },
                  ...(prev.post_history || []),
                ].slice(0, 50), // cap at 50 entries
                settings: {
                  ...mergedSettings,
                  billing: {
                    ...mergedSettings.billing,
                    usage: {
                      ...mergedSettings.billing.usage,
                      postsGenerated: mergedSettings.billing.usage.postsGenerated + 1,
                    },
                  },
                },
              };
            }

            if (actualAgentId === 'lead_creator') {
              return {
                ...prev,
                leads: [...(prev.leads || []), ...(data.leads || [])],
              };
            }

            if (actualAgentId === 'engagement_queue') {
              return {
                ...prev,
                engagement_queue: data.queue || [],
              };
            }

            if (actualAgentId === 'reporting') {
              return {
                ...prev,
                reports: [...(prev.reports || []), data],
              };
            }

            return prev;
          });
        } else {
          setError(response.error?.message || "Agent run failed");
        }
    } catch (err) {
      setError("Failed to run agent");
    } finally {
      setLoading(false);
    }
  };

  const viewWeeklyDraft = (post: any) => {
    const day = String(post?.day || '');
    const draftEntry = workspace.week_posts?.find((p: any) => String(p?.day || '') === day);
    const body = draftEntry?.post?.body || '';

    // Preserve the payload so "Regenerate" (post_refiner) still works from the view screen.
    const payload = {
      day,
      writing_samples: (workspace.writing_samples || onboardingData.writing_samples || []).filter(Boolean),
      profile: {
        name: workspace.settings?.profile?.fullName || '',
        role: workspace.settings?.profile?.role || '',
      },
      offer_positioning: workspace.offer_positioning,
      icp_profile: workspace.icp_profile,
      voice_card: workspace.voice_card,
      post_brief: {
        topic: post.topic,
        voice: undefined,
        pov: post.hook_direction,
        cta: { type: post.cta_type, link_base: 'https://growth.os' },
      },
    };

    // If this day hasn't been generated yet, "View" should generate once, then show the result.
    if (!body) {
      runAgent('post_drafter', payload);
      return;
    }

    const response: AgentResponse = {
      ok: true,
      agent: 'post_drafter',
      version: 'v0.1',
      telemetry: [],
      data: {
        hooks: [],
        post: {
          body,
          word_count: typeof draftEntry?.post?.word_count === 'number' ? draftEntry.post.word_count : body ? body.trim().split(/\s+/).length : 0,
          specifics_used: Array.isArray(draftEntry?.post?.specifics_used) ? draftEntry.post.specifics_used : [],
        },
        first_comment: '',
        hashtags: [],
        cta_tracking: {
          type: post.cta_type || 'no-CTA',
          full_url: '',
          shortlink_slug: '',
          reply_trigger: null,
        },
      },
      warnings: [],
      next_actions: [
        { type: 'HUMAN_APPROVAL', label: 'Review the draft and decide if you like it', payload: { day } },
      ],
    };

    setError(null);
    setLoading(false);
    setCurrentAgent('post_drafter');
    setLastAgentPayload(payload);
    setAgentResult(response);
    setDraftHistory([response]);
    setCurrentDraftIndex(0);
    setStep('agent-run');
  };

  const handleQuickDraft = (topic: string, voice?: string, photo?: { name: string; type: string; size: number } | null) => {
    const payload = {
      writing_samples: (workspace.writing_samples || onboardingData.writing_samples || []).filter(Boolean),
      profile: {
        name: workspace.settings?.profile?.fullName || '',
        role: workspace.settings?.profile?.role || '',
      },
      offer_positioning: workspace.offer_positioning,
      icp_profile: workspace.icp_profile,
      voice_card: workspace.voice_card,
      post_brief: {
        topic: topic,
        voice: voice || undefined,
        pov: voice || "Strong, personal perspective",
        has_photo: !!photo,
        photo: photo || null,
        cta: { type: "reply", link_base: 'https://growth.os' },
      },
    };
    runAgent('post_drafter', payload);
  };

  const resetWorkspace = () => {
    const emptyWorkspace = {
      settings: DEFAULT_SETTINGS,
      isLinkedinConnected: false,
    };
    setWorkspace(emptyWorkspace);
    if (currentUser) {
      void authService.saveUserWorkspace(emptyWorkspace);
    }
    setStep('onboarding');
    setOnboardingStep(1);
    setOnboardingData(createDefaultOnboardingData());
    setAgentResult(null);
    setCurrentAgent(null);
    setActiveTab('strategy');
    localStorage.removeItem('growth-os-workspace');
  };

  const handleAuthSuccess = async (email: string) => {
    setCurrentUser(email);
    setShowAuthModal(false);

    // Load user's workspace if it exists and onboarding is done
    const savedWorkspace = await authService.loadUserWorkspace();
    if (savedWorkspace && hasCompletedOnboarding(savedWorkspace)) {
      setWorkspace({
        ...savedWorkspace,
        settings: savedWorkspace.settings || DEFAULT_SETTINGS,
        isLinkedinConnected: savedWorkspace.isLinkedinConnected ?? false,
      });
      setStep('dashboard');
    } else {
      // No complete per-user workspace — check global workspace (done before login)
      const globalWorkspace = getSafeWorkspace();
      if (hasCompletedOnboarding(globalWorkspace)) {
        // Migrate global workspace to this account
        setWorkspace({
          ...globalWorkspace,
          settings: globalWorkspace.settings || DEFAULT_SETTINGS,
          isLinkedinConnected: globalWorkspace.isLinkedinConnected ?? false,
        });
        void authService.saveUserWorkspace(globalWorkspace);
        setStep('dashboard');
      } else {
        // New or incomplete user — start onboarding (logged in)
        setWorkspace({ settings: DEFAULT_SETTINGS, isLinkedinConnected: false });
        setOnboardingStep(1);
        setOnboardingData(createDefaultOnboardingData());
        setStep('onboarding');
      }
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    // Clear the shared local workspace so the next user to log in on this
    // browser does not inherit the previous user's data via global migration.
    localStorage.removeItem('growth-os-workspace');
    setCurrentUser(null);
    setWorkspace({ settings: DEFAULT_SETTINGS, isLinkedinConnected: false });
    setStep('auth');
    setShowAuthModal(true);
    setOnboardingStep(1);
    setOnboardingData(createDefaultOnboardingData());
    setAgentResult(null);
    setCurrentAgent(null);
    setActiveTab('strategy');
  };

  const saveSettings = () => {
    setWorkspace(prev => ({
      ...prev,
      settings: normalizeSettings(draftSettings),
    }));
    setSettingsDirty(false);
    setSettingsSaveStatus('saved');
    window.setTimeout(() => setSettingsSaveStatus('idle'), 1500);
  };

  const renderAuth = () => {
    return (
      <div className="min-h-screen bg-bg relative overflow-x-hidden flex items-center justify-center px-6">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto w-14 h-14 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/25 mb-6">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-black text-slate-900 text-4xl sm:text-5xl tracking-tighter leading-[0.95]">
            Sign in to Growth OS
          </h1>
          <p className="mt-4 text-slate-500 text-base sm:text-lg font-medium">
            Create an account or log in to continue.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Button
              onClick={() => setShowAuthModal(true)}
              className="px-8"
              icon={ArrowRight}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderOnboarding = () => {
    // Step labels and descriptions
    const TOTAL_STEPS = 6;
    const stepMeta: Record<number, { title: string; label: string }> = {
      1: { title: 'Define Your Voice', label: `STEP 1 OF ${TOTAL_STEPS}` },
      2: { title: 'Your Audience', label: `STEP 2 OF ${TOTAL_STEPS}` },
      3: { title: 'Your #1 Goal', label: `STEP 3 OF ${TOTAL_STEPS}` },
      4: { title: 'Your Style', label: `STEP 4 OF ${TOTAL_STEPS}` },
      5: { title: 'Writing Samples', label: 'OPTIONAL' },
      6: { title: 'Your LinkedIn', label: `STEP 6 OF ${TOTAL_STEPS}` },
    };
    const meta = stepMeta[onboardingStep] || stepMeta[1];

    return (
      <div className="min-h-screen bg-bg relative overflow-x-hidden">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-black text-slate-900 text-2xl tracking-tighter hidden sm:block">Growth OS</span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-black">
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-700 hidden sm:block max-w-[150px] truncate">{currentUser}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <User className="w-4 h-4" />
                Log in
              </button>
            )}
          </div>
        </div>

        {/* Soft background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto relative z-10 px-6 sm:px-8 lg:px-10 py-12 pt-28 lg:min-h-screen lg:py-12 lg:pt-28 lg:flex lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] xl:grid-cols-[minmax(0,1fr)_480px] gap-10 lg:gap-16 items-center"
          >
            {/* ── Left: Hero copy ── */}
            <div className="min-w-0 text-center lg:text-left space-y-6 lg:-mt-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <h1 className="text-balance text-5xl sm:text-6xl md:text-7xl lg:text-[4rem] xl:text-[4.5rem] font-display font-extrabold text-slate-900 tracking-tighter leading-[1.0]">
                  Grow your
                  <span className="block">presence.</span>
                  <span className="block text-accent mt-1">
                    Turn attention
                  </span>
                  <span className="block text-accent">into leads.</span>
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-sm mx-auto lg:mx-0"
              >
                Plan smarter, write faster, and stay consistent every week.
              </motion.p>
            </div>

            {/* ── Right: Form card ── */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:justify-self-end lg:w-[440px] xl:w-[480px] min-h-0">
              <div className="absolute -inset-6 bg-accent/5 blur-3xl rounded-[3rem] -z-10" />

              <Card className="p-7 md:p-8 min-h-0 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.10)] border-slate-100/80 bg-white/97 backdrop-blur-md">
                {/* Card header: progress bar + step label */}
                <div className="flex items-center justify-between mb-6">
                  {/* Progress dots/bar */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i < onboardingStep
                            ? 'bg-accent w-6'
                            : i === onboardingStep - 1
                            ? 'bg-accent w-10'
                            : 'bg-slate-200 w-3'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.22em]">
                    {meta.label}
                  </span>
                </div>

                {/* Card title */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`title-${onboardingStep}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="mb-7"
                  >
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">
                      {meta.title}
                    </h2>
                    {onboardingStep === 1 && (
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                        Tell us about yourself to calibrate your AI agents for authentic content.
                      </p>
                    )}
                    {onboardingStep === 5 && (
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                        Paste even 1 post you've written and every draft will sound like you — same hooks, rhythm, and style. You can still skip, but this is the fastest way to make posts feel yours.
                      </p>
                    )}
                    {onboardingStep === 6 && (
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                        Connect your LinkedIn profile to personalize your dashboard experience.
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>

                <form onSubmit={handleOnboardingSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">

                    {/* ── STEP 1: Define Your Voice ── */}
                    {onboardingStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative group">
                            <input
                              type="text"
                              id="ob-full-name"
                              placeholder="Full Name"
                              value={onboardingData.user.fullName}
                              onChange={(e) => setOnboardingData((prev: any) => ({
                                ...prev,
                                user: { ...prev.user, fullName: e.target.value },
                              }))}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-slate-400 font-medium"
                            />
                          </div>
                          <div className="relative group">
                            <input
                              type="text"
                              id="ob-professional-role"
                              placeholder="Professional Role"
                              value={onboardingData.user.role}
                              onChange={(e) => setOnboardingData((prev: any) => ({
                                ...prev,
                                user: { ...prev.user, role: e.target.value },
                              }))}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-slate-400 font-medium"
                            />
                          </div>
                        </div>
                        <div>
                          <textarea
                            id="ob-core-offer"
                            placeholder="Your Core Offer"
                            rows={4}
                            value={onboardingData.user.coreOffer}
                            onChange={(e) => setOnboardingData((prev: any) => ({
                              ...prev,
                              user: { ...prev.user, coreOffer: e.target.value },
                            }))}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-slate-400 font-medium resize-none"
                          />
                          <p className="text-[11px] text-slate-400 mt-1.5 italic font-medium">
                            What is the #1 problem you solve?
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 2: Target audience ── */}
                    {onboardingStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                          Who exactly do you want to reach on LinkedIn?
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed -mt-1">
                          Job title, company size, industry — be specific.
                        </p>
                        <FloatingTextarea
                          label="Your answer"
                          value={onboardingData.intake.target_audience}
                          onChange={(e) => setOnboardingData((prev: any) => ({
                            ...prev,
                            intake: { ...prev.intake, target_audience: e.target.value },
                          }))}
                          required
                          className="min-h-[130px]"
                        />
                      </motion.div>
                    )}

                    {/* ── STEP 3: Primary goal ── */}
                    {onboardingStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                          What's the #1 outcome you want from LinkedIn right now?
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: 'Inbound leads and demos', icon: '🎯' },
                            { value: 'Investor attention', icon: '💰' },
                            { value: 'Hiring and talent', icon: '👥' },
                            { value: 'Partnership deals', icon: '🤝' },
                            { value: 'Thought leadership', icon: '💡' },
                            { value: 'Growing an audience', icon: '📈' },
                            { value: 'All of the above', icon: '✨' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setOnboardingData((prev: any) => ({
                                ...prev,
                                intake: { ...prev.intake, primary_goal: option.value },
                              }))}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group ${
                                onboardingData.intake.primary_goal === option.value
                                  ? 'border-accent bg-accent/5 shadow-sm'
                                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                              }`}
                            >
                              <span className="text-base flex-shrink-0">{option.icon}</span>
                              <span className={`text-sm font-semibold ${
                                onboardingData.intake.primary_goal === option.value ? 'text-accent' : 'text-slate-700'
                              }`}>
                                {option.value}
                              </span>
                              {onboardingData.intake.primary_goal === option.value && (
                                <CheckCircle2 className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 4: Communication style ── */}
                    {onboardingStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                          How do you naturally communicate?
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: 'Contrarian', desc: 'I challenge assumptions', icon: '⚡' },
                            { value: 'Storyteller', desc: 'I lead with personal moments', icon: '📖' },
                            { value: 'Educator', desc: 'I break things down simply', icon: '🎓' },
                            { value: 'Tactical', desc: 'I give step-by-step frameworks', icon: '🔧' },
                            { value: 'Transparent', desc: 'I share the unfiltered truth', icon: '🪟' },
                            { value: 'Analytical', desc: 'I lead with data and patterns', icon: '📊' },
                            { value: 'All of the above', desc: 'I use a mix of everything', icon: '✨' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setOnboardingData((prev: any) => ({
                                ...prev,
                                intake: { ...prev.intake, content_style: option.value },
                              }))}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group ${
                                onboardingData.intake.content_style === option.value
                                  ? 'border-accent bg-accent/5 shadow-sm'
                                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                              }`}
                            >
                              <span className="text-base flex-shrink-0">{option.icon}</span>
                              <div className="flex flex-col min-w-0">
                                <span className={`text-sm font-semibold ${
                                  onboardingData.intake.content_style === option.value ? 'text-accent' : 'text-slate-700'
                                }`}>
                                  {option.value}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{option.desc}</span>
                              </div>
                              {onboardingData.intake.content_style === option.value && (
                                <CheckCircle2 className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ── STEP 5: Writing Samples (optional) ── */}
                    {onboardingStep === 5 && (
                      <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {[0, 1, 2].map((idx) => (
                          <FloatingTextarea
                            key={idx}
                            label={idx === 0 ? 'Paste a post you wrote (recommended)' : `Writing sample ${idx + 1}`}
                            value={onboardingData.writing_samples[idx]}
                            onChange={(e) => {
                              const next = [...onboardingData.writing_samples];
                              next[idx] = e.target.value;
                              setOnboardingData((prev: any) => ({ ...prev, writing_samples: next }));
                            }}
                            className="min-h-[90px]"
                          />
                        ))}
                      </motion.div>
                    )}
                    {/* ── STEP 6: LinkedIn Profile URL ── */}
                    {onboardingStep === 6 && (
                      <motion.div
                        key="step6"
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <p className="text-[15px] font-semibold text-slate-800 leading-relaxed">
                          Share your LinkedIn profile so we can connect your dashboard.
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed -mt-1">
                          Paste the URL of your LinkedIn profile below.
                        </p>
                        <div className="relative group">
                          <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-accent transition-colors" />
                          <input
                            type="url"
                            id="ob-linkedin-profile"
                            placeholder="https://linkedin.com/in/yourname"
                            value={onboardingData.linkedin_profile}
                            onChange={(e) => setOnboardingData((prev: any) => ({
                              ...prev,
                              linkedin_profile: e.target.value,
                            }))}
                            className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:bg-white focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder:text-slate-300 font-medium"
                          />
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    {onboardingStep >= 2 && (
                      <button
                        type="button"
                        onClick={() => setOnboardingStep(onboardingStep - 1)}
                        className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        (onboardingStep === 3 && !onboardingData.intake.primary_goal) ||
                        (onboardingStep === 4 && !onboardingData.intake.content_style)
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-accent/20 active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          {onboardingStep < 6 ? 'Next Step' : 'Finish Setup'}
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Quick ideas
    const quickIdeas = [
      { icon: '💡', title: 'Share a lesson', desc: 'What did you learn recently?', topic: 'A lesson I learned recently about ' },
      { icon: '🔥', title: 'Share an opinion', desc: "What's your take on something?", topic: 'My take on ' },
      { icon: '📈', title: 'Share a result', desc: 'What impact did you create?', topic: 'A result I achieved recently: ' },
      { icon: '🧩', title: 'Share a framework', desc: 'Break down your process', topic: 'My framework for ' },
      { icon: '❤️', title: 'Share a story', desc: 'Tell a behind-the-scenes story', topic: 'A story about ' },
    ];

    // Recent drafts (last 3)
    const recentDrafts = (workspace.post_history || []).slice(0, 3);

    // Posting activity heatmap data (last 28 days)
    const today = new Date();
    const heatmapData = Array.from({ length: 28 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (27 - i));
      const dateStr = date.toDateString();
      const count = (workspace.post_history || []).filter(
        (p: any) => new Date(p.createdAt).toDateString() === dateStr
      ).length;
      return { date, count };
    });

    const getHeatColor = (count: number) => {
      if (count === 0) return 'bg-slate-100';
      if (count === 1) return 'bg-blue-200';
      if (count === 2) return 'bg-blue-400';
      return 'bg-blue-600';
    };

    const postsCreated = workspace.settings?.billing?.usage?.postsGenerated || 0;
    const draftsCount = workspace.post_history?.length || 0;

    return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Turn your thoughts into a LinkedIn post.
          </p>
        </div>
        <button 
          onClick={() => {
            const el = document.getElementById('inspiration-panel');
            if (el) el.classList.toggle('hidden');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all"
        >
          <Lightbulb className="w-4 h-4" />
          Need inspiration?
        </button>
      </header>

      {/* Inspiration Panel — toggled by Need Inspiration button */}
      <div id="inspiration-panel" className="hidden">
        <Card className="p-5 border-amber-100 bg-amber-50/30">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">Quick ideas to get you started</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { title: 'Share a lesson', desc: 'What did you learn recently?', topic: 'A lesson I learned recently about ' },
              { title: 'Share an opinion', desc: "What's your take on something?", topic: 'My take on ' },
              { title: 'Share a result', desc: 'What impact did you create?', topic: 'A result I achieved recently: ' },
              { title: 'Share a framework', desc: 'Break down your process', topic: 'My framework for ' },
              { title: 'Share a story', desc: 'Tell a behind-the-scenes story', topic: 'A story about ' },
            ].map((idea, i) => (
              <button
                key={i}
                onClick={() => {
                  const el = document.querySelector('textarea');
                  if (el) {
                    (el as HTMLTextAreaElement).value = idea.topic;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.focus();
                  }
                  document.getElementById('inspiration-panel')?.classList.add('hidden');
                }}
                className="group p-3 bg-white border border-amber-100 rounded-xl hover:border-accent/20 hover:shadow-sm transition-all text-left"
              >
                <p className="text-xs font-bold text-slate-900 group-hover:text-accent transition-colors">{idea.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{idea.desc}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(['strategy', 'history', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === tab 
                ? "bg-white text-slate-900 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === 'history' ? (
              <span className="flex items-center gap-1.5">
                Drafts
                {(workspace.post_history?.length ?? 0) > 0 && (
                  <span className="bg-accent text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    {workspace.post_history!.length}
                  </span>
                )}
              </span>
            ) : tab === 'strategy' ? 'Create Post' : tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'strategy' && (
          <motion.div
            key="strategy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Quick Draft — Full Width */}
            <QuickDraft onGenerate={handleQuickDraft} />

            {/* Bottom Grid: Recent Drafts + Analytics (Compact) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Drafts */}
              <Card className="p-0 border-slate-100 overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 text-sm">Recent Drafts</h3>
                </div>
                {recentDrafts.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <FileText className="w-6 h-6 text-slate-200 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-400 font-bold">No drafts yet</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Write your first post above!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {recentDrafts.map((draft: any, idx: number) => {
                      const createdAt = new Date(draft.createdAt);
                      const diffMs = Date.now() - createdAt.getTime();
                      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
                      const timeAgo = diffH < 1 ? 'Just now' : diffH < 24 ? `${diffH}h ago` : `${Math.floor(diffH / 24)}d ago`;
                      return (
                        <div key={draft.id || idx} className="flex items-start gap-2.5 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{draft.topic || draft.body?.split('\n')[0]?.substring(0, 50) || 'Untitled'}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{draft.body?.substring(0, 60)}...</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-300 font-medium">{timeAgo}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText((draft.hook ? draft.hook + '\n\n' : '') + draft.body);
                              }}
                              className="p-1 rounded-lg text-slate-300 hover:text-accent hover:bg-accent/5 transition-all"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {draftsCount > 3 && (
                  <div className="px-5 py-2 border-t border-slate-100">
                    <button 
                      onClick={() => setActiveTab('history')} 
                      className="text-xs font-bold text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1"
                    >
                      View all drafts <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </Card>

              {/* Analytics Overview */}
              <Card className="p-0 border-slate-100 overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 text-sm">Analytics Overview</h3>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Last 30 days</span>
                </div>
                <div className="px-5 py-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <div className="text-center p-2 rounded-lg bg-slate-50/70">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <PenTool className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Posts</span>
                      </div>
                      <p className="text-base font-display font-black text-slate-900">{draftsCount}</p>
                      {draftsCount > 0 && <p className="text-[8px] text-emerald-500 font-bold mt-0.5">↑ Active</p>}
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50/70">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Eye className="w-3 h-3 text-emerald-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Impressions</span>
                      </div>
                      <p className="text-base font-display font-black text-slate-900">—</p>
                      <p className="text-[8px] text-slate-300 font-bold mt-0.5">Coming Soon</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50/70">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Users className="w-3 h-3 text-violet-500" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Profile Views</span>
                      </div>
                      <p className="text-base font-display font-black text-slate-900">—</p>
                      <p className="text-[8px] text-slate-300 font-bold mt-0.5">Coming Soon</p>
                    </div>
                  </div>

                  {/* Posting Activity Heatmap */}
                  <div className="space-y-2.5 w-full max-w-[340px] mx-auto">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Posting Activity — Last 28 Days</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {heatmapData.map((d, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-[4px] ${getHeatColor(d.count)} transition-colors`}
                          title={`${d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${d.count} post${d.count !== 1 ? 's' : ''}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-[8px] text-slate-300 font-semibold">Less</span>
                      <div className="w-3 h-3 rounded-[3px] bg-slate-100" />
                      <div className="w-3 h-3 rounded-[3px] bg-blue-200" />
                      <div className="w-3 h-3 rounded-[3px] bg-blue-400" />
                      <div className="w-3 h-3 rounded-[3px] bg-blue-600" />
                      <span className="text-[8px] text-slate-300 font-semibold">More</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Settings</h2>
                <p className="text-slate-500 font-medium">Configure your growth engine and personal brand preferences.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={settingsDirty ? 'info' : 'success'} className="text-[8px] uppercase tracking-widest">
                  {settingsDirty ? 'Unsaved' : settingsSaveStatus === 'saved' ? 'Saved' : 'Up to date'}
                </Badge>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveSettings}
                  disabled={!settingsDirty}
                  className="px-5"
                >
                  {settingsSaveStatus === 'saved' ? 'Saved' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Profile / Identity */}
              <SettingsSection 
                title="Profile & Identity" 
                description="Define how you are represented inside the product and to your audience."
                icon={User}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput 
                    label="Full Name" 
                    value={draftSettings.profile?.fullName || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftSettings(prev => ({ ...prev, profile: { ...prev.profile, fullName: val } }));
                      setSettingsDirty(true);
                      setSettingsSaveStatus('idle');
                    }}
                  />
                  <FloatingInput 
                    label="Professional Role" 
                    value={draftSettings.profile?.role || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDraftSettings(prev => ({ ...prev, profile: { ...prev.profile, role: val } }));
                      setSettingsDirty(true);
                      setSettingsSaveStatus('idle');
                    }}
                  />
                </div>
                <FloatingTextarea 
                  label="Bio / Positioning" 
                  value={draftSettings.profile?.bio || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraftSettings(prev => ({ ...prev, profile: { ...prev.profile, bio: val } }));
                    setSettingsDirty(true);
                    setSettingsSaveStatus('idle');
                  }}
                />
              </SettingsSection>

              {/* Danger Zone */}
              <Card className="p-0 border-red-100 overflow-hidden bg-red-50/10">
                <div className="p-6 md:p-8 border-b border-red-100 bg-red-50/30">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-red-600 tracking-tight">Danger Zone</h3>
                      <p className="text-sm text-red-500/70 font-medium leading-relaxed">Irreversible and destructive actions for your workspace.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Reset Workspace</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
                      Permanently delete all workspace data, including leads, strategy plans, and draft history. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="danger" size="md" onClick={resetWorkspace} className="shrink-0">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset Workspace
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Draft History</h2>
                <p className="text-sm text-slate-500 font-medium">
                  All your generated posts — saved automatically, never lost.
                </p>
              </div>
              {(workspace.post_history?.length ?? 0) > 0 && (
                <span className="text-xs font-bold text-slate-400">
                  {workspace.post_history!.length} draft{workspace.post_history!.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {(!workspace.post_history || workspace.post_history.length === 0) ? (
              <Card className="p-16 text-center border-dashed border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <p className="font-bold text-slate-900 mb-1">No drafts yet</p>
                <p className="text-sm text-slate-400 font-medium">Generate your first post from the Strategy tab and it'll appear here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {workspace.post_history!.map((draft, idx) => (
                  <Card key={draft.id || idx} className="p-0 border-slate-100 overflow-hidden">
                    <details className="group">
                      <summary className="list-none cursor-pointer select-none">
                        <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-accent" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {draft.topic || draft.body?.split('\n')[0]?.substring(0, 60) || 'Untitled draft'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {new Date(draft.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {draft.voice && (
                                  <>
                                    <span className="text-slate-200">·</span>
                                    <span className="text-[11px] text-accent font-semibold">{draft.voice}</span>
                                  </>
                                )}
                                {draft.wordCount ? (
                                  <>
                                    <span className="text-slate-200">·</span>
                                    <span className="text-[11px] text-slate-400">{draft.wordCount}w</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(
                                  (draft.hook ? draft.hook + '\n\n' : '') + draft.body
                                );
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/5 transition-all"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setWorkspace(prev => ({
                                  ...prev,
                                  post_history: (prev.post_history || []).filter((_, i) => i !== idx),
                                }));
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-open:rotate-90 transition-transform" />
                          </div>
                        </div>
                      </summary>
                      <div className="px-6 pb-6 border-t border-slate-100">
                        {draft.hook && (
                          <p className="text-[15px] font-semibold text-slate-900 mt-5 mb-3 leading-snug">{draft.hook}</p>
                        )}
                        <div className="mt-4 text-[14px] leading-[1.7] text-slate-700 whitespace-pre-wrap font-normal">
                          {draft.body}
                        </div>
                      </div>
                    </details>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
    );
  };

  const PostBody = ({ body }: { body: string }) => {
    const paragraphs = body.split('\n');
    return (
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        lineHeight: '1.65',
        color: '#0f0f0f',
        padding: '0',
        margin: '0'
      }}>
        {paragraphs.map((line, i) => (
          line.trim() === ''
            ? <div key={i} style={{ height: '12px' }} />
            : <div key={i} style={{
                margin: '0',
                padding: '0',
                paddingLeft: '0',
                textIndent: '0',
                fontStyle: 'normal',
                fontWeight: 'normal'
              }}>
                {line}
              </div>
        ))}
      </div>
    );
  };

  const renderAgentRun = () => {
    const steps = currentAgent ? AGENT_LOADING_STEPS[currentAgent] : ["Processing data..."];
    const currentStep = steps[loadingStepIndex] || steps[0];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50">
        {!agentResult ? (
          <div className="text-center space-y-12 max-w-md w-full">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full animate-pulse" />
              <div className="relative w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-slate-100">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Zap className="w-10 h-10 text-accent" />
                </motion.div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                  {currentAgent === 'onboarding' ? "Calibrating Growth Engine" : "Agent in Action"}
                </h2>
                <div className="flex flex-col items-center gap-4">
                  <div className="h-6 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={currentStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="text-accent font-bold text-sm tracking-wide uppercase"
                      >
                        {currentStep}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  
                  <div className="w-full max-w-[240px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(loadingStepIndex + 1) * 20}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-left space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pro Tip</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {currentAgent === 'post_drafter' 
                    ? "The best LinkedIn hooks often start with a specific number or a counter-intuitive observation. Our agent is currently mapping your voice card to these patterns."
                    : currentAgent === 'weekly_strategy'
                    ? "A balanced strategy includes 20% contrarian views, 40% educational value, and 40% personal stories. We're balancing your week now."
                    : "High-signal content requires deep analysis of your ICP's primary pain points. We're cross-referencing your offer positioning with current market triggers."}
                </p>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl py-12">
            {!agentResult.ok ? (
              <Card className="p-12 text-center space-y-6 border-red-100 bg-red-50/30">
                <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto border border-red-200">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-slate-900">Analysis Failed</h2>
                  <p className="text-slate-500 font-medium max-w-md mx-auto">{agentResult.error?.message || "The agent encountered an unexpected error."}</p>
                </div>
                <Button onClick={() => setStep('dashboard')} variant="outline">Return to Dashboard</Button>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-10">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                      {currentAgent === 'weekly_strategy' ? "Your Weekly Content Plan" : "Post Draft"}
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep('dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>

                <Card className="p-10 border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="space-y-12">
                    {(currentAgent === 'post_drafter' || currentAgent === 'post_refiner') && (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          {draftHistory.length > 1 && (
                            <div className="flex items-center justify-end">
                              <div className="flex items-center gap-2">
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Versions</p>
                                <div className="flex gap-1">
                                  {draftHistory.map((_, i) => (
                                    <button
                                      key={i}
                                      onClick={() => {
                                        setCurrentDraftIndex(i);
                                        setAgentResult(draftHistory[i]);
                                      }}
                                      className={`w-5 h-5 rounded-md text-[9px] font-bold transition-all ${
                                        currentDraftIndex === i 
                                          ? 'bg-accent text-white shadow-sm shadow-accent/20' 
                                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                      }`}
                                    >
                                      {i + 1}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="rounded-3xl bg-slate-50 border border-slate-100 relative group" style={{ padding: '24px' }}>
                            {/* Copy button */}
                            <button
                              onClick={() => {
                                const fullText = (agentResult.data.post.hook ? agentResult.data.post.hook + '\n\n' : '') + editedPostBody;
                                navigator.clipboard.writeText(fullText);
                              }}
                              className="absolute top-4 right-4 p-2 bg-white border border-slate-200 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent z-10"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {agentResult.data.post.hook && (
                              <div style={{
                                fontSize: '17px',
                                fontWeight: '600',
                                color: '#0f0f0f',
                                lineHeight: '1.45',
                                marginBottom: '16px',
                                paddingBottom: '16px',
                                borderBottom: '1px solid #f0f0f0'
                              }}>
                                {agentResult.data.post.hook}
                              </div>
                            )}

                            {/* Editable post body */}
                            <textarea
                              ref={(el) => {
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = el.scrollHeight + 'px';
                                }
                              }}
                              value={editedPostBody}
                              onChange={(e) => {
                                setEditedPostBody(e.target.value);
                                // Auto-grow
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              className="w-full bg-transparent outline-none resize-none text-[15px] leading-[1.65] text-[#0f0f0f] font-normal placeholder:text-slate-300 transition-colors focus:bg-white/60 rounded-xl px-2 py-1 -mx-2 -my-1 hover:bg-white/40"
                              style={{ minHeight: '80px', overflow: 'hidden' }}
                              placeholder="Your post content will appear here..."
                              spellCheck
                            />

                          </div>
                          {currentAgent === 'post_refiner' && (() => {
                            const rd = agentResult.data as Record<string, unknown>;
                            const alts = rd.alternative_versions as
                              | { style?: string; body?: string; hook_options?: string[] }[]
                              | undefined;
                            const hasExtras =
                              Boolean(rd.diagnosis) ||
                              Boolean(rd.improvement_strategy) ||
                              (Array.isArray(alts) && alts.length > 0);
                            if (!hasExtras) return null;
                            return (
                              <details className="group/refine rounded-2xl border border-slate-200 bg-white open:shadow-md">
                                <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800">
                                  <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-open/refine:rotate-90 text-slate-400" />
                                  Diagnosis &amp; alternate versions
                                </summary>
                                <div className="px-5 pb-5 pt-1 space-y-5 text-sm text-slate-700 border-t border-slate-100 mt-2">
                                  {typeof rd.diagnosis === 'string' && rd.diagnosis.trim() ? (
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Diagnosis</p>
                                      <p className="whitespace-pre-wrap leading-relaxed">{rd.diagnosis}</p>
                                    </div>
                                  ) : null}
                                  {typeof rd.improvement_strategy === 'string' && rd.improvement_strategy.trim() ? (
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Improvement strategy</p>
                                      <p className="whitespace-pre-wrap leading-relaxed">{rd.improvement_strategy}</p>
                                    </div>
                                  ) : null}
                                  {Array.isArray(alts) &&
                                    alts.map((av, idx) =>
                                      typeof av.body === 'string' && av.body.trim() ? (
                                        <div key={`${av.style}-${idx}`} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                            {av.style || `Alternate ${idx + 1}`}
                                          </p>
                                          <PostBody body={av.body} />
                                          {Array.isArray(av.hook_options) && av.hook_options.some(Boolean) ? (
                                            <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1">
                                              <p className="text-[10px] font-bold uppercase text-slate-400">Hook options</p>
                                              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                                                {av.hook_options.filter(Boolean).map((h, hi) => (
                                                  <li key={hi}>{h}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          ) : null}
                                        </div>
                                      ) : null
                                    )}
                                </div>
                              </details>
                            );
                          })()}
                        </div>
                        
                        <div className="pt-4 space-y-4">
                          <Button 
                            fullWidth 
                            size="lg" 
                            disabled={loading || linkedinFlowStatus !== 'idle'}
                            className={`shadow-lg transition-all ${
                              workspace.isLinkedinConnected 
                                ? 'bg-[#0077b5] hover:bg-[#006396] text-white shadow-blue-500/20' 
                                : 'shadow-accent/20'
                            } ${linkedinFlowStatus !== 'idle' ? 'opacity-70 cursor-not-allowed' : ''}`} 
                            onClick={() => handlePostOnLinkedin(editedPostBody || agentResult.data.post.body)}
                          >
                            {linkedinFlowStatus === 'connecting' ? (
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            ) : linkedinFlowStatus === 'preparing' ? (
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                            ) : linkedinFlowStatus === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                            ) : (
                              <Linkedin className="w-5 h-5 mr-2" />
                            )}
                            
                            {linkedinFlowStatus === 'connecting' ? 'Connecting LinkedIn...' :
                             linkedinFlowStatus === 'preparing' ? 'Preparing LinkedIn Post...' :
                             linkedinFlowStatus === 'success' ? 'Draft Ready for LinkedIn!' :
                             linkedinFlowStatus === 'error' ? 'Connection Failed - Try Again' :
                             workspace.isLinkedinConnected ? 'Post on LinkedIn' : 'Connect & Post on LinkedIn'}
                          </Button>

                          <AnimatePresence>
                            {linkedinFlowStatus === 'success' && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-emerald-900">Draft Copied & LinkedIn Opened</p>
                                  <p className="text-xs text-emerald-700 leading-relaxed">
                                    We've opened LinkedIn and copied your draft. Simply paste it into the post composer to publish.
                                  </p>
                                </div>
                              </motion.div>
                            )}
                            {linkedinFlowStatus === 'error' && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-red-900">LinkedIn Flow Error</p>
                                  <p className="text-xs text-red-700 leading-relaxed">{linkedinFlowError}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {currentAgent === 'weekly_strategy' && (
                      <div className="space-y-10">
                        {/* Weekly Content Cards */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-accent rounded-full" />
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Weekly Content Plan</p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            {agentResult.data.week_plan?.map((post: any, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <Card className="p-0 border-slate-100 hover:border-accent/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group overflow-hidden">
                                  <div className="flex flex-col md:flex-row p-6 gap-6">
                                    {/* Day & Type */}
                                    <div className="flex md:flex-col items-center md:items-center justify-between md:justify-start gap-4 shrink-0">
                                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shadow-sm group-hover:bg-accent/5 group-hover:border-accent/10 transition-colors">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{post.day.substring(0, 3)}</span>
                                        <span className="font-display font-bold text-slate-900 text-lg leading-none">{i + 1}</span>
                                      </div>
                                      <Badge variant="neutral" className="text-[8px] px-2 py-0.5 bg-slate-100/50 text-slate-500 border-slate-200/50 font-bold uppercase tracking-wider">
                                        {post.post_type}
                                      </Badge>
                                    </div>

                                    {/* Content Details */}
                                    <div className="flex-1 space-y-4">
                                      <div className="space-y-1">
                                        <h4 className="text-xl font-display font-bold text-slate-900 tracking-tight leading-tight group-hover:text-accent transition-colors">
                                          {post.topic}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3">
                                          <div className="flex items-center gap-1.5 text-slate-400">
                                            <Target className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{post.intended_outcome}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 text-slate-400">
                                            <MessageSquare className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{post.cta_type}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hook Direction</p>
                                          <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{post.hook_direction}"</p>
                                        </div>
                                        <div className="space-y-1.5">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Audience Pain Point</p>
                                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{post.icp_pain_addressed}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                                      <Button 
                                        variant="primary" 
                                        size="sm"
                                        className="shadow-md shadow-accent/10 h-10 px-5 whitespace-nowrap"
                                        onClick={() => runAgent('post_drafter', { 
                                          day: post.day,
                                          writing_samples: (workspace.writing_samples || onboardingData.writing_samples || []).filter(Boolean),
                                          profile: {
                                            name: workspace.settings?.profile?.fullName || '',
                                            role: workspace.settings?.profile?.role || '',
                                          },
                                          offer_positioning: workspace.offer_positioning,
                                          icp_profile: workspace.icp_profile,
                                          voice_card: workspace.voice_card, 
                                          post_brief: { 
                                            topic: post.topic, 
                                            pov: post.hook_direction, 
                                            cta: { type: post.cta_type, link_base: "https://growth.os" } 
                                          } 
                                        })}
                                      >
                                        <PenTool className="w-3.5 h-3.5 mr-2" />
                                        Generate Draft
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="h-10 px-5 whitespace-nowrap border-slate-200 text-slate-500 hover:text-accent hover:border-accent/30"
                                        onClick={() => runAgent('weekly_strategy', workspace, true)}
                                      >
                                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                        Regenerate Idea
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentAgent === 'engagement_queue' && (
                      <div className="space-y-8">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-accent rounded-full" />
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Prioritized Queue</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {agentResult.data.queue.map((item: any, i: number) => (
                            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-6 hover:border-accent/20 transition-all group">
                              <div className="flex items-center gap-6">
                                <div className="text-3xl font-display font-bold text-slate-200 group-hover:text-accent/20 transition-colors">{(i + 1).toString().padStart(2, '0')}</div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <p className="font-bold text-slate-900 text-lg">{item.target_account}</p>
                                    <Badge variant="info" className="text-[8px] uppercase tracking-widest bg-blue-50">{item.engagement_type}</Badge>
                                  </div>
                                  <p className="text-slate-500 text-sm font-medium">{item.post_topic}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => {
                                const comment = agentResult.data.drafted_comments.find((c: any) => c.rank === item.rank);
                                if (comment) {
                                  navigator.clipboard.writeText(comment.comment_text);
                                }
                              }}>
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Copy
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback JSON view for other agents */}
                    {!['post_drafter', 'post_refiner', 'engagement_queue', 'weekly_strategy'].includes(currentAgent!) && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-accent rounded-full" />
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Raw Intelligence Data</p>
                        </div>
                        <pre className="p-8 bg-slate-900 text-accent rounded-3xl overflow-x-auto text-xs font-mono leading-relaxed shadow-inner">
                          {JSON.stringify(agentResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-4">
                    <Button 
                      variant="primary" 
                      size="md"
                      className="shadow-md shadow-accent/10 min-w-[140px]"
                      onClick={() => runAgent(currentAgent === 'post_refiner' ? 'post_drafter' : currentAgent!, lastAgentPayload, true)}
                      disabled={loading || linkedinFlowStatus !== 'idle'}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Regenerating...' : currentAgent === 'weekly_strategy' ? 'Regenerate Week' : 'Regenerate'}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="md"
                      className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px]" 
                      onClick={() => setStep('dashboard')}
                      disabled={loading || linkedinFlowStatus !== 'idle'}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg text-slate-700 font-sans selection:bg-accent/10 selection:text-accent overflow-x-hidden">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        canClose={step !== 'auth'}
      />

      {/* Sidebar Navigation (Desktop) */}
      {workspace.voice_card && (step === 'dashboard' || step === 'agent-run') && (
        <aside className="fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="font-display font-black text-slate-900 text-xl tracking-tighter">Growth OS</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: 'strategy', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'settings', icon: ShieldCheck, label: 'Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? "bg-accent/5 text-accent" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-accent" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="hidden lg:block font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-xs">
                {currentUser ? currentUser.charAt(0).toUpperCase() : (displayName?.charAt(0) || 'G')}
              </div>
              <div className="hidden lg:block overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName || 'User'}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">
                  {currentUser || displayRole}
                </p>
              </div>
            </div>
            {currentUser && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:block text-xs font-bold">Logout</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`transition-all duration-500 ${workspace.voice_card && (step === 'dashboard' || step === 'agent-run') ? 'md:pl-20 lg:pl-64' : ''}`}>
        <AnimatePresence mode="wait">
          {step === 'auth' && renderAuth()}
          {step === 'onboarding' && renderOnboarding()}
          {step === 'dashboard' && renderDashboard()}
          {step === 'agent-run' && renderAgentRun()}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      {workspace.voice_card && (step === 'dashboard' || step === 'agent-run') && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 flex md:hidden items-center justify-around px-6">
          {[
            { id: 'strategy', icon: LayoutDashboard },
            { id: 'settings', icon: ShieldCheck },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`p-3 rounded-2xl transition-all ${
                activeTab === item.id ? "bg-accent/10 text-accent" : "text-slate-400"
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
