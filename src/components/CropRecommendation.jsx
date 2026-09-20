import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Sparkles, 
  MapPin, 
  Droplets, 
  Clock, 
  Coins, 
  Leaf, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Filter,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle
} from "lucide-react";

export default function CropRecommendation() {
  const { user, farmProfile, language, playVoice, stopVoice, isSpeaking, setActiveTab, showToast } = useApp();

  const [state, setState] = useState(farmProfile?.state || "Andhra Pradesh");
  const [district, setDistrict] = useState(farmProfile?.district || "Guntur");
  const [mandal, setMandal] = useState(farmProfile?.mandal || "Tenali");
  const [village, setVillage] = useState(farmProfile?.village || "Tenali Rural");
  const [soilType, setSoilType] = useState(farmProfile?.soilType || "Deep Black Clayey Soil");
  const [irrigation, setIrrigation] = useState(farmProfile?.irrigationSource || "Borewell with Drip");
  const [season, setSeason] = useState("Kharif (Monsoon / ఖరీఫ్)");
  const [acres, setAcres] = useState(farmProfile?.totalAcres || 3.5);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableMandals, setAvailableMandals] = useState(["Tenali", "Bapatla", "Mangalagiri", "Sattenapalle"]);

  const districtMandalMap = {
    "Guntur": ["Tenali", "Bapatla", "Mangalagiri", "Sattenapalle"],
    "Warangal": ["Narsampet", "Wardhannapet", "Parvathagiri"],
    "Kurnool": ["Adoni", "Nandyal"],
    "Chittoor": ["Madanapalle", "Pileru", "Chandragiri"],
    "Nashik": ["Niphad", "Dindori"]
  };

  const handleDistrictChange = (dist) => {
    setDistrict(dist);
    const mandals = districtMandalMap[dist] || ["Central Mandal"];
    setAvailableMandals(mandals);
    setMandal(mandals[0]);
  };

  useEffect(() => {
    if (farmProfile?.district && farmProfile.district !== district) {
      setDistrict(farmProfile.district);
      const mandals = districtMandalMap[farmProfile.district] || [farmProfile.mandal || "Central Mandal"];
      setAvailableMandals(mandals);
      setMandal(farmProfile.mandal || mandals[0]);
    }
  }, [farmProfile?.district, farmProfile?.mandal]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisory/area-suitability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          district,
          mandal,
          village,
          soilType,
          irrigation,
          season,
          acres
        })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data);
      }
    } catch (e) {
      console.warn("Recommendation error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [district, mandal, acres]);

  const handleListenAdvice = (crop) => {
    const text = language === "te"
      ? `${crop.cropTe || crop.crop} మీ ${acres} ఎకరాల నేలకు ${crop.suitabilityScore}% అనుకూలమైనది. పంట కాలం ${crop.growingDurationDays} రోజులు. ఎకరానికి ఆశించిన దిగుబడి ${crop.expectedYieldPerAcreQuintals} క్వింటాళ్లు.`
      : `${crop.crop} has a suitability score of ${crop.suitabilityScore}% for your ${acres} acres in ${mandal}, ${district}. Expected duration is ${crop.growingDurationDays} days, with an estimated yield of ${crop.expectedYieldPerAcreQuintals} quintals per acre.`;
    playVoice(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </span>
            Crop Recommendation & Area Suitability (పంట సిఫార్సు)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover the highest-performing crops for your exact mandal, soil type, irrigation, and season.
          </p>
        </div>

        {/* Quick Sync with My Farm */}
        <button
          onClick={() => {
            setAcres(farmProfile?.totalAcres || 3.5);
            setDistrict(farmProfile?.district || "Guntur");
            showToast("Synced settings from My Farm!", "info");
          }}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition self-start md:self-auto"
        >
          Auto-fill from My Farm ({acres} Acres)
        </button>
      </div>

      {/* Mandatory Verification Alert Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <strong>Important Farmer Advisory:</strong> All crop recommendations, input costs, and yield figures are historical scientific estimates. Micro-climates, pest cycles, and water levels vary. We strongly recommend verifying with your <strong>Mandal Agricultural Officer (MAO)</strong> or local <strong>Krishi Vigyan Kendra (KVK)</strong> before buying seeds and sowing.
        </div>
      </div>

      {/* Filter / Area Selector Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Select Area & Farm Specifications
          </span>
          <span className="text-xs font-bold text-emerald-700">
            Target Land: {acres} Acres
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="Andhra Pradesh">Andhra Pradesh (ఆంధ్రప్రదేశ్)</option>
              <option value="Telangana">Telangana (తెలంగాణ)</option>
              <option value="Maharashtra">Maharashtra (మహారాష్ట్ర)</option>
              <option value="Punjab">Punjab (పంజాబ్)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">District</label>
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white font-bold"
            >
              <option value="Guntur">Guntur (గుంటూరు)</option>
              <option value="Warangal">Warangal (వరంగల్)</option>
              <option value="Kurnool">Kurnool (కర్నూలు)</option>
              <option value="Chittoor">Chittoor (చిత్తూరు)</option>
              <option value="Nashik">Nashik (నాసిక్)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mandal (మండలం)</label>
            <select
              value={mandal}
              onChange={(e) => setMandal(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              {availableMandals.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="Kharif (Monsoon / ఖరీఫ్)">Kharif (Monsoon / ఖరీఫ్)</option>
              <option value="Rabi (Winter / రబీ)">Rabi (Winter / రబీ)</option>
              <option value="Zaid (Summer / జాయెద్)">Zaid (Summer / జాయెద్)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="Deep Black Clayey Soil">Deep Black Clayey Soil (నల్లరేగడి)</option>
              <option value="Red Sandy Loam with Chalkas">Red Sandy Loam (ఎర్ర ఇసుక నేల)</option>
              <option value="Krishna Alluvial Silt">Krishna Alluvial Silt (ఒండ్రు నేల)</option>
              <option value="Coastal Sandy Loam">Coastal Sandy Loam (తీరప్రాంత ఇసుక)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Irrigation Availability</label>
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
            >
              <option value="Borewell with Drip">Borewell + Drip (బోరుబావి + బిందు సేద్యం)</option>
              <option value="Canal Water">Canal Water (కాలువ నీరు)</option>
              <option value="Rainfed (No Borewell)">Rainfed / వర్షాధారం</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Acres to Plant: <strong>{acres} Acres</strong></label>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="w-full accent-emerald-600 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Recommended Crops Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Analyzing ICAR and state agro-ecological suitability data for {mandal}, {district}...
        </div>
      ) : results?.recommendedCrops?.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Top Recommended Crops for {mandal}, {district} ({results.recommendedCrops.length} options)
            </h2>
            <span className="text-xs text-slate-500">
              Rainfall: ~{results.location.avgRainfall}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.recommendedCrops.map((c, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  {/* Header: Crop name, score, and listen button */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">
                          {c.crop}
                        </span>
                        {c.cropTe && (
                          <span className="text-sm font-bold text-emerald-800">
                            ({c.cropTe})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Best Variety: <strong>{c.variety}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleListenAdvice(c)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition"
                        title="Listen to Advice"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <span className="bg-emerald-100 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-xl">
                        {c.suitabilityScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Rationale */}
                  <p className="text-xs text-slate-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100 italic">
                    "{c.soilFitRationale}"
                  </p>

                  {/* 4 Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Growing Duration</span>
                      <span className="font-extrabold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {c.growingDurationDays} Days
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Water Requirement</span>
                      <span className="font-extrabold text-slate-800 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                        {c.waterRequirement}
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Yield / Acre</span>
                      <span className="font-extrabold text-emerald-700">
                        {c.expectedYieldPerAcreQuintals} Qtl/Acre
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({c.totalExpectedYieldForAcres} Qtl for {acres} Acres)
                      </span>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Input Cost / Acre</span>
                      <span className="font-extrabold text-slate-800">
                        ₹{c.inputCostPerAcre.toLocaleString()} / Acre
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        (₹{c.totalInputCostForAcres.toLocaleString()} for {acres} Acres)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Calculate Income & Buy Certified Seeds */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveTab("income")}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Calculate Income</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("seeds")}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Buy Certified Seeds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No crop records found for this selection. Try selecting another Mandal.
        </div>
      )}
    </div>
  );
}
