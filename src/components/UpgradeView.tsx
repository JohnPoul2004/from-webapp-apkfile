import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Gem,
  Crown,
  Sparkles,
  Award,
  HardDrive,
  Gift,
  Check,
  CheckCircle2,
  Video,
  Newspaper,
  Film,
  BarChart3,
  HelpCircle,
  CreditCard,
  Lock,
  ShieldCheck,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Tag,
  MapPin,
  ShoppingBag,
  Clapperboard
} from 'lucide-react';
import { BillingCycle, QuotaTierConfig, QuotaTierName, UserProfile } from '../types';
import { QUOTA_TIERS, QUOTA_TIER_NAMES } from '../data/quotaTiers';

interface UpgradeViewProps {
  activeTier: QuotaTierName;
  currentUserProfile?: UserProfile | null;
  onSelectTier: (tier: QuotaTierName) => void;
}

export const UpgradeView: React.FC<UpgradeViewProps> = ({ activeTier, currentUserProfile, onSelectTier }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Checkout Modal State
  const [checkoutTier, setCheckoutTier] = useState<QuotaTierName | null>(null);
  const [cardholderName, setCardholderName] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [billingStreet, setBillingStreet] = useState<string>('');
  const [billingCity, setBillingCity] = useState<string>('');
  const [billingState, setBillingState] = useState<string>('');
  const [billingPostalCode, setBillingPostalCode] = useState<string>('');
  const [billingCountry, setBillingCountry] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleOpenCheckout = (tierName: QuotaTierName) => {
    if (tierName === 'Free') {
      onSelectTier('Free');
      return;
    }
    setCheckoutTier(tierName);
    setCardholderName(currentUserProfile?.fullName || '');
    setBillingStreet(currentUserProfile?.billingAddress?.street || '');
    setBillingCity(currentUserProfile?.billingAddress?.city || '');
    setBillingState(currentUserProfile?.billingAddress?.state || '');
    setBillingPostalCode(currentUserProfile?.billingAddress?.postalCode || '');
    setBillingCountry(currentUserProfile?.billingAddress?.country || '');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(false);
  };

  const handleCloseCheckout = () => {
    if (isProcessing) return;
    setCheckoutTier(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleCardNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  const handleCvvInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholderName.trim()) {
      setErrorMsg('Please enter the Cardholder Name');
      return;
    }
    const cleanCardNum = cardNumber.replace(/\s+/g, '');
    if (cleanCardNum.length < 15) {
      setErrorMsg('Please enter a valid 15 or 16-digit Card Number');
      return;
    }
    if (expiry.length < 5 || !expiry.includes('/')) {
      setErrorMsg('Please enter a valid Expiry (MM/YY)');
      return;
    }
    if (cvv.length < 3) {
      setErrorMsg('Please enter a valid 3 or 4-digit CVV');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setSuccessMsg(`Payment Approved! Your workspace is now upgraded to ${checkoutTier} tier.`);
      if (checkoutTier) {
        onSelectTier(checkoutTier);
      }
      setTimeout(() => {
        setCheckoutTier(null);
        setSuccessMsg(null);
        setCardholderName('');
        setCardNumber('');
        setExpiry('');
        setCvv('');
      }, 1500);
    }, 850);
  };

  const getTierPriceForCycle = (tierName: QuotaTierName) => {
    const tier = QUOTA_TIERS[tierName];
    if (!tier) return { price: '₱0', cadence: '' };
    if (billingCycle === 'weekly') {
      return { price: tier.priceWeekly || tier.priceMonthly, cadence: '/ week' };
    }
    if (billingCycle === 'yearly') {
      return { price: tier.priceYearly || tier.priceAnnual, cadence: '/ year' };
    }
    if (billingCycle === 'lifetime') {
      return { price: tier.priceLifetime || tier.priceMonthly, cadence: 'one-time' };
    }
    return { price: tier.priceMonthly, cadence: '/ month' };
  };

  const getTierIcon = (name: QuotaTierName) => {
    switch (name) {
      case 'Free':
        return <Gift className="w-5 h-5 text-emerald-600" />;
      case 'Bronze':
        return <Shield className="w-5 h-5 text-amber-800" />;
      case 'Silver':
        return <Layers className="w-5 h-5 text-slate-600" />;
      case 'Ruby':
        return <Gem className="w-5 h-5 text-rose-600" />;
      case 'Gold':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'Diamond':
        return <Sparkles className="w-5 h-5 text-cyan-600" />;
      case 'Platinum':
        return <Award className="w-5 h-5 text-indigo-600" />;
      case 'Sapphire':
        return <Gem className="w-5 h-5 text-blue-600" />;
      case 'Emerald':
        return <Gem className="w-5 h-5 text-emerald-600" />;
      case 'Amethyst':
        return <Gem className="w-5 h-5 text-purple-600" />;
      case 'Pearl':
        return <Award className="w-5 h-5 text-slate-700" />;
      case 'Obsidian':
        return <Crown className="w-5 h-5 text-zinc-900" />;
      case 'Titanium':
        return <HardDrive className="w-5 h-5 text-zinc-300" />;
    }
  };

  return (
    <div id="upgrade-plans-container" className="max-w-6xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <div className="text-center space-y-2.5 max-w-xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
          Upgrade Workspace Quota
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500">
          Scale effortlessly across 13 tiers: Free, Bronze, Silver, Ruby, Gold, Diamond, Platinum, Sapphire, Emerald, Amethyst, Pearl, Obsidian, and Titanium.
          Enjoy dedicated limits for Videos, Shorts, Showbiz News, Photos, Polls, Quizzes, Pages, Events, and Shopping.
        </p>

        {/* Billing Toggle (Weekly, Monthly, Yearly, Lifetime) */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1 p-1 bg-zinc-200/80 rounded-xl mt-2 text-xs font-semibold shadow-2xs">
          <button
            type="button"
            onClick={() => setBillingCycle('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              billingCycle === 'weekly'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>Yearly</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('lifetime')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'lifetime'
                ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>Lifetime</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
              Best Value
            </span>
          </button>
        </div>
      </div>

      {/* 9 Tiers Grid (Selected Element) */}
      <div
        id="upgrade-tier-cards-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-2"
      >
        {QUOTA_TIER_NAMES.map((tierName) => {
          const tier = QUOTA_TIERS[tierName];
          const isCurrent = activeTier === tierName;
          const isPopular = tier.isPopular;
          const isFree = tierName === 'Free';

          let price = tier.priceMonthly;
          let cadence = '/ month';
          let subtext: string | null = null;

          if (billingCycle === 'weekly') {
            price = tier.priceWeekly || tier.priceMonthly;
            cadence = '/ week';
          } else if (billingCycle === 'monthly') {
            price = tier.priceMonthly;
            cadence = '/ month';
          } else if (billingCycle === 'yearly') {
            price = tier.priceYearly || tier.priceAnnual;
            cadence = '/ year';
            if (tierName !== 'Free' && tier.priceAnnual) {
              subtext = `equiv. ${tier.priceAnnual}/mo`;
            }
          } else if (billingCycle === 'lifetime') {
            price = tier.priceLifetime || tier.priceMonthly;
            cadence = 'one-time';
            if (tierName !== 'Free') {
              subtext = 'Pay once, keep forever';
            }
          }

          const isFreePrice = isFree || price === '₱0' || price === '$0' || price === '0';
          const displayCadence = isFreePrice ? '/ forever' : cadence;

          return (
            <div
              key={tierName}
              id={`upgrade-card-${tierName.toLowerCase()}`}
              className={`rounded-2xl sm:rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 relative ${
                isCurrent
                  ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]'
                  : isPopular
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl'
                  : isFree
                  ? 'bg-white border-emerald-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs'
                  : 'bg-white border-zinc-200/90 hover:border-zinc-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 shadow-2xs">
                  Popular Choice
                </div>
              )}

              {isFree && !isCurrent && (
                <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  Forever Free
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                  Your Current Plan
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPopular
                          ? 'bg-zinc-800 text-white'
                          : isFree
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100'
                      }`}
                    >
                      {getTierIcon(tierName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3
                          className={`text-base font-extrabold ${
                            isPopular ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {tier.name}
                        </h3>
                        {isFree && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                            Starter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-3xl font-black tracking-tight ${
                        isPopular ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {price}
                    </span>
                    <span className={`text-xs font-medium ${isPopular ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {displayCadence}
                    </span>
                  </div>
                  {subtext && (
                    <p className={`text-[10px] font-bold mt-0.5 ${isPopular ? 'text-amber-300' : 'text-emerald-700'}`}>
                      {subtext}
                    </p>
                  )}
                  <p
                    className={`text-[11px] mt-1.5 leading-relaxed min-h-[34px] ${
                      isPopular ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>

                {/* Quota Item Breakdown */}
                <div
                  className={`pt-3.5 border-t text-xs space-y-2.5 ${
                    isPopular ? 'border-zinc-800 text-zinc-300' : 'border-zinc-100 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isPopular ? 'text-zinc-400' : 'text-zinc-400'
                      }`}
                    >
                      Quota Breakdown
                    </p>
                    <span className={`text-[10px] font-bold ${isPopular ? 'text-amber-300' : 'text-zinc-700'}`}>
                      {tier.totalItemsLimit.toLocaleString()} max items
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Video size={13} className={isPopular ? 'text-amber-400' : 'text-zinc-600'} />
                        <span>Videos:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.videos.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Clapperboard size={13} className={isPopular ? 'text-rose-400' : 'text-rose-600'} />
                        <span>Shorts:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {(tier.limits.shorts ?? 5).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Newspaper size={13} className={isPopular ? 'text-blue-400' : 'text-blue-600'} />
                        <span>Showbiz News:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.news.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Film size={13} className={isPopular ? 'text-amber-400' : 'text-amber-600'} />
                        <span>Photos:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.photos.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 size={13} className={isPopular ? 'text-emerald-400' : 'text-emerald-600'} />
                        <span>Polls:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.polls.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Award size={13} className={isPopular ? 'text-purple-400' : 'text-purple-600'} />
                        <span>Quiz:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.quiz.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} className={isPopular ? 'text-emerald-400' : 'text-emerald-600'} />
                        <span>Pages:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.pages?.toLocaleString() || '10'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className={isPopular ? 'text-blue-400' : 'text-blue-600'} />
                        <span>Events:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.events?.toLocaleString() || '10'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag size={13} className={isPopular ? 'text-emerald-400' : 'text-emerald-600'} />
                        <span>Shopping:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.shopping?.toLocaleString() || '10'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Tag size={13} className={isPopular ? 'text-rose-400' : 'text-rose-600'} />
                        <span>Tags per Item:</span>
                      </span>
                      <span className="font-bold font-mono">
                        {tier.limits.tags?.toLocaleString() || '20'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-zinc-100/10">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 opacity-90 cursor-default"
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Current Active Plan</span>
                  </button>
                ) : isFree ? (
                  <button
                    type="button"
                    onClick={() => onSelectTier(tierName)}
                    className="w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <span>Switch to Free Tier</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id={`btn-buy-now-${tierName.toLowerCase()}`}
                    onClick={() => handleOpenCheckout(tierName)}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98 ${
                      isPopular
                        ? 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white font-black'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Credit or Debit Card</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Popup Modal for Card Details */}
      {checkoutTier && (
        <div
          id="checkout-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-150"
          onClick={handleCloseCheckout}
        >
          <div
            id="checkout-modal-content"
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-zinc-200 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                  {getTierIcon(checkoutTier)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">
                    Upgrade to {checkoutTier} Plan
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Enter your payment card details below to complete order
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="btn-close-checkout-modal"
                disabled={isProcessing}
                onClick={handleCloseCheckout}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Plan & Pricing Summary */}
            <div className="px-5 sm:px-6 pt-4 pb-2">
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900">{checkoutTier} Tier</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {billingCycle}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {QUOTA_TIERS[checkoutTier]?.totalItemsLimit.toLocaleString()} total quota items
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-zinc-900">
                    {getTierPriceForCycle(checkoutTier).price}
                  </div>
                  <div className="text-[10px] font-medium text-zinc-500">
                    {getTierPriceForCycle(checkoutTier).cadence}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleProcessPayment} className="p-5 sm:px-6 space-y-4">
              {/* Cardholder Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="checkout-cardholder-name"
                  className="block text-xs font-bold text-zinc-800"
                >
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="checkout-cardholder-name"
                  name="cardholderName"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  disabled={isProcessing || !!successMsg}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Card Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="checkout-card-number"
                    className="block text-xs font-bold text-zinc-800"
                  >
                    Card Number
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-700 rounded border border-zinc-200">Visa</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-700 rounded border border-zinc-200">Mastercard</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-700 rounded border border-zinc-200">Amex</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-700 rounded border border-zinc-200">Discover</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-zinc-100 text-zinc-700 rounded border border-zinc-200">JCB</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="checkout-card-number"
                    name="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberInput}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    disabled={isProcessing || !!successMsg}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono tracking-wider bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                  <CreditCard
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                </div>
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-expiry"
                    className="block text-xs font-bold text-zinc-800"
                  >
                    Expiry
                  </label>
                  <input
                    type="text"
                    id="checkout-expiry"
                    name="expiry"
                    value={expiry}
                    onChange={handleExpiryInput}
                    placeholder="MM/YY"
                    maxLength={5}
                    disabled={isProcessing || !!successMsg}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="checkout-cvv"
                    className="block text-xs font-bold text-zinc-800"
                  >
                    CVV
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="checkout-cvv"
                      name="cvv"
                      value={cvv}
                      onChange={handleCvvInput}
                      placeholder="123"
                      maxLength={4}
                      disabled={isProcessing || !!successMsg}
                      className="w-full pl-3.5 pr-8 py-2.5 text-xs font-mono bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all text-center"
                    />
                    <Lock
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Billing & Shipping Address Section */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <MapPin size={13} className="text-zinc-600" />
                    <span>Billing & Shipping Address</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Auto-synced for billing & shipping</span>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={billingStreet}
                    onChange={(e) => setBillingStreet(e.target.value)}
                    placeholder="Street Address (e.g. 123 Main St)"
                    disabled={isProcessing || !!successMsg}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={billingCity}
                      onChange={(e) => setBillingCity(e.target.value)}
                      placeholder="City"
                      disabled={isProcessing || !!successMsg}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      placeholder="State"
                      disabled={isProcessing || !!successMsg}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      value={billingPostalCode}
                      onChange={(e) => setBillingPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      disabled={isProcessing || !!successMsg}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    value={billingCountry}
                    onChange={(e) => setBillingCountry(e.target.value)}
                    placeholder="Country"
                    disabled={isProcessing || !!successMsg}
                    className="w-full px-3 py-2 text-xs bg-white border border-zinc-300 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* Secure Transaction Note */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-Bit SSL Encrypted • Instant Workspace Activation</span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleCloseCheckout}
                  className="flex-1 py-2.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="checkout-submit-btn"
                  disabled={isProcessing || !!successMsg}
                  className="flex-2 py-2.5 text-xs font-extrabold text-white bg-zinc-900 hover:bg-zinc-800 active:bg-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Verifying Card...</span>
                    </>
                  ) : successMsg ? (
                    <>
                      <Check size={15} />
                      <span>Upgraded!</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} />
                      <span>Credit or Debit Card</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
