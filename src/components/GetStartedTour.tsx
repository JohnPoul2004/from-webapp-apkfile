import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Plus,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Tv,
  Film,
  Newspaper,
  Image as ImageIcon,
  CheckSquare,
  HelpCircle,
  BarChart3
} from 'lucide-react';

export interface GetStartedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection?: (section: any) => void;
  onTriggerCreate?: () => void;
  isDarkMode?: boolean;
}

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  targetLabel: string;
  highlightTag: string;
  tips: string[];
  actionBtnText?: string;
  accentColor: string;
}

export const GetStartedTour: React.FC<GetStartedTourProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  onTriggerCreate,
  isDarkMode = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Creator Dashboard',
      subtitle: 'Real-time hub for all your channels and multi-media content',
      description:
        'Manage, publish, and track engagement across entertainment videos, breaking news, curated photo galleries, audience polls, and interactive quizzes all in one place.',
      icon: Compass,
      targetLabel: 'Main Workspace',
      highlightTag: 'Overview',
      tips: [
        'Live engagement stats for likes, reacts, shares, and comments',
        'Built-in quota tracking with real-time Firestore synchronization',
        'Instant Dark / Light mode toggle at the top right'
      ],
      accentColor: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'navigation',
      title: 'Primary Dashboard Navigation',
      subtitle: 'Seamlessly switch channels, pages, and tools',
      description:
        'Use the sidebar navigation on desktop (or the top-left hamburger menu on mobile & tablet) to jump between primary sections: Pages, Events, Entertainment, Replay, Coding, News, Quota & Settings.',
      icon: Layers,
      targetLabel: 'Sidebar & Channel Hub',
      highlightTag: 'Navigation',
      tips: [
        'Explore Entertainment, Replay, Coding, and News channels',
        'Manage Pages, Events, and member roles from dedicated managers',
        'Check Quota limits anytime to stay ahead of tier capacity'
      ],
      accentColor: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400'
    },
    {
      id: 'subtabs',
      title: 'Content Category Tabs',
      subtitle: 'Videos, News, Photos, Polls, and Quizzes',
      description:
        'Inside any media channel, use the sub-tabs toolbar to filter between media types. Each category comes with customized fields, video embed players, gallery viewers, and interactive voting.',
      icon: Film,
      targetLabel: 'Category Filter Bar',
      highlightTag: '5 Media Channels',
      tips: [
        'Videos: Supports YouTube, Facebook, Threads, Instagram & Dailymotion',
        'Photos: Multi-photo albums with scroll & slideshow modes',
        'Polls & Quizzes: Live voting, scoring, and instant community answers'
      ],
      accentColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'create',
      title: "The 'Create' Action Button",
      subtitle: 'Publish new items with AI-assisted drafting & instant preview',
      description:
        "The primary 'Create' button is located in the top action toolbar across all media channels. Tap it to launch the rich Creation Modal equipped with Gemini AI descriptions, cover image upload, and customizable visibility settings.",
      icon: Plus,
      targetLabel: 'Primary Create Button',
      highlightTag: 'Create Content',
      tips: [
        'AI Generation: Generate engaging descriptions with one click',
        'Visibility Controls: Publish as Public, Unlisted, or Private',
        'Safety & Trash: Soft-delete with 30-day restore protection'
      ],
      accentColor: 'from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400'
    },
    {
      id: 'ready',
      title: "You're Ready to Create!",
      subtitle: 'Take your network to the next level',
      description:
        'You can revisit this quick tour anytime from the Help section or the dashboard header. Start by publishing your first post or exploring the channel metrics.',
      icon: Sparkles,
      targetLabel: 'Get Started',
      highlightTag: 'Complete',
      tips: [
        'Need assistance? Head over to the Help tab for complete video embedding guides',
        'Check out Quota & Upgrades to unlock higher limits and premium features'
      ],
      accentColor: 'from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400'
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Reset to first step when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinishTour();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length]);

  const handleFinishTour = () => {
    try {
      localStorage.setItem('dmm_get_started_tour_completed', 'true');
    } catch {
      // ignore localStorage errors
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinishTour();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSpecialAction = () => {
    handleNext();
  };

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Animated Dark Backdrop with subtle radial glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleFinishTour}
          className="fixed inset-0 bg-zinc-950/75 backdrop-blur-md cursor-pointer"
        />

        {/* Tour Modal Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Gradient Banner */}
          <div className="relative h-24 sm:h-28 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 p-4 sm:p-6 flex items-center justify-between overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="absolute left-1/3 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-lg pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-inner">
                <StepIcon size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                    {currentStep.highlightTag}
                  </span>
                  <span className="text-zinc-400 text-xs font-semibold">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight mt-0.5">
                  Get Started Tour
                </h3>
              </div>
            </div>

            {/* Close / Skip button */}
            <button
              type="button"
              onClick={handleFinishTour}
              className="relative z-10 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Close tour"
              aria-label="Close tour"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content with AnimatePresence per step */}
          <div className="p-5 sm:p-7 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {currentStep.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                    {currentStep.subtitle}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
                  {currentStep.description}
                </div>

                {/* Key Features / Highlights Checklist */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Highlights & Best Practices
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {currentStep.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800"
                      >
                        <CheckCircle2
                          size={15}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <span className="font-medium">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional interactive direct action trigger */}
                {currentStep.actionBtnText && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleSpecialAction}
                      className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-200 dark:border-zinc-700"
                    >
                      <span>{currentStep.actionBtnText}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls & Step Navigation */}
          <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Step Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((s, idx) => {
                const isActive = idx === currentStepIndex;
                const isPast = idx < currentStepIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-7 bg-zinc-900 dark:bg-zinc-100'
                        : isPast
                        ? 'w-2 bg-zinc-400 dark:bg-zinc-600'
                        : 'w-2 bg-zinc-200 dark:bg-zinc-800'
                    }`}
                    title={`Go to step ${idx + 1}: ${s.title}`}
                    aria-label={`Go to step ${idx + 1}: ${s.title}`}
                  />
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleFinishTour}
                className="px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer min-h-[38px]"
              >
                Skip Tour
              </button>

              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] active:scale-98"
              >
                <span>
                  {currentStepIndex === steps.length - 1 ? 'Got it, let’s go!' : 'Next'}
                </span>
                {currentStepIndex < steps.length - 1 && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GetStartedTour;
