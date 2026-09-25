import React, { useState, useEffect } from 'react';
import {
  Tv,
  Calendar,
  Clock,
  User,
  Search,
  Radio,
  Info,
  Play,
  Sparkles,
  ChevronRight,
  Bell,
  BellRing,
  Check,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export type ParentalRating = 'G' | 'PG' | 'SPG';

export interface TVProgram {
  id: string;
  title: string;
  time: string;
  week: string;
  hostOrStar: string;
  description: string;
  coverPhoto: string;
  category: 'News' | 'Entertainment' | 'Drama' | 'Comedy' | 'Public Affairs' | 'Lifestyle' | 'Movie' | 'Shopping';
  days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
  rating?: ParentalRating;
}

const MONDAY_FRIDAY_PROGRAMS: TVProgram[] = [
  {
    id: 'mf-1',
    title: 'Balita Pambansang sa Tanghali',
    time: '12:00 NN',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Arnold Clavio & Connie Sison',
    description: 'The flagship midday national newscast bringing live breaking updates, top headlines, and regional reports across the Philippines.',
    coverPhoto: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
    category: 'News',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-2',
    title: 'Dear SV',
    time: '12:30 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Sam Verzosa',
    description: 'Heartwarming public service program featuring inspirational stories of hope, community outreach, and life-changing aid for Filipinos.',
    coverPhoto: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-3',
    title: 'DMM Mobile Fiesta',
    time: '01:00 PM',
    week: 'Monday - Saturday',
    hostOrStar: 'Starring Classic & Blockbuster Cinema Casts',
    description: 'An afternoon movie showcase bringing timeless local and international blockbuster films directly to your television screen.',
    coverPhoto: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    category: 'Movie',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'mf-4',
    title: 'Buena Familia',
    time: '02:30 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Kylie Padilla, Julie Anne San Jose, Jake Vargas & Martin del Rosario',
    description: 'A compelling family drama navigating themes of wealth, resilience, forgiveness, and unconditional love through hardship.',
    coverPhoto: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-5',
    title: 'Hanggang Makita Kang Muli',
    time: '03:10 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Bea Binene, Derrick Monasterio, Angelika dela Cruz & Raymart Santiago',
    description: 'A dramatic tale of a feral child raised in isolation and her journey back to humanity, family, and true emotional recovery.',
    coverPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-6',
    title: 'Dragon Lady',
    time: '03:50 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Janine Gutierrez, Tom Rodriguez & Joyce Ching',
    description: 'A fantasy drama centered on a mysterious dragon statue, family secrets, and a woman claiming power over her destiny.',
    coverPhoto: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-7',
    title: 'Balita Pambansang sa Hapon',
    time: '04:30 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Ivan Mayrina & Connie Sison',
    description: 'Comprehensive afternoon news edition with real-time field reports, weather alerts, and nationwide traffic updates.',
    coverPhoto: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
    category: 'News',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-8',
    title: 'Alisto',
    time: '05:00 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Arnold Clavio',
    description: 'An investigative crime and public safety series exposing modus operandi, traffic hazards, and disaster preparedness.',
    coverPhoto: 'https://images.unsplash.com/photo-1508873696983-2df515122519?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-9',
    title: 'Daig Kayo ng Lola Ko',
    time: '05:30 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Gloria Romero, Jillian Ward & David Licauco',
    description: 'An anthology fantasy series sharing magical fables, traditional Filipino folklore, and moral stories for young audiences.',
    coverPhoto: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=600&auto=format&fit=crop&q=80',
    category: 'Entertainment',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-10',
    title: 'Fast Talk with Boy Abunda',
    time: '06:10 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Boy Abunda',
    description: 'Exclusive celebrity talk show delivering candid one-on-one interviews, showbiz news analysis, and rapid-fire quiz rounds.',
    coverPhoto: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    category: 'Entertainment',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-11',
    title: 'Balitang XP',
    time: '06:40 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Atom Araullo & Kara David',
    description: 'In-depth prime evening news delivering critical national stories, investigative reports, and economic commentary.',
    coverPhoto: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    category: 'News',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-12',
    title: 'Luna Blanca',
    time: '07:30 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Jillian Ward, Mona Louise Rey, Barbie Forteza & Bianca Umali',
    description: 'An epic trilogy drama following twin sisters born under contrasting lunar omens and their mystical bond.',
    coverPhoto: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-13',
    title: 'Langit sa Piling Mo',
    time: '08:10 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Heart Evangelista, Mark Herras & Katrina Halili',
    description: 'A romantic drama set in the aviation industry filled with passion, ambition, secrets, and high-flying romance.',
    coverPhoto: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-14',
    title: 'Niño',
    time: '08:50 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Miguel Tanfelix, Bianca Umali & Renz Valerio',
    description: 'An inspiring drama about a mentally challenged boy whose innocence and unyielding faith touch the hearts of his town.',
    coverPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-15',
    title: "My Mother's Secret",
    time: '09:30 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Elmo Magalona, Janine Gutierrez, Christian Bautista & Gwen Zamora',
    description: 'A poignant mystery-drama uncovering long-hidden family secrets, maternal sacrifices, and unexpected romantic ties.',
    coverPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-16',
    title: 'Wagas',
    time: '10:10 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Starring Guest Love Teams & Premier Actors',
    description: 'True love story dramatizations showcasing real-life romantic journeys, enduring devotion, and triumphs over adversity.',
    coverPhoto: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-17',
    title: 'Palakasang Balita',
    time: '11:00 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Chito Rivera & Mark Reyes',
    description: 'The ultimate late-night sports highlights show covering PBA basketball, boxing champions, international leagues, and athletic rivalries.',
    coverPhoto: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
    category: 'News',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'mf-18-a',
    title: 'Tunay na Buhay',
    time: '11:20 PM',
    week: 'Monday - Thursday',
    hostOrStar: 'Hosted by Pia Arcangel',
    description: 'A deep-dive biographical documentary series profiling notable personalities, celebrities, public servants, and ordinary heroes.',
    coverPhoto: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  {
    id: 'mf-18-b',
    title: 'Powerhouse',
    time: '11:20 PM',
    week: 'Friday',
    hostOrStar: 'Hosted by Kara David',
    description: 'Exclusive home interviews with influential leaders, captains of industry, artists, and prominent figures inside their private residences.',
    coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Friday']
  },
  {
    id: 'mf-19',
    title: 'Frontrow',
    time: '11:50 PM',
    week: 'Monday - Friday',
    hostOrStar: 'Hosted by Award-winning Documentary Directors',
    description: 'An acclaimed cinema-verite documentary series capturing raw human stories, cultural subcultures, and pressing social realities.',
    coverPhoto: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: 'ez-shop-mon',
    title: 'EZ Shop',
    time: '01:35 AM',
    week: 'Monday',
    hostOrStar: 'Hosted by EZ Shop Product Presenters',
    description: 'Late-night home shopping broadcast showcasing innovative home appliances, wellness gadgets, kitchenware, and lifestyle items.',
    coverPhoto: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop&q=80',
    category: 'Shopping',
    days: ['Monday']
  },
  {
    id: 'ez-shop-tue-sat',
    title: 'EZ Shop',
    time: '12:20 AM',
    week: 'Tuesday - Saturday',
    hostOrStar: 'Hosted by EZ Shop Product Presenters',
    description: 'Late-night home shopping broadcast showcasing innovative home appliances, wellness gadgets, kitchenware, and lifestyle items.',
    coverPhoto: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop&q=80',
    category: 'Shopping',
    days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  {
    id: 'shoptv-mon',
    title: 'Shop TV Philippines',
    time: '02:35 AM - 03:35 AM',
    week: 'Monday',
    hostOrStar: 'Hosted by Shop TV Host Ambassadors',
    description: 'Overnight teleshopping segment offering exclusive promotional discounts on health products, fitness gear, and gadgets.',
    coverPhoto: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
    category: 'Shopping',
    days: ['Monday']
  },
  {
    id: 'shoptv-tue-sat',
    title: 'Shop TV Philippines',
    time: '01:20 AM - 02:20 AM',
    week: 'Tuesday - Saturday',
    hostOrStar: 'Hosted by Shop TV Host Ambassadors',
    description: 'Overnight teleshopping segment offering exclusive promotional discounts on health products, fitness gear, and gadgets.',
    coverPhoto: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
    category: 'Shopping',
    days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  }
];

const SATURDAY_PROGRAMS: TVProgram[] = [
  {
    id: 'sat-1',
    title: 'Jesus the Healer',
    time: '05:15 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Bishop Bro. Eddie Villanueva',
    description: 'Early morning inspirational message and prayer broadcast bringing spiritual healing, worship songs, and religious sermons.',
    coverPhoto: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Saturday']
  },
  {
    id: 'sat-2',
    title: 'Biyahe ni Drew',
    time: '06:00 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Drew Arellano',
    description: 'Popular weekend travelogue exploring breathtaking destinations, local food delicacies, budget itineraries, and cultural gems.',
    coverPhoto: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
    days: ['Saturday']
  },
  {
    id: 'sat-3',
    title: 'Agriprenur',
    time: '06:45 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Jiggy Manicad',
    description: 'Agricultural show celebrating Filipino farmers, agribusiness innovations, sustainable farming techniques, and rural livelihood.',
    coverPhoto: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Saturday']
  },
  {
    id: 'sat-4',
    title: 'Kapwa Ko, Mahal Ko',
    time: '07:15 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Connie Sison & Dr. Orly Mercado',
    description: 'The longest-running public assistance television show rendering medical missions, health advocacy, and community relief.',
    coverPhoto: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Saturday']
  },
  {
    id: 'sat-5',
    title: 'Pinas Sarap',
    time: '07:45 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Kara David',
    description: 'Culinary documentary program uncovering rich Filipino heritage recipes, street food cultures, and regional cooking traditions.',
    coverPhoto: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
    days: ['Saturday']
  },
  {
    id: 'sat-6',
    title: 'Good News',
    time: '08:30 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Vicky Morales',
    description: 'Uplifting magazine show highlighting heartwarming positive news, life hacks, affordable recipe ideas, and eco-friendly tips.',
    coverPhoto: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
    days: ['Saturday']
  },
  {
    id: 'sat-7',
    title: 'iJuander',
    time: '09:15 AM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Susan Enriquez & Mark Salazar',
    description: 'Cultural investigative program examining Filipino superstitions, heritage traditions, urban legends, and popular culture.',
    coverPhoto: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Saturday']
  },
  {
    id: 'sat-8',
    title: 'DMM Saturday Cinema',
    time: '10:00 AM',
    week: 'Saturday',
    hostOrStar: 'Starring Premier Cinema Ensembles',
    description: 'A mid-morning movie block showcasing family-friendly animated features, action hits, and classic cinema favorites.',
    coverPhoto: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    category: 'Movie',
    days: ['Saturday']
  },
  {
    id: 'sat-9',
    title: 'Ang Dami Mong Alam, Kuya Kim',
    time: '12:00 NN',
    week: 'Saturday',
    hostOrStar: 'Hosted by Kim Atienza (Kuya Kim)',
    description: 'An educational science, wildlife, and trivia show filled with exciting experiments, animal encounters, and mind-blowing facts.',
    coverPhoto: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    category: 'Entertainment',
    days: ['Saturday']
  },
  {
    id: 'sat-10',
    title: 'Rosalinda',
    time: '12:30 PM',
    week: 'Saturday',
    hostOrStar: 'Starring Carla Abellana & Geoff Eigenmann',
    description: 'The beloved drama romance telling the tale of a humble flower vendor who triumphs over trials to find true love and stardom.',
    coverPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Saturday']
  },
  {
    id: 'sat-11',
    title: 'DMM Pinoy Cinema',
    time: '02:30 PM',
    week: 'Saturday',
    hostOrStar: 'Starring Legendary Philippine Cinema Actors',
    description: 'An afternoon movie showcase celebrating iconic Tagalog drama classics, action hero blockbusters, and award-winning films.',
    coverPhoto: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80',
    category: 'Movie',
    days: ['Saturday']
  },
  {
    id: 'sat-12',
    title: 'Tadhana',
    time: '04:15 PM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Marian Rivera',
    description: 'Weekly drama anthology sharing emotional stories of Overseas Filipino Workers (OFWs) sacrificing for their families back home.',
    coverPhoto: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Saturday']
  },
  {
    id: 'sat-13',
    title: 'Barangay Love Stories',
    time: '05:00 PM - 05:45 PM',
    week: 'Saturday',
    hostOrStar: 'Hosted by Papa Dudut',
    description: 'Popular radio-to-television drama anthology presenting real-life romantic journeys, relationship advice, and emotional letters from listeners.',
    coverPhoto: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80',
    category: 'Entertainment',
    days: ['Saturday']
  }
];

const SUNDAY_PROGRAMS: TVProgram[] = [
  {
    id: 'sun-1',
    title: 'DMM Airez Sunday',
    time: '02:30 PM',
    week: 'Sunday',
    hostOrStar: 'Starring Premier Variety Performers & Musical Artists',
    description: 'A high-energy Sunday afternoon musical variety showcase packed with explosive live dance numbers, vocal showdowns, and celebrity games.',
    coverPhoto: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    category: 'Entertainment',
    days: ['Sunday']
  },
  {
    id: 'sun-2',
    title: 'Regal Studio Presents',
    time: '04:00 PM',
    week: 'Sunday',
    hostOrStar: 'Starring Next-Gen Stars & Regal Entertainment Casts',
    description: 'Weekly anthology presenting romantic comedy specials, teen dramas, and heartwarming coming-of-age stories.',
    coverPhoto: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Sunday']
  },
  {
    id: 'sun-3',
    title: 'Pera Paraan',
    time: '04:45 PM',
    week: 'Sunday',
    hostOrStar: 'Hosted by Susan Enriquez',
    description: 'Practical financial advice and micro-business show showcasing inspirational Filipino entrepreneurs, home-based businesses, and savings hacks.',
    coverPhoto: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
    days: ['Sunday']
  },
  {
    id: 'sun-4',
    title: 'Balita Pambansang Sunday',
    time: '05:30 PM',
    week: 'Sunday',
    hostOrStar: 'Hosted by Mariz Umali & Raffy Tima',
    description: 'Comprehensive Sunday evening news roundup summarizing weekend national developments, disaster monitoring, and sports results.',
    coverPhoto: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80',
    category: 'News',
    days: ['Sunday']
  },
  {
    id: 'sun-5',
    title: 'Pepito Manaloto',
    time: '06:00 PM',
    week: 'Sunday',
    hostOrStar: 'Starring Michael V., Manilyn Reynes, Jake Vargas & Angel Satsumi',
    description: 'Award-winning situational comedy about a lottery winner and his family coping with overnight wealth with humor, moral lessons, and heart.',
    coverPhoto: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&auto=format&fit=crop&q=80',
    category: 'Comedy',
    days: ['Sunday']
  },
  {
    id: 'sun-6',
    title: 'Wagas',
    time: '07:00 PM',
    week: 'Sunday',
    hostOrStar: 'Starring Premier Dramatic Love Teams',
    description: 'Sunday dramatic special illustrating true stories of extraordinary devotion, romantic endurance, and inspirational life triumphs.',
    coverPhoto: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80',
    category: 'Drama',
    days: ['Sunday']
  },
  {
    id: 'sun-7',
    title: 'Resibo: Walang Lusot ang May Atraso',
    time: '08:00 PM',
    week: 'Sunday',
    hostOrStar: 'Hosted by Emil Sumangil',
    description: 'Hard-hitting investigative public advocacy program addressing grievances, scam complaints, consumer protection, and government accountability.',
    coverPhoto: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Sunday']
  },
  {
    id: 'sun-8',
    title: 'Farm to Table',
    time: '08:30 PM',
    week: 'Sunday',
    hostOrStar: 'Hosted by Chef JR Royol',
    description: 'A farm-fresh cooking adventure showcasing organic produce, sustainable culinary recipes, and farm tours across Philippine provinces.',
    coverPhoto: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
    category: 'Lifestyle',
    days: ['Sunday']
  },
  {
    id: 'sun-9',
    title: 'Bubble Gang',
    time: '09:15 PM',
    week: 'Sunday',
    hostOrStar: 'Starring Michael V., Paolo Contis, Chariz Solomon & Betong Sumaya',
    description: 'The Philippines longest-running gag show delivering iconic parody sketches, commercial spoofing, viral memes, and hilarious character comedy.',
    coverPhoto: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    category: 'Comedy',
    days: ['Sunday']
  },
  {
    id: 'sun-10',
    title: 'Kapuso Mo Jessica Soho',
    time: '10:15 PM - 12:00 MN',
    week: 'Sunday',
    hostOrStar: 'Hosted by Jessica Soho',
    description: 'The top-rated news magazine show featuring viral internet sensations, human interest features, paranormal investigations, and food trips.',
    coverPhoto: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    category: 'Public Affairs',
    days: ['Sunday']
  }
];

const ALL_PROGRAMS: TVProgram[] = [
  ...MONDAY_FRIDAY_PROGRAMS,
  ...SATURDAY_PROGRAMS,
  ...SUNDAY_PROGRAMS
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

type DayType = (typeof DAYS_OF_WEEK)[number];

function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const clean = t.trim().toUpperCase();
  if (clean.includes('MN') || clean.includes('MIDNIGHT')) return 1440;
  if (clean.includes('NN') || clean.includes('NOON')) {
    const match = clean.match(/(\d+):(\d+)/);
    if (match) return 12 * 60 + parseInt(match[2], 10);
    return 12 * 60;
  }
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const match = clean.match(/(\d+):(\d+)/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getProgramStartEnd(timeStr: string): { startMinutes: number; endMinutes: number } {
  if (timeStr.includes('-')) {
    const parts = timeStr.split('-');
    const start = parseTimeToMinutes(parts[0]);
    let end = parseTimeToMinutes(parts[1]);
    if (end <= start) end = start + 60;
    return { startMinutes: start, endMinutes: end };
  } else {
    const start = parseTimeToMinutes(timeStr);
    return { startMinutes: start, endMinutes: start + 40 };
  }
}

export function getFamilyTag(startMinutes: number, day: DayType, title?: string): { tag: string; sub: string; color: string; bgBadge: string } {
  if (title && title.toLowerCase().includes('daig kayo ng lola ko')) {
    return { tag: 'Mothers', sub: 'Primetime', color: 'text-rose-400 border-rose-500/40 bg-rose-950/60', bgBadge: 'bg-rose-600 text-white' };
  }
  if (title && (title.toLowerCase().includes('dmm') || title.toLowerCase().includes('mobile fiesta') || title.toLowerCase().includes('movie fiesta'))) {
    return { tag: 'Sons', sub: 'Afternoon', color: 'text-blue-400 border-blue-500/40 bg-blue-950/60', bgBadge: 'bg-blue-600 text-white' };
  }

  if (day === 'Saturday') {
    if (startMinutes >= 300 && startMinutes < 720) {
      return { tag: 'Brothers', sub: 'Saturday Morning', color: 'text-teal-400 border-teal-500/40 bg-teal-950/60', bgBadge: 'bg-teal-600 text-white' };
    }
    if (startMinutes >= 720 && startMinutes < 780) {
      return { tag: 'Boyfriend', sub: 'Saturday Noontime', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60', bgBadge: 'bg-cyan-600 text-white' };
    }
    if (startMinutes >= 780 && startMinutes < 1080) {
      return { tag: 'Girlfriend', sub: 'Saturday Afternoon', color: 'text-pink-400 border-pink-500/40 bg-pink-950/60', bgBadge: 'bg-pink-600 text-white' };
    }
    if (startMinutes < 300) {
      return { tag: 'Grandfathers', sub: 'Tuesday to Saturday Midnight', color: 'text-purple-400 border-purple-500/40 bg-purple-950/60', bgBadge: 'bg-purple-600 text-white' };
    }
    return { tag: 'Mothers', sub: 'Saturday Primetime', color: 'text-rose-400 border-rose-500/40 bg-rose-950/60', bgBadge: 'bg-rose-600 text-white' };
  }

  if (day === 'Sunday') {
    if (startMinutes >= 720 && startMinutes < 1080) {
      return { tag: 'Wife', sub: 'Sunday Afternoon', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60', bgBadge: 'bg-emerald-600 text-white' };
    }
    if (startMinutes >= 1080) {
      return { tag: 'Husband', sub: 'Sunday Night', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/60', bgBadge: 'bg-indigo-600 text-white' };
    }
    return { tag: 'Grandfathers', sub: 'Midnight', color: 'text-purple-400 border-purple-500/40 bg-purple-950/60', bgBadge: 'bg-purple-600 text-white' };
  }

  if (day === 'Monday') {
    if (startMinutes < 300) {
      return { tag: 'Uncle', sub: 'Monday Midnight', color: 'text-amber-400 border-amber-500/40 bg-amber-950/60', bgBadge: 'bg-amber-600 text-white' };
    }
    if (startMinutes >= 720 && startMinutes < 780) {
      return { tag: 'Sons', sub: 'Noontime', color: 'text-blue-400 border-blue-500/40 bg-blue-950/60', bgBadge: 'bg-blue-600 text-white' };
    }
    if (startMinutes >= 780 && startMinutes < 990) {
      return { tag: 'Daughters', sub: 'Afternoon', color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/60', bgBadge: 'bg-fuchsia-600 text-white' };
    }
    if (startMinutes >= 990 && startMinutes < 1080) {
      return { tag: 'Grandmothers', sub: 'Late Afternoon', color: 'text-orange-400 border-orange-500/40 bg-orange-950/60', bgBadge: 'bg-orange-600 text-white' };
    }
    if (startMinutes >= 1080 && startMinutes < 1350) {
      return { tag: 'Mothers', sub: 'Primetime', color: 'text-rose-400 border-rose-500/40 bg-rose-950/60', bgBadge: 'bg-rose-600 text-white' };
    }
    if (startMinutes >= 1350) {
      return { tag: 'Fathers', sub: 'Late Night', color: 'text-violet-400 border-violet-500/40 bg-violet-950/60', bgBadge: 'bg-violet-600 text-white' };
    }
  }

  // Tuesday to Friday
  if (startMinutes < 300) {
    return { tag: 'Grandfathers', sub: 'Tuesday to Saturday Midnight', color: 'text-purple-400 border-purple-500/40 bg-purple-950/60', bgBadge: 'bg-purple-600 text-white' };
  }
  if (startMinutes >= 720 && startMinutes < 780) {
    return { tag: 'Sons', sub: 'Noontime', color: 'text-blue-400 border-blue-500/40 bg-blue-950/60', bgBadge: 'bg-blue-600 text-white' };
  }
  if (startMinutes >= 780 && startMinutes < 990) {
    return { tag: 'Daughters', sub: 'Afternoon', color: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/60', bgBadge: 'bg-fuchsia-600 text-white' };
  }
  if (startMinutes >= 990 && startMinutes < 1080) {
    return { tag: 'Grandmothers', sub: 'Late Afternoon', color: 'text-orange-400 border-orange-500/40 bg-orange-950/60', bgBadge: 'bg-orange-600 text-white' };
  }
  if (startMinutes >= 1080 && startMinutes < 1350) {
    return { tag: 'Mothers', sub: 'Primetime', color: 'text-rose-400 border-rose-500/40 bg-rose-950/60', bgBadge: 'bg-rose-600 text-white' };
  }
  return { tag: 'Fathers', sub: 'Late Night', color: 'text-violet-400 border-violet-500/40 bg-violet-950/60', bgBadge: 'bg-violet-600 text-white' };
}

export function getProgramRating(prog: { title: string; category: string; rating?: ParentalRating }): {
  rating: ParentalRating;
  label: string;
  description: string;
  style: string;
  badgeStyle: string;
} {
  let rating: ParentalRating = prog.rating || 'PG';

  if (!prog.rating) {
    const titleLower = prog.title.toLowerCase();
    if (
      titleLower.includes('imbestigador') ||
      titleLower.includes('resibo') ||
      titleLower.includes('karelasyon') ||
      titleLower.includes('i-witness') ||
      titleLower.includes('reporter')
    ) {
      rating = 'SPG';
    } else if (
      prog.category === 'Shopping' ||
      titleLower.includes('ez shop') ||
      titleLower.includes('shop tv') ||
      titleLower.includes('farm to table') ||
      titleLower.includes('tropang potchi') ||
      titleLower.includes('aha!') ||
      titleLower.includes('born to be wild') ||
      titleLower.includes('pinoy md') ||
      titleLower.includes('day off')
    ) {
      rating = 'G';
    } else {
      rating = 'PG';
    }
  }

  switch (rating) {
    case 'G':
      return {
        rating: 'G',
        label: 'G - General Patronage',
        description: 'General Patronage - Suitable for all ages',
        style: 'bg-emerald-600 text-white border-emerald-400/40 shadow-xs',
        badgeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      };
    case 'SPG':
      return {
        rating: 'SPG',
        label: 'SPG - Strong Parental Guidance',
        description: 'Strong Parental Guidance - Sensitive themes & crime investigation scenes',
        style: 'bg-rose-700 text-white border-rose-500/40 shadow-xs',
        badgeStyle: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      };
    case 'PG':
    default:
      return {
        rating: 'PG',
        label: 'PG - Parental Guidance',
        description: 'Parental Guidance - Parental guidance recommended for young viewers',
        style: 'bg-amber-600 text-white border-amber-400/40 shadow-xs',
        badgeStyle: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      };
  }
}

export function getProgramProgress(
  startMinutes: number,
  endMinutes: number,
  activeDay: DayType,
  realCurrentDay: DayType,
  now: Date
): {
  percent: number;
  statusLabel: string;
  isLive: boolean;
  color: string;
} {
  if (activeDay !== realCurrentDay) {
    return {
      percent: 0,
      statusLabel: `Scheduled for ${activeDay}`,
      isLive: false,
      color: 'bg-zinc-300 dark:bg-zinc-700'
    };
  }

  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  if (currentTotalMinutes < startMinutes) {
    const minsUntil = Math.ceil(startMinutes - currentTotalMinutes);
    return {
      percent: 0,
      statusLabel: minsUntil > 60 ? 'Upcoming' : `Starts in ${minsUntil} min${minsUntil === 1 ? '' : 's'}`,
      isLive: false,
      color: 'bg-indigo-500/30'
    };
  }

  if (currentTotalMinutes >= endMinutes) {
    return {
      percent: 100,
      statusLabel: 'Finished',
      isLive: false,
      color: 'bg-zinc-400 dark:bg-zinc-600'
    };
  }

  const duration = Math.max(1, endMinutes - startMinutes);
  const elapsed = currentTotalMinutes - startMinutes;
  const percent = Math.min(100, Math.max(0, (elapsed / duration) * 100));
  const remainingMins = Math.ceil(endMinutes - currentTotalMinutes);

  return {
    percent,
    statusLabel: `${Math.round(percent)}% elapsed (${remainingMins}m left)`,
    isLive: true,
    color: 'bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 shadow-xs shadow-rose-500/50'
  };
}

export interface ReminderItem {
  id: string;
  programId: string;
  programTitle: string;
  programTime: string;
  day: DayType;
  startMinutes: number;
  notifyAtMs: number;
  triggered?: boolean;
}

export const TVScheduleView: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active reminders state loaded from localStorage
  const [reminders, setReminders] = useState<Record<string, ReminderItem>>(() => {
    try {
      const saved = localStorage.getItem('tv_schedule_reminders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Real-time tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Interval checker to trigger browser notification 5 minutes before scheduled show
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const nowMs = Date.now();
      let hasChange = false;
      const updatedReminders = { ...reminders };

      Object.values(updatedReminders).forEach((rem) => {
        if (!rem.triggered && nowMs >= rem.notifyAtMs) {
          // Trigger browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`📺 ${rem.programTitle} Starts in 5 Minutes!`, {
                body: `Get ready! ${rem.programTitle} airs at ${rem.programTime} on ${rem.day}.`,
                icon: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80'
              });
            } catch (err) {
              console.error('Notification trigger error:', err);
            }
          }
          showToast(`🔔 SHOW REMINDER: ${rem.programTitle} starts in 5 minutes! (${rem.programTime})`);
          updatedReminders[rem.id] = { ...rem, triggered: true };
          hasChange = true;
        }
      });

      if (hasChange) {
        setReminders(updatedReminders);
        try {
          localStorage.setItem('tv_schedule_reminders', JSON.stringify(updatedReminders));
        } catch (e) {
          console.error(e);
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [reminders]);

  const toggleReminder = async (prog: { id: string; title: string; time: string; startMinutes: number }, day: DayType) => {
    const reminderKey = `${prog.id}_${day}`;

    if (reminders[reminderKey]) {
      const newReminders = { ...reminders };
      delete newReminders[reminderKey];
      setReminders(newReminders);
      try {
        localStorage.setItem('tv_schedule_reminders', JSON.stringify(newReminders));
      } catch (e) {
        console.error(e);
      }
      showToast(`Reminder removed for "${prog.title}"`);
      return;
    }

    // Request browser notification permission if available
    let permissionGranted = false;
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        permissionGranted = true;
      } else if (Notification.permission !== 'denied') {
        const result = await Notification.requestPermission();
        permissionGranted = result === 'granted';
      }
    }

    // Calculate show start date and target notification time (5 minutes before)
    const currentDate = new Date();
    const daysOfWeekArr: DayType[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIdx = currentDate.getDay();
    const targetDayIdx = daysOfWeekArr.indexOf(day);

    let daysOffset = (targetDayIdx - currentDayIdx + 7) % 7;

    const showDate = new Date(currentDate);
    showDate.setDate(currentDate.getDate() + daysOffset);
    showDate.setHours(Math.floor(prog.startMinutes / 60), prog.startMinutes % 60, 0, 0);

    // 5 minutes before show start time
    let notifyAtMs = showDate.getTime() - 5 * 60 * 1000;

    // If the 5-minute reminder time for today has already passed, set for next week's occurrence
    if (notifyAtMs <= Date.now()) {
      showDate.setDate(showDate.getDate() + 7);
      notifyAtMs = showDate.getTime() - 5 * 60 * 1000;
    }

    const newReminder: ReminderItem = {
      id: reminderKey,
      programId: prog.id,
      programTitle: prog.title,
      programTime: prog.time,
      day,
      startMinutes: prog.startMinutes,
      notifyAtMs,
      triggered: false
    };

    const updated = { ...reminders, [reminderKey]: newReminder };
    setReminders(updated);
    try {
      localStorage.setItem('tv_schedule_reminders', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    const reminderTimeFormatted = new Date(notifyAtMs).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (permissionGranted) {
      try {
        new Notification(`⏰ Reminder Set: ${prog.title}`, {
          body: `You will get a browser notification 5 minutes before ${prog.title} (${prog.time} on ${day}).`,
          icon: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=120&auto=format&fit=crop&q=80'
        });
      } catch (e) {
        console.error(e);
      }
      showToast(`⏰ Reminder active! Browser alert set for ${reminderTimeFormatted} (5 mins before ${prog.title}).`);
    } else {
      showToast(`⏰ In-app reminder set for ${reminderTimeFormatted}! (Enable browser notifications for system popups).`);
    }
  };

  const daysOfWeekArr: DayType[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const realCurrentDay = daysOfWeekArr[now.getDay()];

  // Active day selection defaulting to actual current day
  const [activeDay, setActiveDay] = useState<DayType>(() => {
    return daysOfWeekArr[new Date().getDay()];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');

  // Convert real current time to total minutes from midnight
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Get raw programs for selected day
  const dayPrograms = ALL_PROGRAMS.filter((prog) => prog.days.includes(activeDay));

  // Sort programs chronologically by start time and attach family tag, rating & live progress info
  const sortedDayPrograms = [...dayPrograms].map((prog) => {
    const { startMinutes, endMinutes } = getProgramStartEnd(prog.time);
    const familyTag = getFamilyTag(startMinutes, activeDay, prog.title);
    const ratingInfo = getProgramRating(prog);
    const progress = getProgramProgress(startMinutes, endMinutes, activeDay, realCurrentDay, now);
    return { ...prog, startMinutes, endMinutes, familyTag, ratingInfo, progress };
  }).sort((a, b) => a.startMinutes - b.startMinutes);

  // Filter sorted programs based on user search query, category, family tag & parental rating
  const filteredPrograms = sortedDayPrograms.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.hostOrStar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.familyTag.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.familyTag.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.ratingInfo.rating.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.ratingInfo.label.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || program.category === selectedCategory;

    const matchesTag =
      selectedTag === 'All' || program.familyTag.tag === selectedTag;

    const matchesRating =
      selectedRating === 'All' || program.ratingInfo.rating === selectedRating;

    return matchesSearch && matchesCategory && matchesTag && matchesRating;
  });

  // Dynamically calculate NOW SHOWING, UP NEXT, and LATER based on active date & time
  let nowIndex = -1;

  if (activeDay === realCurrentDay) {
    nowIndex = sortedDayPrograms.findIndex(
      (prog) => currentMinutes >= prog.startMinutes && currentMinutes < prog.endMinutes
    );
    if (nowIndex === -1) {
      // Find closest program coming up or just passed
      const nextIdx = sortedDayPrograms.findIndex((prog) => prog.startMinutes > currentMinutes);
      if (nextIdx > 0) nowIndex = nextIdx - 1;
      else if (nextIdx === -1 && sortedDayPrograms.length > 0) {
        nowIndex = sortedDayPrograms.length - 1;
      } else {
        nowIndex = 0;
      }
    }
  } else {
    nowIndex = 0;
  }

  if (nowIndex < 0 && sortedDayPrograms.length > 0) {
    nowIndex = 0;
  }

  const nowProgram = sortedDayPrograms[nowIndex] || null;
  const upNextProgram = sortedDayPrograms[nowIndex + 1] || sortedDayPrograms[0] || null;
  const laterProgram = sortedDayPrograms[nowIndex + 2] || sortedDayPrograms[1] || null;

  const getStatusBadge = (programId: string) => {
    if (nowProgram && programId === nowProgram.id) {
      return {
        label: 'NOW SHOWING',
        style: 'bg-rose-600 text-white animate-pulse shadow-rose-600/30 font-black'
      };
    }
    if (upNextProgram && programId === upNextProgram.id) {
      return {
        label: 'UP NEXT',
        style: 'bg-amber-500 text-zinc-950 font-black'
      };
    }
    if (laterProgram && programId === laterProgram.id) {
      return {
        label: 'LATER',
        style: 'bg-indigo-600 text-white font-bold'
      };
    }
    return {
      label: 'SCHEDULED',
      style: 'bg-zinc-800 text-zinc-300 font-medium'
    };
  };

  const formattedActiveDateTime = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 text-zinc-900 dark:text-white relative">
      {/* Floating Toast Notification Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-zinc-900 text-white p-4 rounded-2xl border border-amber-500/50 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <BellRing size={20} className="text-amber-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 text-xs font-medium text-zinc-200 leading-snug">
            {toastMessage}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Banner with Real-time Active Date & Time Clock */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 text-white p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Tv size={260} />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-zinc-800/80 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-300 border border-white/10">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Official Network Broadcast Grid</span>
            </div>

            {/* Active Real-Time Date & Clock Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 backdrop-blur-md rounded-full text-xs font-mono font-bold border border-emerald-500/30">
              <Clock size={13} className="text-emerald-400" />
              <span>Active Date & Time: {formattedActiveDateTime}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            TV Program Schedule
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
            Explore daily broadcast lineups, airtimes, starring casts, news anchors, and show descriptions across Monday through Sunday.
          </p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="bg-white dark:bg-zinc-900 p-2 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = activeDay === day;
            const isToday = realCurrentDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-[100px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Calendar size={14} className={isSelected ? 'text-white' : 'text-zinc-400'} />
                <span>{day}</span>
                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs absolute top-1.5 right-1.5" title="Active Today" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured LIVE Schedule Status Bar: NOW, UP NEXT, and LATER dynamically calculated based on Active Date & Time */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>{activeDay} Real-Time Lineup Status</span>
          </h2>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Active Clock Synced</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NOW SHOWING CARD */}
          {nowProgram && (
            <div className="bg-gradient-to-br from-rose-950/90 via-zinc-900 to-zinc-950 text-white p-4 sm:p-5 rounded-3xl border border-rose-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg animate-pulse">
                    <Radio size={12} />
                    <span>Now Showing</span>
                  </span>
                  <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                    <Clock size={13} />
                    <span>{nowProgram.time}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={nowProgram.coverPhoto}
                    alt={nowProgram.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-rose-500/30 shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                      {nowProgram.title}
                    </h3>
                    <p className="text-[11px] text-zinc-300 font-medium line-clamp-1 mt-0.5">
                      {nowProgram.hostOrStar}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-rose-200 font-bold">
                        {nowProgram.category}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border flex items-center gap-1 ${nowProgram.ratingInfo.badgeStyle}`}>
                        <Shield size={10} />
                        <span>{nowProgram.ratingInfo.rating}</span>
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${nowProgram.familyTag.color}`}>
                        🏷️ {nowProgram.familyTag.tag}
                      </span>
                    </div>

                    {/* Mini Progress Bar for Now Showing */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-rose-200 font-medium">
                        <span>Elapsed Progress</span>
                        <span className="font-extrabold text-rose-300">{nowProgram.progress.statusLabel}</span>
                      </div>
                      <div className="w-full h-1.5 bg-rose-950/80 rounded-full overflow-hidden border border-rose-500/30">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 rounded-full transition-all duration-500 shadow-xs"
                          style={{ width: `${nowProgram.progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex items-center justify-between text-[11px] text-rose-200">
                <span className="flex items-center gap-1">
                  <Play size={13} className="text-rose-400 fill-rose-400" />
                  <span>Airing Now</span>
                </span>
                <button
                  onClick={() => toggleReminder({ id: nowProgram.id, title: nowProgram.title, time: nowProgram.time, startMinutes: nowProgram.startMinutes }, activeDay)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-[10px] text-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {reminders[`${nowProgram.id}_${activeDay}`] ? (
                    <>
                      <BellRing size={12} className="text-amber-400 animate-bounce" />
                      <span>Reminder On</span>
                    </>
                  ) : (
                    <>
                      <Bell size={12} />
                      <span>Remind Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* UP NEXT CARD */}
          {upNextProgram && (
            <div className="bg-gradient-to-br from-amber-950/80 via-zinc-900 to-zinc-950 text-white p-4 sm:p-5 rounded-3xl border border-amber-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-zinc-950 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
                    <Clock size={12} />
                    <span>Up Next</span>
                  </span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Clock size={13} />
                    <span>{upNextProgram.time}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={upNextProgram.coverPhoto}
                    alt={upNextProgram.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-amber-500/30 shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {upNextProgram.title}
                    </h3>
                    <p className="text-[11px] text-zinc-300 font-medium line-clamp-1 mt-0.5">
                      {upNextProgram.hostOrStar}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-amber-200 font-bold">
                        {upNextProgram.category}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border flex items-center gap-1 ${upNextProgram.ratingInfo.badgeStyle}`}>
                        <Shield size={10} />
                        <span>{upNextProgram.ratingInfo.rating}</span>
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${upNextProgram.familyTag.color}`}>
                        🏷️ {upNextProgram.familyTag.tag}
                      </span>
                    </div>

                    {/* Mini Progress Bar for Up Next */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-amber-200 font-medium">
                        <span>Airing Status</span>
                        <span className="font-extrabold text-amber-300">{upNextProgram.progress.statusLabel}</span>
                      </div>
                      <div className="w-full h-1.5 bg-amber-950/80 rounded-full overflow-hidden border border-amber-500/30">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${upNextProgram.progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-200">
                <span className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-amber-400" />
                  <span>Up Next</span>
                </span>
                <button
                  onClick={() => toggleReminder({ id: upNextProgram.id, title: upNextProgram.title, time: upNextProgram.time, startMinutes: upNextProgram.startMinutes }, activeDay)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-[10px] text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {reminders[`${upNextProgram.id}_${activeDay}`] ? (
                    <>
                      <BellRing size={12} className="text-amber-400 animate-bounce" />
                      <span>Reminder On</span>
                    </>
                  ) : (
                    <>
                      <Bell size={12} />
                      <span>Remind Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* LATER CARD */}
          {laterProgram && (
            <div className="bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 text-white p-4 sm:p-5 rounded-3xl border border-indigo-500/40 shadow-xl relative overflow-hidden flex flex-col justify-between group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
                    <Calendar size={12} />
                    <span>Later Today</span>
                  </span>
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                    <Clock size={13} />
                    <span>{laterProgram.time}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={laterProgram.coverPhoto}
                    alt={laterProgram.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-indigo-500/30 shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {laterProgram.title}
                    </h3>
                    <p className="text-[11px] text-zinc-300 font-medium line-clamp-1 mt-0.5">
                      {laterProgram.hostOrStar}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded text-indigo-200 font-bold">
                        {laterProgram.category}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border flex items-center gap-1 ${laterProgram.ratingInfo.badgeStyle}`}>
                        <Shield size={10} />
                        <span>{laterProgram.ratingInfo.rating}</span>
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${laterProgram.familyTag.color}`}>
                        🏷️ {laterProgram.familyTag.tag}
                      </span>
                    </div>

                    {/* Mini Progress Bar for Later */}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-indigo-200 font-medium">
                        <span>Airing Status</span>
                        <span className="font-extrabold text-indigo-300">{laterProgram.progress.statusLabel}</span>
                      </div>
                      <div className="w-full h-1.5 bg-indigo-950/80 rounded-full overflow-hidden border border-indigo-500/30">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${laterProgram.progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-indigo-200">
                <span className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-indigo-400" />
                  <span>Later Today</span>
                </span>
                <button
                  onClick={() => toggleReminder({ id: laterProgram.id, title: laterProgram.title, time: laterProgram.time, startMinutes: laterProgram.startMinutes }, activeDay)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-[10px] text-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {reminders[`${laterProgram.id}_${activeDay}`] ? (
                    <>
                      <BellRing size={12} className="text-amber-400 animate-bounce" />
                      <span>Reminder On</span>
                    </>
                  ) : (
                    <>
                      <Bell size={12} />
                      <span>Remind Me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls: Search, Category Filter & Family Slot Tag Filter */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeDay}'s schedule by show, star, or tag (e.g. Sons, Mothers, Uncle, Boyfriend)...`}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'News', 'Drama', 'Comedy', 'Public Affairs', 'Lifestyle', 'Movie', 'Shopping'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Family Slot Tag Filter Pills */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-black uppercase text-zinc-400 shrink-0 mr-1">Time Slot Tags:</span>
          {[
            'All',
            'Sons',
            'Daughters',
            'Grandmothers',
            'Mothers',
            'Fathers',
            'Grandfathers',
            'Brothers',
            'Boyfriend',
            'Girlfriend',
            'Wife',
            'Husband',
            'Uncle'
          ].map((tagItem) => {
            const isSelected = selectedTag === tagItem;
            return (
              <button
                key={tagItem}
                onClick={() => setSelectedTag(tagItem)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-indigo-500/50'
                }`}
              >
                🏷️ {tagItem}
              </button>
            );
          })}
        </div>

        {/* Parental Rating Filter Pills */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-black uppercase text-zinc-400 shrink-0 mr-1 flex items-center gap-1">
            <Shield size={12} className="text-amber-500" />
            <span>Parental Rating:</span>
          </span>
          {[
            { id: 'All', label: 'All Ratings' },
            { id: 'G', label: 'G (General Patronage)' },
            { id: 'PG', label: 'PG (Parental Guidance)' },
            { id: 'SPG', label: 'SPG (Strong Guidance)' }
          ].map((rateItem) => {
            const isSelected = selectedRating === rateItem.id;
            return (
              <button
                key={rateItem.id}
                onClick={() => setSelectedRating(rateItem.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:border-amber-500/50'
                }`}
              >
                {rateItem.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Grid Cards */}
      {filteredPrograms.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Info size={36} className="mx-auto text-zinc-400" />
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No TV programs found for {activeDay}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing tag and rating filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrograms.map((prog) => {
            const status = getStatusBadge(prog.id);
            return (
              <div
                key={`${prog.id}-${activeDay}`}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Cover Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={prog.coverPhoto}
                    alt={prog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badge (NOW SHOWING, UP NEXT, LATER, SCHEDULED) */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] rounded-lg border border-white/20 shadow-md ${status.style}`}>
                    {status.label}
                  </span>

                  {/* Parental Rating & Category Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-md flex items-center gap-1 ${prog.ratingInfo.style}`}
                      title={prog.ratingInfo.description}
                    >
                      {prog.ratingInfo.rating === 'SPG' ? (
                        <ShieldAlert size={12} />
                      ) : prog.ratingInfo.rating === 'G' ? (
                        <ShieldCheck size={12} />
                      ) : (
                        <Shield size={12} />
                      )}
                      <span>{prog.ratingInfo.rating}</span>
                    </span>

                    <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white rounded-lg border border-white/20">
                      {prog.category}
                    </span>
                  </div>

                  {/* Time Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
                    <Clock size={13} />
                    <span>{prog.time}</span>
                  </div>

                  {/* Cover Photo Bottom Progress Bar Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${prog.progress.color}`}
                      style={{ width: `${prog.progress.percent}%` }}
                    />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{prog.week}</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Parental Rating Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black rounded-md border backdrop-blur-md flex items-center gap-1 cursor-help ${prog.ratingInfo.badgeStyle}`}
                          title={prog.ratingInfo.description}
                        >
                          <Shield size={10} />
                          <span>{prog.ratingInfo.rating}</span>
                        </span>

                        {/* Family Slot Tag Badge */}
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border backdrop-blur-md ${prog.familyTag.color}`}>
                          🏷️ {prog.familyTag.tag} ({prog.familyTag.sub})
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {prog.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {prog.description}
                    </p>

                    {/* Visual Broadcast Progress Bar */}
                    <div className="py-2.5 px-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-bold text-zinc-600 dark:text-zinc-300">
                          {prog.progress.isLive ? (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          ) : (
                            <Clock size={12} className="text-zinc-400" />
                          )}
                          <span className={prog.progress.isLive ? 'text-rose-600 dark:text-rose-400 font-extrabold uppercase tracking-wider' : 'text-zinc-500 dark:text-zinc-400'}>
                            {prog.progress.isLive ? 'LIVE ON AIR' : 'BROADCAST PROGRESS'}
                          </span>
                        </span>
                        <span className={`text-[10px] font-extrabold ${prog.progress.isLive ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {prog.progress.statusLabel}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${prog.progress.color}`}
                          style={{ width: `${prog.progress.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hosted by or Starring Section */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                    <div className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                      <User size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold block text-zinc-900 dark:text-white">
                          {prog.hostOrStar.startsWith('Hosted by') ? 'Hosted by:' : 'Starring:'}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium leading-tight block">
                          {prog.hostOrStar.replace(/^(Hosted by|Starring)\s*/i, '')}
                        </span>
                      </div>
                    </div>

                    {/* Set Reminder Button */}
                    <button
                      onClick={() => toggleReminder({ id: prog.id, title: prog.title, time: prog.time, startMinutes: prog.startMinutes }, activeDay)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                        reminders[`${prog.id}_${activeDay}`]
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/25 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                      }`}
                    >
                      {reminders[`${prog.id}_${activeDay}`] ? (
                        <>
                          <BellRing size={14} className="text-amber-500 animate-bounce" />
                          <span>Reminder Set (-5 mins)</span>
                          <Check size={13} className="text-amber-500 ml-auto" />
                        </>
                      ) : (
                        <>
                          <Bell size={14} />
                          <span>Set Reminder (-5 mins)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TVScheduleView;
