import React, { useState, useMemo } from 'react';
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
  AlertTriangle,
  Code2,
  FileCode,
  FileText,
  Info,
  ArrowUpRight,
  Copy,
  Check,
  Hash,
  ExternalLink,
  Terminal,
  Github,
  GitBranch,
  Wrench,
  RefreshCw,
  Cpu,
  MessageSquareCode,
  Sparkles
} from 'lucide-react';
import { ViewCodeModal, CodeLanguage, FeatureScope } from './ViewCodeModal';
import {
  ALL_HTTP_STATUS_CODES,
  HttpStatusCodeItem,
  HttpStatusClass
} from '../data/httpStatusCodes';
import { SoloParentIcon, ParentsIcon } from './ErrorIcons';

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
  | 'Errors'
  | 'Issues';

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
    title: 'HTTP Status Codes & Error Directory (1xx, 2xx, 3xx, 4xx, 5xx)',
    badge: 'Status Codes (1xx–5xx)',
    icon: AlertOctagon,
    targetSection: 'Errors',
    description:
      'Complete RFC reference directory for HTTP status codes across all five standard classes: 1xx Informational, 2xx Success, 3xx Redirection, 4xx Client Errors (Solo Parent Icon), and 5xx Server Errors (Parents Icon).',
    steps: [
      'Navigate to "Errors Help" in the Help Center to access the interactive 1xx, 2xx, 3xx, 4xx, and 5xx Status Code directory.',
      'Filter by category pills: "1xx Informational (4)", "2xx Success (10)", "3xx Redirection (8)", "4xx Client Errors (29)", or "5xx Server Errors (11)".',
      'Use the live search bar to quickly locate any status code by number (e.g., 200, 301, 404, 500) or by descriptive name.',
      'Review RFC technical specifications, status code meanings, and family icon badges (Solo Parent Icon for 4xx, Parents Icon for 5xx).',
      'Click the "Copy" button on any status code card to quickly copy code numbers and standard names for API documentation and debugging.',
      'Click "View Error Page" in the Errors section to launch live full-screen error simulations with custom headers.'
    ],
    tips: [
      '1xx Informational (100–103): Provisional responses indicating request receipt; client continues sending data.',
      '2xx Success (200–226): Confirms request was received, understood, and successfully processed by the server.',
      '3xx Redirection (300–308): Further action required; client must follow new URI location headers to complete request.',
      '4xx Client Error (400–451): Client-side faults (bad syntax, missing auth, not found) badged with the Solo Parent Icon.',
      '5xx Server Error (500–511): Origin server failures (internal crash, gateway timeouts) badged with the Parents Icon.',
      'Use 301 for permanent URL changes to preserve SEO ranking, and 302/307 for temporary URL diversions.'
    ],
    faqs: [
      {
        q: 'What are the 5 standard classes of HTTP status codes (1xx, 2xx, 3xx, 4xx, 5xx)?',
        a: 'HTTP response status codes are grouped into five standard classes: 1xx Informational (request received, continuing process), 2xx Success (action successfully received and accepted), 3xx Redirection (further action must be taken to complete request), 4xx Client Error (request contains bad syntax or cannot be fulfilled), and 5xx Server Error (server failed to fulfill an apparently valid request).'
      },
      {
        q: 'What status codes are in the 1xx Informational class?',
        a: 'The 1xx class includes 100 Continue (proceed with body), 101 Switching Protocols (e.g. HTTP to WebSocket), 102 Processing (WebDAV in-flight), and 103 Early Hints (preloading critical link headers before final response).'
      },
      {
        q: 'What status codes are in the 2xx Success class?',
        a: 'The 2xx class includes 200 OK (standard success), 201 Created (new resource created), 202 Accepted (queued for asynchronous processing), 203 Non-Authoritative Information, 204 No Content, 205 Reset Content, 206 Partial Content, 207 Multi-Status (WebDAV), 208 Already Reported (WebDAV), and 226 IM Used.'
      },
      {
        q: 'What status codes are in the 3xx Redirection class?',
        a: 'The 3xx class includes 300 Multiple Choices, 301 Moved Permanently (permanent redirect), 302 Found (temporary redirect), 303 See Other (redirect to GET), 304 Not Modified (cached copy valid), 305 Use Proxy, 307 Temporary Redirect (preserves HTTP method), and 308 Permanent Redirect (preserves HTTP method).'
      },
      {
        q: 'Which error codes have the Solo Parent Icon?',
        a: 'All 29 standard 4xx Client Error codes are badged with the Solo Parent Icon: 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, and 451.'
      },
      {
        q: 'Which error codes have the Parents Icon?',
        a: 'All 11 standard 5xx Server Error codes are badged with the Parents Icon: 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, and 511.'
      },
      {
        q: 'Can I preview what an error page looks like?',
        a: 'Yes, clicking "View Error Page" in the Errors section renders the exact responsive error layout with custom headers, diagnostic recommendations, and return actions.'
      }
    ]
  },
  {
    id: 'issues-help',
    category: 'Issues',
    title: 'How to Fix Process Completed with Exit Code 1 (GitHub & Google AI Studio)',
    badge: 'GitHub & Google AI Studio Fix',
    icon: AlertTriangle,
    targetSection: 'Issues',
    description:
      'Complete developer guide for diagnosing and fixing "Process completed with exit code 1." across Google AI Studio build environments, GitHub Actions CI/CD workflows, and local TypeScript/npm runners—including Prompt Start and End text formatting.',
    steps: [
      'Locate the failing command in stderr: In Google AI Studio, look at the terminal output logs of "compile_applet" or "lint_applet". In GitHub Actions, expand the failed step in the Workflow Run Summary.',
      'Diagnose the root cause: Check for TypeScript compiler errors (e.g. "error TS2304: Cannot find name \'Mail\' or \'Plus\'"), uninstalled npm packages, or missing environment variables.',
      'Format bug-fix prompts with Prompt Start and End text: When asking an AI model or writing issue reports, encapsulate the error context between explicit boundary delimiters (e.g., <PROMPT_START> and <PROMPT_END> or --- BEGIN PROMPT --- and --- END PROMPT ---) to prevent prompt injection and truncation.',
      'Fix in Google AI Studio: Add missing symbol imports to the top of your TSX/JSX file (e.g. import { Mail, Plus } from "lucide-react";), install missing dependencies with install_applet_package, and re-run "npm run lint".',
      'Fix in GitHub Actions: Ensure node-version in .github/workflows/*.yml matches your runtime (Node 20.x), add missing repository secrets under Settings -> Secrets and variables -> Actions, and commit an updated package-lock.json so "npm ci" succeeds.',
      'Verify clean exit code 0: Run "npm run lint && npm run build" locally or in AI Studio. When the command executes without assertion errors, check "echo $?" to confirm it returns 0 (Success).',
      'Test live in View Code: Click "Inspect in View Code (Exit Code 1)" and toggle "Preview Code" to test the interactive terminal auto-fix simulation.'
    ],
    tips: [
      'Exit Code 0 means Success (No Errors), while Exit Code 1 signals an unhandled POSIX fatal execution failure.',
      'Always frame issue prompts with Prompt Start and End text (e.g., <PROMPT_START> ... <PROMPT_END>) to instruct models to only produce targeted code replacements without placeholders.',
      'In GitHub Actions, CI=true turns linter warnings into blocking errors. Always run "npm run lint" before pushing commits.',
      'Never commit package.json modifications without running "npm install" to synchronize package-lock.json, otherwise GitHub Actions "npm ci" will abort with exit code 1.',
      'In Google AI Studio, use the 4th dropdown menu ("4. Issues") in View Code to inspect the full ProcessCompletedWithExitCode1.log diagnostic template.',
      'For missing icons or UI helpers, inspect line and column numbers reported in the tsc error trace (e.g., ViewCodeModal.tsx:2428:20).'
    ],
    faqs: [
      {
        q: 'What is Prompt Start and End Text and why should I use it for Issues Help?',
        a: 'Prompt Start and End Text are explicit boundary markers (such as <PROMPT_START> ... <PROMPT_END> or --- BEGIN PROMPT --- ... --- END PROMPT ---) that encapsulate user instructions, diagnostic logs, and error traces. They prevent prompt truncation, block prompt injection, and clearly instruct AI coding models where the issue context starts and where output constraints end.'
      },
      {
        q: 'How do I fix "Process completed with exit code 1." in Google AI Studio?',
        a: 'In Google AI Studio, this error typically occurs during compile_applet or lint_applet when tsc --noEmit detects TypeScript errors (such as error TS2304 for undeclared identifiers like Mail or Plus). To fix it: 1) Open the file referenced in the error log, 2) Add the missing imports at the top of the file, 3) If an external package is missing, install it with install_applet_package, 4) Re-run the applet build to verify that the exit code transitions from 1 to 0.'
      },
      {
        q: 'How do I fix "Process completed with exit code 1." in GitHub Actions?',
        a: 'In GitHub Actions, a step fails with exit code 1 if any script command in your workflow exits with non-zero status. Fix it by: 1) Clicking on the failed workflow run in the "Actions" tab and expanding the red step to see the exact error, 2) Ensuring your workflow uses the correct Node version (actions/setup-node@v4 with node-version: 20), 3) Making sure package-lock.json is committed and synced with package.json so "npm ci" does not fail, 4) Configuring missing secrets in GitHub Repository Settings -> Secrets and variables -> Actions.'
      },
      {
        q: 'What are the recommended Prompt Start and End Text templates for debugging?',
        a: 'Popular formats include: 1) XML tag format (<PROMPT_START> and <PROMPT_END>), 2) Markdown horizontal rules (--- BEGIN ISSUE FIX PROMPT --- and --- END ISSUE FIX PROMPT ---), and 3) Custom delimiters. You can generate, customize, and copy these directly using the "Prompt Start & End Text" tab in Issues Help.'
      },
      {
        q: 'How do I resolve "error TS2304: Cannot find name \'Mail\' or \'Plus\'"?',
        a: 'This error happens when JSX references component or icon identifiers without importing them. Resolve it by updating your import statement at line 1-50 of the component: import { Mail, Plus } from "lucide-react"; and then running npm run lint to confirm all references resolve cleanly.'
      },
      {
        q: 'Why does a build succeed locally but fail with exit code 1 in GitHub Actions?',
        a: 'GitHub Actions runners execute in a pristine environment with CI=true, strict case-sensitive file systems (Ubuntu Linux), and use "npm ci" instead of "npm install". Discrepancies usually come from: 1) File path capitalization differences (e.g. Component.tsx vs component.tsx), 2) Diverged package-lock.json, 3) Missing environment variables not defined in GitHub repository secrets, or 4) Linter warnings treated as errors in CI mode.'
      },
      {
        q: 'How can I check the exit code in my terminal?',
        a: 'In bash or zsh, run "echo $?" immediately after running a command. A return value of 0 means the command completed successfully. Any value of 1 or greater indicates a failure that will trigger "Process completed with exit code 1" in CI runners.'
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

  // State for 1xx, 2xx, 3xx, 4xx, 5xx Status Code Directory in Errors Help
  const [httpStatusTab, setHttpStatusTab] = useState<'All' | HttpStatusClass>('All');
  const [httpStatusQuery, setHttpStatusQuery] = useState('');
  const [copiedStatusCode, setCopiedStatusCode] = useState<number | null>(null);

  const handleCopyStatus = (code: number, name: string) => {
    navigator.clipboard.writeText(`${code} ${name}`);
    setCopiedStatusCode(code);
    setTimeout(() => setCopiedStatusCode(null), 2000);
  };

  // State for GitHub & Google AI Studio Exit Code 1 Troubleshooter in Issues Help
  const [issuesPlatformTab, setIssuesPlatformTab] = useState<'aistudio' | 'github' | 'prompt' | 'terminal'>('aistudio');
  const [isSimulatedResolved, setIsSimulatedResolved] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // State for Prompt Start and End Text in Issues Help
  const [promptStyle, setPromptStyle] = useState<'tags' | 'markdown' | 'xml' | 'custom'>('tags');
  const [customPromptStart, setCustomPromptStart] = useState('<PROMPT_START>');
  const [customPromptEnd, setCustomPromptEnd] = useState('<PROMPT_END>');
  const [promptIssueTarget, setPromptIssueTarget] = useState<'exitCode1' | 'missingImports' | 'githubCI'>('exitCode1');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const getPromptStartText = () => {
    switch (promptStyle) {
      case 'tags':
        return '<PROMPT_START>';
      case 'markdown':
        return '--- BEGIN ISSUE FIX PROMPT ---';
      case 'xml':
        return '<prompt type="issue_diagnostic">';
      case 'custom':
        return customPromptStart;
    }
  };

  const getPromptEndText = () => {
    switch (promptStyle) {
      case 'tags':
        return '<PROMPT_END>';
      case 'markdown':
        return '--- END ISSUE FIX PROMPT ---';
      case 'xml':
        return '</prompt>';
      case 'custom':
        return customPromptEnd;
    }
  };

  const generatedPromptContent = useMemo(() => {
    const startText = getPromptStartText();
    const endText = getPromptEndText();

    let body = '';
    if (promptIssueTarget === 'exitCode1') {
      body = `[TARGET ENVIRONMENT]: Google AI Studio & GitHub Actions
[TASK]: Fix "Process completed with exit code 1." in build verification.
[ERROR LOG]:
> react-example@0.0.0 lint
> tsc --noEmit
src/components/ViewCodeModal.tsx(2428,20): error TS2304: Cannot find name 'Mail'.
src/components/ViewCodeModal.tsx(2659,18): error TS2304: Cannot find name 'Plus'.
Process completed with exit code 1.

[DIAGNOSTIC INSTRUCTIONS]:
1. Identify missing symbol imports in src/components/ViewCodeModal.tsx.
2. Add "import { Mail, Plus } from 'lucide-react';" to top-level imports.
3. Verify that running "npm run lint" yields zero errors and returns exit code 0.
[REQUIRED OUTPUT]: Return precise, clean drop-in code edits without placeholders.`;
    } else if (promptIssueTarget === 'missingImports') {
      body = `[TASK]: Resolve TypeScript TS2304 Undeclared Identifiers.
[TARGET FILE]: src/components/ViewCodeModal.tsx
[SYMBOLS]: Mail, Plus from 'lucide-react'
[RESOLUTION]: Update Lucide icon imports at line 1-50. Ensure no circular dependencies.
[VERIFICATION]: Run "tsc --noEmit" to confirm exit status 0.`;
    } else {
      body = `[TARGET ENVIRONMENT]: GitHub Actions CI/CD Runner
[WORKFLOW FAILURE]: Process completed with exit code 1 in step "Run npm run build"
[RUNNER OS]: ubuntu-latest (Node.js 20.x)
[ACTIONS NEEDED]:
1. Check .github/workflows/*.yml for node-version compatibility.
2. Ensure package-lock.json is synchronized with package.json for "npm ci".
3. Verify all VITE_* repository secrets are passed to runner env.`;
    }

    return `${startText}\n${body}\n${endText}`;
  }, [promptStyle, customPromptStart, customPromptEnd, promptIssueTarget]);

  const handleCopyFullPrompt = () => {
    navigator.clipboard.writeText(generatedPromptContent);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Filter HTTP Status Codes based on active category tab & search keyword
  const filteredHttpStatusCodes = useMemo(() => {
    return ALL_HTTP_STATUS_CODES.filter((item) => {
      const matchesTab = httpStatusTab === 'All' || item.category === httpStatusTab;
      if (!matchesTab) return false;
      if (!httpStatusQuery.trim()) return true;
      const q = httpStatusQuery.toLowerCase();
      return (
        item.code.toString().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.rfc.toLowerCase().includes(q)
      );
    });
  }, [httpStatusTab, httpStatusQuery]);

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
              <span className="text-zinc-200 font-semibold">Quota</span>,{' '}
              <span className="text-zinc-200 font-semibold">Upgrade</span>,{' '}
              <span className="text-zinc-200 font-semibold">Errors</span>, and{' '}
              <span className="text-zinc-200 font-semibold">Issues</span>.
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
            { id: 'Errors', label: 'Errors Help', icon: AlertOctagon },
            { id: 'Issues', label: 'Issues Help', icon: AlertTriangle }
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

      {/* Quick Action Bento Grid (All Categories) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
          },
          {
            title: 'Errors Help',
            desc: 'HTTP 4xx & 5xx Codes',
            icon: AlertOctagon,
            bg: 'bg-yellow-50 text-yellow-800 border-yellow-200/80',
            actionCat: 'Errors'
          },
          {
            title: 'Issues Help',
            desc: 'Exit Code 1 & Diagnostics',
            icon: AlertTriangle,
            bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
            actionCat: 'Issues'
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
            "Videos", "News", "Photos", "Polls", "Quiz", "Pages", "Events", "Shopping", "Delete", "Quota", "Upgrade", "Errors", or "Issues".
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

                  {topic.category === 'Issues' && (
                    <button
                      type="button"
                      onClick={() => handleOpenViewCode('TypeScript', 'Issues')}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0 self-start sm:self-center"
                    >
                      <Code2 size={14} />
                      <span>Inspect in View Code (Exit Code 1)</span>
                    </button>
                  )}
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

                {/* Dedicated Interactive 1xx, 2xx, 3xx, 4xx, 5xx Status Code Explorer for Errors Help */}
                {topic.category === 'Errors' && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-zinc-100 space-y-4">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-yellow-100 text-yellow-800">
                            <AlertOctagon size={16} />
                          </span>
                          <h3 className="text-sm font-black text-zinc-900">
                            Comprehensive List of HTTP Status Codes (1xx, 2xx, 3xx, 4xx, 5xx)
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Standard RFC specifications across all 5 HTTP response categories. 4xx codes feature the Solo Parent Icon; 5xx codes feature the Parents Icon.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                          {filteredHttpStatusCodes.length} of {ALL_HTTP_STATUS_CODES.length} Codes
                        </span>
                      </div>
                    </div>

                    {/* Class Summary Badges Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="p-2.5 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-sky-800">
                          <span>1xx Info</span>
                          <span className="font-mono">4</span>
                        </div>
                        <div className="text-[10px] text-sky-600 truncate">100 &ndash; 103</div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                          <span>2xx Success</span>
                          <span className="font-mono">10</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 truncate">200 &ndash; 226</div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-purple-50 border border-purple-200/80 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-purple-800">
                          <span>3xx Redirect</span>
                          <span className="font-mono">8</span>
                        </div>
                        <div className="text-[10px] text-purple-600 truncate">300 &ndash; 308</div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                          <span className="flex items-center gap-1">
                            <SoloParentIcon size={12} className="text-amber-700" />
                            <span>4xx Client</span>
                          </span>
                          <span className="font-mono">29</span>
                        </div>
                        <div className="text-[10px] text-amber-600 truncate">Solo Parent Icon</div>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-0.5 col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-rose-800">
                          <span className="flex items-center gap-1">
                            <ParentsIcon size={12} className="text-rose-700" />
                            <span>5xx Server</span>
                          </span>
                          <span className="font-mono">11</span>
                        </div>
                        <div className="text-[10px] text-rose-600 truncate">Parents Icon</div>
                      </div>
                    </div>

                    {/* Filters and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-zinc-50 p-2 rounded-2xl border border-zinc-200">
                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                        {(
                          [
                            { id: 'All', label: 'All Codes', count: 62 },
                            { id: '1xx', label: '1xx Info', count: 4 },
                            { id: '2xx', label: '2xx Success', count: 10 },
                            { id: '3xx', label: '3xx Redirect', count: 8 },
                            { id: '4xx', label: '4xx Client', count: 29, icon: SoloParentIcon },
                            { id: '5xx', label: '5xx Server', count: 11, icon: ParentsIcon }
                          ] as { id: 'All' | HttpStatusClass; label: string; count: number; icon?: any }[]
                        ).map((tab) => {
                          const isSelected = httpStatusTab === tab.id;
                          const IconComp = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setHttpStatusTab(tab.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                isSelected
                                  ? 'bg-zinc-900 text-white shadow-xs'
                                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
                              }`}
                            >
                              {IconComp && <IconComp size={13} className={isSelected ? 'text-white' : 'text-zinc-500'} />}
                              <span>{tab.label}</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                                isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200/80 text-zinc-600'
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Search Input */}
                      <div className="relative w-full sm:w-56 shrink-0">
                        <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                        <input
                          type="text"
                          value={httpStatusQuery}
                          onChange={(e) => setHttpStatusQuery(e.target.value)}
                          placeholder="Search code or name..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        {httpStatusQuery && (
                          <button
                            type="button"
                            onClick={() => setHttpStatusQuery('')}
                            className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 text-xs font-bold cursor-pointer"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Codes Cards List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                      {filteredHttpStatusCodes.map((item) => {
                        const isCopied = copiedStatusCode === item.code;
                        return (
                          <div
                            key={item.code}
                            className="p-3.5 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 hover:shadow-xs transition space-y-2 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs border ${item.badgeColor}`}>
                                    {item.code}
                                  </span>
                                  <span className="font-bold text-xs text-zinc-900">
                                    {item.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {item.category === '4xx' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" title="Solo Parent Icon">
                                      <SoloParentIcon size={12} className="text-amber-800" />
                                      <span>Solo Parent</span>
                                    </span>
                                  )}
                                  {item.category === '5xx' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300" title="Parents Icon">
                                      <ParentsIcon size={12} className="text-rose-800" />
                                      <span>Parents</span>
                                    </span>
                                  )}
                                  {item.category === '1xx' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                                      <Info size={11} className="text-sky-700" />
                                      <span>Info</span>
                                    </span>
                                  )}
                                  {item.category === '2xx' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 size={11} className="text-emerald-700" />
                                      <span>Success</span>
                                    </span>
                                  )}
                                  {item.category === '3xx' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                                      <ArrowUpRight size={11} className="text-purple-700" />
                                      <span>Redirect</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-zinc-600 leading-relaxed">
                                {item.summary}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                              <span className="font-mono text-[10px] text-zinc-400">
                                {item.rfc}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyStatus(item.code, item.name)}
                                className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                                title="Copy code number and name"
                              >
                                {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredHttpStatusCodes.length === 0 && (
                        <div className="col-span-full py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                          <p className="text-xs font-bold text-zinc-600">
                            No status codes matching "{httpStatusQuery}"
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setHttpStatusTab('All');
                              setHttpStatusQuery('');
                            }}
                            className="mt-2 text-xs text-amber-600 font-bold hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dedicated Interactive GitHub & Google AI Studio Exit Code 1 Troubleshooter */}
                {topic.category === 'Issues' && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-zinc-100 space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-rose-100 text-rose-800">
                            <AlertTriangle size={16} />
                          </span>
                          <h3 className="text-sm font-black text-zinc-900">
                            How to Fix "Process completed with exit code 1." (GitHub & Google AI Studio)
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Select your platform to view verified fix procedures, terminal diagnostics, and common compiler assertions.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenViewCode('TypeScript', 'Issues')}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
                      >
                        <Code2 size={13} className="text-amber-400" />
                        <span>Inspect ProcessCompletedWithExitCode1.log</span>
                      </button>
                    </div>

                    {/* Platform Selector Tabs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setIssuesPlatformTab('aistudio')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          issuesPlatformTab === 'aistudio'
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        <Cpu size={14} className={issuesPlatformTab === 'aistudio' ? 'text-amber-500' : 'text-zinc-400'} />
                        <span className="truncate">Google AI Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIssuesPlatformTab('github')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          issuesPlatformTab === 'github'
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        <Github size={14} className={issuesPlatformTab === 'github' ? 'text-indigo-600' : 'text-zinc-400'} />
                        <span className="truncate">GitHub Actions</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIssuesPlatformTab('prompt')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          issuesPlatformTab === 'prompt'
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        <MessageSquareCode size={14} className={issuesPlatformTab === 'prompt' ? 'text-violet-600' : 'text-zinc-400'} />
                        <span className="truncate">Prompt Start & End</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIssuesPlatformTab('terminal')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          issuesPlatformTab === 'terminal'
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        <Terminal size={14} className={issuesPlatformTab === 'terminal' ? 'text-emerald-600' : 'text-zinc-400'} />
                        <span className="truncate">Terminal Simulator</span>
                      </button>
                    </div>

                    {/* 1. GOOGLE AI STUDIO FIX GUIDE */}
                    {issuesPlatformTab === 'aistudio' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-3">
                          <Cpu size={18} className="text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-amber-900">Why does Exit Code 1 happen in Google AI Studio?</div>
                            <p className="text-amber-800 leading-relaxed">
                              When executing automated tools like <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">compile_applet</code> or <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">lint_applet</code>, the TypeScript compiler (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">tsc --noEmit</code>) halts execution if undeclared components or icons are referenced in JSX.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[11px] font-black flex items-center justify-center">1</span>
                              <h4 className="font-bold text-xs text-zinc-900">Inspect Stderr & Line Numbers</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              Look at the compiler log output to locate the exact file and line number:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                              src/components/ViewCodeModal.tsx(2428,20): error TS2304: Cannot find name 'Mail'.
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[11px] font-black flex items-center justify-center">2</span>
                              <h4 className="font-bold text-xs text-zinc-900">Add Missing Top-Level Imports</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              Add the identifier to your Lucide or component imports at the top of the file:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                              import &#123; Mail, Plus &#125; from 'lucide-react';
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 text-[11px] font-black flex items-center justify-center">3</span>
                              <h4 className="font-bold text-xs text-zinc-900">Install Missing Packages</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              If an external npm library is missing, install it with the platform package tool:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-amber-300 font-mono text-[11px] overflow-x-auto">
                              install_applet_package(['lucide-react'])
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center">4</span>
                              <h4 className="font-bold text-xs text-zinc-900">Verify Exit Code 0 Transition</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              Run the linter. Zero errors confirms the exit code successfully returned 0:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                              Linting completed successfully. (exit status: 0)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. GITHUB ACTIONS FIX GUIDE */}
                    {issuesPlatformTab === 'github' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 text-xs flex items-start gap-3">
                          <Github size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-indigo-900">Why does Exit Code 1 happen in GitHub Actions?</div>
                            <p className="text-indigo-800 leading-relaxed">
                              In GitHub Actions, any non-zero exit status aborts the runner job immediately. Common reasons include lockfile divergence during <code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-[11px]">npm ci</code>, Node version incompatibilities, missing repository secrets, or strict linter rules under <code className="font-mono bg-indigo-100 px-1 py-0.5 rounded text-[11px]">CI=true</code>.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
                              <h4 className="font-bold text-xs text-zinc-900">Examine the Failing Workflow Step</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              Go to your GitHub repo &rarr; <strong>Actions</strong> tab &rarr; click the failed workflow run &rarr; expand the red step (e.g. "Run npm run build") to see the failure log.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">2</span>
                              <h4 className="font-bold text-xs text-zinc-900">Align Node.js Runner Version</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              In <code className="font-mono text-[11px]">.github/workflows/deploy.yml</code>, ensure the node version matches your project:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                              - uses: actions/setup-node@v4<br />
                              &nbsp;&nbsp;with:<br />
                              &nbsp;&nbsp;&nbsp;&nbsp;node-version: '20.x'<br />
                              &nbsp;&nbsp;&nbsp;&nbsp;cache: 'npm'
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">3</span>
                              <h4 className="font-bold text-xs text-zinc-900">Sync package-lock.json (Fix npm ci)</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              If <code className="font-mono text-[11px]">package-lock.json</code> is out of sync with <code className="font-mono text-[11px]">package.json</code>, <code className="font-mono text-[11px]">npm ci</code> fails with exit 1. Re-sync locally:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-amber-300 font-mono text-[11px] overflow-x-auto">
                              npm install && git add package-lock.json && git commit -m "fix: sync lockfile"
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">4</span>
                              <h4 className="font-bold text-xs text-zinc-900">Inject Missing Repository Secrets</h4>
                            </div>
                            <p className="text-xs text-zinc-600 leading-relaxed">
                              Under <strong>Repo Settings &rarr; Secrets and variables &rarr; Actions</strong>, add environment secrets and bind them to steps:
                            </p>
                            <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                              env:<br />
                              &nbsp;&nbsp;VITE_FIREBASE_API_KEY: $&#123;&#123; secrets.VITE_FIREBASE_API_KEY &#125;&#125;
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. PROMPT START AND END TEXT BUILDER & GUIDE */}
                    {issuesPlatformTab === 'prompt' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        {/* Concept Banner */}
                        <div className="p-4 rounded-2xl bg-violet-50/80 border border-violet-200/80 text-violet-950 text-xs flex items-start gap-3">
                          <MessageSquareCode size={18} className="text-violet-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-violet-900">What is Prompt Start and End Text?</div>
                            <p className="text-violet-800 leading-relaxed">
                              Prompt Start and End Text are explicit boundary markers that wrap AI instructions and raw error traces. In developer workflows, they prevent prompt truncation, block prompt injection from untrusted logs, and instruct models to produce clean, isolated code solutions without verbose conversational filler.
                            </p>
                          </div>
                        </div>

                        {/* Interactive Delimiter Configurator */}
                        <div className="p-4 rounded-3xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-500" />
                                <span>Prompt Delimiter Format & Issue Preset</span>
                              </h4>
                              <p className="text-[11px] text-zinc-500">
                                Select delimiter style and issue context to generate a standard prompt with explicit Start & End text.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleCopyFullPrompt}
                              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs self-start sm:self-auto"
                            >
                              {copiedPrompt ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Formatted Prompt'}</span>
                            </button>
                          </div>

                          {/* Style & Issue Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Delimiter Presets */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                1. Delimiter Syntax Style
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: 'tags', label: '<PROMPT_START>', sub: 'Tag Delimiters' },
                                  { id: 'markdown', label: '--- BEGIN ---', sub: 'Markdown Rules' },
                                  { id: 'xml', label: '<prompt>', sub: 'XML Wrapper' },
                                  { id: 'custom', label: 'Custom Text', sub: 'User Defined' }
                                ].map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setPromptStyle(item.id as any)}
                                    className={`p-2 rounded-xl text-left border transition cursor-pointer text-xs ${
                                      promptStyle === item.id
                                        ? 'bg-violet-50 border-violet-400 text-violet-900 font-bold'
                                        : 'bg-zinc-50/80 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                    }`}
                                  >
                                    <div className="font-mono text-[11px] truncate">{item.label}</div>
                                    <div className="text-[10px] text-zinc-500 font-normal">{item.sub}</div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Issue Preset */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                2. Issue Troubleshooting Preset
                              </label>
                              <div className="space-y-1.5">
                                {[
                                  { id: 'exitCode1', label: 'Process Completed with Exit Code 1', desc: 'Compiler stderr with tsc --noEmit' },
                                  { id: 'missingImports', label: 'TS2304: Missing Symbol Imports', desc: 'Lucide React undeclared JSX components' },
                                  { id: 'githubCI', label: 'GitHub Actions Runner Job Failure', desc: 'CI npm ci & node version mismatch' }
                                ].map((preset) => (
                                  <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => setPromptIssueTarget(preset.id as any)}
                                    className={`w-full p-2 rounded-xl text-left border transition cursor-pointer text-xs ${
                                      promptIssueTarget === preset.id
                                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                                        : 'bg-zinc-50/80 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                    }`}
                                  >
                                    <div className="font-bold truncate">{preset.label}</div>
                                    <div className="text-[10px] text-zinc-500 font-normal truncate">{preset.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Custom Text Inputs if custom is selected */}
                          {promptStyle === 'custom' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 animate-in fade-in-50">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Custom Prompt Start Text</label>
                                <input
                                  type="text"
                                  value={customPromptStart}
                                  onChange={(e) => setCustomPromptStart(e.target.value)}
                                  placeholder="e.g. <<<START_PROMPT>>>"
                                  className="w-full px-3 py-1.5 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500">Custom Prompt End Text</label>
                                <input
                                  type="text"
                                  value={customPromptEnd}
                                  onChange={(e) => setCustomPromptEnd(e.target.value)}
                                  placeholder="e.g. <<<END_PROMPT>>>"
                                  className="w-full px-3 py-1.5 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-900 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                />
                              </div>
                            </div>
                          )}

                          {/* Visual Prompt Preview with Boundary Highlighting */}
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                              <span className="font-bold text-zinc-700">Live Prompt Construction with Boundary Markers:</span>
                              <span className="text-[10px] font-mono text-zinc-400">Ready to paste into AI Studio or GitHub</span>
                            </div>

                            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto space-y-2 select-text">
                              {/* Highlighted Prompt Start Text */}
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans">
                                  Prompt Start Text
                                </span>
                                <span className="text-amber-400 font-bold">{getPromptStartText()}</span>
                              </div>

                              {/* Prompt Body */}
                              <div className="text-zinc-300 pl-3 border-l-2 border-zinc-800 space-y-1 py-1 text-[11px] leading-relaxed whitespace-pre-wrap">
                                {promptIssueTarget === 'exitCode1' && (
                                  <>
                                    <span className="text-zinc-500">[TARGET ENVIRONMENT]:</span> Google AI Studio & GitHub Actions<br />
                                    <span className="text-zinc-500">[TASK]:</span> Fix "Process completed with exit code 1." in build verification.<br />
                                    <span className="text-zinc-500">[ERROR LOG]:</span><br />
                                    <span className="text-rose-400">&gt; react-example@0.0.0 lint<br />&gt; tsc --noEmit<br />src/components/ViewCodeModal.tsx(2428,20): error TS2304: Cannot find name 'Mail'.<br />src/components/ViewCodeModal.tsx(2659,18): error TS2304: Cannot find name 'Plus'.<br />Process completed with exit code 1.</span><br /><br />
                                    <span className="text-zinc-500">[DIAGNOSTIC INSTRUCTIONS]:</span><br />
                                    1. Identify missing symbol imports in src/components/ViewCodeModal.tsx.<br />
                                    2. Add "import &#123; Mail, Plus &#125; from 'lucide-react';" to top-level imports.<br />
                                    3. Verify that running "npm run lint" yields zero errors and returns exit code 0.<br />
                                    <span className="text-zinc-500">[REQUIRED OUTPUT]:</span> Return precise, clean drop-in code edits without placeholders.
                                  </>
                                )}
                                {promptIssueTarget === 'missingImports' && (
                                  <>
                                    <span className="text-zinc-500">[TASK]:</span> Resolve TypeScript TS2304 Undeclared Identifiers.<br />
                                    <span className="text-zinc-500">[TARGET FILE]:</span> src/components/ViewCodeModal.tsx<br />
                                    <span className="text-zinc-500">[SYMBOLS]:</span> Mail, Plus from 'lucide-react'<br />
                                    <span className="text-zinc-500">[RESOLUTION]:</span> Update Lucide icon imports at line 1-50. Ensure no circular dependencies.<br />
                                    <span className="text-zinc-500">[VERIFICATION]:</span> Run "tsc --noEmit" to confirm exit status 0.
                                  </>
                                )}
                                {promptIssueTarget === 'githubCI' && (
                                  <>
                                    <span className="text-zinc-500">[TARGET ENVIRONMENT]:</span> GitHub Actions CI/CD Runner<br />
                                    <span className="text-zinc-500">[WORKFLOW FAILURE]:</span> Process completed with exit code 1 in step "Run npm run build"<br />
                                    <span className="text-zinc-500">[RUNNER OS]:</span> ubuntu-latest (Node.js 20.x)<br />
                                    <span className="text-zinc-500">[ACTIONS NEEDED]:</span><br />
                                    1. Check .github/workflows/*.yml for node-version compatibility.<br />
                                    2. Ensure package-lock.json is synchronized with package.json for "npm ci".<br />
                                    3. Verify all VITE_* repository secrets are passed to runner env.
                                  </>
                                )}
                              </div>

                              {/* Highlighted Prompt End Text */}
                              <div className="flex items-center gap-2 pt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-sans">
                                  Prompt End Text
                                </span>
                                <span className="text-emerald-400 font-bold">{getPromptEndText()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Best Practices Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                            <div className="text-[10px] font-bold uppercase text-zinc-500">Anti-Truncation</div>
                            <div className="text-xs font-bold text-zinc-900">Prevents Incomplete Edits</div>
                            <p className="text-[11px] text-zinc-600 leading-relaxed">
                              Closing with Prompt End Text signals to the model that all instructions are delivered, preventing cut-off answers.
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                            <div className="text-[10px] font-bold uppercase text-zinc-500">Security Boundary</div>
                            <div className="text-xs font-bold text-zinc-900">Blocks Injection Attacks</div>
                            <p className="text-[11px] text-zinc-600 leading-relaxed">
                              Delimiter tags isolate untrusted compiler stderr or terminal crash traces from actual instructions.
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                            <div className="text-[10px] font-bold uppercase text-zinc-500">Clean Code Output</div>
                            <div className="text-xs font-bold text-zinc-900">Zero-Placeholder Delivery</div>
                            <p className="text-[11px] text-zinc-600 leading-relaxed">
                              End text mandates complete drop-in TSX/TS replacements, avoiding comments like "// rest of code remains the same".
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. TERMINAL COMMANDS & CLI SIMULATOR */}
                    {issuesPlatformTab === 'terminal' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        {/* Copyable CLI Commands Table */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                            Essential Diagnostic Terminal Commands
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              { cmd: 'npm run lint', desc: 'Runs tsc --noEmit to check TypeScript errors without generating output' },
                              { cmd: 'echo $?', desc: 'Prints the exit status code of the preceding command (0 = success, 1 = failure)' },
                              { cmd: 'npm run build', desc: 'Compiles full production bundle with Vite/Next.js to catch packaging errors' },
                              { cmd: 'npm ci', desc: 'Runs pristine dependency install matching GitHub Actions CI runner behavior' }
                            ].map((item) => {
                              const isCopied = copiedCmd === item.cmd;
                              return (
                                <div key={item.cmd} className="p-3 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-mono text-xs font-bold text-zinc-900 truncate">{item.cmd}</div>
                                    <div className="text-[11px] text-zinc-500 line-clamp-1">{item.desc}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCommand(item.cmd)}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition cursor-pointer shrink-0 flex items-center gap-1"
                                  >
                                    {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Simulator Card */}
                        <div className="p-4 rounded-3xl bg-zinc-950 text-white border border-zinc-800 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                              <Terminal size={16} className="text-amber-400" />
                              <span className="font-mono text-xs font-bold">Interactive CLI Exit Status Simulator</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setIsSimulatedResolved(!isSimulatedResolved)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                isSimulatedResolved
                                  ? 'bg-emerald-500 text-zinc-950 font-black'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              <RefreshCw size={12} />
                              <span>{isSimulatedResolved ? 'Simulated Status: Exit 0 (Success)' : 'Simulated Status: Exit 1 (Failed)'}</span>
                            </button>
                          </div>

                          <div className="font-mono text-xs space-y-1.5 bg-black/60 p-3.5 rounded-2xl select-text overflow-x-auto">
                            <div className="text-zinc-500">$ npm run lint && echo "Exit code: $?"</div>
                            <div className="text-zinc-400">&gt; react-example@0.0.0 lint</div>
                            <div className="text-zinc-400">&gt; tsc --noEmit</div>

                            {!isSimulatedResolved ? (
                              <>
                                <div className="text-rose-400 pt-1">
                                  src/components/ViewCodeModal.tsx(2428,20): error TS2304: Cannot find name 'Mail'.
                                </div>
                                <div className="text-rose-400">
                                  src/components/ViewCodeModal.tsx(2659,18): error TS2304: Cannot find name 'Plus'.
                                </div>
                                <div className="text-zinc-400 pt-1">Found 2 errors in 1 file.</div>
                                <div className="text-rose-400 font-bold bg-rose-950/80 p-2 rounded-xl mt-1 border border-rose-800/80">
                                  npm error Lifecycle script `lint` failed with error code 1.<br />
                                  Process completed with exit code 1.
                                </div>
                              </>
                            ) : (
                              <div className="text-emerald-400 pt-2 flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/50">
                                <CheckCircle2 size={16} />
                                <span>Linting completed successfully. Exit code: 0 [SUCCESS]</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
