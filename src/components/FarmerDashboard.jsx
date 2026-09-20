import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import LiveLocationWeather from "./LiveLocationWeather.jsx";
import { 
  LayoutDashboard, 
  Sprout, 
  TrendingUp, 
  Coins, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  CloudRain, 
  Sun, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  ExternalLink, 
  Calendar, 
  Award,
  DollarSign,
  Layers,
  ChevronRight
} from "lucide-react";

export default function FarmerDashboard() {
  const { user, farmProfile, setActiveTab, playVoice, language } = useApp();

  const [selectedScenario, setSelectedScenario] = useState("expected"); // 'low' | 'expected' | 'high'

  const farmerName = user?.name || "K. Anjaneyulu Reddy (రైతు)";
  const acres = farmProfile?.totalAcres || user?.acresOwned || 4.5;
  const district = farmProfile?.district || user?.district || "Warangal";
  const state = farmProfile?.state || user?.state || "Telangana";
  const village = farmProfile?.village || user?.village || "Narsampet";
  const soilType = farmProfile?.soilType || "Deep Black Clayey Soil (నల్లరేగడి నేల)";

  // Financial calculations based on acres
  const financialData = {
    low: {
      revenue: Math.round(92400 * (acres / 3.5)),
      costs: Math.round(42000 * (acres / 3.5)),
      net: Math.round(50400 * (acres / 3.5)),
      roi: 52,
      yieldQtl: Math.round(36 * (acres / 3.5)),
      mandiRate: 17200,
      label: "Low Scenario (కనిష్ట ధర)",
      tag: "Adverse Weather / Mandi Glut"
    },
    expected: {
      revenue: Math.round(148500 * (acres / 3.5)),
      costs: Math.round(42000 * (acres / 3.5)),
      net: Math.round(106500 * (acres / 3.5)),
      roi: 72,
      yieldQtl: Math.round(54 * (acres / 3.5)),
      mandiRate: 20500,
      label: "Expected Scenario (సాధారణ ధర)",
      tag: "Current Modal APMC Rate"
    },
    high: {
      revenue: Math.round(212000 * (acres / 3.5)),
      costs: Math.round(42000 * (acres / 3.5)),
      net: Math.round(170000 * (acres / 3.5)),
      roi: 94,
      yieldQtl: Math.round(68 * (acres / 3.5)),
      mandiRate: 21800,
      label: "High Scenario (గరిష్ట ధర)",
      tag: "Direct FPO Contract Grade-A"
    }
  };

  const currentFin = financialData[selectedScenario];

  const handleListenSummary = () => {
    const text = language === "te"
      ? `నమస్కారం ${farmerName}. మీ ${acres} ఎకరాల పొలంలో ప్రస్తుత వాతావరణం 29 డిగ్రీలు, పిచికారీకి అనుకూలంగా ఉంది. మీ ప్రధాన పంట మిరప ప్రస్తుత మార్కెట్ ధర క్వింటాలుకు 20,500 రూపాయలు. ఆశించిన నికర లాభం సుమారు ${currentFin.net.toLocaleString()} రూపాయలు.`
      : `Welcome ${farmerName}. Current weather for your ${acres} acres in ${district} is 29°C, with ideal spraying conditions. Current chilli market rate is ₹20,500 per quintal. Expected seasonal net profit is approximately ₹${currentFin.net.toLocaleString()}.`;
    playVoice(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">

      {/* 1. TOP EXECUTIVE FARMER HERO CARD */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-700/50 relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <Sprout className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>రైతు ప్రొఫెషనల్ డాష్‌బోర్డ్ • Verified Farmer Profile</span>
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-bold text-[11px] rounded-full border border-blue-500/30">
                PM-Kisan & Rythu Bandhu Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{farmerName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <strong>{village}, {district}, {state}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <strong>{acres} ఎకరాలు ({acres} Acres Landholding)</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-200">{soilType}</span>
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleListenSummary}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 border border-emerald-400/40"
              title="Listen to audio briefing in selected language"
            >
              <Volume2 className="w-4 h-4 text-emerald-200" />
              <span>వినండి / Listen Briefing</span>
            </button>

            <button
              onClick={() => setActiveTab("myfarm")}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <span>Edit Farm Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-700/40 text-xs">
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[10px] text-emerald-300/80 font-bold uppercase block">Current Crop (ప్రస్తుత పంట)</span>
            <span className="text-sm sm:text-base font-extrabold text-white">Chilli (మిరప) • Sitara F1</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Day 42 (Vegetative Stage)</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[10px] text-emerald-300/80 font-bold uppercase block">Soil Health Status</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-300">Grade A • NPK Balanced</span>
            <span className="text-[10px] text-emerald-400/90 block mt-0.5">pH 7.4 • Drip Irrigated</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[10px] text-emerald-300/80 font-bold uppercase block">APMC Guntur Rate</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-300">₹20,500 / Qtl</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">▲ +₹450 (Bullish trend)</span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-700/30">
            <span className="text-[10px] text-emerald-300/80 font-bold uppercase block">Projected Net Margin</span>
            <span className="text-sm sm:text-base font-extrabold text-white">₹{currentFin.net.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">{currentFin.roi}% Estimated ROI</span>
          </div>
        </div>
      </div>

      {/* 2. LIVE LOCATION & 5-DAY AGRO-METEOROLOGICAL WEATHER FORECAST */}
      <LiveLocationWeather />

      {/* 3. ACTIVE CROP GROWTH STAGE & IRRIGATION SCHEDULE */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>పంట ప్రగతి & నిర్వహణ షెడ్యూల్ (Active Crop Growth Stage)</span>
          </h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            Healthy (ఆరోగ్యకరమైనది)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Vegetative Growth (మొక్క పెరుగుదల దశ)</span>
            <span className="text-emerald-700">Day 42 of 145 Days (29%)</span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: "29%" }}></div>
          </div>
          <div className="grid grid-cols-4 text-[10px] text-slate-400 font-semibold mt-2 text-center">
            <span className="text-emerald-700 font-bold">1. Nursery ✓</span>
            <span className="text-emerald-700 font-bold">2. Vegetative ◄</span>
            <span>3. Flowering</span>
            <span>4. Harvesting</span>
          </div>
        </div>

        {/* Next 3 Scheduled Tasks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-extrabold uppercase block">💧 Next Irrigation</span>
            <span className="font-bold text-slate-900 block mt-0.5">Drip Fertigation</span>
            <span className="text-[11px] text-slate-600">Tomorrow, 7:00 AM (2.5 hrs)</span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200">
            <span className="text-[10px] text-blue-800 font-extrabold uppercase block">🌿 Nutrition Dose</span>
            <span className="font-bold text-slate-900 block mt-0.5">19:19:19 + Zinc</span>
            <span className="text-[11px] text-slate-600">3kg per acre via venturi</span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
            <span className="text-[10px] text-amber-800 font-extrabold uppercase block">🛡️ Pest Preventive</span>
            <span className="font-bold text-slate-900 block mt-0.5">Yellow Traps (8/Ac)</span>
            <span className="text-[11px] text-slate-600">Thrips surveillance</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">ANGRAU & ICAR crop protection recommendations</span>
          <button
            onClick={() => setActiveTab("crop-care")}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1"
          >
            <span>Scan Leaf with AI</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. 3-SCENARIO INCOME MATH & FINANCIAL HEALTH */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>ఆదాయ అంచనా మరియు దృశ్యాలు (3-Scenario Income & Revenue Math)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Realistic net profit calculations tailored to your {acres} acres with variable market scenarios.
            </p>
          </div>

          {/* Scenario Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl self-start sm:self-auto border border-slate-200">
            {["low", "expected", "high"].map((sc) => (
              <button
                key={sc}
                onClick={() => setSelectedScenario(sc)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition capitalize ${
                  selectedScenario === sc 
                    ? sc === "high" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : sc === "low" 
                      ? "bg-amber-600 text-white shadow-sm" 
                      : "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>

        {/* Active Scenario Card Display */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase block">Expected Gross Yield</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{currentFin.yieldQtl} Quintals</span>
            <span className="text-[11px] text-slate-600 font-semibold mt-0.5">Avg: {(currentFin.yieldQtl / acres).toFixed(1)} Qtl/Acre</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
            <span className="text-xs font-bold text-blue-800 uppercase block">Mandi / Buyer Rate</span>
            <span className="text-2xl font-black text-blue-900 block mt-1">₹{currentFin.mandiRate.toLocaleString()}</span>
            <span className="text-[11px] text-slate-600 font-semibold mt-0.5">Per Quintal ({currentFin.tag})</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase block">Total Input Costs</span>
            <span className="text-2xl font-black text-slate-800 block mt-1">₹{currentFin.costs.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-0.5">Seeds, fertilizers, irrigation & labor</span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm">
            <span className="text-xs font-extrabold text-emerald-100 uppercase block">Estimated Net Profit</span>
            <span className="text-2xl font-black text-white block mt-1">₹{currentFin.net.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-200 font-bold mt-0.5">+{currentFin.roi}% Return on Investment</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>Formula: (Yield × Rate) - Input Costs. Calculated for {acres} Acres in {district}.</span>
          <button
            onClick={() => setActiveTab("income")}
            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>Open Custom Calculator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. 1-CLICK AGRICULTURAL ACTION HUB */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>త్వరిత కార్యాచరణ కేంద్రం (Direct Agricultural Module Hub)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">9 Integrated Farmer Modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Crop Doctor */}
          <div 
            onClick={() => setActiveTab("crop-care")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Crop Doctor</h4>
                <p className="text-[11px] text-slate-500">AI వ్యాధి నిర్ధారణ</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Scan diseased leaf to get immediate organic & chemical treatment recipes.
            </p>
            <span className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
              <span>Scan Now</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 2: Crop Advisory */}
          <div 
            onClick={() => setActiveTab("recommendation")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Crop Advisory</h4>
                <p className="text-[11px] text-slate-500">మండల పంట సిఫార్సు</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Area suitability rankings by soil type, mandal rainfall, and irrigation.
            </p>
            <span className="text-[11px] font-bold text-blue-700 mt-2 flex items-center gap-1">
              <span>View Advice</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 3: Mandi Rates */}
          <div 
            onClick={() => setActiveTab("mandi")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-green-100 text-green-700 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Live Mandi Rates</h4>
                <p className="text-[11px] text-slate-500">APMC మార్కెట్ ధరలు</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Real-time APMC price cards, 7-day trends, and MSP comparisons.
            </p>
            <span className="text-[11px] font-bold text-green-700 mt-2 flex items-center gap-1">
              <span>Check Rates</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 4: Buy Seeds */}
          <div 
            onClick={() => setActiveTab("seeds")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Buy Seeds</h4>
                <p className="text-[11px] text-slate-500">ప్రమాణీకరించిన విత్తనాలు</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              NSC & ICAR certified seed store with automatic acreage calculator.
            </p>
            <span className="text-[11px] font-bold text-purple-700 mt-2 flex items-center gap-1">
              <span>Order Seeds</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 5: Buyers & FPOs */}
          <div 
            onClick={() => setActiveTab("market")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Buyers & FPOs</h4>
                <p className="text-[11px] text-slate-500">0% దళారీ కమీషన్</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Direct WhatsApp & phone dialer to verified corporate buyers & FPOs.
            </p>
            <span className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
              <span>Contact Buyers</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 6: Cold Storage */}
          <div 
            onClick={() => setActiveTab("storage")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-cyan-100 text-cyan-700 rounded-2xl group-hover:bg-cyan-600 group-hover:text-white transition">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Cold Storage</h4>
                <p className="text-[11px] text-slate-500">శీతల గిడ్డంగులు</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Discover nearby facilities, capacity MT, and book storage space.
            </p>
            <span className="text-[11px] font-bold text-cyan-700 mt-2 flex items-center gap-1">
              <span>Find Space</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 7: Logistics Hub */}
          <div 
            onClick={() => setActiveTab("logistics")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-orange-100 text-orange-700 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Logistics Pooling</h4>
                <p className="text-[11px] text-slate-500">రవాణా నెట్‌వర్క్ (~40% తగ్గింపు)</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Share transport trucks with neighboring farmers to cut freight cost.
            </p>
            <span className="text-[11px] font-bold text-orange-700 mt-2 flex items-center gap-1">
              <span>Book Fleet</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

          {/* Card 8: My Farm */}
          <div 
            onClick={() => setActiveTab("myfarm")}
            className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500 cursor-pointer transition flex flex-col justify-between group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-teal-100 text-teal-700 rounded-2xl group-hover:bg-teal-600 group-hover:text-white transition">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">My Farm Profile</h4>
                <p className="text-[11px] text-slate-500">నేల ఆరోగ్య కార్డు & చరిత్ర</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2">
              Maintain soil testing records, past harvest history, and land certificates.
            </p>
            <span className="text-[11px] font-bold text-teal-700 mt-2 flex items-center gap-1">
              <span>View Profile</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </span>
          </div>

        </div>
      </div>

      {/* 5. MANDATORY EXPERT DISCLAIMER */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <strong>రైతులకు ముఖ్య గమనిక (Farmer Advisory):</strong> అన్ని దిగుబడి మరియు ఆదాయ లెక్కలు ఐసీఏఆర్ (ICAR) మరియు ఏఎన్‌జీఆర్‌ఏయూ (ANGRAU) గత పరిశోధనల ఆధారంగా అంచనా వేయబడినవి. వాతావరణ పరిస్థితులు, నేల సారం మారవచ్చు. విత్తే ముందు మీ స్థానిక మండల వ్యవసాయ అధికారి (MAO) లేదా కృషి విజ్ఞాన కేంద్రం (KVK) శాస్త్రవేత్తలను సంప్రదించండి.
        </div>
      </div>

    </div>
  );
}
