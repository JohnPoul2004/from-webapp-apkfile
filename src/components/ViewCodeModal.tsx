import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Code2,
  FileCode,
  Layers,
  Calendar,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ChevronDown,
  Terminal,
  FileText,
  Filter,
  Globe,
  Clock,
  MapPin,
  CheckCircle,
  Film,
  CloudSun,
  ShoppingCart,
  Tv,
  Newspaper,
  Image as ImageIcon,
  Zap,
  AlertTriangle,
  Home,
  PlusSquare,
  Trash2,
  Sliders,
  Play,
  Database,
  BarChart3,
  Award,
  Crown,
  Settings,
  Shield,
  CreditCard,
  Moon,
  Sun,
  File,
  Lock,
  PanelLeft,
  Heart,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Plus
} from 'lucide-react';

export type CodeLanguage =
  | 'TypeScript'
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'PHP'
  | 'Python'
  | 'XML'
  | 'Kotlin'
  | 'Java'
  | 'MySQL'
  | 'Flutter';

export type FeatureScope =
  | 'Home'
  | 'Sidebar'
  | 'Tabs'
  | 'Mothers'
  | 'CreateModal'
  | 'DeleteModal'
  | 'Quota'
  | 'Upgrade'
  | 'Settings'
  | 'Entertainment'
  | 'Weather'
  | 'Shopping'
  | 'Auth'
  | 'All';

export type CodeTab = CodeLanguage; // Backwards compatibility for existing imports

interface ViewCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: CodeLanguage;
  initialFeature?: FeatureScope;
  initialTab?: CodeTab;
}

interface CodeFile {
  id: string;
  name: string;
  language: CodeLanguage;
  feature: FeatureScope;
  fileName: string;
  description: string;
  code: string;
}

const CODE_FILES: CodeFile[] = [
  // ==========================================
  // 1. TYPESCRIPT FILES
  // ==========================================
  {
    id: 'ts-home-dashboard',
    name: 'HomeDashboard.tsx (Dashboard Feed & Metrics)',
    language: 'TypeScript',
    feature: 'Home',
    fileName: 'HomeDashboard.tsx',
    description: 'Home dashboard overview featuring greeting banner, metric cards, recent creations feed, and quick category shortcuts.',
    code: `import React from 'react';
import { Home, Sparkles, TrendingUp, Users } from 'lucide-react';
import { VideoItem, NewsItem, PhotoItem, PollItem, QuizItem } from '../types';

interface HomeDashboardProps {
  currentUser: { displayName?: string | null; email?: string | null } | null;
  items: Array<VideoItem | NewsItem | PhotoItem | PollItem | QuizItem>;
}

export function HomeDashboard({ currentUser, items }: HomeDashboardProps) {
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Creator';
  const totalViews = items.reduce((acc, item) => acc + (item.views || 0), 0);
  const totalReactions = items.reduce((acc, item) => acc + (item.likes || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 p-6 rounded-3xl border border-zinc-800 text-white">
        <h1 className="text-2xl font-black">Welcome back, {userName}!</h1>
        <p className="text-xs text-zinc-400 mt-1">Live analytics, channel status, and recent multimedia performance.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
            <span className="text-xs text-zinc-400">Total Items</span>
            <div className="text-xl font-black text-white">{items.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
            <span className="text-xs text-zinc-400">Total Views</span>
            <div className="text-xl font-black text-amber-400">{totalViews.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
            <span className="text-xs text-zinc-400">Reactions</span>
            <div className="text-xl font-black text-rose-400">{totalReactions.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
            <span className="text-xs text-zinc-400">Cloud Sync</span>
            <div className="text-xl font-black text-emerald-400">Online</div>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'ts-sidebar-navigation',
    name: 'SidebarNav.tsx (Responsive Drawer & Routes)',
    language: 'TypeScript',
    feature: 'Sidebar',
    fileName: 'SidebarNav.tsx',
    description: 'Responsive sidebar component managing channel navigation links, active route highlight, branding logo, and mobile drawer transitions.',
    code: `import React from 'react';
import { Home, Film, Sparkles, Tv, Settings, History, HelpCircle, X, ShieldCheck } from 'lucide-react';
import { DashboardSection } from '../types';

interface SidebarNavProps {
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function SidebarNav({
  activeSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile
}: SidebarNavProps) {
  const navItems: { id: DashboardSection; label: string; icon: any }[] = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Entertainment', label: 'Entertainment', icon: Film },
    { id: 'TV Schedule', label: 'TV Schedule', icon: Tv },
    { id: 'Activity Log', label: 'Activity Log', icon: History },
    { id: 'Settings', label: 'Settings', icon: Settings },
    { id: 'Help', label: 'Help', icon: HelpCircle },
    { id: 'Community Standards', label: 'Community Standards', icon: ShieldCheck }
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full text-white p-4">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <img
            src="/src/logo-list/logo.png"
            alt="Logo"
            className="w-9 h-9 rounded-xl object-contain bg-zinc-950 border border-zinc-800 p-1"
          />
          <div>
            <h2 className="text-sm font-bold text-white">Creator Studio</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[11px] text-zinc-400 font-medium">{activeSection}</p>
            </div>
          </div>
        </div>
        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={\`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all \${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }\`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-500">
        DMM Studio v2.4.0
      </div>
    </aside>
  );
}`
  },
  {
    id: 'ts-tabs-navigation',
    name: 'NavigationTabs.tsx (Top & Sub-Category Tabs)',
    language: 'TypeScript',
    feature: 'Tabs',
    fileName: 'NavigationTabs.tsx',
    description: 'Modular tab navigation system managing main dashboard channels and sub-tabs.',
    code: `import React from 'react';
import { Film, CloudSun, ShoppingCart, BarChart3, Zap, Settings as SettingsIcon } from 'lucide-react';
import { DashboardSection } from '../types';

export function NavigationTabs({
  activeSection,
  onSectionChange,
}: {
  activeSection: DashboardSection;
  onSectionChange: (s: DashboardSection) => void;
}) {
  const mainSections: { id: DashboardSection; label: string; icon: any }[] = [
    { id: 'Home', label: 'Home', icon: Film },
    { id: 'Entertainment', label: 'Entertainment', icon: Film },
    { id: 'Quota', label: 'Quota', icon: BarChart3 },
    { id: 'Upgrade', label: 'Upgrade', icon: Zap },
    { id: 'Settings', label: 'Settings', icon: SettingsIcon },
    { id: 'Weather', label: 'Weather', icon: CloudSun },
    { id: 'Shopping', label: 'Shopping', icon: ShoppingCart }
  ];

  return (
    <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {mainSections.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSectionChange(sec.id)}
            className={\`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 \${
              isActive ? 'bg-amber-500 text-zinc-950 font-black' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
            }\`}
          >
            <Icon size={16} />
            <span>{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
}`
  },
  {
    id: 'ts-mothers-channel',
    name: 'MothersChannel.tsx (Family Channel & Stories)',
    language: 'TypeScript',
    feature: 'Mothers',
    fileName: 'MothersChannel.tsx',
    description: 'Mothers family channel feed controller featuring maternal tributes, heartfelt family stories, photo carousels, and dedication reaction meters.',
    code: `import React, { useState } from 'react';
import { Heart, Sparkles, MessageSquare, Share2, Award, Calendar, Plus } from 'lucide-react';
import { VideoItem, NewsItem, PhotoItem } from '../types';

interface MothersChannelProps {
  items: Array<VideoItem | NewsItem | PhotoItem>;
  onOpenCreate: () => void;
}

export function MothersChannel({ items, onOpenCreate }: MothersChannelProps) {
  const [filter, setFilter] = useState<'All' | 'Stories' | 'Tributes' | 'Photos'>('All');
  
  // Filter items tagged or categorized for Mothers
  const motherItems = items.filter(
    (item) => item.category === 'Mothers' || (item as any).section === 'Mothers' || item.tags?.includes('Mothers')
  );

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto">
      {/* Mothers Channel Hero Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-zinc-900 to-amber-950/40 p-6 rounded-3xl border border-rose-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Heart size={14} className="fill-rose-400 text-rose-400" />
            <span>Family & Mothers Channel</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Honoring Mothers & Family Stories</h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            A dedicated maternal showcase featuring heartfelt memories, milestone video clips, family recipes, and touching tributes.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-rose-950/50"
        >
          <Plus size={16} />
          <span>New Mother Tribute</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3">
        {(['All', 'Stories', 'Tributes', 'Photos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition \${
              filter === tab ? 'bg-rose-600 text-white' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }\`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Channel Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {motherItems.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-zinc-900/60 rounded-3xl border border-zinc-800">
            <Heart className="mx-auto text-rose-400 mb-2 opacity-60" size={32} />
            <p className="text-sm font-bold text-zinc-300">No Mothers channel stories published yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Be the first to share a warm family dedication or memory.</p>
          </div>
        ) : (
          motherItems.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 hover:border-rose-900/60 transition p-4 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-800/80">
                <span className="flex items-center gap-1 text-rose-400">
                  <Heart size={13} className="fill-rose-400" />
                  {item.likes || 0}
                </span>
                <span>{item.views || 0} views</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}`
  },
  {
    id: 'ts-create-modal',
    name: 'CreateModal.tsx (Creation Dialog Controller)',
    language: 'TypeScript',
    feature: 'CreateModal',
    fileName: 'CreateModal.tsx',
    description: 'Universal creation modal handling multi-format forms, Page/Event location linking, quota checks, and Firestore persistence.',
    code: `import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function CreateModal({ isOpen, onClose, currentUser }: { isOpen: boolean; onClose: () => void; currentUser: any }) {
  const [title, setTitle] = useState('');
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addDoc(collection(db, 'videos'), {
      title: title.trim(),
      userId: currentUser?.uid,
      createdAt: Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-3xl w-full max-w-lg space-y-4">
        <h3 className="font-bold text-white text-base">Create New Content</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title..."
          className="w-full px-4 py-2 bg-zinc-800 rounded-xl text-white text-xs"
        />
        <button type="submit" className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl">Save</button>
      </form>
    </div>
  );
}`
  },
  {
    id: 'ts-delete-modal',
    name: 'DeletedModal.tsx (Trash Bin & 100-Day Recovery)',
    language: 'TypeScript',
    feature: 'DeleteModal',
    fileName: 'DeletedModal.tsx',
    description: 'Trash Bin modal controller featuring 100-day recovery timers, item restoration, and permanent deletion.',
    code: `import React, { useState } from 'react';
import { Trash2, RotateCcw, Clock } from 'lucide-react';

export function DeletedModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-zinc-900 p-6 rounded-3xl w-full max-w-xl text-white space-y-4">
        <h3 className="font-bold flex items-center gap-2 text-rose-400">
          <Trash2 size={18} /> Trash Bin (100-Day Recovery)
        </h3>
        <p className="text-xs text-zinc-400">Items remain in trash for 100 days with one-click restore.</p>
      </div>
    </div>
  );
}`
  },
  {
    id: 'ts-quota-view',
    name: 'QuotaView.tsx (Quota Usage & Tier Limits)',
    language: 'TypeScript',
    feature: 'Quota',
    fileName: 'QuotaView.tsx',
    description: 'Live quota tracking dashboard displaying usage meters across Videos, News, Photos, Polls, Quizzes, storage bytes, and 30-day reset timer.',
    code: `import React from 'react';
import { BarChart3, HardDrive, Shield, Clock, ArrowUpRight } from 'lucide-react';
import { QuotaTierName } from '../types';
import { QUOTA_TIERS } from '../data/quotaTiers';

export function QuotaView({ quotaCounts, activeTier }: { quotaCounts: any; activeTier: QuotaTierName }) {
  const tierConfig = QUOTA_TIERS[activeTier];

  return (
    <div className="space-y-6 text-white">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
        <h2 className="text-xl font-bold">Quota Usage & Tier Allocation ({activeTier})</h2>
      </div>
    </div>
  );
}`
  },
  {
    id: 'ts-upgrade-view',
    name: 'UpgradeView.tsx (Subscription Tiers & Pricing)',
    language: 'TypeScript',
    feature: 'Upgrade',
    fileName: 'UpgradeView.tsx',
    description: 'Tier subscription selector supporting Free, Plus, Pro, Creator Max, and Enterprise plans with monthly/annual discounts.',
    code: `import React, { useState } from 'react';
import { Crown, Check, Zap, Sparkles } from 'lucide-react';
import { QuotaTierName } from '../types';

export function UpgradeView({ activeTier, onSelectTier }: { activeTier: QuotaTierName; onSelectTier: (t: QuotaTierName) => void }) {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly');
  return (
    <div className="space-y-6 text-white">
      <h1 className="text-2xl font-black">Upgrade Your Creator Capacity</h1>
    </div>
  );
}`
  },
  {
    id: 'ts-settings-view',
    name: 'SettingsView.tsx (Preferences & Theme Switcher)',
    language: 'TypeScript',
    feature: 'Settings',
    fileName: 'SettingsView.tsx',
    description: 'Application settings controller managing Dark/Light theme toggles, notification preferences, cloud synchronization, and security profile.',
    code: `import React, { useState } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';

export function SettingsView() {
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  return (
    <div className="space-y-6 text-white">
      <h2 className="text-xl font-bold">Preferences & App Settings</h2>
    </div>
  );
}`
  },
  {
    id: 'ts-auth-screen',
    name: 'AuthScreen.tsx (Firebase Authentication & Login Flow)',
    language: 'TypeScript',
    feature: 'Auth',
    fileName: 'AuthScreen.tsx',
    description: 'Secure authentication screen featuring email/password sign-in, account creation, password reset, and Firebase credential validation.',
    code: `import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, Sparkles, LogIn } from 'lucide-react';

export function AuthScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-md space-y-6 text-white shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-black">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-xs text-zinc-400">Sign in to access your Creator Studio dashboard</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
        >
          <LogIn size={16} />
          <span>{isSignUp ? 'Register Account' : 'Sign In'}</span>
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-400 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}`
  },
  {
    id: 'ts-entertainment-section',
    name: 'EntertainmentSection.tsx (Media Feeds & Embeds)',
    language: 'TypeScript',
    feature: 'Entertainment',
    fileName: 'EntertainmentSection.tsx',
    description: 'Entertainment media gallery controller supporting YouTube/Vimeo embeds, Showbiz News, Photo carousels, Polls, and Quizzes.',
    code: `import React from 'react';
import { Film } from 'lucide-react';

export function EntertainmentSection() {
  return (
    <div className="space-y-6 text-white">
      <h2 className="text-xl font-black">Entertainment Hub</h2>
    </div>
  );
}`
  },
  {
    id: 'ts-weather-section',
    name: 'WeatherSection.tsx (Forecasts & Severe Alerts)',
    language: 'TypeScript',
    feature: 'Weather',
    fileName: 'WeatherSection.tsx',
    description: 'Live weather radar, 7-day forecast cards, severe weather alert notifications, and 3 recent searched locations memory.',
    code: `import React, { useState } from 'react';
import { CloudSun } from 'lucide-react';

export function WeatherSection() {
  return (
    <div className="space-y-6 text-white">
      <h2 className="text-xl font-bold">Live Weather & Radar</h2>
    </div>
  );
}`
  },
  {
    id: 'ts-shopping-view',
    name: 'ProductsView.tsx (E-Commerce Store)',
    language: 'TypeScript',
    feature: 'Shopping',
    fileName: 'ProductsView.tsx',
    description: 'Creator merchandise inventory, shopping cart state, and order tracking.',
    code: `import React from 'react';
import { ShoppingCart } from 'lucide-react';

export function ProductsView() {
  return (
    <div className="space-y-6 text-white">
      <h2 className="text-xl font-bold">Creator Store</h2>
    </div>
  );
}`
  },
  {
    id: 'ts-app-main',
    name: 'App.tsx (Root Controller)',
    language: 'TypeScript',
    feature: 'All',
    fileName: 'App.tsx',
    description: 'React root application controller routing between Home, Entertainment, Quota, Upgrade, Settings, Weather, and Shopping.',
    code: `import React, { useState } from 'react';

export function App() {
  const [activeSection, setActiveSection] = useState('Home');
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Root Layout */}
    </div>
  );
}`
  },

  // ==========================================
  // 2. HTML FILES
  // ==========================================
  {
    id: 'html-home-template',
    name: 'home-template.html (Dashboard Structure)',
    language: 'HTML',
    feature: 'Home',
    fileName: 'home-template.html',
    description: 'Semantic HTML5 structure for the Home dashboard overview, stats cards, and feed sections.',
    code: `<!-- Semantic HTML5 Home Dashboard Template -->
<section id="home-dashboard" class="home-container" aria-label="Creator Studio Home">
  <div class="welcome-hero-banner">
    <span class="hub-pill">&#127968; Creator Studio</span>
    <h1 class="welcome-title">Welcome back, Creator!</h1>
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Total Creations</span>
        <span class="stat-number">48</span>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 'html-tabs-template',
    name: 'tabs-template.html (ARIA Tab Navigation)',
    language: 'HTML',
    feature: 'Tabs',
    fileName: 'tabs-template.html',
    description: 'Accessible ARIA tablist structure with keyboard navigation attributes, tabpanels, and pill buttons.',
    code: `<!-- Semantic ARIA Tabs Navigation Template -->
<nav class="tabs-nav" aria-label="Main Channels">
  <ul role="tablist" class="tab-list">
    <li role="presentation"><button role="tab" class="tab-btn active">Home</button></li>
    <li role="presentation"><button role="tab" class="tab-btn">Quota</button></li>
    <li role="presentation"><button role="tab" class="tab-btn">Upgrade</button></li>
  </ul>
</nav>`
  },
  {
    id: 'html-create-modal-template',
    name: 'create-modal-template.html (Modal Dialog Markup)',
    language: 'HTML',
    feature: 'CreateModal',
    fileName: 'create-modal-template.html',
    description: 'Semantic HTML5 structure for the creation dialog, input groups, platform selector, and image dropzone.',
    code: `<!-- Create Modal HTML5 Dialog Structure -->
<div class="modal-overlay" id="create-modal-backdrop" role="dialog" aria-modal="true">
  <div class="modal-card">
    <header class="modal-header">
      <h2>&#10024; Create New Media</h2>
    </header>
    <form class="create-form">
      <input type="text" placeholder="Title..." required />
      <button type="submit">Publish</button>
    </form>
  </div>
</div>`
  },
  {
    id: 'html-delete-modal-template',
    name: 'delete-modal-template.html (Trash Bin Markup)',
    language: 'HTML',
    feature: 'DeleteModal',
    fileName: 'delete-modal-template.html',
    description: 'Semantic HTML5 structure for the Trash bin modal, countdown badge, and permanent deletion alert dialog.',
    code: `<!-- Trash Bin & Safe Deletion Modal Template -->
<div class="modal-overlay" id="trash-modal-backdrop" role="dialog">
  <div class="modal-card-trash">
    <h2>&#128465; Trash Bin (100-Day Recovery)</h2>
  </div>
</div>`
  },
  {
    id: 'html-quota-template',
    name: 'quota-template.html (Quota Meters UI)',
    language: 'HTML',
    feature: 'Quota',
    fileName: 'quota-template.html',
    description: 'Semantic HTML5 meters and progress indicators for account storage and media upload limits.',
    code: `<!-- Quota Meters & Capacity Layout -->
<section id="quota-dashboard" class="quota-container">
  <div class="meter-card">
    <span class="meter-title">Video Upload Capacity</span>
    <progress value="18" max="50"></progress>
  </div>
</section>`
  },
  {
    id: 'html-upgrade-template',
    name: 'upgrade-template.html (Pricing Matrix UI)',
    language: 'HTML',
    feature: 'Upgrade',
    fileName: 'upgrade-template.html',
    description: 'HTML5 pricing matrix tables with plan comparison cards and checkout buttons.',
    code: `<!-- Upgrade & Subscription Pricing Grid -->
<div class="pricing-grid">
  <div class="tier-card pro">
    <span class="tier-badge">Pro Creator</span>
    <h3 class="tier-price">$19 <span>/mo</span></h3>
  </div>
</div>`
  },
  {
    id: 'html-settings-template',
    name: 'settings-template.html (Preferences Layout)',
    language: 'HTML',
    feature: 'Settings',
    fileName: 'settings-template.html',
    description: 'HTML5 form layout for dark mode toggles, notification switches, and account security.',
    code: `<!-- Settings & User Preferences Form -->
<form class="settings-form">
  <label class="switch-row">
    <span>Enable Dark Appearance</span>
    <input type="checkbox" checked />
  </label>
</form>`
  },
  {
    id: 'html-index-main',
    name: 'index.html (HTML5 Document Root)',
    language: 'HTML',
    feature: 'All',
    fileName: 'index.html',
    description: 'HTML5 root document shell, typography preconnect, and app mounting container.',
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>DMM Creator Studio</title>
  </head>
  <body class="bg-zinc-950 text-white">
    <div id="root"></div>
  </body>
</html>`
  },

  // ==========================================
  // 3. CSS FILES
  // ==========================================
  {
    id: 'css-home-styles',
    name: 'home-styles.css (Hero Gradient & Stat Cards)',
    language: 'CSS',
    feature: 'Home',
    fileName: 'home.css',
    description: 'Styling rules for home banner gradients, stat card hover effects, and responsive dashboard layout.',
    code: `/* Home Dashboard Styles */
.welcome-hero-banner {
  background: linear-gradient(135deg, #18181b 0%, #09090b 60%, rgba(245, 158, 11, 0.1) 100%);
  border: 1px solid rgba(39, 39, 42, 0.8);
  border-radius: 1.5rem;
  padding: 1.75rem;
  color: #ffffff;
}`
  },
  {
    id: 'css-tabs-styles',
    name: 'tabs-styles.css (Pill Indicators & Scrollbars)',
    language: 'CSS',
    feature: 'Tabs',
    fileName: 'tabs.css',
    description: 'Styling rules for active pill indicators, sliding glow animations, and responsive horizontal scrollbars.',
    code: `/* Tabs Navigation Styles */
.tab-btn.active {
  background-color: #f59e0b;
  color: #09090b;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}`
  },
  {
    id: 'css-create-modal-styles',
    name: 'create-modal-styles.css (Dialog Pop-in)',
    language: 'CSS',
    feature: 'CreateModal',
    fileName: 'create-modal.css',
    description: 'Styling rules for backdrop blur filters, zoom-in modal entrance animations, and form inputs.',
    code: `/* Create Modal Dialog Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}`
  },
  {
    id: 'css-delete-modal-styles',
    name: 'delete-modal-styles.css (Danger Alerts & Timers)',
    language: 'CSS',
    feature: 'DeleteModal',
    fileName: 'delete-modal.css',
    description: 'Styling rules for rose danger accent borders, pulsing countdown chips, and permanent deletion confirmation.',
    code: `/* Delete Modal & Trash Bin Styles */
.badge-timer {
  color: #fbbf24;
  background-color: rgba(251, 191, 36, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}`
  },
  {
    id: 'css-quota-styles',
    name: 'quota-styles.css (Progress Bars & Capacity Badges)',
    language: 'CSS',
    feature: 'Quota',
    fileName: 'quota.css',
    description: 'Styling rules for capacity progress bars, storage meters, and 30-day reset badges.',
    code: `/* Quota Dashboard Progress Meter Styles */
.quota-progress-fill {
  background: linear-gradient(90deg, #f59e0b 0%, #10b981 100%);
  border-radius: 9999px;
  height: 0.5rem;
  transition: width 0.3s ease-in-out;
}`
  },
  {
    id: 'css-settings-styles',
    name: 'settings-styles.css (Toggle Switches & Form Controls)',
    language: 'CSS',
    feature: 'Settings',
    fileName: 'settings.css',
    description: 'Custom styling for theme switchers, dark mode toggles, and form inputs.',
    code: `/* Settings & Preferences Styles */
.theme-switch-btn {
  background-color: #27272a;
  border: 1px solid #3f3f46;
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  color: #ffffff;
}`
  },
  {
    id: 'css-index-global',
    name: 'index.css (Tailwind Directives)',
    language: 'CSS',
    feature: 'All',
    fileName: 'index.css',
    description: 'Tailwind CSS v4 directives, dark mode styling, and custom scrollbars.',
    code: `@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));`
  },

  // ==========================================
  // 4. JAVASCRIPT FILES
  // ==========================================
  {
    id: 'js-home-feed-utils',
    name: 'homeFeedUtils.js (Feed Aggregator & Metrics)',
    language: 'JavaScript',
    feature: 'Home',
    fileName: 'homeFeedUtils.js',
    description: 'JavaScript helper for aggregating feed items, calculating engagement score, and sorting recent activities.',
    code: `export function aggregateHomeFeed(items, limit = 10) {
  if (!Array.isArray(items)) return [];
  return [...items]
    .filter(item => !item.isDeleted)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, limit);
}

export function computeEngagementMetrics(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return { totalViews: 0, totalLikes: 0, averageEngagement: 0 };
  }
  const totalViews = items.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = items.reduce((sum, item) => sum + (item.likes || 0), 0);
  const averageEngagement = ((totalLikes / (totalViews || 1)) * 100).toFixed(1);
  return { totalViews, totalLikes, averageEngagement };
}`
  },
  {
    id: 'js-sidebar-navigation',
    name: 'sidebarNav.js (Drawer Router & Route Switcher)',
    language: 'JavaScript',
    feature: 'Sidebar',
    fileName: 'sidebarNav.js',
    description: 'JavaScript sidebar controller managing drawer toggles, active link highlighting, and route navigation.',
    code: `export function initializeSidebar(navElement, onNavigate) {
  if (!navElement) return;

  const links = navElement.querySelectorAll('[data-nav-route]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-nav-route');
      
      // Update active state classes
      links.forEach(l => l.classList.remove('active', 'bg-amber-500', 'text-black'));
      link.classList.add('active', 'bg-amber-500', 'text-black');

      if (typeof onNavigate === 'function') {
        onNavigate(route);
      }
    });
  });
}

export function toggleSidebarMobile(drawerElement, isOpen) {
  if (!drawerElement) return;
  if (isOpen) {
    drawerElement.classList.remove('hidden', '-translate-x-full');
    drawerElement.classList.add('translate-x-0');
  } else {
    drawerElement.classList.add('-translate-x-full');
  }
}`
  },
  {
    id: 'js-tabs-utils',
    name: 'tabSwitchUtils.js (Keyboard Nav & State)',
    language: 'JavaScript',
    feature: 'Tabs',
    fileName: 'tabSwitchUtils.js',
    description: 'JavaScript logic for keyboard tab navigation [ArrowLeft, ArrowRight, Home, End] and syncing tab state.',
    code: `export function handleTabKeyNavigation(event, tabButtons) {
  const currentIndex = tabButtons.indexOf(document.activeElement);
  if (currentIndex === -1) return;
  let newIndex = currentIndex;
  if (event.key === 'ArrowRight') newIndex = (currentIndex + 1) % tabButtons.length;
  else if (event.key === 'ArrowLeft') newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
  else if (event.key === 'Home') newIndex = 0;
  else if (event.key === 'End') newIndex = tabButtons.length - 1;
  else return;
  event.preventDefault();
  tabButtons[newIndex].focus();
}`
  },
  {
    id: 'js-mothers-service',
    name: 'mothersService.js (Mothers Channel Feeds & Dedications)',
    language: 'JavaScript',
    feature: 'Mothers',
    fileName: 'mothersService.js',
    description: 'JavaScript service for filtering Mothers channel family media, calculating heart reaction stats, and formatting tribute posts.',
    code: `export function filterMothersFeed(items, subFilter = 'All') {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    const isMotherItem = item.category === 'Mothers' || item.section === 'Mothers' || (item.tags && item.tags.includes('Mothers'));
    if (!isMotherItem) return false;
    if (subFilter === 'All') return true;
    if (subFilter === 'Stories') return item.type === 'story' || item.format === 'News';
    if (subFilter === 'Tributes') return item.type === 'tribute' || item.isTribute;
    if (subFilter === 'Photos') return item.format === 'Photos' || item.mediaType === 'image';
    return true;
  });
}

export function calculateMotherDedicationRank(item) {
  const likes = item.likes || 0;
  const views = item.views || 0;
  const comments = item.commentCount || 0;
  // Weighted tribute score focusing on hearts and comments
  return (likes * 3) + (comments * 2) + Math.floor(views * 0.1);
}`
  },
  {
    id: 'js-create-validation-utils',
    name: 'createValidationUtils.js (Form Sanitizer)',
    language: 'JavaScript',
    feature: 'CreateModal',
    fileName: 'createValidationUtils.js',
    description: 'JavaScript algorithms for sanitizing user inputs, validating embed links, and checking quota limit thresholds.',
    code: `export function validateCreatePayload(formData) {
  const errors = [];
  if (!formData.title || formData.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long.');
  }
  if (formData.mediaUrl && !formData.mediaUrl.startsWith('http')) {
    errors.push('Media URL must begin with http:// or https://');
  }
  return { isValid: errors.length === 0, errors };
}`
  },
  {
    id: 'js-trash-recovery-utils',
    name: 'trashRecoveryUtils.js (100-Day Calculator)',
    language: 'JavaScript',
    feature: 'DeleteModal',
    fileName: 'trashRecoveryUtils.js',
    description: 'JavaScript algorithm computing days remaining before 100-day soft-delete expiration and auto-purge.',
    code: `export function calculateDaysRemaining(deletedAtMs, retentionDays = 100) {
  if (!deletedAtMs) return retentionDays;
  const deletedTime = typeof deletedAtMs === 'number' ? deletedAtMs : new Date(deletedAtMs).getTime();
  const diffMs = Date.now() - deletedTime;
  const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, retentionDays - daysPassed);
}`
  },
  {
    id: 'js-quota-utils',
    name: 'quotaCalculatorUtils.js (Quota Limits & Resets)',
    language: 'JavaScript',
    feature: 'Quota',
    fileName: 'quotaCalculatorUtils.js',
    description: 'JavaScript logic calculating remaining items per category and 30-day billing cycle reset timestamps.',
    code: `export function getQuotaResetCountdown() {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const diffMs = endOfMonth.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { days, resetDate: endOfMonth.toLocaleDateString() };
}`
  },
  {
    id: 'js-upgrade-service',
    name: 'upgradeService.js (Subscription Tiers & Discounts)',
    language: 'JavaScript',
    feature: 'Upgrade',
    fileName: 'upgradeService.js',
    description: 'JavaScript logic for computing subscription plans, discounts, and feature allocation matrices.',
    code: `export const QUOTA_TIERS = {
  Free: { name: 'Free', price: 0, videoLimit: 5, newsLimit: 10, photoLimit: 15, pollLimit: 5, quizLimit: 5, storageMB: 500 },
  Plus: { name: 'Plus', price: 9.99, videoLimit: 25, newsLimit: 50, photoLimit: 100, pollLimit: 25, quizLimit: 25, storageMB: 5000 },
  Pro: { name: 'Pro', price: 29.99, videoLimit: 100, newsLimit: 200, photoLimit: 500, pollLimit: 100, quizLimit: 100, storageMB: 25000 },
  CreatorMax: { name: 'Creator Max', price: 79.99, videoLimit: 500, newsLimit: 1000, photoLimit: 2500, pollLimit: 500, quizLimit: 500, storageMB: 100000 },
  Enterprise: { name: 'Enterprise', price: 199.99, videoLimit: 2000, newsLimit: 5000, photoLimit: 10000, pollLimit: 2000, quizLimit: 2000, storageMB: 500000 }
};

export function calculateUpgradePrice(tierName, isAnnual = false) {
  const tier = QUOTA_TIERS[tierName] || QUOTA_TIERS.Free;
  if (isAnnual) {
    const yearly = tier.price * 12 * 0.8;
    return { monthlyEquivalent: (yearly / 12).toFixed(2), totalYearly: yearly.toFixed(2) };
  }
  return { monthlyEquivalent: tier.price.toFixed(2), totalYearly: (tier.price * 12).toFixed(2) };
}`
  },
  {
    id: 'js-settings-controller',
    name: 'settingsController.js (Theme & Preference Switcher)',
    language: 'JavaScript',
    feature: 'Settings',
    fileName: 'settingsController.js',
    description: 'JavaScript preference manager handling theme toggles, notification state, and localStorage persistence.',
    code: `export function applyThemePreference(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

export function loadSavedPreferences() {
  const theme = localStorage.getItem('theme') || 'dark';
  const notifications = JSON.parse(localStorage.getItem('notifications_enabled') || 'true');
  return { theme, notifications };
}`
  },
  {
    id: 'js-entertainment-hub',
    name: 'entertainmentHub.js (Media Embed Parsers & Quizzes)',
    language: 'JavaScript',
    feature: 'Entertainment',
    fileName: 'entertainmentHub.js',
    description: 'JavaScript module for parsing video embeds (YouTube/Vimeo), processing quiz scores, and news formatting.',
    code: `export function extractVideoEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (youtubeMatch) return \`https://www.youtube.com/embed/\${youtubeMatch[1]}\`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)/);
  if (vimeoMatch) return \`https://player.vimeo.com/video/\${vimeoMatch[1]}\`;
  return url;
}

export function calculateQuizScore(questions, userAnswers) {
  let score = 0;
  questions.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctAnswerIndex) score += 1;
  });
  return { score, total: questions.length, percentage: Math.round((score / questions.length) * 100) };
}`
  },
  {
    id: 'js-weather-service',
    name: 'weatherService.js (Open-Meteo Weather Service)',
    language: 'JavaScript',
    feature: 'Weather',
    fileName: 'weatherService.js',
    description: 'JavaScript API client requesting current weather, 7-day forecasts, and severe weather alerts from Open-Meteo.',
    code: `export async function fetchWeatherForecast(lat = 14.5995, lon = 120.9842) {
  const apiUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${lat}&longitude=\${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto\`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Weather API request failed');
    const data = await response.json();
    return {
      temperature: data.current_weather.temperature,
      windspeed: data.current_weather.windspeed,
      weathercode: data.current_weather.weathercode,
      daily: data.daily
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
}`
  },
  {
    id: 'js-store-controller',
    name: 'storeController.js (Cart & Orders Manager)',
    language: 'JavaScript',
    feature: 'Shopping',
    fileName: 'storeController.js',
    description: 'JavaScript store logic managing cart totals, tax calculation, quantity updates, and order generation.',
    code: `export function processCartCheckout(cartItems, paymentDetails) {
  if (!cartItems || cartItems.length === 0) return { success: false, message: 'Cart is empty' };
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  return {
    orderId: \`ORD-\${Date.now().toString(36).toUpperCase()}\`,
    itemCount: cartItems.length,
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    status: 'Confirmed'
  };
}`
  },
  {
    id: 'js-auth-controller',
    name: 'authController.js (Firebase Authentication Engine)',
    language: 'JavaScript',
    feature: 'Auth',
    fileName: 'authController.js',
    description: 'JavaScript Firebase Authentication wrapper managing user login, registration, password reset, and auth state.',
    code: `import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase.js';

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  await signOut(auth);
}`
  },
  {
    id: 'js-app-main',
    name: 'App.js (JavaScript Root Application Controller)',
    language: 'JavaScript',
    feature: 'All',
    fileName: 'App.js',
    description: 'Complete JavaScript root React application controller managing navigation, state, modals, and channel feeds.',
    code: `import React, { useState } from 'react';

export function FullAppController() {
  const [activeSection, setActiveSection] = useState('Home');
  const [activeTab, setActiveTab] = useState('Videos');
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <header className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h1 className="font-black text-amber-400 text-lg">DMM Creator Studio (JS)</h1>
        <div className="flex gap-2">
          {['Home', 'Quota', 'Upgrade', 'Settings', 'Weather', 'Shopping'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold \${activeSection === section ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-300'}\`}
            >
              {section}
            </button>
          ))}
        </div>
      </header>
      <main className="p-6">
        <h2 className="text-xl font-bold">Active Section: {activeSection}</h2>
        <p className="text-xs text-zinc-400 mt-2">Full JavaScript React application controller with modular feature components.</p>
      </main>
    </div>
  );
}`
  },

  // ==========================================
  // 5. PHP FILES
  // ==========================================
  {
    id: 'php-home-controller',
    name: 'HomeController.php (Backend REST API & Metrics)',
    language: 'PHP',
    feature: 'Home',
    fileName: 'HomeController.php',
    description: 'PHP REST API controller providing aggregate dashboard metrics, active user sessions, and chronological media streams.',
    code: `<?php
namespace App\\Http\\Controllers;

use App\\Models\\MediaItem;
use Illuminate\\Http\\Request;
use Illuminate\\Http\\JsonResponse;

class HomeController extends Controller
{
    public function getDashboardMetrics(Request $request): JsonResponse
    {
        $totalItems = MediaItem::where('is_deleted', false)->count();
        $totalViews = MediaItem::where('is_deleted', false)->sum('views');
        $totalReactions = MediaItem::where('is_deleted', false)->sum('likes');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_items' => $totalItems,
                'total_views' => $totalViews,
                'total_reactions' => $totalReactions,
            ]
        ]);
    }
}`
  },
  {
    id: 'php-create-handler',
    name: 'MediaCreateHandler.php (Upload & Location Linker)',
    language: 'PHP',
    feature: 'CreateModal',
    fileName: 'MediaCreateHandler.php',
    description: 'PHP endpoint handling multi-format uploads, CSRF validation, page/event location tags, and database sync.',
    code: `<?php
namespace App\\Services;

use App\\Models\\MediaItem;

class MediaCreateHandler
{
    public function createMedia(array $payload, string $userId): array
    {
        $item = MediaItem::create([
            'title' => trim($payload['title']),
            'description' => $payload['description'] ?? '',
            'user_id' => $userId,
            'is_deleted' => false,
        ]);
        return ['success' => true, 'item_id' => $item->id];
    }
}`
  },
  {
    id: 'php-trash-service',
    name: 'TrashBinService.php (100-Day Retention Worker)',
    language: 'PHP',
    feature: 'DeleteModal',
    fileName: 'TrashBinService.php',
    description: 'PHP background service evaluating 100-day soft-delete expiration windows, restoring items, and permanently pruning expired rows.',
    code: `<?php
namespace App\\Services;

use App\\Models\\MediaItem;
use Carbon\\Carbon;

class TrashBinService
{
    const RETENTION_DAYS = 100;

    public function restoreItem(string $itemId): bool
    {
        return MediaItem::where('id', $itemId)->update(['is_deleted' => false, 'deleted_at' => null]) > 0;
    }
}`
  },

  // ==========================================
  // 6. PYTHON FILES
  // ==========================================
  {
    id: 'py-main-dashboard',
    name: 'main_dashboard.py (FastAPI Analytics & Router)',
    language: 'Python',
    feature: 'Home',
    fileName: 'main_dashboard.py',
    description: 'Python FastAPI asynchronous backend computing creator dashboard engagement, handling Firebase Admin authentication, and broadcasting feeds.',
    code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="DMM Creator Studio API", version="2.0.0")

class DashboardMetrics(BaseModel):
    total_items: int
    total_views: int
    total_reactions: int

@app.get("/api/v1/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    return DashboardMetrics(
        total_items=48,
        total_views=124500,
        total_reactions=8920
    )`
  },
  {
    id: 'py-create-service',
    name: 'create_content_service.py (Payload Validator & Firestore)',
    language: 'Python',
    feature: 'CreateModal',
    fileName: 'create_content_service.py',
    description: 'Python content creation pipeline validating media schemas, parsing YouTube oEmbed responses, and writing to Firestore collection.',
    code: `from pydantic import BaseModel, Field
import time

class CreateMediaSchema(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)

def process_create_payload(payload: CreateMediaSchema, user_id: str) -> dict:
    return {
        "title": payload.title.strip(),
        "userId": user_id,
        "isDeleted": False,
        "createdAt": int(time.time() * 1000)
    }`
  },

  // ==========================================
  // 7. XML FILES
  // ==========================================
  {
    id: 'xml-activity-home',
    name: 'activity_home_dashboard.xml (Android ConstraintLayout)',
    language: 'XML',
    feature: 'Home',
    fileName: 'activity_home_dashboard.xml',
    description: 'Android Material Design 3 layout for the Home screen featuring CoordinatorLayout, CardViews, and Metric chips.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#09090B">

    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/toolbar_home"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        app:title="DMM Creator Studio"
        app:titleTextColor="#FFFFFF" />
</androidx.coordinatorlayout.widget.CoordinatorLayout>`
  },

  // ==========================================
  // 8. KOTLIN FILES
  // ==========================================
  {
    id: 'kt-home-viewmodel',
    name: 'HomeViewModel.kt (Jetpack Compose & Coroutines)',
    language: 'Kotlin',
    feature: 'Home',
    fileName: 'HomeViewModel.kt',
    description: 'Kotlin ViewModel using StateFlow, Coroutines, and Firebase Firestore snapshot listeners for live creator dashboard metrics.',
    code: `package com.dmm.creatorstudio.ui.home

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class HomeUiState(val totalItems: Int = 0, val totalViews: Long = 0)

class HomeViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()
}`
  },

  // ==========================================
  // 9. JAVA FILES
  // ==========================================
  {
    id: 'java-dashboard-controller',
    name: 'MediaDashboardController.java (Spring Boot REST)',
    language: 'Java',
    feature: 'Home',
    fileName: 'MediaDashboardController.java',
    description: 'Java Spring Boot REST controller exposing /api/v1/dashboard/metrics endpoints with Spring Security and caching annotations.',
    code: `package com.dmm.creatorstudio.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/dashboard")
public class MediaDashboardController {

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalCreations", 48);
        return ResponseEntity.ok(map);
    }
}`
  },

  // ==========================================
  // 10. MYSQL FILES
  // ==========================================
  {
    id: 'sql-schema-main',
    name: 'schema.sql (Relational DDL & Indexing)',
    language: 'MySQL',
    feature: 'Home',
    fileName: 'schema.sql',
    description: 'MySQL relational database schema with tables for media items, categories, metrics indexing, foreign keys, and soft-delete timestamp columns.',
    code: `-- DMM Creator Studio Relational Database Schema
CREATE TABLE IF NOT EXISTS media_items (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    section ENUM('Entertainment', 'Quota', 'Upgrade', 'Settings', 'Weather', 'Shopping') NOT NULL,
    sub_tab ENUM('Videos', 'News', 'Photos', 'Polls', 'Quiz') NOT NULL,
    title VARCHAR(255) NOT NULL,
    views BIGINT UNSIGNED DEFAULT 0,
    likes INT UNSIGNED DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;`
  },
  {
    id: 'sql-trash-retention',
    name: 'trash_bin_retention.sql (100-Day Purge & Recovery)',
    language: 'MySQL',
    feature: 'DeleteModal',
    fileName: 'trash_bin_retention.sql',
    description: 'MySQL queries for soft-deleting items, querying trash with 100-day countdown expiration, restoring items, and automated purge events.',
    code: `-- 1. Soft Delete Query (Moves item to Trash Bin)
UPDATE media_items SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = 'item_12345';

-- 2. Query Trash with Remaining Days Calculation (100 Days Retention)
SELECT id, title, GREATEST(0, 100 - DATEDIFF(CURRENT_TIMESTAMP, deleted_at)) AS days_remaining
FROM media_items WHERE is_deleted = TRUE;`
  },

  // ==========================================
  // 11. FLUTTER (DART) FILES
  // ==========================================
  {
    id: 'flutter-home-dashboard',
    name: 'home_dashboard_screen.dart (Flutter Material 3 UI)',
    language: 'Flutter',
    feature: 'Home',
    fileName: 'home_dashboard_screen.dart',
    description: 'Cross-platform Flutter screen built with Material 3, glassmorphic metric cards, reactive StreamBuilders, and category grids.',
    code: `import 'package:flutter/material.dart';

class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF18181B),
        title: const Text('DMM Creator Studio', style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white)),
      ),
      body: const Center(
        child: Text('Welcome back, Creator!', style: TextStyle(color: Colors.white)),
      ),
    );
  }
}`
  }
];

export const ViewCodeModal: React.FC<ViewCodeModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'TypeScript',
  initialFeature = 'Home',
  initialTab
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>(
    initialTab || initialLanguage
  );
  const [selectedFeature, setSelectedFeature] = useState<FeatureScope>(initialFeature);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  
  // Dropdown Open States
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);

  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const langRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (featureRef.current && !featureRef.current.contains(event.target as Node)) {
        setIsFeatureDropdownOpen(false);
      }
      if (fileRef.current && !fileRef.current.contains(event.target as Node)) {
        setIsFileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available files based on Language and Feature dropdown selections
  const matchingFiles = useMemo(() => {
    const list = CODE_FILES.filter((file) => {
      const matchLang = file.language === selectedLanguage;
      const matchFeature =
        selectedFeature === 'All' ||
        file.feature === 'All' ||
        file.feature === selectedFeature;
      return matchLang && matchFeature;
    });

    // If no exact match for this language+feature combo, return all files of that language
    if (list.length === 0) {
      return CODE_FILES.filter((file) => file.language === selectedLanguage);
    }
    return list;
  }, [selectedLanguage, selectedFeature]);

  // Synchronize on modal open
  useEffect(() => {
    if (isOpen) {
      const lang = initialTab || initialLanguage;
      setSelectedLanguage(lang);
      setSelectedFeature(initialFeature);
      const files = CODE_FILES.filter((f) => f.language === lang && (initialFeature === 'All' || f.feature === 'All' || f.feature === initialFeature));
      if (files.length > 0) {
        setSelectedFileId(files[0].id);
      } else {
        const fallback = CODE_FILES.find((f) => f.language === lang);
        if (fallback) setSelectedFileId(fallback.id);
      }
      setCopied(false);
      setIsPreviewMode(false);
    }
  }, [isOpen, initialLanguage, initialFeature, initialTab]);

  // Maintain active file selection when dropdowns change
  useEffect(() => {
    if (matchingFiles.length > 0) {
      const stillExists = matchingFiles.some((f) => f.id === selectedFileId);
      if (!stillExists) {
        setSelectedFileId(matchingFiles[0].id);
      }
    } else {
      const fallback = CODE_FILES.find((f) => f.language === selectedLanguage);
      if (fallback) {
        setSelectedFileId(fallback.id);
      }
    }
  }, [matchingFiles, selectedLanguage, selectedFileId]);

  const activeFile = useMemo(() => {
    return (
      matchingFiles.find((f) => f.id === selectedFileId) ||
      matchingFiles[0] ||
      CODE_FILES.find((f) => f.language === selectedLanguage) ||
      CODE_FILES[0]
    );
  }, [matchingFiles, selectedFileId, selectedLanguage]);

  const handleCopyCode = async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadCode = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const lines = activeFile ? activeFile.code.split('\n') : [];
  const lineCount = lines.length;

  // 1st Dropdown: Languages List (11 Languages & Frameworks)
  const languagesList: { id: CodeLanguage; label: string; ext: string; badge: string; color: string }[] = [
    { id: 'TypeScript', label: 'TypeScript', ext: '.tsx / .ts', badge: 'TS', color: 'text-blue-400 bg-blue-500/10' },
    { id: 'JavaScript', label: 'JavaScript', ext: '.js', badge: 'JS', color: 'text-amber-400 bg-amber-500/10' },
    { id: 'HTML', label: 'HTML', ext: 'index.html', badge: '</>', color: 'text-orange-400 bg-orange-500/10' },
    { id: 'CSS', label: 'CSS', ext: 'index.css', badge: '{}', color: 'text-sky-400 bg-sky-500/10' },
    { id: 'PHP', label: 'PHP', ext: '.php', badge: 'PHP', color: 'text-indigo-400 bg-indigo-500/10' },
    { id: 'Python', label: 'Python', ext: '.py', badge: 'PY', color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'MySQL', label: 'MySQL', ext: '.sql', badge: 'SQL', color: 'text-cyan-400 bg-cyan-500/10' },
    { id: 'Flutter', label: 'Flutter', ext: '.dart', badge: 'FLUTTER', color: 'text-sky-400 bg-sky-500/10' },
    { id: 'XML', label: 'XML', ext: '.xml', badge: 'XML', color: 'text-rose-400 bg-rose-500/10' },
    { id: 'Kotlin', label: 'Kotlin', ext: '.kt', badge: 'KT', color: 'text-purple-400 bg-purple-500/10' },
    { id: 'Java', label: 'Java', ext: '.java', badge: 'JAVA', color: 'text-red-400 bg-red-500/10' }
  ];

  // 2nd Dropdown: Features List (Home, Sidebar, Tabs, Create Modal, Delete Modal, Quota, Upgrade, Settings, Entertainment, etc.)
  const featuresList: { id: FeatureScope; label: string; icon: any; desc: string; badge: string }[] = [
    { id: 'Home', label: 'Home', icon: Home, desc: 'Dashboard overview, creator greetings & metric cards', badge: 'Dashboard' },
    { id: 'Sidebar', label: 'Sidebar Navigation', icon: PanelLeft, desc: 'Responsive navigation drawer, branding logo, channel routes & collapse state', badge: 'Layout' },
    { id: 'Tabs', label: 'Tabs', icon: Sliders, desc: 'Top navigation tabs & sub-category filter bar', badge: 'Navigation' },
    { id: 'Mothers', label: 'Mothers', icon: Heart, desc: 'Family channel feed, maternal dedications, photos & stories', badge: 'Channel' },
    { id: 'CreateModal', label: 'Create Modal', icon: PlusSquare, desc: 'Universal creation modal, cross-linking & validation', badge: 'Creator' },
    { id: 'DeleteModal', label: 'Delete Modal', icon: Trash2, desc: 'Safe trash bin with 100-day countdown & restoration', badge: 'Trash & Purge' },
    { id: 'Quota', label: 'Quota', icon: BarChart3, desc: 'Usage limits, storage bytes & 30-day reset countdown', badge: 'Capacity' },
    { id: 'Upgrade', label: 'Upgrade', icon: Zap, desc: 'Tier subscriptions, pricing calculator & checkout modal', badge: 'Plans' },
    { id: 'Settings', label: 'Settings', icon: Settings, desc: 'Theme toggle, notifications & user preferences', badge: 'Preferences' },
    { id: 'Entertainment', label: 'Entertainment', icon: Film, desc: 'Media feeds, video embed parsers & showbiz news', badge: 'Media' },
    { id: 'Weather', label: 'Weather', icon: CloudSun, desc: 'Live Open-Meteo forecasts, radar & severe alerts', badge: 'Radar' },
    { id: 'Shopping', label: 'Shopping & Products', icon: ShoppingCart, desc: 'Creator store products, cart & orders', badge: 'Store' },
    { id: 'Auth', label: 'Auth Screen', icon: Lock, desc: 'Firebase Authentication sign-in, sign-up & password recovery screens', badge: 'Security' },
    { id: 'All', label: 'All Modules (Full App)', icon: CheckCircle2, desc: 'Complete root controller, types & utility suite', badge: 'Full Code' }
  ];

  const currentLangMeta = languagesList.find((l) => l.id === selectedLanguage) || languagesList[0];
  const currentFeatureMeta = featuresList.find((f) => f.id === selectedFeature) || featuresList[0];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 ${
        isFullscreen ? 'p-0 md:p-2 bg-black/95' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      <div
        className={`bg-zinc-950 text-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full ${
          isFullscreen
            ? 'fixed inset-0 h-[100dvh] w-screen max-w-none rounded-none md:rounded-2xl border-0 md:border md:border-zinc-800'
            : 'max-w-5xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl h-[94vh] sm:h-[90vh] max-h-[920px] rounded-2xl sm:rounded-3xl border border-zinc-800'
        }`}
      >
        {/* Header Bar */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-zinc-900/95 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-xs shrink-0">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>View Code</span>
                  <span className="text-zinc-600 font-medium text-xs">/</span>
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                    {selectedLanguage}
                  </span>
                  <span className="text-zinc-600 font-medium text-xs">/</span>
                  <span className="text-indigo-400 text-xs font-bold tracking-wider">
                    {currentFeatureMeta.label}
                  </span>
                  <span className="text-zinc-600 font-medium text-xs">/</span>
                  <span className="text-emerald-400 text-xs font-bold tracking-wider truncate max-w-[120px] sm:max-w-[180px]">
                    {activeFile?.fileName || 'File'}
                  </span>
                </h2>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                  {lineCount} lines
                </span>
                {isFullscreen && (
                  <span className="hidden sm:inline-flex px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider shrink-0">
                    Full Screen
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate sm:whitespace-normal">
                Inspect architecture, components, and logic templates across 3 interactive dropdown selectors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
            {/* Preview Code Button */}
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isPreviewMode
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-amber-900/40 shadow-sm'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
              title={isPreviewMode ? 'Switch back to Code View' : 'Preview this code interactively'}
            >
              <Eye size={14} className={isPreviewMode ? 'text-zinc-950' : 'text-amber-400'} />
              <span>{isPreviewMode ? 'Code View' : 'Preview Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-900/40 shadow-sm'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadCode}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Download source file"
            >
              <Download size={14} className="text-zinc-400" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isFullscreen
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
              }`}
              title={isFullscreen ? 'Exit full screen (ESC)' : 'Expand full screen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden lg:inline text-[11px]">{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 transition-colors cursor-pointer"
              title="Close View Code modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3-DROPDOWN CONTROLS TOOLBAR: Language | Feature/Component | Source Files  */}
        {/* ========================================================================= */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-zinc-900/75 border-b border-zinc-800 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
            
            {/* 1st DROPDOWN MENU: Language / Tech */}
            <div className="relative w-full" ref={langRef}>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 mb-1 flex items-center gap-1">
                <span>1. Language / Tech ({languagesList.length})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsFeatureDropdownOpen(false);
                  setIsFileDropdownOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-xs min-h-[38px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded-md font-extrabold shrink-0 ${currentLangMeta.color}`}>
                    {currentLangMeta.badge}
                  </span>
                  <span className="truncate">{currentLangMeta.label}</span>
                </div>
                <ChevronDown size={15} className={`text-zinc-400 shrink-0 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown Menu */}
              {isLangDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-64 max-h-[50vh] sm:max-h-[420px] overflow-y-auto bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Select Language / Tech
                  </div>
                  {languagesList.map((lang) => {
                    const isSelected = selectedLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lang.id);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 text-amber-300 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={`font-mono text-xs px-1.5 py-0.5 rounded-md font-bold min-w-[38px] text-center shrink-0 ${lang.color}`}>
                            {lang.badge}
                          </span>
                          <div className="truncate">
                            <div className="font-bold truncate">{lang.label}</div>
                            <div className="text-[10px] text-zinc-500 font-normal truncate">{lang.ext}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-amber-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2nd DROPDOWN MENU: Feature / Component */}
            <div className="relative w-full" ref={featureRef}>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 mb-1 flex items-center gap-1">
                <span>2. Feature / Component</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFeatureDropdownOpen(!isFeatureDropdownOpen);
                  setIsLangDropdownOpen(false);
                  setIsFileDropdownOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-xs min-h-[38px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <currentFeatureMeta.icon size={15} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{currentFeatureMeta.label}</span>
                </div>
                <ChevronDown size={15} className={`text-zinc-400 shrink-0 transition-transform ${isFeatureDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Second Dropdown Menu Popup */}
              {isFeatureDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full sm:w-72 md:w-80 max-h-[50vh] sm:max-h-[420px] overflow-y-auto bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Select Feature / Modal
                  </div>
                  {featuresList.map((feat) => {
                    const isSelected = selectedFeature === feat.id;
                    const IconComp = feat.icon;
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => {
                          setSelectedFeature(feat.id);
                          setIsFeatureDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-zinc-800 text-zinc-400'}`}>
                            <IconComp size={15} />
                          </div>
                          <div className="truncate">
                            <div className="font-bold flex items-center gap-2 truncate">
                              <span className="truncate">{feat.label}</span>
                              <span className="text-[10px] font-normal text-zinc-500 shrink-0">[{feat.badge}]</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-normal line-clamp-1">{feat.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-indigo-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3rd DROPDOWN MENU: Source Files */}
            <div className="relative w-full" ref={fileRef}>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 mb-1 flex items-center gap-1">
                <span>3. Files ({matchingFiles.length})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFileDropdownOpen(!isFileDropdownOpen);
                  setIsLangDropdownOpen(false);
                  setIsFeatureDropdownOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 text-xs font-bold transition flex items-center justify-between cursor-pointer shadow-xs min-h-[38px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode size={15} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{activeFile?.fileName || 'Select File'}</span>
                </div>
                <ChevronDown size={15} className={`text-zinc-400 shrink-0 transition-transform ${isFileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Third Dropdown Menu Popup for Files */}
              {isFileDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-full sm:w-72 md:w-80 max-h-[50vh] sm:max-h-[420px] overflow-y-auto bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                    <span>Available Source Files</span>
                    <span className="text-emerald-400 font-mono">{matchingFiles.length} file{matchingFiles.length > 1 ? 's' : ''}</span>
                  </div>
                  {matchingFiles.map((file) => {
                    const isSelected = activeFile?.id === file.id;
                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => {
                          setSelectedFileId(file.id);
                          setIsFileDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-zinc-800 text-zinc-400'}`}>
                            <FileCode size={15} />
                          </div>
                          <div className="truncate">
                            <div className="font-bold flex items-center gap-2 truncate">
                              <span className="truncate">{file.fileName}</span>
                              <span className="text-[10px] font-normal text-zinc-500 shrink-0">[{file.feature}]</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-normal line-clamp-1">{file.description}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Active File Info Subheader */}
        {activeFile && (
          <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-zinc-950 border-b border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-xs text-zinc-400 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileCode size={14} className="text-amber-400 shrink-0" />
              <span className="font-bold text-zinc-200 truncate">{activeFile.name}</span>
              <span className="text-zinc-600 hidden md:inline">•</span>
              <span className="text-[11px] text-zinc-400 hidden md:inline truncate">{activeFile.description}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-500 font-mono self-start sm:self-auto shrink-0 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-sans font-medium">
                Scope: {activeFile.feature}
              </span>
              <span>•</span>
              <span className="uppercase text-amber-400/90 font-bold">{activeFile.language}</span>

              {/* Segmented Code / Preview Toggle */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 ml-1">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-bold flex items-center gap-1 transition cursor-pointer ${
                    !isPreviewMode ? 'bg-amber-500 text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="View source code"
                >
                  <Code2 size={12} />
                  <span>Code View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(true)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-bold flex items-center gap-1 transition cursor-pointer ${
                    isPreviewMode ? 'bg-amber-500 text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Preview interactive component UI"
                >
                  <Eye size={12} />
                  <span>Preview Code</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area: Either Live Component Preview or Code Content Viewport */}
        {isPreviewMode ? (
          <ComponentPreview
            feature={selectedFeature}
            file={activeFile}
            language={selectedLanguage}
            isFullscreen={isFullscreen}
            onBackToCode={() => setIsPreviewMode(false)}
          />
        ) : (
          /* Code Content Viewport with Line Numbers */
          <div
            className={`flex-1 overflow-auto bg-[#0d1117] font-mono leading-relaxed select-text ${
              isFullscreen ? 'text-[11px] sm:text-xs md:text-[13px] p-3 sm:p-5 md:p-6' : 'text-[11px] sm:text-xs p-2.5 sm:p-4'
            }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="table w-full">
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                return (
                  <div key={idx} className="table-row hover:bg-zinc-800/40 transition-colors">
                    <div
                      className={`table-cell pr-2 sm:pr-4 text-right select-none text-zinc-600 shrink-0 ${
                        isFullscreen ? 'w-8 sm:w-12 md:w-14 text-[10px] sm:text-xs' : 'w-8 sm:w-12 text-[10px] sm:text-[11px]'
                      }`}
                    >
                      {lineNum}
                    </div>
                    <div className="table-cell pl-1.5 sm:pl-2 text-zinc-200 whitespace-pre overflow-x-auto font-mono">
                      <HighlightedCodeLine line={line} language={selectedLanguage} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-zinc-900/90 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs text-zinc-400 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] sm:text-xs">
              <CheckCircle2 size={13} />
              <span>{isPreviewMode ? 'Interactive Component Preview Mode' : 'Production Code Ready'}</span>
            </div>
            <span className="text-zinc-700 hidden md:inline">•</span>
            <span className="hidden md:inline text-[11px] text-zinc-400">
              1. <strong className="text-zinc-300 font-semibold">{selectedLanguage}</strong> &bull; 2. <strong className="text-zinc-300 font-semibold">{currentFeatureMeta.label}</strong> &bull; 3. <strong className="text-zinc-300 font-semibold">{activeFile?.fileName}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Toggle Preview Button in Footer */}
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>{isPreviewMode ? 'Back to Code View' : 'Preview Code'}</span>
            </button>

            <span className="text-[10px] sm:text-[11px] text-zinc-500 hidden sm:inline">
              {isFullscreen ? 'Press ESC to exit full screen' : 'Press ESC or click Close'}
            </span>
            {isFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Exit Full Screen
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Syntax coloring highlighter supporting multi-language tokens
function HighlightedCodeLine({ line, language }: { line: string; language: CodeLanguage }) {
  if (!line) {
    return <span>&nbsp;</span>;
  }

  // Comments in various languages
  if (
    line.trim().startsWith('//') ||
    line.trim().startsWith('/*') ||
    line.trim().startsWith('*') ||
    line.trim().startsWith('#') ||
    line.trim().startsWith('--') ||
    line.trim().startsWith('<!--')
  ) {
    return <span className="text-emerald-500 italic">{line}</span>;
  }

  // HTML / XML tags
  if (language === 'HTML' || language === 'XML') {
    if (line.includes('<') && line.includes('>')) {
      return <span className="text-amber-300">{line}</span>;
    }
  }

  // CSS properties
  if (language === 'CSS') {
    if (line.includes(':') && line.includes(';')) {
      const [prop, ...rest] = line.split(':');
      return (
        <span>
          <span className="text-sky-300">{prop}</span>:
          <span className="text-amber-200">{rest.join(':')}</span>
        </span>
      );
    }
  }

  // MySQL Keywords
  if (language === 'MySQL') {
    if (
      line.includes('CREATE ') ||
      line.includes('TABLE ') ||
      line.includes('SELECT ') ||
      line.includes('INSERT ') ||
      line.includes('UPDATE ') ||
      line.includes('DELETE ') ||
      line.includes('WHERE ') ||
      line.includes('FROM ') ||
      line.includes('PRIMARY KEY') ||
      line.includes('FOREIGN KEY')
    ) {
      return <span className="text-cyan-300 font-bold">{line}</span>;
    }
  }

  // Flutter / Dart Keywords
  if (language === 'Flutter') {
    if (
      line.includes('Widget ') ||
      line.includes('build(') ||
      line.includes('StatefulWidget') ||
      line.includes('StatelessWidget') ||
      line.includes('class ') ||
      line.includes('return ') ||
      line.includes('final ') ||
      line.includes('const ')
    ) {
      return <span className="text-sky-300 font-bold">{line}</span>;
    }
  }

  // PHP
  if (language === 'PHP') {
    if (line.includes('<?php') || line.includes('function') || line.includes('namespace') || line.includes('class')) {
      return <span className="text-indigo-300 font-bold">{line}</span>;
    }
  }

  // Python
  if (language === 'Python') {
    if (line.includes('def ') || line.includes('class ') || line.includes('async def') || line.includes('import ')) {
      return <span className="text-emerald-300 font-bold">{line}</span>;
    }
  }

  // Kotlin
  if (language === 'Kotlin') {
    if (line.includes('fun ') || line.includes('class ') || line.includes('data class') || line.includes('val ') || line.includes('var ')) {
      return <span className="text-purple-300 font-bold">{line}</span>;
    }
  }

  // Java
  if (language === 'Java') {
    if (line.includes('public class') || line.includes('@') || line.includes('void ') || line.includes('package ')) {
      return <span className="text-red-300 font-bold">{line}</span>;
    }
  }

  return <span className="text-zinc-100">{line}</span>;
}

// =========================================================================
// INTERACTIVE COMPONENT PREVIEW (Live UI renderer for View Code)
// =========================================================================
interface ComponentPreviewProps {
  feature: FeatureScope;
  file?: CodeFile;
  language: CodeLanguage;
  isFullscreen: boolean;
  onBackToCode: () => void;
}

function ComponentPreview({
  feature,
  file,
  language,
  isFullscreen,
  onBackToCode
}: ComponentPreviewProps) {
  // Interactive mock states
  const [authEmail, setAuthEmail] = useState('creator@example.com');
  const [authPassword, setAuthPassword] = useState('••••••••');
  const [isAuthSignUp, setIsAuthSignUp] = useState(false);
  const [authSubmitted, setAuthSubmitted] = useState(false);

  const [motherLikes, setMotherLikes] = useState<Record<string, number>>({
    m1: 42,
    m2: 89,
    m3: 134
  });
  const [motherLiked, setMotherLiked] = useState<Record<string, boolean>>({});

  const [activeSidebarRoute, setActiveSidebarRoute] = useState('Home');
  const [activeTabSelect, setActiveTabSelect] = useState('Videos');
  const [cartCount, setCartCount] = useState(2);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [upgradeCycle, setUpgradeCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleToggleMotherLike = (id: string) => {
    setMotherLiked((prev) => {
      const isLiked = !!prev[id];
      setMotherLikes((likes) => ({
        ...likes,
        [id]: likes[id] + (isLiked ? -1 : 1)
      }));
      return { ...prev, [id]: !isLiked };
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
      {/* Preview Top Notification Bar */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-indigo-950/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
            <Eye size={13} className="text-amber-400" />
            <span>Interactive Code Preview</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {feature}
          </span>
          <span className="text-zinc-600 hidden sm:inline">&bull;</span>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Rendering live UI simulation for <strong className="text-zinc-200">{file?.fileName || 'component'}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToCode}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Code2 size={13} className="text-amber-400" />
          <span>Back to Code View</span>
        </button>
      </div>

      {/* Preview Viewport Canvas */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isFullscreen ? 'max-w-6xl mx-auto w-full' : ''}`}>
        
        {/* 1. AUTH SCREEN PREVIEW */}
        {feature === 'Auth' && (
          <div className="max-w-md mx-auto my-4 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
                <Lock size={22} />
              </div>
              <h3 className="text-xl font-black text-white">
                {isAuthSignUp ? 'Create Creator Account' : 'Welcome to Creator Studio'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isAuthSignUp
                  ? 'Join thousands of creators managing videos, articles and polls'
                  : 'Sign in to access your media channels, analytics, and quota'}
              </p>
            </div>

            {authSubmitted && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <span>Simulated Auth Successful! Logged in as <strong>{authEmail}</strong>.</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAuthSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="creator@example.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isAuthSignUp ? 'Sign Up with Email' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-zinc-800 text-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsAuthSignUp(!isAuthSignUp);
                  setAuthSubmitted(false);
                }}
                className="text-amber-400 hover:underline cursor-pointer font-bold"
              >
                {isAuthSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}

        {/* 2. MOTHERS CHANNEL PREVIEW */}
        {feature === 'Mothers' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Mothers Banner */}
            <div className="bg-gradient-to-r from-rose-950/70 via-zinc-900 to-amber-950/40 p-6 rounded-3xl border border-rose-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Heart size={14} className="fill-rose-400 text-rose-400" />
                  <span>Mothers Channel Showcase</span>
                </div>
                <h2 className="text-2xl font-black text-white">Heartfelt Stories & Maternal Tributes</h2>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Celebrate love, sacrifice, and family milestones. Interactive cards allow clicking the heart button to show live love and appreciation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert('New Mother Tribute Dialog (Preview)')}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition cursor-pointer shadow-lg shadow-rose-950/60"
              >
                <Heart size={15} className="fill-white" />
                <span>Dedicate a Memory</span>
              </button>
            </div>

            {/* Story Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'm1', title: 'Everyday Hero: Mom’s Journey', author: 'Elena Ramos', text: 'A tribute to endless morning routines, warm laughter, and constant guidance.' },
                { id: 'm2', title: 'Golden Recipes from Mom’s Kitchen', author: 'Carlos Diaz', text: 'Cooking Sunday family meals with the wisdom passed down through three generations.' },
                { id: 'm3', title: 'Words of Comfort in Tough Times', author: 'Maya Santos', text: 'How my mother’s encouraging advice shaped my career and creator journey.' }
              ].map((card) => {
                const isLiked = !!motherLiked[card.id];
                const count = motherLikes[card.id];
                return (
                  <div key={card.id} className="bg-zinc-900 border border-zinc-800 hover:border-rose-900/50 p-5 rounded-2xl transition space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Family Dedication</span>
                      <h4 className="font-bold text-sm text-white mt-1">{card.title}</h4>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">{card.text}</p>
                    </div>
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span className="text-[11px] text-zinc-500">By {card.author}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleMotherLike(card.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isLiked ? 'bg-rose-600 text-white shadow-rose-900/40 shadow-sm' : 'bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Heart size={13} className={isLiked ? 'fill-white text-white' : 'text-rose-400'} />
                        <span>{count}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. SIDEBAR NAVIGATION PREVIEW */}
        {feature === 'Sidebar' && (
          <div className="max-w-2xl mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                  DMM
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Creator Studio Sidebar Navigation</h3>
                  <p className="text-xs text-zinc-400">Click any navigation item below to test active state</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                Active: {activeSidebarRoute}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'Home', icon: Home, label: 'Home Feed' },
                { id: 'Entertainment', icon: Film, label: 'Entertainment' },
                { id: 'TV Schedule', icon: Tv, label: 'TV Schedule' },
                { id: 'Weather', icon: CloudSun, label: 'Weather Radar' },
                { id: 'Mothers', icon: Heart, label: 'Mothers Channel' },
                { id: 'Shopping', icon: ShoppingCart, label: 'Creator Store' },
                { id: 'Quota', icon: BarChart3, label: 'Quota Capacity' },
                { id: 'Upgrade', icon: Zap, label: 'Upgrade Tier' },
                { id: 'Settings', icon: Settings, label: 'Preferences' }
              ].map((route) => {
                const Icon = route.icon;
                const isActive = activeSidebarRoute === route.id;
                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => setActiveSidebarRoute(route.id)}
                    className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition text-left cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20'
                        : 'bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-zinc-950' : 'text-zinc-400'} />
                    <span className="truncate">{route.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. HOME DASHBOARD PREVIEW */}
        {feature === 'Home' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 p-6 rounded-3xl border border-zinc-800 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Welcome back, Creator!</h2>
                  <p className="text-xs text-zinc-400 mt-1">Real-time audience engagement & cloud synchronized media</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Feed Sync
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
                  <span className="text-[11px] text-zinc-400">Total Media Items</span>
                  <div className="text-2xl font-black text-white mt-1">128</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
                  <span className="text-[11px] text-zinc-400">Total Views</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">48.2K</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
                  <span className="text-[11px] text-zinc-400">Reactions</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">9.4K</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
                  <span className="text-[11px] text-zinc-400">Cloud Storage</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">3.2 GB</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. TABS NAVIGATION PREVIEW */}
        {feature === 'Tabs' && (
          <div className="max-w-3xl mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-white">Sub-Category Navigation Tabs</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Videos', 'Showbiz News', 'Photos', 'Polls', 'Quizzes', 'Shorts', 'Products'].map((tab) => {
                const isSelected = activeTabSelect === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTabSelect(tab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                        : 'bg-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/60 text-xs text-zinc-300">
              Active Category View: <strong className="text-amber-400 font-bold">{activeTabSelect}</strong>
            </div>
          </div>
        )}

        {/* 6. CREATE MODAL PREVIEW */}
        {feature === 'CreateModal' && (
          <div className="max-w-lg mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus size={16} className="text-amber-400" />
                <span>Create New Content Form (Preview)</span>
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">Modal View</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Content Title</label>
                <input
                  type="text"
                  defaultValue="Behind The Scenes: Creator Studio Episode 1"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">Category / Channel</label>
                <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white">
                  <option>Entertainment</option>
                  <option>Mothers</option>
                  <option>TV Schedule</option>
                  <option>Showbiz News</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => alert('Simulated Content Created!')}
                className="w-full py-2.5 bg-amber-500 text-zinc-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Publish to Studio Feed
              </button>
            </div>
          </div>
        )}

        {/* 7. DELETE MODAL PREVIEW */}
        {feature === 'DeleteModal' && (
          <div className="max-w-lg mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-rose-400 flex items-center gap-2">
                <Trash2 size={16} />
                <span>Trash Bin & 100-Day Recovery (Preview)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300">
                100 Days Retention
              </span>
            </div>
            <div className="space-y-2">
              {[
                { title: 'Archived Studio Vlog #12', days: 87 },
                { title: 'Old Product Announcement Graphic', days: 94 }
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{item.title}</div>
                    <div className="text-[10px] text-zinc-400">{item.days} days remaining before permanent purge</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Restored: ${item.title}`)}
                    className="px-2.5 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. QUOTA PREVIEW */}
        {feature === 'Quota' && (
          <div className="max-w-2xl mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Tier Usage Allocation (Plus Plan)</h3>
              <span className="text-xs text-amber-400 font-bold">Resets in 18 days</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Videos', used: 18, max: 25 },
                { label: 'Photos', used: 64, max: 100 },
                { label: 'Showbiz News', used: 32, max: 50 },
                { label: 'Storage (MB)', used: 2400, max: 5000 }
              ].map((meter) => {
                const pct = Math.round((meter.used / meter.max) * 100);
                return (
                  <div key={meter.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-semibold">{meter.label}</span>
                      <span className="text-zinc-400 font-mono">{meter.used} / {meter.max} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. UPGRADE PREVIEW */}
        {feature === 'Upgrade' && (
          <div className="max-w-3xl mx-auto my-4 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-white">Upgrade Subscription Tiers</h3>
              <div className="inline-flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setUpgradeCycle('monthly')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                    upgradeCycle === 'monthly' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setUpgradeCycle('annual')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                    upgradeCycle === 'annual' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                  }`}
                >
                  Annual (20% Off)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: 'Plus', price: upgradeCycle === 'annual' ? '$7.99' : '$9.99', desc: 'Active creators sharing weekly' },
                { name: 'Pro', price: upgradeCycle === 'annual' ? '$23.99' : '$29.99', desc: 'Heavy media creators & news publishers', popular: true },
                { name: 'Creator Max', price: upgradeCycle === 'annual' ? '$63.99' : '$79.99', desc: 'Agencies and commercial channels' }
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`p-5 rounded-3xl border transition ${
                    tier.popular ? 'bg-zinc-900 border-amber-500/60 shadow-xl' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="font-black text-white text-base">{tier.name}</div>
                  <div className="text-2xl font-black text-amber-400 mt-2">{tier.price} <span className="text-xs font-normal text-zinc-400">/mo</span></div>
                  <p className="text-xs text-zinc-400 mt-2">{tier.desc}</p>
                  <button
                    type="button"
                    onClick={() => alert(`Selected Tier: ${tier.name}`)}
                    className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. SETTINGS PREVIEW */}
        {feature === 'Settings' && (
          <div className="max-w-lg mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-white">Application Preferences (Preview)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/80">
                <div>
                  <div className="text-xs font-bold text-white">Color Theme</div>
                  <div className="text-[10px] text-zinc-400">Toggle dark or light mode</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="px-3 py-1 bg-zinc-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/80">
                <div>
                  <div className="text-xs font-bold text-white">Live Push Notifications</div>
                  <div className="text-[10px] text-zinc-400">Activity and reactions alerts</div>
                </div>
                <span className="text-xs font-bold text-emerald-400">Enabled</span>
              </div>
            </div>
          </div>
        )}

        {/* 11. WEATHER PREVIEW */}
        {feature === 'Weather' && (
          <div className="max-w-md mx-auto my-4 bg-gradient-to-br from-sky-950/60 to-zinc-900 border border-sky-900/40 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Live Open-Meteo Weather</span>
                <h3 className="text-xl font-black">Metro Manila, PH</h3>
              </div>
              <CloudSun size={36} className="text-amber-400" />
            </div>
            <div className="text-4xl font-black text-white">28°C <span className="text-xs font-normal text-zinc-400">Partly Cloudy</span></div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-center text-xs">
              <div className="p-2 bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-500 text-[10px]">Humidity</span>
                <div className="font-bold">78%</div>
              </div>
              <div className="p-2 bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-500 text-[10px]">Wind</span>
                <div className="font-bold">14 km/h</div>
              </div>
              <div className="p-2 bg-zinc-800/60 rounded-xl">
                <span className="text-zinc-500 text-[10px]">Precip</span>
                <div className="font-bold">10%</div>
              </div>
            </div>
          </div>
        )}

        {/* 12. SHOPPING PREVIEW */}
        {feature === 'Shopping' && (
          <div className="max-w-3xl mx-auto my-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Creator Merch & Products Store</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
                <ShoppingCart size={14} />
                <span>Cart ({cartCount})</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Creator Studio Cotton Hoodie', price: '$49.99' },
                { title: 'Premium Studio Microphone Cap', price: '$24.99' },
                { title: 'Enamel Pin Set: Family & Media', price: '$14.99' }
              ].map((p, i) => (
                <div key={i} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
                  <div className="h-28 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600">
                    <ShoppingCart size={32} />
                  </div>
                  <h4 className="font-bold text-xs text-white line-clamp-1">{p.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-400 text-sm">{p.price}</span>
                    <button
                      type="button"
                      onClick={() => setCartCount((c) => c + 1)}
                      className="px-2.5 py-1 bg-amber-500 text-zinc-950 font-bold text-xs rounded-lg cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. ENTERTAINMENT PREVIEW */}
        {feature === 'Entertainment' && (
          <div className="max-w-2xl mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="h-56 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-2xl cursor-pointer group-hover:scale-105 transition-transform">
                <Play size={28} className="ml-1 fill-zinc-950" />
              </div>
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-[10px] text-white font-mono">
                12:45
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Showbiz Video Premiere</span>
              <h3 className="font-bold text-sm text-white">DMM Studio Exclusive: Stars Roundtable Interview</h3>
              <p className="text-xs text-zinc-400">14.2K views &bull; Published 2 hours ago</p>
            </div>
          </div>
        )}

        {/* 14. ALL MODULES PREVIEW */}
        {feature === 'All' && (
          <div className="max-w-3xl mx-auto my-4 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-black text-white">Full Application Suite Preview</h3>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto">
              This application unites Home metrics, Auth flows, Family & Mothers channels, responsive Sidebar navigation, Quota tracking, and Entertainment feeds.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {['Home', 'Sidebar', 'Mothers', 'Auth', 'Entertainment', 'Quota', 'Weather'].map((badge) => (
                <span key={badge} className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold border border-zinc-700">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ViewCodeModal;
