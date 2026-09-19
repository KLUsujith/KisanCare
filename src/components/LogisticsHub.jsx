import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Truck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Users, 
  Calculator, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Route, 
  DollarSign,
  Layers,
  ArrowRight
} from "lucide-react";

export default function LogisticsHub() {
  const { t, showToast } = useApp();

  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Freight Calculator state
  const [calcDistance, setCalcDistance] = useState(35);
  const [calcWeight, setCalcWeight] = useState(12);
  const [calcVehicle, setCalcVehicle] = useState("mini");
  const [useSharedPool, setUseSharedPool] = useState(true);
  const [estimateResult, setEstimateResult] = useState(null);

  const fetchTransporters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logistics");
      const data = await res.json();
      if (data.success) {
        setTransporters(data.transporters);
      }
    } catch (e) {
      console.warn("Logistics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = async () => {
    try {
      const res = await fetch("/api/logistics/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distanceKm: calcDistance,
          weightQuintals: calcWeight,
          vehicleType: calcVehicle,
          useSharedPool: useSharedPool
        })
      });
      const data = await res.json();
      if (data.success) {
        setEstimateResult(data);
      }
    } catch (e) {
      console.warn("Estimate error:", e);
    }
  };

  useEffect(() => {
    fetchTransporters();
    calculateEstimate();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      
      {/* Title */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
            <Truck className="w-6 h-6" />
          </span>
          {t.logisticsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.logisticsSub}
        </p>
      </div>

      {/* Two Column Layout: Calculator on Left, Fleet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Freight Cost Calculator & Pool Savings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Calculator className="w-5 h-5 text-orange-600" />
              <h2 className="font-extrabold text-base text-slate-900">
                {t.freightCalculator}
              </h2>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <label>{t.calcDistanceKm}</label>
                  <span className="text-orange-600 font-extrabold">{calcDistance} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <label>{t.calcWeightQuintals}</label>
                  <span className="text-orange-600 font-extrabold">{calcWeight} Quintals</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.calcVehicleType}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCalcVehicle("light")}
                    className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                      calcVehicle === "light"
                        ? "bg-orange-50 border-orange-500 text-orange-950 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Tata Ace (1 Ton)
                  </button>

                  <button
                    onClick={() => setCalcVehicle("mini")}
                    className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                      calcVehicle === "mini"
                        ? "bg-orange-50 border-orange-500 text-orange-950 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Bolero Maxi (2 Ton)
                  </button>

                  <button
                    onClick={() => setCalcVehicle("medium")}
                    className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                      calcVehicle === "medium"
                        ? "bg-orange-50 border-orange-500 text-orange-950 font-extrabold"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  >
                    Eicher 14ft (5 Ton)
                  </button>
                </div>
              </div>

              {/* Shared Pool Toggle */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 text-xs">
                  <input
                    type="checkbox"
                    checked={useSharedPool}
                    onChange={(e) => setUseSharedPool(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span>{t.useSharedPoolOption}</span>
                </label>
                <span className="text-[11px] text-amber-700 block mt-1">
                  Combines your produce with 2-3 farmers heading in the same route.
                </span>
              </div>

              <button
                onClick={calculateEstimate}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl transition shadow-md"
              >
                {t.calculateFreightBtn}
              </button>

              {/* Estimate Calculation Box */}
              {estimateResult && (
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 mt-3 animate-in fade-in">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-300 uppercase font-bold">{t.estimatedCost}</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₹{estimateResult.estimatedFreight}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t.costPerQtl}:</span>
                    <span className="text-white font-bold">₹{estimateResult.costPerQuintal} / Qtl</span>
                  </div>

                  {estimateResult.sharedPoolSavings > 0 && (
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-300">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {t.sharedSavingsAmount}:
                      </span>
                      <span>- ₹{estimateResult.sharedPoolSavings}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Verified Transport Fleet & Active Routes (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-600" />
              Verified Rural Transporters & Route Schedules
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {transporters.length} active routes
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading transport fleet...
            </div>
          ) : (
            <div className="space-y-3">
              {transporters.map((tItem) => (
                <div
                  key={tItem.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-orange-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-base text-slate-900">
                            {tItem.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-700">{tItem.vehicleType}</span>
                          <span>•</span>
                          <span className="font-mono">{tItem.vehicleNumber}</span>
                        </div>
                      </div>

                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        ★ {tItem.rating} ({tItem.tripsCompleted} trips)
                      </span>
                    </div>

                    {/* Route & Schedule */}
                    <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Route className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>Route: {tItem.activeRoute}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{tItem.dailySchedule}</span>
                      </div>
                    </div>

                    {/* Shared Space Availability */}
                    {tItem.sharedPoolAvailable && (
                      <div className="mt-2.5 flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-200">
                        <span className="font-bold flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          Shared Space Left: <strong>{tItem.availableSpaceQuintals} Qtl</strong>
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {tItem.sharedPoolDiscount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/${tItem.whatsapp}?text=${encodeURIComponent(
                        `Namaste ${tItem.driverName}, I saw your ${tItem.vehicleType} on KisanSetu. I need produce transport to Mandi.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Driver</span>
                    </a>

                    <a
                      href={`tel:${tItem.phone}`}
                      className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>Call ({tItem.driverName})</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
