export type DashboardSection =
  | 'Home'
  | 'Pages'
  | 'Events'
  | 'Entertainment'
  | 'Replay'
  | 'Coding'
  | 'News'
  | 'Music'
  | 'Movies'
  | 'Idents'
  | 'Public Affairs'
  | 'Mukbang'
  | 'Gaming'
  | 'Tech'
  | 'Vlog'
  | 'Smash'
  | 'Mothers'
  | 'Fathers'
  | 'Specials'
  | 'Sports'
  | 'Radio 1st'
  | 'Radio 2nd'
  | 'Grandmothers'
  | 'Grandfathers'
  | 'Granddaughters'
  | 'Grandsons'
  | 'Daughters'
  | 'Sons'
  | 'Sisters'
  | 'Brothers'
  | 'Boyfriend'
  | 'Girlfriend'
  | 'Wife'
  | 'Husband'
  | 'Auntie'
  | 'Uncle'
  | 'Cousin'
  | 'Nephew'
  | 'Niece'
  | 'Quota'
  | 'Upgrade'
  | 'Settings'
  | 'Activity Log'
  | 'Help'
  | 'Community Standards'
  | 'TV Schedule'
  | 'Weather'
  | 'Catch Now'
  | 'Terms of Service'
  | 'Privacy Policy';
export type SubTab = 'Videos' | 'Showbiz News' | 'Photos' | 'Polls' | 'Quizzes' | 'Shorts' | 'Products' | 'Shopping';

export interface UserProfile {
  uid?: string;
  fullName?: string;
  username?: string;
  email?: string;
  photoURL?: string;
  quota?: number;
  createdAt?: any;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
  };
}

export interface PageItem {
  id?: string;
  coverPhoto: string;
  title: string;
  username?: string;
  pageUsername?: string;
  creatorUsername?: string;
  description: string;
  visibility: 'Published' | 'Unpublished';
  pageLocation?: string;
  tags?: string[];
  section?: DashboardSection;
  createdAt?: any;
  updatedAt?: any;
  isDeleted?: boolean;
  deletedAt?: any;
}

export interface EventItem {
  id?: string;
  coverPhoto: string;
  title: string;
  description: string;
  visibility: 'Public' | 'Private';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  eventLocation?: string;
  tags?: string[];
  isReminded?: boolean;
  section?: DashboardSection;
  createdAt?: any;
  updatedAt?: any;
  isDeleted?: boolean;
  deletedAt?: any;
}

export interface VideoItem {
  id?: string;
  videoUrl: string;
  title: string;
  document: string;
  tags?: string[];
  section?: DashboardSection;
  visibility?: string;
  pageLocation?: string;
  eventLocation?: string;
  createdAt?: any;
}

export interface ShowbizNewsItem {
  id?: string;
  coverPhoto: string;
  title: string;
  document: string;
  tags?: string[];
  section?: DashboardSection;
  visibility?: string;
  pageLocation?: string;
  eventLocation?: string;
  createdAt?: any;
}

export interface ShortItem {
  id?: string;
  videoUrl: string;
  title: string;
  description: string;
  tags?: string[];
  pageLocation?: string;
  eventLocation?: string;
  section?: DashboardSection;
  createdAt?: any;
}

export interface ProductItem {
  id?: string;
  photo: string;
  title: string;
  description: string;
  pricing: string;
  tag?: string;
  tags?: string[];
  visibility?: string;
  pageLocation?: string;
  eventLocation?: string;
  section?: DashboardSection;
  createdAt?: any;
}

export interface CartItem {
  id?: string;
  productId: string;
  title: string;
  photo?: string;
  pricing: string | number;
  quantity: number;
}

export type OrderTrackingStatus = 'Pending' | 'Processing' | 'In Transit' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  items: {
    productId: string;
    title: string;
    photo?: string;
    pricing: number;
    quantity: number;
  }[];
  totalAmount: number;
  customerName?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  status?: string;
  trackingStatus?: OrderTrackingStatus | string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  cardLast4?: string;
  createdAt?: any;
}

export interface OtherPhotoItem {
  id?: string;
  photo: string;
  title: string;
  description: string;
}

export interface PhotoItem {
  id?: string;
  coverPhoto: string;
  title: string;
  document: string;
  tags?: string[];
  otherPhoto: (OtherPhotoItem | string)[];
  section?: DashboardSection;
  visibility?: string;
  pageLocation?: string;
  eventLocation?: string;
  createdAt?: any;
}

export interface PollData {
  question: string;
  options: { id: string; text: string; votes?: number }[];
}

export interface PollItem {
  id?: string;
  coverPhoto: string;
  title: string;
  document: string;
  tags?: string[];
  poll: PollData;
  section?: DashboardSection;
  visibility?: string;
  pageLocation?: string;
  eventLocation?: string;
  createdAt?: any;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizData {
  title?: string;
  questions: QuizQuestion[];
}

export interface QuizItem {
  id?: string;
  coverPhoto: string;
  title: string;
  document: string;
  tags?: string[];
  quiz: QuizData;
  section?: DashboardSection;
  visibility?: string;
  pageLocation?: string;
  eventLocation?: string;
  createdAt?: any;
}

export type EmbedPlatform = 'YouTube' | 'Facebook' | 'Instagram' | 'Threads' | 'Dailymotion' | 'Slideshow Photos' | 'Image';

export type QuotaTierName =
  | 'Free'
  | 'Bronze'
  | 'Silver'
  | 'Ruby'
  | 'Gold'
  | 'Diamond'
  | 'Platinum'
  | 'Sapphire'
  | 'Emerald'
  | 'Amethyst'
  | 'Pearl'
  | 'Obsidian'
  | 'Titanium';

export interface QuotaTierLimits {
  videos: number;
  news: number;
  photos: number;
  polls: number;
  quiz: number;
  shorts: number;
  products: number;
  shopping?: number;
  pages: number;
  events: number;
  tags: number;
}

export type BillingCycle = 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export interface QuotaTierConfig {
  name: QuotaTierName;
  tagline: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentBg: string;
  progressBarColor: string;
  totalStorageBytes: number;
  totalStorageLabel: string;
  totalItemsLimit: number;
  limits: QuotaTierLimits;
  priceWeekly?: string;
  priceMonthly: string;
  priceAnnual: string;
  priceYearly?: string;
  priceLifetime?: string;
  description: string;
  isPopular?: boolean;
}

export interface CatchNowOption {
  id?: string;
  optionNumber: number | string;
  title: string;
  description: string;
  gongManEnabled?: boolean;
}

export interface CatchNowItem {
  id?: string;
  userId?: string;
  authorName?: string;
  authorEmail?: string;
  title: string;
  story: string;
  date: string;
  time?: string;
  category?: string;
  coverPhoto?: string;
  options?: CatchNowOption[];
  // Legacy single option support fallback
  optionNumber?: number | string;
  optionTitle?: string;
  optionDescription?: string;
  likes?: number;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
  isDeleted?: boolean;
  deletedAt?: any;
}
