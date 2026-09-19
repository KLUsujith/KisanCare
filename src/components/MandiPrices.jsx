import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  MapPin, 
  Award, 
  ShieldCheck, 
  Mic, 
  Filter,
  ArrowUpRight,
  Info
} from "lucide-react";
import { createSpeechRecognizer } from "../utils/speech.js";

export default function MandiPrices() {
  const { t, language, showToast } = useApp();

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [highestMandi, setHighestMandi] = useState(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const cropsList = ["Tomato", "Cotton", "Rice / Paddy", "Potato", "Chilli", "Wheat", "Onion", "Soybean"];
  const statesList = ["Maharashtra", "Telangana", "Punjab", "Uttar Pradesh", "Andhra Pradesh", "Madhya Pradesh", "Gujarat", "Karnataka", "Delhi"];

  const fetchPrices = async () => {
    setLoading(true);
    try {
      let url = `/api/mandi-prices?`;
      if (selectedCrop !== "all") url += `crop=${encodeURIComponent(selectedCrop)}&`;
      if (selectedState !== "all") url += `state=${encodeURIComponent(selectedState)}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPrices(data.prices);
        setHighestMandi(data.highestPriceMandi);
      }
    } catch (err) {
      console.warn("Mandi API fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedState, searchQuery]);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const recognizer = createSpeechRecognizer(
      language,
      (spokenText) => {
        setSearchQuery(spokenText);
        showToast(`Voice Search: "${spokenText}"`, "info");
        setIsListeningVoice(false);
      },
      (error) => {
        showToast("Could not recognize voice. Please try again or type.", "warning");
        setIsListeningVoice(false);
      },
      () => {
        setIsListeningVoice(false);
      }
    );

    if (recognizer) {
      setIsListeningVoice(true);
      recognizer.start();
    } else {
      showToast("Speech recognition not supported in your browser.", "warning");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      
      {/* Title & Best Mandi Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </span>
            {t.mandiTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.mandiSub}
          </p>
        </div>

        {/* Highest Paying Mandi Recommender Pill */}
        {highestMandi && (
          <div className="bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-sm">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                {t.bestOpportunityBadge}
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-800">
                {highestMandi.mandiName}: <span className="text-emerald-700">₹{highestMandi.modalPrice}</span> / Qtl
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box + Voice Input */}
          <div className="sm:col-span-6 relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchMandiPlaceholder}
              className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-2 p-1.5 rounded-lg transition ${
                isListeningVoice ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Crop Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="all">{t.filterCrop}</option>
              {cropsList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="all">{t.filterState}</option>
              {statesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mandi Rates Grid / Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading APMC Live Mandi Data...
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No mandi prices match your current filter. Try resetting search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prices.map((item) => {
            const isRising = item.trend === "up";
            const isFalling = item.trend === "down";

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-emerald-300 transition relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Crop & Recommended Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-base text-slate-900">
                          {item.crop}
                        </span>
                        {item.variety && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            ({item.variety})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.mandiName}, {item.state}</span>
                      </div>
                    </div>

                    {/* Trend Pill */}
                    <div className={`px-2 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
                      isRising 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                        : isFalling 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-slate-50 text-slate-600 border border-slate-200"
                    }`}>
                      {isRising ? <TrendingUp className="w-3.5 h-3.5" /> : isFalling ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      <span>{item.changePercent}</span>
                    </div>
                  </div>

                  {/* Modal Price & Range */}
                  <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t.modalPrice}
                      </span>
                      <span className="text-2xl font-black text-slate-900">
                        ₹{item.modalPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">/ Quintal</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t.minMaxPrice}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        ₹{item.minPrice} - ₹{item.maxPrice}
                      </span>
                    </div>
                  </div>

                  {/* MSP Benchmark Comparison */}
                  {item.mspRate && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] px-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        MSP: ₹{item.mspRate}
                      </span>
                      <span className={`font-bold ${item.modalPrice >= item.mspRate ? "text-emerald-600" : "text-amber-600"}`}>
                        {item.modalPrice >= item.mspRate ? `+₹${item.modalPrice - item.mspRate} (${t.aboveMsp})` : `-₹${item.mspRate - item.modalPrice} (${t.belowMsp})`}
                      </span>
                    </div>
                  )}

                  {/* Buyer Type Category */}
                  {item.bestBuyerCategory && (
                    <div className="mt-3 text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      <span className="font-bold text-amber-900">Active Buyers: </span>
                      <span>{item.bestBuyerCategory}</span>
                    </div>
                  )}
                </div>

                {/* Distance & Arrivals Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Distance: ~{item.distanceKm} km</span>
                  <span>Daily Arrivals: {item.dailyArrivals} Qtl</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
