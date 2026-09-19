import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Sprout, 
  MapPin, 
  Droplets, 
  Layers, 
  History, 
  CheckCircle2, 
  Save, 
  Calendar, 
  FileText,
  Activity,
  ArrowRight
} from "lucide-react";

export default function MyFarm() {
  const { user, updateFarmProfile, showToast, setActiveTab } = useApp();

  const [farmData, setFarmData] = useState({
    farmerName: user?.name || "K. Anjaneyulu Reddy",
    phone: user?.phone || "9440177889",
    totalAcres: user?.acresOwned || 3.5,
    state: user?.state || "Andhra Pradesh",
    district: user?.district || "Guntur",
    mandal: "Tenali",
    village: user?.village || "Tenali Rural",
    soilType: "Deep Black Clayey Soil",
    irrigationSource: "Borewell with Drip (బోరుబావి + బిందు సేద్యం)",
    previousCrop: "Cotton (పత్తి)",
    previousYieldQuintals: 35
  });

  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/myfarm")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          setFarmData(prev => ({ ...prev, ...data.profile }));
        }
      })
      .catch(e => console.warn("Farm load error:", e));

    fetch("/api/myfarm/history")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.history) {
          setHistory(data.history);
        }
      })
      .catch(e => console.warn("History load error:", e));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/myfarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(farmData)
      });
      const data = await res.json();
      if (data.success) {
        updateFarmProfile(farmData);
        showToast("Farm profile updated! Recommendations adjusted to your acres.", "success");
      }
    } catch (err) {
      updateFarmProfile(farmData);
      showToast("Farm profile saved locally!", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Sprout className="w-6 h-6" />
            </span>
            My Farm Profile (నా పొలం వివరాలు)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain your land area in acres, soil type, irrigation setup, and crop history to personalize income and seed recommendations.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("recommendation")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold py-2 px-3.5 rounded-xl shadow transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Get Crop Advisory for this Farm</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Farm Profile Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Land & Soil Characteristics
          </h2>

          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            
            {/* Acres Slider & Input */}
            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-extrabold text-emerald-950 text-sm">
                  Total Land Area (ఎకరాలు / Acres) *
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={farmData.totalAcres}
                    onChange={(e) => setFarmData({ ...farmData, totalAcres: Number(e.target.value) })}
                    className="w-20 p-1.5 border border-emerald-300 rounded-lg text-center font-black text-lg text-emerald-800 bg-white"
                  />
                  <span className="font-bold text-emerald-900 text-xs">Acres</span>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={farmData.totalAcres}
                onChange={(e) => setFarmData({ ...farmData, totalAcres: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />

              <div className="flex gap-1.5 pt-1">
                {[1, 2.5, 3.5, 5, 10].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setFarmData({ ...farmData, totalAcres: quick })}
                    className={`px-2 py-1 rounded-md text-xs font-bold border ${
                      farmData.totalAcres === quick 
                        ? "bg-emerald-700 text-white border-emerald-700" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {quick} Acres
                  </button>
                ))}
              </div>
            </div>

            {/* Location: State, District, Mandal, Village */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">State (రాష్ట్రం)</label>
                <select
                  value={farmData.state}
                  onChange={(e) => setFarmData({ ...farmData, state: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
                >
                  <option value="Andhra Pradesh">Andhra Pradesh (ఆంధ్రప్రదేశ్)</option>
                  <option value="Telangana">Telangana (తెలంగాణ)</option>
                  <option value="Maharashtra">Maharashtra (మహారాష్ట్ర)</option>
                  <option value="Punjab">Punjab (పంజాబ్)</option>
                  <option value="Karnataka">Karnataka (కర్ణాటక)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District (జిల్లా)</label>
                <select
                  value={farmData.district}
                  onChange={(e) => setFarmData({ ...farmData, district: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white font-semibold"
                >
                  <option value="Guntur">Guntur (గుంటూరు)</option>
                  <option value="Warangal">Warangal (వరంగల్)</option>
                  <option value="Krishna">Krishna (కృష్ణా)</option>
                  <option value="Kurnool">Kurnool (కర్నూలు)</option>
                  <option value="Chittoor">Chittoor (చిత్తూరు)</option>
                  <option value="Nashik">Nashik (నాసిక్)</option>
                  <option value="Ludhiana">Ludhiana (లుధియానా)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mandal (మండలం)</label>
                <input
                  type="text"
                  value={farmData.mandal}
                  onChange={(e) => setFarmData({ ...farmData, mandal: e.target.value })}
                  placeholder="e.g. Tenali / Narsampet"
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Village (గ్రామం)</label>
                <input
                  type="text"
                  value={farmData.village}
                  onChange={(e) => setFarmData({ ...farmData, village: e.target.value })}
                  placeholder="e.g. Angalakuduru"
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Soil Type & Irrigation */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Soil Type (నేల రకం)</label>
                <select
                  value={farmData.soilType}
                  onChange={(e) => setFarmData({ ...farmData, soilType: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
                >
                  <option value="Deep Black Clayey Soil">Deep Black Clayey Soil (నల్లరేగడి)</option>
                  <option value="Red Sandy Loam with Chalkas">Red Sandy Loam (ఎర్ర ఇసుక నేల)</option>
                  <option value="Krishna Alluvial Silt">Alluvial Silt (ఒండ్రు నేల)</option>
                  <option value="Coastal Sandy Loam">Coastal Sandy Loam (తీరప్రాంత ఇసుక)</option>
                  <option value="Medium Black Loam">Medium Black Loam (మధ్యస్థ నల్లరేగడి)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Irrigation Setup (నీటి పారుదల)</label>
                <select
                  value={farmData.irrigationSource}
                  onChange={(e) => setFarmData({ ...farmData, irrigationSource: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 bg-white"
                >
                  <option value="Borewell with Drip">Borewell + Drip (బోరుబావి + బిందు సేద్యం)</option>
                  <option value="Canal Water">Canal Water (కాలువ నీరు)</option>
                  <option value="Borewell with Sprinklers">Borewell + Sprinklers (తుంపర సేద్యం)</option>
                  <option value="Rainfed (No Borewell)">Rainfed / వర్షాధారం</option>
                </select>
              </div>
            </div>

            {/* Previous Crop */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous Crop (గత పంట)</label>
                <input
                  type="text"
                  value={farmData.previousCrop}
                  onChange={(e) => setFarmData({ ...farmData, previousCrop: e.target.value })}
                  placeholder="e.g. Cotton / Chilli / Paddy"
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Previous Yield (Quintals)</label>
                <input
                  type="number"
                  value={farmData.previousYieldQuintals}
                  onChange={(e) => setFarmData({ ...farmData, previousYieldQuintals: Number(e.target.value) })}
                  placeholder="Total harvested bags/quintals"
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Farm..." : "Save Farm Profile & Sync"}</span>
            </button>
          </form>
        </div>

        {/* Soil Health Card & Performance History (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Soil Health Card Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                Soil Health Card (భూసార పరీక్ష)
              </h3>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                KVK Accredited
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Organic Carbon</span>
                <span className="font-extrabold text-slate-800">0.62% (Moderate)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">pH Value</span>
                <span className="font-extrabold text-emerald-700">7.2 (Ideal Neutral)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Available Nitrogen (N)</span>
                <span className="font-extrabold text-amber-600">Medium (Add Neem Cake)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Available Potash (K)</span>
                <span className="font-extrabold text-emerald-700">High (Excellent for Bolls)</span>
              </div>
            </div>
          </div>

          {/* Past Seasons History */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-600" />
                Season Harvest History (గత పంటలు)
              </h3>
            </div>

            <div className="space-y-2.5">
              {history.map((h, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-extrabold text-slate-800">
                    <span>{h.crop} ({h.season})</span>
                    <span className="text-emerald-700 font-black">+₹{h.netProfit?.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>{h.acres} Acres • Yield: {h.yieldQuintals} Qtl</span>
                    <span>Sold at: ₹{h.sellingPricePerQuintal}/Qtl</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
