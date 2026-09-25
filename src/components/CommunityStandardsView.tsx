import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  BookOpen,
  FileText,
  AlertTriangle,
  UserX,
  Trash2,
  Lock,
  EyeOff,
  Flame,
  MessageSquare,
  Scale,
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Flag
} from 'lucide-react';

export interface CommunityStandardsViewProps {
  onBackToDashboard?: () => void;
}

interface PolicyCategory {
  id: string;
  title: string;
  iconName: string;
  badge: string;
  summary: string;
  details: string[];
  prohibitedBehaviors: string[];
  enforcementAction: string;
}

const POLICIES: PolicyCategory[] = [
  {
    id: 'community-standards-overview',
    title: 'Community Standards',
    iconName: 'ShieldCheck',
    badge: 'Core Policy',
    summary: 'Our foundational commitment to keeping our ecosystem safe, respectful, creative, and inclusive for all content creators and viewers.',
    details: [
      'These standards apply to all content including videos, showbiz news articles, photos, polls, quizzes, comments, user handles, and profile metadata.',
      'By using our platform, you agree to adhere to these standards at all times across all public and private interactions.',
      'We use automated detection systems combined with human reviewer teams to monitor and enforce these guidelines 24/7.'
    ],
    prohibitedBehaviors: [
      'Violating any platform guideline or attempt to circumvent safety filters',
      'Encouraging others to breach community rules or orchestrate policy breaches',
      'Repeatedly publishing low-quality, misleading, or bad-faith submissions'
    ],
    enforcementAction: 'Warning, temporary posting restrictions, or account suspension depending on severity.'
  },
  {
    id: 'copyright',
    title: 'Copyright & Intellectual Property',
    iconName: 'FileText',
    badge: 'Legal & IP',
    summary: 'Respect for intellectual property rights. Only upload videos, images, news stories, and assets that you own or have explicit authorization to license.',
    details: [
      'Do not upload audio tracks, video clips, celebrity photography, or artwork owned by third parties without appropriate permission or fair-use justification.',
      'Rightsholders can file formal Digital Millennium Copyright Act (DMCA) takedown notices through our designated portal.',
      'Repeat infringers will face permanent account termination under our strict Three-Strike DMCA Policy.'
    ],
    prohibitedBehaviors: [
      'Re-uploading copyrighted TV shows, movies, music videos, or concerts without authorization',
      'Using copyrighted music tracks as background audio without commercial clearance',
      'Scraping and republishing full paywalled articles or news reports'
    ],
    enforcementAction: 'Immediate content removal, DMCA strike issuance, and permanent ban after 3 strikes.'
  },
  {
    id: 'nudity-sexual',
    title: 'Nudity or Sexual Content',
    iconName: 'EyeOff',
    badge: 'Safety',
    summary: 'Prohibition of explicit adult content, sexually suggestive material involving minors, pornographic imagery, and non-consensual sexual content.',
    details: [
      'We maintain a zero-tolerance policy for sexually explicit media, pornographic clips, and non-consensual intimacy.',
      'Artistic or educational nudity must be age-gated and strictly compliant with sensitive media labeling standards.',
      'Any sexualization of minors results in immediate law enforcement escalation and lifetime IP blacklisting.'
    ],
    prohibitedBehaviors: [
      'Pornography, explicit sexual acts, or genitalia exposure',
      'Non-consensual sexual content, revenge material, or deepfake explicit imagery',
      'Sexually provocative depictions of minors or young actors'
    ],
    enforcementAction: 'Immediate content deletion, account ban, and referral to NCMEC/law enforcement if minors are involved.'
  },
  {
    id: 'spam-scams',
    title: 'Spam and Scams',
    iconName: 'AlertTriangle',
    badge: 'Security',
    summary: 'Protecting users from fraudulent schemes, artificial engagement manipulation, phishing links, crypto scams, and deceptive marketing.',
    details: [
      'Do not post repetitive automated comments, clickbait scams, fake giveaway links, or deceptive promotional code spam.',
      'Artificially inflating view counts, poll votes, or quiz entries using botnets or pay-per-click farms is strictly prohibited.',
      'Phishing attempts targeting user credentials or financial payment cards will trigger immediate security locks.'
    ],
    prohibitedBehaviors: [
      'Promoting guaranteed financial returns, crypto pump-and-dump schemes, or phishing URLs',
      'Automated mass commenting, bot creation, or artificial engagement farming',
      'Deceptive thumbnail images or titles promising fake monetary prizes'
    ],
    enforcementAction: 'Content purge, account ban, and domain blacklisting.'
  },
  {
    id: 'hate-speech',
    title: 'Hate Speech & Discrimination',
    iconName: 'Flame',
    badge: 'Inclusion',
    summary: 'Building an environment free from hateful attacks, slurs, dehumanizing language, and discrimination targeting protected groups.',
    details: [
      'Hate speech includes attacks, dehumanization, or incitement of violence against individuals or groups based on race, ethnicity, nationality, religion, disability, age, veteran status, sexual orientation, or gender identity.',
      'We do not tolerate white supremacy, caste discrimination, or hate symbols in thumbnails, articles, or profile avatars.',
      'Counterspeech and educational discussions of historical hate events are permitted with context.'
    ],
    prohibitedBehaviors: [
      'Using racial, ethnic, or homophobic slurs or dehumanizing tropes',
      'Promoting violent ideology, segregation, or inferiority of protected characteristics',
      'Harassing public figures or creators with discriminatory slurs in comments'
    ],
    enforcementAction: 'Immediate content removal, strike issuance, or permanent account termination.'
  },
  {
    id: 'trademark',
    title: 'Trademark Infringement',
    iconName: 'Lock',
    badge: 'Legal & IP',
    summary: 'Protection of business logos, brand names, and official company marks against unauthorized commercial confusion or misrepresentation.',
    details: [
      'Do not use registered brand names, corporate logos, or protected trade dress in a manner that tricks users into believing your channel or account is officially affiliated with that brand.',
      'Fair commentary, reviews, and news reporting about companies are fully allowed under informational usage rules.'
    ],
    prohibitedBehaviors: [
      'Posing as official brand customer support or corporate handles',
      'Using registered trademarks as channel logos to deceive buyers',
      'Selling unapproved branded merchandise via video links'
    ],
    enforcementAction: 'Content removal, handle reclamation, and account strike.'
  },
  {
    id: 'counterfeit',
    title: 'Counterfeit Items & Fake Goods',
    iconName: 'Ban',
    badge: 'Commerce Policy',
    summary: 'Prohibiting the display, promotion, sale, or distribution of knockoff products, fake designer goods, or replica merchandise.',
    details: [
      'Content that advertises or provides links to purchase counterfeit designer clothing, pirated electronics, or fake luxury goods is strictly prohibited.',
      'Reviews comparing genuine and counterfeit items are allowed only if they do not promote vendor purchasing channels.'
    ],
    prohibitedBehaviors: [
      'Providing direct purchasing links to replica/counterfeit websites',
      'Promoting illegal knockoff luxury bags, watches, or designer gear',
      'Offering instructions on how to import unauthorized counterfeit items'
    ],
    enforcementAction: 'Content deletion and account suspension.'
  },
  {
    id: 'legal-complaint',
    title: 'Legal Complaints & Court Orders',
    iconName: 'Scale',
    badge: 'Compliance',
    summary: 'Handling valid court orders, government legal demands, statutory removal requests, and local legal compliance.',
    details: [
      'When presented with valid court orders, subpoenas, or official government requests, we evaluate demands strictly against applicable laws and human rights principles.',
      'Users whose content is subject to legal demand notices will be notified where legally permissible.'
    ],
    prohibitedBehaviors: [
      'Violating valid local statutes, cybercrime laws, or court injunctions',
      'Filing fraudulent or bad-faith legal removal requests'
    ],
    enforcementAction: 'Geo-blocking of non-compliant content or global removal pursuant to legal mandates.'
  },
  {
    id: 'privacy-standards',
    title: 'Privacy Standards & Doxxing',
    iconName: 'Lock',
    badge: 'Privacy',
    summary: 'Protecting user personal information, private records, non-public personal media, and preventing malicious doxxing.',
    details: [
      'Publishing private personally identifiable information (PII) such as home addresses, personal phone numbers, government IDs, bank details, or private medical documents without consent is prohibited.',
      'Unconsented intimate imagery or secretly recorded footage in private spaces is strictly banned.'
    ],
    prohibitedBehaviors: [
      'Doxxing users by revealing personal home locations, private emails, or identification cards',
      'Sharing private phone numbers or banking info in comments or showbiz news',
      'Recording individuals in private environments without their consent'
    ],
    enforcementAction: 'Immediate content deletion and account suspension.'
  },
  {
    id: 'impersonation',
    title: 'Impersonation Policy',
    iconName: 'UserX',
    badge: 'Identity',
    summary: 'Prohibiting accounts that pretend to be another person, celebrity, brand, public figure, or official entity to deceive others.',
    details: [
      'Accounts copying another person’s avatar, bio, name, and posting style to mislead viewers are subject to removal.',
      'Fan accounts and satire/parody channels must explicitly state "Fan Account" or "Parody" in their display name and channel bio.'
    ],
    prohibitedBehaviors: [
      'Creating fake celebrity profiles to scam fans or solicit money',
      'Posing as platform moderators, staff, or system bots',
      'Copying another creator’s exact handle and channel design to siphon views'
    ],
    enforcementAction: 'Profile reset, handle forfeiture, and permanent account termination.'
  },
  {
    id: 'harassment',
    title: 'Harassment & Cyberbullying',
    iconName: 'MessageSquare',
    badge: 'Safety',
    summary: 'Zero tolerance for targeted abuse, stalking, extortion, dogpiling, threats, and persistent unwanted contact.',
    details: [
      'Harassment includes targeted insults, mass brigading, sexual harassment, blackmail, and persistent abusive comments across videos, polls, or news items.',
      'We offer robust comment blocking, word filtering, and user blocking tools to protect creators.'
    ],
    prohibitedBehaviors: [
      'Organizing mass harassment campaigns or "dogpiling" against individuals',
      'Sending repeated unwanted threat messages or derogatory comments',
      'Blackmailing or extortion attempts against creators'
    ],
    enforcementAction: 'Temporary or permanent comment muting, content deletion, and account ban.'
  },
  {
    id: 'violent-graphic',
    title: 'Violent or Graphic Content',
    iconName: 'ShieldAlert',
    badge: 'Safety',
    summary: 'Restricting gore, extreme physical violence, bodily harm, cruelty to animals, and sensationalized accident imagery.',
    details: [
      'Graphic violence, blood, mutilation, or severe injury intended to shock or disgust viewers is strictly prohibited.',
      'News coverage of war or public safety incidents must include appropriate content warnings and educational commentary.'
    ],
    prohibitedBehaviors: [
      'Uploading raw footage of homicides, executions, or violent assaults',
      'Depicting animal abuse, animal fighting, or intentional torture',
      'Sensationalized bloody accident scenes without news context'
    ],
    enforcementAction: 'Age-gating, content removal, or account ban.'
  },
  {
    id: 'guns-drugs',
    title: 'Guns, Drugs & Regulated Goods',
    iconName: 'Ban',
    badge: 'Legal & Safety',
    summary: 'Strict regulations regarding illicit narcotics, unregulated pharmaceuticals, illegal firearms, explosives, and dangerous contraband.',
    details: [
      'Selling, trading, or facilitating transactions for illegal firearms, ammunition, illicit narcotics, or prescription drugs without authorization is strictly banned.',
      'Tutorials on manufacturing homemade explosives, 3D printing unregistered ghost guns, or synthesizing illegal drugs are prohibited.'
    ],
    prohibitedBehaviors: [
      'Providing purchase links for illegal drugs or unregulated supplements',
      'Advertising illegal gun sales or unregistered weapon conversions',
      'Demonstrating DIY manufacturing of explosives, bomb detonators, or illegal chemical substances'
    ],
    enforcementAction: 'Immediate content deletion and permanent account termination.'
  },
  {
    id: 'harmful-dangerous',
    title: 'Harmful and Dangerous Policy',
    iconName: 'AlertTriangle',
    badge: 'Safety',
    summary: 'Prohibiting content that encourages dangerous physical stunts, dangerous dares, self-harm, suicide, or harmful medical misinformation.',
    details: [
      'We do not allow viral challenges or stunts that carry a high risk of severe physical injury, death, or permanent disability.',
      'Encouraging or providing instructions on suicide or self-harm is strictly prohibited and triggers crisis hotline intervention support.',
      'Harmful medical claims that contradict established health consensus during public health emergencies are subject to removal.'
    ],
    prohibitedBehaviors: [
      'Promoting dangerous viral stunts, choking games, or poison challenges',
      'Depicting, glorifying, or instructing on self-harm or suicide techniques',
      'Promoting toxic chemical cures or dangerous fake medical treatments'
    ],
    enforcementAction: 'Immediate removal, crisis referral overlay, and permanent account ban for repeat violations.'
  },
  {
    id: 'child-policy',
    title: 'Child Safety Policy',
    iconName: 'ShieldCheck',
    badge: 'Highest Priority',
    summary: 'Our paramount commitment to protecting children from abuse, exploitation, endangerment, cyberbullying, and inappropriate exposure.',
    details: [
      'Child Sexual Abuse Material (CSAM) or Child Sexual Exploitation and Abuse (CSAE) is subject to immediate removal, user ban, and criminal reporting to the National Center for Missing & Exploited Children (NCMEC).',
      'Minors featured in video content must be adequately supervised and protected from dangerous stunts or exploitation.',
      'Interactive features like comments on videos featuring minors may be automatically restricted.'
    ],
    prohibitedBehaviors: [
      'Any form of CSAM, CSAE, or sexual grooming behavior',
      'Forcing minors into unsafe physical acts, severe distress, or humiliation',
      'Exploitative monetization or inappropriate depiction of young children'
    ],
    enforcementAction: 'Zero tolerance: immediate global ban, permanent device blacklisting, and law enforcement escalation.'
  },
  {
    id: 'defamation',
    title: 'Defamation & Malicious Falsehoods',
    iconName: 'FileText',
    badge: 'Legal',
    summary: 'Prohibiting false statements of fact that cause provable reputational or monetary damage to individuals or organizations.',
    details: [
      'While showbiz news and celebrity commentary are central features of our platform, publishing known false statements claiming illegal acts or heinous crimes without factual basis is subject to review.',
      'Defamation complaints are evaluated under local legal frameworks upon receipt of formal documentation.'
    ],
    prohibitedBehaviors: [
      'Fabricating fake police reports or criminal allegations against creators',
      'Publishing forged legal documents to ruin an individual’s reputation',
      'Spreading fabricated medical or financial rumors intended to destroy a business'
    ],
    enforcementAction: 'Content correction notice, content removal, or account strike.'
  },
  {
    id: 'technological-measures',
    title: 'Circumvention of Technological Measures',
    iconName: 'Lock',
    badge: 'Security',
    summary: 'Strict prohibition against bypassing, disabling, or hacking security protections, paywalls, DRM, or anti-bot filters.',
    details: [
      'Users must not bypass digital rights management (DRM), platform access controls, quota systems, or anti-scraping protections.',
      'Publishing tutorials or software tools designed to crack platform subscriptions or bypass security systems is prohibited.'
    ],
    prohibitedBehaviors: [
      'Distributing crack scripts, key generators, or DRM removal tools',
      'Exploiting software vulnerabilities to bypass quota limits or subscription paywalls',
      'Attempting unauthorized API access, DDoS attacks, or database manipulation'
    ],
    enforcementAction: 'Immediate account termination, IP ban, and potential legal recourse.'
  },
  {
    id: 'content-removal-account-termination',
    title: 'Content Removal & Account Termination Policy',
    iconName: 'Trash2',
    badge: 'Enforcement Policy',
    summary: 'Clear outline of our progressive discipline, strike system, content takedown procedures, and permanent termination protocols.',
    details: [
      'System Warnings: Minor first-time infractions trigger a formal email warning and content removal.',
      'Strike 1: 7-day restriction from uploading new videos, articles, photos, or creating polls.',
      'Strike 2: 14-day global upload and comment blackout across all workspace features.',
      'Strike 3 (Within 90 Days): Permanent account termination, forfeiture of subscriber channel handles, and total removal of published content.',
      'Severe Infractions: Zero-tolerance violations (Child Safety, CSAM, terror threats, severe hacking) trigger immediate Strike 3 lifetime termination without prior warnings.'
    ],
    prohibitedBehaviors: [
      'Creating secondary ban-evasion accounts to bypass active suspensions',
      'Filing fraudulent appeals or harassing review staff'
    ],
    enforcementAction: 'Permanent lifetime ban, channel handle deletion, and network blacklisting.'
  }
];

export const CommunityStandardsView: React.FC<CommunityStandardsViewProps> = ({ onBackToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>('community-standards-overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportReason, setReportReason] = useState('copyright');
  const [reportDetails, setReportDetails] = useState('');

  const filteredPolicies = POLICIES.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.prohibitedBehaviors.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'safety') return matchesSearch && (policy.badge === 'Safety' || policy.badge === 'Highest Priority');
    if (selectedCategory === 'legal') return matchesSearch && (policy.badge === 'Legal & IP' || policy.badge === 'Legal' || policy.badge === 'Compliance');
    if (selectedCategory === 'enforcement') return matchesSearch && (policy.badge === 'Enforcement Policy' || policy.badge === 'Core Policy');
    return matchesSearch;
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportDetails('');
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-zinc-900 dark:text-white">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-black text-white p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <ShieldAlert size={280} />
        </div>
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-zinc-800/80 backdrop-blur-md rounded-full text-xs font-semibold text-zinc-200 border border-white/10">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Official Platform Policy Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Community Standards & Safety Rules
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
            Our comprehensive guidelines governing content creation, intellectual property, safety, user privacy, and account enforcement. Protecting our creators and audience across all media formats.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flag size={14} />
              <span>Report a Policy Violation</span>
            </button>
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition-all cursor-pointer"
              >
                Back to Workspace
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stats & Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Status</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Active & Enforced</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Discipline</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">3-Strike System</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Total Standards</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">18 Governance Rules</p>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
            <Ban size={22} />
          </div>
          <div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Zero Tolerance</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-white">Child Abuse & CSAM</p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies (e.g. Copyright, Spam, Harassment, Account Termination)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-white font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Policies ({POLICIES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('safety')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'safety'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Safety & Protection
          </button>
          <button
            onClick={() => setSelectedCategory('legal')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'legal'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Legal & IP
          </button>
          <button
            onClick={() => setSelectedCategory('enforcement')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'enforcement'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Enforcement
          </button>
        </div>
      </div>

      {/* Accordion Policy List */}
      <div className="space-y-3">
        {filteredPolicies.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <Info size={32} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No matching community policies found</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Try adjusting your search query or filter category.</p>
          </div>
        ) : (
          filteredPolicies.map((policy) => {
            const isExpanded = expandedPolicyId === policy.id;
            return (
              <div
                key={policy.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedPolicyId(isExpanded ? null : policy.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 pr-4">
                    <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold flex-shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">{policy.title}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {policy.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{policy.summary}</p>
                    </div>
                  </div>
                  <div className="text-zinc-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4 text-xs">
                    {/* Policy Summary Box */}
                    <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {policy.summary}
                    </div>

                    {/* Detailed Rules */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">Key Governance Directives</h4>
                      <ul className="space-y-1.5 pl-1">
                        {policy.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300">
                            <CheckCircle size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Prohibited Behaviors */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        <span>Strictly Prohibited Violations</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {policy.prohibitedBehaviors.map((behavior, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-rose-900 dark:text-rose-200 flex items-start gap-2"
                          >
                            <Ban size={14} className="text-rose-500 flex-shrink-0 mt-0.5" />
                            <span>{behavior}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enforcement Consequences */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-start gap-2 text-amber-900 dark:text-amber-200">
                      <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider text-[10px] block text-amber-700 dark:text-amber-400">Enforcement Action:</span>
                        <span>{policy.enforcementAction}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Highlight Box: Content Removal & Account Termination */}
      <div className="bg-gradient-to-br from-rose-950/90 via-zinc-900 to-black text-white p-6 sm:p-7 rounded-3xl border border-rose-900/50 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-600 text-white rounded-2xl">
            <Trash2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Content Removal & Account Termination Protocol</h3>
            <p className="text-xs text-rose-200">Enforcement framework for policy infractions across videos, showbiz news, photos, polls, and quizzes.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>Strike 1: First Warning</span>
            </div>
            <p className="text-xs text-zinc-300">Content removed + 7-day restriction from publishing new videos, articles, photos, or polls.</p>
          </div>
          <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert size={14} />
              <span>Strike 2: Final Notice</span>
            </div>
            <p className="text-xs text-zinc-300">14-day total uploading and commenting blackout across all platform features.</p>
          </div>
          <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <UserX size={14} />
              <span>Strike 3: Account Termination</span>
            </div>
            <p className="text-xs text-zinc-300">Permanent account ban, forfeiture of handles, deletion of published items, and IP blacklisting.</p>
          </div>
        </div>
      </div>

      {/* Agreement Footer Badge */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
          <CheckCircle size={16} className="text-emerald-500" />
          <span>By continuing to use this workspace, you agree to uphold all Community Standards and Policy Governance rules.</span>
        </div>
        <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Version 2026.4</span>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag size={18} className="text-rose-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Report Policy Violation</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle size={32} className="mx-auto text-emerald-500" />
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Report Submitted Successfully</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Our safety review team will evaluate this claim within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Violation Category</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium"
                  >
                    <option value="copyright">Copyright & IP Infringement</option>
                    <option value="nudity">Nudity or Sexual Content</option>
                    <option value="spam">Spam, Scams, or Phishing</option>
                    <option value="hate">Hate Speech or Discrimination</option>
                    <option value="trademark">Trademark Infringement</option>
                    <option value="counterfeit">Counterfeit Goods</option>
                    <option value="privacy">Privacy Standards & Doxxing</option>
                    <option value="impersonation">Impersonation</option>
                    <option value="harassment">Harassment or Cyberbullying</option>
                    <option value="violence">Violent or Graphic Content</option>
                    <option value="guns_drugs">Guns, Drugs & Regulated Goods</option>
                    <option value="child_safety">Child Safety Violation</option>
                    <option value="circumvention">Circumvention of Technological Measures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Incident Details / URL Link</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="Provide specific links, video IDs, or evidence regarding the policy violation..."
                    className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Submit Official Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityStandardsView;
