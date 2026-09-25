import React, { useState } from 'react';
import {
  HelpCircle,
  Video,
  Newspaper,
  Image,
  BarChart2,
  HelpCircle as QuizIcon,
  Search,
  CheckCircle2,
  Layers,
  Calendar,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  Zap,
  Trash2,
  Sliders,
  Compass,
  AlertOctagon,
  Code2,
  FileCode,
  FileText
} from 'lucide-react';
import { ViewCodeModal, CodeLanguage, FeatureScope } from './ViewCodeModal';

interface HelpViewProps {
  onStartTour?: () => void;
}

export type HelpCategory =
  | 'All'
  | 'Videos'
  | 'News'
  | 'Photos'
  | 'Polls'
  | 'Quiz'
  | 'Pages'
  | 'Events'
  | 'Delete'
  | 'Quota'
  | 'Upgrade'
  | 'Errors';

export interface HelpTopic {
  id: string;
  category: HelpCategory;
  title: string;
  badge: string;
  icon: React.FC<{ size?: number; className?: string }>;
  description: string;
  targetSection?: string;
  createLabel?: string;
  steps: string[];
  tips: string[];
  faqs: { q: string; a: string }[];
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'videos-help',
    category: 'Videos',
    title: 'Videos Help & Embedding Guide',
    badge: 'Videos',
    icon: Video,
    targetSection: 'Entertainment',
    createLabel: 'Video',
    description:
      'Learn how to embed video content from major platforms (YouTube, Facebook, Instagram, Threads, Dailymotion) or generate Slideshow Videos from custom photo galleries.',
    steps: [
      'Navigate to any media category in the sidebar (e.g. Entertainment, Coding, Tech) and ensure the "Videos" sub-tab is active.',
      'Click the "Create Video" button located at the top right of the toolbar.',
      'Select your Embed Platform: choose from YouTube, Facebook, Instagram, Threads, Dailymotion, or Slideshow Photos.',
      'Paste the full video URL or configure your slideshow photos and timing intervals.',
      'Enter a clear, descriptive title for the video and optionally add formatted notes or transcripts in the document editor.',
      'Select the Page Location or Event Location to automatically cross-link this video to relevant Pages and Events.',
      'Choose Visibility ("Public" or "Private") and click "Create Video" to save.'
    ],
    tips: [
      'Ensure YouTube URLs are public or unlisted. Shorts, standard watch links, and embed URLs are all automatically parsed.',
      'For Slideshow Photos, upload high-resolution images to produce clear HD slideshow sequences.',
      'Cross-linked videos automatically appear inside the "View Page" or "View Event" detail modal under the Videos sub-tab.'
    ],
    faqs: [
      {
        q: 'Which video platforms are supported?',
        a: 'We support YouTube, Facebook Watch & Reels, Instagram Reels & Videos, Threads video links, Dailymotion, and custom Slideshow Photo compilations.'
      },
      {
        q: 'How does linking videos to Pages or Events work?',
        a: 'When creating a video, select an existing Page or Event from the Location dropdown. The video will be indexed so visitors viewing that specific Page or Event will see it directly in the linked media tab.'
      },
      {
        q: 'Can I edit or delete a video later?',
        a: 'Yes! Click on any video card to open its detail view, or click the menu (⋮) to edit details or delete the video. Deleted items are safely preserved in the Trash with 100-day recovery.'
      }
    ]
  },
  {
    id: 'news-help',
    category: 'News',
    title: 'News & Showbiz Articles Help',
    badge: 'Showbiz News',
    icon: Newspaper,
    targetSection: 'News',
    createLabel: 'Showbiz News',
    description:
      'Publish breaking stories, celebrity news, industry updates, and editorials with cover images and rich document formatting.',
    steps: [
      'Select any dashboard section from the sidebar and switch to the "Showbiz News" (or News) sub-tab.',
      'Click the "Create Showbiz News" button at the top of the screen.',
      'Upload or provide a high-impact Cover Photo URL representing the headline story.',
      'Enter an engaging article title and compose your story using the rich document formatting editor.',
      'Tag the news item with Page Location or Event Location if the story covers a specific entity or live occurrence.',
      'Set the publication status (Published, Draft, or Public) and submit to save.'
    ],
    tips: [
      'Use catchy, informative titles under 80 characters for optimal visibility across card grids.',
      'Add formatting such as bold text, bullet points, and headers in the article editor to improve readability.',
      'Linked news articles will automatically display in the corresponding Page or Event detail tabs.'
    ],
    faqs: [
      {
        q: 'Can I include hyperlinks and formatting in news articles?',
        a: 'Yes, the document editor supports rich formatting, headers, paragraphs, and lists.'
      },
      {
        q: 'What image format is best for news cover photos?',
        a: 'JPG, PNG, and WebP images formatted in 16:9 or 4:3 aspect ratios work best for news preview cards.'
      },
      {
        q: 'How do I organize news by category?',
        a: 'Navigate to the relevant sidebar section (e.g. Entertainment, Music, Sports, Tech) before clicking Create to automatically categorize your story.'
      }
    ]
  },
  {
    id: 'photos-help',
    category: 'Photos',
    title: 'Photos & Gallery Management Help',
    badge: 'Photos',
    icon: Image,
    targetSection: 'Entertainment',
    createLabel: 'Photos',
    description:
      'Upload, organize, and showcase photo albums, multi-image galleries, captions, and interactive slideshow viewports.',
    steps: [
      'Navigate to your desired category and select the "Photos" sub-tab.',
      'Click "Create Photos" in the top toolbar.',
      'Specify the primary Cover Photo which serves as the preview thumbnail.',
      'Add secondary gallery pictures using the "Other Photos" field to build a multi-image album.',
      'Add individual photo captions and descriptions to provide context for each slide.',
      'Attach the photo album to a Page or Event if applicable, then save.'
    ],
    tips: [
      'You can add multiple additional photos to create rich multi-photo slideshow experiences.',
      'Click on any photo card to open the interactive photo slideshow player with fullscreen and navigation controls.',
      'Photos linked to Pages or Events appear automatically inside their dedicated detail popups.'
    ],
    faqs: [
      {
        q: 'How many photos can I include in a single photo post?',
        a: 'You can add a cover photo plus multiple gallery images within your account quota limits.'
      },
      {
        q: 'How does the Slideshow Player work?',
        a: 'When opening a photo item, the built-in Slideshow Player lets viewers navigate through images with keyboard arrow keys or touch swipe gestures.'
      },
      {
        q: 'Can I delete individual pictures?',
        a: 'Yes, while editing a photo album you can add or remove individual photos from the gallery list.'
      }
    ]
  },
  {
    id: 'polls-help',
    category: 'Polls',
    title: 'Interactive Polls & Voting Help',
    badge: 'Polls',
    icon: BarChart2,
    targetSection: 'Entertainment',
    createLabel: 'Polls',
    description:
      'Engage your audience with interactive multiple-choice polls, real-time voting percentages, question customization, and community feedback.',
    steps: [
      'Select any sidebar category and switch to the "Polls" sub-tab.',
      'Click the "Create Polls" button.',
      'Enter your Poll Question in the title/question field.',
      'Add 2 to 10 response options for participants to vote on.',
      'Optionally upload a Cover Image to make the poll visually distinctive in the feed.',
      'Add background context or instructions in the document description field.',
      'Select linked Pages or Events if this poll is part of a specific show or gathering, then publish.'
    ],
    tips: [
      'Keep options concise and distinct to encourage maximum participant response.',
      'Use the live preview on the card to inspect how the percentage bars and vote totals will render.',
      'Link polls to live Events to collect instant audience feedback during streams or broadcasts.'
    ],
    faqs: [
      {
        q: 'How are poll percentages calculated?',
        a: 'Percentages are computed dynamically based on the total number of votes cast across all available options.'
      },
      {
        q: 'Can users change their vote?',
        a: 'Poll options update seamlessly upon user interaction, recording one selection per session.'
      },
      {
        q: 'Can I add more than two options to a poll?',
        a: 'Yes! You can add multiple options using the "+ Add Option" button in the Create Poll modal.'
      }
    ]
  },
  {
    id: 'quiz-help',
    category: 'Quiz',
    title: 'Interactive Quiz & Trivia Help',
    badge: 'Quizzes',
    icon: QuizIcon,
    targetSection: 'Entertainment',
    createLabel: 'Quiz',
    description:
      'Create engaging trivia tests, knowledge quizzes, multi-question challenges, and educational assessments with instant scoring feedback.',
    steps: [
      'Choose a sidebar category and click on the "Quiz" (Quizzes) sub-tab.',
      'Click "Create Quiz" at the top right of the toolbar.',
      'Enter the Quiz Title and an introductory description or instructions.',
      'Add one or more questions. For each question, provide 2 to 4 answer choices.',
      'Mark the Correct Answer radio button for each question so the quiz engine can evaluate scores.',
      'Optionally upload a Cover Graphic to give your trivia quiz an attractive banner.',
      'Link to relevant Pages or Events and click "Create Quiz".'
    ],
    tips: [
      'Create 3 to 10 questions for ideal participant engagement and completion rates.',
      'Test your quiz after publishing by clicking on the quiz card in the dashboard grid.',
      'Quizzes linked to a Page or Event can be directly accessed from the View Page/Event modal.'
    ],
    faqs: [
      {
        q: 'How does quiz scoring work?',
        a: 'When users submit their answers, the quiz engine tallies correct responses and displays immediate percentage and score summaries.'
      },
      {
        q: 'Can I have multiple questions in one quiz?',
        a: 'Yes! You can add unlimited questions per quiz, each with its own set of customized multiple-choice options.'
      },
      {
        q: 'How do I edit existing quiz questions?',
        a: 'Open the quiz card, click the Edit button (or ⋮ menu), modify the questions/answers, and save your changes.'
      }
    ]
  },
  {
    id: 'pages-help',
    category: 'Pages',
    title: 'Page Creation & Location Management Help',
    badge: 'Pages & Hubs',
    icon: Layers,
    targetSection: 'Pages',
    createLabel: 'Page',
    description:
      'Build hub pages, brand profiles, and topic collections, customize cover banners, and automatically aggregate all linked videos, news, photos, polls, and quizzes using Page Locations.',
    steps: [
      'Click on "Pages" in the left sidebar navigation to enter the Pages Hub.',
      'Click the "+ Create Page" button at the top right of the header.',
      'Enter the Page Title (e.g., "Marvel Cinematic Universe", "Tech Hub", "Daily Vlog").',
      'Assign a unique Page Location tag (e.g., "Hollywood", "Studio A", "Silicon Valley") which links media items across all sections.',
      'Upload or input a high-resolution Cover Photo and provide a detailed page bio or description in the document editor.',
      'Click "Create Page" to publish.',
      'Click on any page card to open the View Page modal and explore all media linked to that page across Videos, News, Photos, Polls, and Quizzes.'
    ],
    tips: [
      'Use memorable, standardized Page Location names to make cross-tagging media seamless across all dashboard categories.',
      'Inside the View Page modal, use the sub-tabs (Videos, Showbiz News, Photos, Polls, Quizzes) and search bar to filter all attached media.',
      'You can edit or update a page anytime by clicking the Edit button on the page card.'
    ],
    faqs: [
      {
        q: 'How do videos and news appear on my page?',
        a: 'When creating videos, news, photos, polls, or quizzes, select your page in the Page Location dropdown. They will automatically appear inside that Page’s detail popup.'
      },
      {
        q: 'Can I change the cover photo or title later?',
        a: 'Yes, clicking "Edit Page" allows you to modify all attributes without losing any linked media connections.'
      },
      {
        q: 'What happens if I delete a page?',
        a: 'Deleting a page moves it to the Deleted Pages trash. Linked media items remain intact and can be re-linked to other pages.'
      }
    ]
  },
  {
    id: 'events-help',
    category: 'Events',
    title: 'Event Scheduling & Live Coverage Help',
    badge: 'Events & Live',
    icon: Calendar,
    targetSection: 'Events',
    createLabel: 'Event',
    description:
      'Master event scheduling, start/end dates, timezone management, physical/virtual Event Locations, live coverage status, and media aggregation for festivals, conferences, and streams.',
    steps: [
      'Click "Events" in the sidebar navigation.',
      'Click "+ Create Event" in the top header.',
      'Enter the Event Name and select its Start Date/Time and End Date/Time.',
      'Set the Event Location (e.g., "Madison Square Garden", "Online Stream", "Main Stage") to link event-specific broadcasts and content.',
      'Upload a Cover Banner image and provide the event agenda, ticket info, or stream notes in the document editor.',
      'Select the event status (Scheduled, Live, Completed, or Draft) and save.'
    ],
    tips: [
      'Set events to "Live" during broadcasts to highlight active sessions in the dashboard.',
      'Link live stream videos, photo galleries, and real-time polls to the event location so attendees have a unified live hub.',
      'Use the search and date filters in the Events manager to quickly locate upcoming or archived events.'
    ],
    faqs: [
      {
        q: 'How does event media linking work?',
        a: 'Any media item created with this Event’s Location tag will automatically populate the Videos, News, Photos, Polls, and Quizzes tabs inside the View Event detail modal.'
      },
      {
        q: 'Can I schedule multi-day events?',
        a: 'Yes, set distinct Start and End dates to cover single-day or multi-day conventions.'
      },
      {
        q: 'Can I restore an event if deleted accidentally?',
        a: 'Yes, deleted events are safely held in the Deleted Events trash for 100 days.'
      }
    ]
  },
  {
    id: 'delete-help',
    category: 'Delete',
    title: 'Delete & Trash Recovery Help (100-Day Safe Retention)',
    badge: 'Trash & Recovery',
    icon: Trash2,
    targetSection: 'Home',
    description:
      'Understand the trash workflow, 100-day safe retention policy, one-click restoration, permanent cleanup, and search filters for deleted videos, news, photos, polls, quizzes, pages, and events.',
    steps: [
      'To delete any active item, click the menu (⋮) on its card or detail modal and choose "Delete". Confirm the prompt.',
      'The item is safely moved to the Deleted Trash bin and immediately removed from public feeds.',
      'To view deleted content, click the "Deleted [Type]" button on the top toolbar or header in any section.',
      'Inside the Deleted Modal, browse all deleted items with their deletion timestamp, original location, and days remaining.',
      'Click "Restore" to instantly return an item to active status with all linked content preserved.',
      'Click "Permanently Delete" to irrevocably remove the item and free up quota storage.'
    ],
    tips: [
      'All deleted items are retained for 100 full days before automatic expiration, preventing accidental data loss.',
      'Restoring an item restores all its metadata, views, comments, options, and location tags without corruption.',
      'Use the search bar inside the Deleted Modal to find deleted content quickly by title or ID.'
    ],
    faqs: [
      {
        q: 'How long do items stay in the trash before being permanently erased?',
        a: 'Items remain recoverable for 100 days from their deletion date.'
      },
      {
        q: 'Does deleting an item free up my quota immediately?',
        a: 'Soft-deleted items count toward quota until permanently deleted or restored. Use "Permanently Delete" in the Trash modal to instantly reclaim capacity.'
      },
      {
        q: 'Can I restore multiple items at once?',
        a: 'You can individually review and restore any item with a single click from the Deleted Modal.'
      }
    ]
  },
  {
    id: 'quota-help',
    category: 'Quota',
    title: 'Quota & Storage Management Help',
    badge: 'Quota & Limits',
    icon: Sliders,
    targetSection: 'Quota',
    description:
      'Monitor your real-time resource consumption, understand tier allowances across all media types, track cloud database limits, and avoid quota overages.',
    steps: [
      'Click "Quota" in the sidebar navigation to open the Resource Monitor.',
      'Review the overall Storage Meter showing used capacity vs total storage allowance.',
      'Inspect individual breakdown gauges for Videos, News Articles, Photo Albums, Polls, Quizzes, Pages, and Events.',
      'Check the Daily API and Generation limits to ensure uninterrupted AI and slideshow processing.',
      'If your quota approaches 80% or 100%, consider archiving/permanently deleting old trash or upgrading to a higher plan.'
    ],
    tips: [
      'Regularly empty items from the Deleted Trash to free up storage space.',
      'Use optimized image formats (WebP/JPG) for cover photos to stay well within photo storage ceilings.',
      'The Quota dashboard refreshes in real-time as you create or delete content.'
    ],
    faqs: [
      {
        q: 'What happens when I reach 100% of my quota limit?',
        a: 'You will be notified to either clean up unused items in your Trash or upgrade your plan to unlock expanded limits.'
      },
      {
        q: 'How often do daily quotas reset?',
        a: 'Daily request and processing quotas reset automatically every 24 hours at midnight UTC.'
      },
      {
        q: 'Do deleted items consume quota?',
        a: 'Soft-deleted items in the 100-day trash retain their slot until permanently deleted or restored.'
      }
    ]
  },
  {
    id: 'upgrade-help',
    category: 'Upgrade',
    title: 'Upgrade & Subscription Plans Help',
    badge: 'Upgrade Plans',
    icon: Zap,
    targetSection: 'Upgrade',
    description:
      'Compare plan tiers (Free Starter, Creator Pro, Enterprise VIP), discover premium capabilities (unlimited items, priority cloud storage, custom branding, HD export), and manage billing.',
    steps: [
      'Click "Upgrade" in the sidebar to open the pricing and plan comparison dashboard.',
      'Compare the feature matrix across Starter (Free), Creator Pro, and Enterprise tiers.',
      'Select your preferred billing cycle (Monthly or Annual with 20% discount).',
      'Click "Upgrade to Pro" or "Get Enterprise" to initiate the upgrade flow.',
      'Once activated, your quota limits increase instantly without any downtime or data migration needed.'
    ],
    tips: [
      'Annual billing saves 20% compared to monthly subscriptions.',
      'Creator Pro is ideal for active content creators needing unlimited video embeds, news articles, and custom page locations.',
      'Enterprise tier includes dedicated support, custom domain mapping, and white-label branding options.'
    ],
    faqs: [
      {
        q: 'Can I switch plans or cancel at any time?',
        a: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time with prorated adjustments.'
      },
      {
        q: 'Will my existing content be affected when I upgrade?',
        a: 'No, all existing pages, events, shopping products, videos, news, photos, polls, and quizzes are automatically preserved with higher quotas.'
      },
      {
        q: 'What payment methods are supported?',
        a: 'We accept all major credit cards, debit cards, PayPal, and Google Pay through secure checkout.'
      }
    ]
  },
  {
    id: 'errors-help',
    category: 'Errors',
    title: 'HTTP Status Code & Error Pages Directory',
    badge: 'Error Pages',
    icon: AlertOctagon,
    targetSection: 'Errors',
    description:
      'Explore standard HTTP 4xx Client Errors badged with the Solo Parent Icon, and 5xx Server Errors badged with the Parents Icon.',
    steps: [
      'Click "Errors" in the sidebar to open the full HTTP error pages directory.',
      'Filter between All (40 codes), 4xx Client Errors (29 codes), or 5xx Server Errors (11 codes).',
      'Click "View Error Page" on any error card to launch the live full-screen error simulation page.',
      'Copy standard status code definitions or view in-depth RFC technical specifications and troubleshooting tips.'
    ],
    tips: [
      '4xx client errors (400 to 451) are paired with the Solo Parent Icon.',
      '5xx server errors (500 to 511) are paired with the Parents Icon.',
      'All error codes include actionable troubleshooting checklists and RFC standard references.'
    ],
    faqs: [
      {
        q: 'Which error codes have the Solo Parent Icon?',
        a: 'All 29 standard 4xx Client Error codes: 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, and 451.'
      },
      {
        q: 'Which error codes have the Parents Icon?',
        a: 'All 11 standard 5xx Server Error codes: 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, and 511.'
      },
      {
        q: 'Can I preview what an error page looks like?',
        a: 'Yes, clicking "View Error Page" renders the exact responsive error layout with custom headers, diagnostic recommendations, and return actions.'
      }
    ]
  }
];

export const HelpView: React.FC<HelpViewProps> = ({ onStartTour }) => {
  const [activeCategory, setActiveCategory] = useState<HelpCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [isViewCodeOpen, setIsViewCodeOpen] = useState(false);
  const [viewCodeInitialLang, setViewCodeInitialLang] = useState<CodeLanguage>('TypeScript');
  const [viewCodeInitialFeature, setViewCodeInitialFeature] = useState<FeatureScope>('Home');

  const handleOpenViewCode = (
    lang: CodeLanguage = 'TypeScript',
    feature: FeatureScope = 'Home'
  ) => {
    setViewCodeInitialLang(lang);
    setViewCodeInitialFeature(feature);
    setIsViewCodeOpen(true);
  };

  // Filter topics based on category and search query
  const filteredTopics = HELP_TOPICS.filter((topic) => {
    const matchesCategory =
      activeCategory === 'All' || topic.category === activeCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = topic.title.toLowerCase().includes(q);
    const matchesDesc = topic.description.toLowerCase().includes(q);
    const matchesFaq = topic.faqs.some(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
    const matchesSteps = topic.steps.some((s) => s.toLowerCase().includes(q));
    const matchesBadge = topic.badge.toLowerCase().includes(q);
    return matchesTitle || matchesDesc || matchesFaq || matchesSteps || matchesBadge;
  });

  const toggleFaq = (key: string) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6 px-1 sm:px-4">
      {/* Header Banner */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 text-zinc-300 text-xs font-semibold border border-zinc-700/60">
                <HelpCircle size={14} className="text-amber-400" />
                <span>Help Center & Documentation</span>
              </div>
              
              {/* View Code Button */}
              <button
                type="button"
                onClick={() => handleOpenViewCode('TypeScript')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-colors cursor-pointer shadow-2xs group"
                title="View Source Code with TypeScript, HTML, CSS & JavaScript tabs"
              >
                <Code2 size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>View Code</span>
              </button>

              {onStartTour && (
                <button
                  type="button"
                  onClick={onStartTour}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/40 transition-colors cursor-pointer shadow-2xs"
                >
                  <Compass size={13} className="text-indigo-400" />
                  <span>Start Get Started Tour</span>
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Help Center & Creator Guides
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Complete guides, step-by-step walkthroughs, and FAQs for{' '}
              <span className="text-zinc-200 font-semibold">Videos</span>,{' '}
              <span className="text-zinc-200 font-semibold">News</span>,{' '}
              <span className="text-zinc-200 font-semibold">Photos</span>,{' '}
              <span className="text-zinc-200 font-semibold">Polls</span>,{' '}
              <span className="text-zinc-200 font-semibold">Quizzes</span>,{' '}
              <span className="text-zinc-200 font-semibold">Pages</span>,{' '}
              <span className="text-zinc-200 font-semibold">Events</span>,{' '}
              <span className="text-zinc-200 font-semibold">Trash & Delete</span>,{' '}
              <span className="text-zinc-200 font-semibold">Quota</span>, and{' '}
              <span className="text-zinc-200 font-semibold">Upgrade</span>.
            </p>
          </div>

          {/* Search bar inside header */}
          <div className="relative w-full md:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help guides, topics & FAQs..."
              className="w-full pl-9 pr-8 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-2xl text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
            />
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Developer Source Code Quick Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Code2 size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white">Developer Source Code &amp; Architecture</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Inspect application architecture, components, and implementation logic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenViewCode('TypeScript', 'Home')}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-2xs shrink-0"
          >
            <Code2 size={14} />
            <span>Open View Code</span>
          </button>
        </div>
      </div>

      {/* Quick Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {(
          [
            { id: 'All', label: 'All Topics', icon: BookOpen },
            { id: 'Videos', label: 'Videos Help', icon: Video },
            { id: 'News', label: 'News Help', icon: Newspaper },
            { id: 'Photos', label: 'Photos Help', icon: Image },
            { id: 'Polls', label: 'Polls Help', icon: BarChart2 },
            { id: 'Quiz', label: 'Quiz Help', icon: QuizIcon },
            { id: 'Pages', label: 'Page Help', icon: Layers },
            { id: 'Events', label: 'Event Help', icon: Calendar },
            { id: 'Delete', label: 'Delete Help', icon: Trash2 },
            { id: 'Quota', label: 'Quota Help', icon: Sliders },
            { id: 'Upgrade', label: 'Upgrade Help', icon: Zap },
            { id: 'Errors', label: 'Errors Help', icon: AlertOctagon }
          ] as { id: HelpCategory; label: string; icon: any }[]
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer min-h-[44px] shrink-0 ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-200/80'
              }`}
            >
              <Icon
                size={14}
                className={isActive ? 'text-amber-400' : 'text-zinc-400'}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Action Bento Grid (All 10 Categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[
          {
            title: 'Videos Help',
            desc: 'Embed & Slideshow',
            icon: Video,
            bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
            actionCat: 'Videos'
          },
          {
            title: 'News Help',
            desc: 'Articles & Stories',
            icon: Newspaper,
            bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
            actionCat: 'News'
          },
          {
            title: 'Photos Help',
            desc: 'Galleries & Albums',
            icon: Image,
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
            actionCat: 'Photos'
          },
          {
            title: 'Polls Help',
            desc: 'Voting & Percentages',
            icon: BarChart2,
            bg: 'bg-violet-50 text-violet-700 border-violet-200/80',
            actionCat: 'Polls'
          },
          {
            title: 'Quiz Help',
            desc: 'Trivia & Scoring',
            icon: QuizIcon,
            bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
            actionCat: 'Quiz'
          },
          {
            title: 'Page Help',
            desc: 'Hubs & Locations',
            icon: Layers,
            bg: 'bg-teal-50 text-teal-700 border-teal-200/80',
            actionCat: 'Pages'
          },
          {
            title: 'Event Help',
            desc: 'Schedules & Broadcasts',
            icon: Calendar,
            bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
            actionCat: 'Events'
          },
          {
            title: 'Delete Help',
            desc: '100-Day Trash & Restore',
            icon: Trash2,
            bg: 'bg-red-50 text-red-700 border-red-200/80',
            actionCat: 'Delete'
          },
          {
            title: 'Quota Help',
            desc: 'Storage & Daily Limits',
            icon: Sliders,
            bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
            actionCat: 'Quota'
          },
          {
            title: 'Upgrade Help',
            desc: 'Plans & Pro Features',
            icon: Zap,
            bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
            actionCat: 'Upgrade'
          }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              onClick={() => setActiveCategory(card.actionCat as HelpCategory)}
              className={`p-3.5 rounded-2xl border ${card.bg} flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center shadow-2xs">
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  Guide
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black leading-tight group-hover:underline truncate">
                  {card.title}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5 truncate">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Sections */}
      {filteredTopics.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-zinc-300 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <Search size={32} className="text-zinc-400 mb-2" />
          <h3 className="text-sm font-bold text-zinc-800">No help guides found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            We couldn't find any guides matching "{searchQuery}". Try searching for
            "Videos", "News", "Photos", "Polls", "Quiz", "Pages", "Events", "Shopping", "Delete", "Quota", "Upgrade", or "Errors".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                id={topic.id}
                className="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Topic Header */}
                <div className="p-5 sm:p-6 border-b border-zinc-100 bg-linear-to-r from-zinc-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Icon size={22} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black text-zinc-900">
                          {topic.title}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {topic.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1 max-w-2xl leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Topic Content: Steps & Pro Tips */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Step-by-Step Instructions */}
                  <div className="lg:col-span-2 space-y-3.5">
                    <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-zinc-600" />
                      <span>Step-by-Step Instructions</span>
                    </h3>
                    <div className="space-y-2.5">
                      {topic.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-100 text-xs text-zinc-700"
                        >
                          <div className="w-5 h-5 rounded-full bg-zinc-900 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="leading-relaxed flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tips Box */}
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-amber-600" />
                      <span>Pro Tips & Best Practices</span>
                    </h3>
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
                      {topic.tips.map((tip, tipIdx) => (
                        <div key={tipIdx} className="flex items-start gap-2.5 text-xs text-amber-950">
                          <CheckCircle2
                            size={14}
                            className="text-amber-600 shrink-0 mt-0.5"
                          />
                          <p className="leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FAQs Accordion */}
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-zinc-100">
                  <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-zinc-600" />
                    <span>Frequently Asked Questions</span>
                  </h3>
                  <div className="space-y-2">
                    {topic.faqs.map((faq, faqIdx) => {
                      const faqKey = `${topic.id}-faq-${faqIdx}`;
                      const isExpanded = expandedFaq === faqKey;
                      return (
                        <div
                          key={faqIdx}
                          className="border border-zinc-200/80 rounded-2xl overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleFaq(faqKey)}
                            className="w-full px-4 py-3 bg-zinc-50 hover:bg-zinc-100/80 flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-zinc-900 pr-2">
                              {faq.q}
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={16} className="text-zinc-500 shrink-0" />
                            ) : (
                              <ChevronDown size={16} className="text-zinc-400 shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-4 py-3 bg-white text-xs text-zinc-600 leading-relaxed border-t border-zinc-100">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cross-linking & Location Linking Guide Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900">
              How Pages & Events Location Linking Works
            </h3>
            <p className="text-xs text-zinc-500">
              Connect your Videos, News, Photos, Polls, and Quizzes to specific Pages or Events
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-700 leading-relaxed pt-1">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <h4 className="font-black text-zinc-900 flex items-center gap-1.5">
              <Layers size={14} className="text-zinc-700" />
              <span>Page Location Linking</span>
            </h4>
            <p>
              When creating or editing a Page, you can assign a Page Location tag. Any Videos, News, Photos, Polls, or Quizzes created with that same location tag will automatically appear inside the <strong>View Page</strong> detail modal under its corresponding content tab.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-2">
            <h4 className="font-black text-zinc-900 flex items-center gap-1.5">
              <Calendar size={14} className="text-zinc-700" />
              <span>Event Location Linking</span>
            </h4>
            <p>
              When organizing an Event, set its Event Location tag. All associated media tagged with that location will show up inside the <strong>View Event</strong> detail modal. You can also filter, preview, or delete linked media directly from within the event popup.
            </p>
          </div>
        </div>
      </div>

      {/* View Code Modal Dialog */}
      <ViewCodeModal
        isOpen={isViewCodeOpen}
        onClose={() => setIsViewCodeOpen(false)}
        initialLanguage={viewCodeInitialLang}
        initialFeature={viewCodeInitialFeature}
      />
    </div>
  );
};
