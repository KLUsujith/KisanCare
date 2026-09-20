import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  Receipt,
  ArrowRight
} from "lucide-react";

export default function IncomeEstimator() {
  const { farmProfile, language, playVoice, stopVoice, isSpeaking, setActiveTab, showToast } = useApp();

  const [crop, setCrop] = useState("Chilli");
  const [acres, setAcres] = useState(farmProfile?.totalAcres || 3.5);
  const [district, setDistrict] = useState(farmProfile?.district || "Guntur");

  // Manual overrides
  const [manualPrice, setManualPrice] = useState("");
  const [manualYield, setManualYield] = useState("");
  const [manualCost, setManualCost] = useState("");

  const [scenarioData, setScenarioData] = useState(null);
  const [loading, setLoading] = useState(false);

  const cropsList = [
    { name: "Chilli", nameTe: "మిరప", defaultPrice: 19800, defaultYield: 22 },
    { name: "Cotton", nameTe: "పత్తి", defaultPrice: 7650, defaultYield: 11 },
    { name: "Tomato", nameTe: "టమాట", defaultPrice: 2200, defaultYield: 140 },
    { name: "Rice / Paddy", nameTe: "వరి", defaultPrice: 2400, defaultYield: 24 },
    { name: "Potato", nameTe: "ఆలూ", defaultPrice: 1720, defaultYield: 125 },
    { name: "Maize", nameTe: "మొక్కజొన్న", defaultPrice: 2150, defaultYield: 28 },
    { name: "Onion", nameTe: "ఉల్లిపాయ", defaultPrice: 2600, defaultYield: 110 }
  ];

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/advisory/scenario-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          acres,
          district,
          manualSellingPrice: manualPrice ? Number(manualPrice) : null,
          manualYieldPerAcre: manualYield ? Number(manualYield) : null,
          manualInputCostPerAcre: manualCost ? Number(manualCost) : null
        })
      });
      const data = await res.json();
      if (data && data.success && data.scenarios) {
        setScenarioData(data);
      }
    } catch (err) {
      console.warn("Scenario fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, [crop, acres, manualPrice, manualYield, manualCost]);

  const handleListenScenarios = () => {
    if (!scenarioData || !scenarioData.scenarios) return;
    const s = scenarioData.scenarios;
    const expNet = (s.expected?.estimatedNetIncome ?? 0).toLocaleString();
    const lowNet = (s.low?.estimatedNetIncome ?? 0).toLocaleString();
    const highNet = (s.high?.estimatedNetIncome ?? 0).toLocaleString();
    const text = language === "te"
      ? `${crop} పంట కోసం ${acres} ఎకరాలలో ఆశించిన నికర రాబడి సుమారుగా ${expNet} రూపాయలు. ప్రతికూల వాతావరణంలో తక్కువ రాబడి ${lowNet} రూపాయలు, మరియు అనుకూల వాతావరణంలో అధిక రాబడి ${highNet} రూపాయలు.`
      : `For ${acres} acres of ${crop}: Expected net profit is approximately ₹${expNet}. Under adverse conditions, low scenario yields ₹${lowNet}, and under optimal season, high scenario yields ₹${highNet}.`;
    playVoice(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Coins className="w-6 h-6" />
            </span>
            Farm Income & Profit Estimator (ఆదాయ అంచనా కాలిక్యులేటర్)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate Low, Expected, and High income scenarios for your land acres with transparent cost calculations.
          </p>
        </div>

        {scenarioData && (
          <button
            onClick={handleListenScenarios}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center gap-2 self-start md:self-auto"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen to Income Scenarios</span>
          </button>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Statistical Projections Disclaimer:</strong> These three scenarios (Low, Expected, High) are statistical models based on historical mandi price volatility and regional yield records. They do <strong>NOT</strong> constitute guaranteed financial returns.
        </div>
      </div>

      {/* Control Panel: Crop, Acres, and Manual Overrides */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-600" />
            Input Parameters & Manual Adjustments
          </span>
          <button
            onClick={() => {
              setManualPrice("");
              setManualYield("");
              setManualCost("");
              showToast("Reset to regional baseline averages!", "info");
            }}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Reset Overrides
          </button>
        </div>

        {/* Crop Selection & Land Acres */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Select Crop (పంట)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {cropsList.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCrop(c.name)}
                  className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                    crop === c.name
                      ? "bg-amber-50 border-amber-500 text-amber-950 font-black ring-2 ring-amber-400/20"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div>{c.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{c.nameTe}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-6 bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-amber-950">
                Land Size: <strong className="text-lg text-amber-800 font-black">{acres} Acres</strong>
              </label>
              <span className="text-xs text-slate-500 font-medium">Synced with My Farm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <div className="flex gap-1.5">
              {[1, 2, 3.5, 5, 10].map((quick) => (
                <button
                  key={quick}
                  onClick={() => setAcres(quick)}
                  className={`px-2 py-0.5 text-xs font-bold rounded border ${acres === quick ? "bg-amber-700 text-white" : "bg-white text-slate-700 border-slate-300"}`}
                >
                  {quick} Ac
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Parameter Customizers */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Optional: Adjust Values if your local mandi or costs differ
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mandi Price (₹/Quintal)</label>
              <input
                type="number"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                placeholder={`Auto Live: ₹${scenarioData?.parametersUsed?.sellingPricePerQtl || 2200}`}
                className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expected Yield (Qtl / Acre)</label>
              <input
                type="number"
                step="0.5"
                value={manualYield}
                onChange={(e) => setManualYield(e.target.value)}
                placeholder={`Baseline: ${scenarioData?.parametersUsed?.yieldPerAcre || 20} Qtl`}
                className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Input Cost (₹ / Acre)</label>
              <input
                type="number"
                value={manualCost}
                onChange={(e) => setManualCost(e.target.value)}
                placeholder={`Baseline: ₹${scenarioData?.parametersUsed?.inputCostPerAcre?.toLocaleString() || 30000}`}
                className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/30 font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Scenarios Cards: Low, Expected, High */}
      {scenarioData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              Projected Scenarios for {acres} Acres of {crop}
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              Benchmark: {scenarioData.benchmarkMandi || "APMC Market Benchmark"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Scenario 1: Low Scenario */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-red-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-100 text-red-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase">
                Adverse Year
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-red-600 font-extrabold text-sm mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>Low Income Scenario</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {scenarioData.scenarios?.low?.scenarioNameTe || "తక్కువ రాబడి (ప్రతికూల వాతావరణం)"}
                </div>

                <div className="mt-4 p-3 bg-red-50/50 rounded-xl border border-red-100 space-y-1">
                  <div className="text-xs text-slate-500">Estimated Net Profit:</div>
                  <div className="text-2xl font-black text-red-700">
                    ₹{(scenarioData.scenarios?.low?.estimatedNetIncome ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-red-800 font-bold">
                    ROI: {scenarioData.scenarios?.low?.roiPercent ?? 0}%
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Yield for {acres} Ac:</span>
                    <strong className="text-slate-800">{scenarioData.scenarios?.low?.totalYieldQuintals ?? 0} Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mandi Sale Price:</span>
                    <strong className="text-slate-800">₹{scenarioData.scenarios?.low?.sellingPricePerQtl ?? 0} / Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Revenue:</span>
                    <strong className="text-slate-800">₹{(scenarioData.scenarios?.low?.grossRevenue ?? 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Cultivation Cost:</span>
                    <span>- ₹{(scenarioData.scenarios?.low?.cultivationCost ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 2: Expected Scenario (Highlighted) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500 shadow-md flex flex-col justify-between relative overflow-hidden ring-4 ring-emerald-500/10">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                ★ Recommended Baseline
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Expected Normal Scenario</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {scenarioData.scenarios?.expected?.scenarioNameTe || "సాధారణ ఆశించిన రాబడి"}
                </div>

                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                  <div className="text-xs text-emerald-800 font-bold">Estimated Net Profit:</div>
                  <div className="text-3xl font-black text-emerald-700">
                    ₹{(scenarioData.scenarios?.expected?.estimatedNetIncome ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-900 font-bold">
                    Net Return on Investment (ROI): {scenarioData.scenarios?.expected?.roiPercent ?? 0}%
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-700 font-medium">
                  <div className="flex justify-between">
                    <span>Expected Yield for {acres} Ac:</span>
                    <strong className="text-slate-900">{scenarioData.scenarios?.expected?.totalYieldQuintals ?? 0} Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mandi Sale Price:</span>
                    <strong className="text-slate-900">₹{scenarioData.scenarios?.expected?.sellingPricePerQtl ?? 0} / Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Revenue:</span>
                    <strong className="text-slate-900">₹{(scenarioData.scenarios?.expected?.grossRevenue ?? 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total Cultivation Cost:</span>
                    <span>- ₹{(scenarioData.scenarios?.expected?.cultivationCost ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario 3: High Scenario */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-300 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase">
                Bumper Season
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>High Income Scenario</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {scenarioData.scenarios?.high?.scenarioNameTe || "అధిక రాబడి (అనుకూల వాతావరణం)"}
                </div>

                <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                  <div className="text-xs text-slate-500">Estimated Net Profit:</div>
                  <div className="text-2xl font-black text-blue-700">
                    ₹{(scenarioData.scenarios?.high?.estimatedNetIncome ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-blue-800 font-bold">
                    ROI: {scenarioData.scenarios?.high?.roiPercent ?? 0}%
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>High Yield for {acres} Ac:</span>
                    <strong className="text-slate-800">{scenarioData.scenarios?.high?.totalYieldQuintals ?? 0} Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium Price:</span>
                    <strong className="text-slate-800">₹{scenarioData.scenarios?.high?.sellingPricePerQtl ?? 0} / Qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Revenue:</span>
                    <strong className="text-slate-800">₹{(scenarioData.scenarios?.high?.grossRevenue ?? 0).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Cultivation Cost:</span>
                    <span>- ₹{(scenarioData.scenarios?.high?.cultivationCost ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Calculation Breakdown Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Transparent Math & Itemized Cultivation Expenses (for {acres} Acres)
              </h3>
            </div>

            <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto">
              {scenarioData.transparencyFormula}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Certified Seeds</span>
                <span className="font-extrabold text-slate-800">₹{(scenarioData.costBreakdown?.seeds ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Land Preparation / Plowing</span>
                <span className="font-extrabold text-slate-800">₹{(scenarioData.costBreakdown?.landPreparation ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fertilizers & Organic Manure</span>
                <span className="font-extrabold text-slate-800">₹{(scenarioData.costBreakdown?.fertilizersAndManure ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Crop Protection / Sprays</span>
                <span className="font-extrabold text-slate-800">₹{(scenarioData.costBreakdown?.plantProtectionSprays ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Irrigation & Power</span>
                <span className="font-extrabold text-slate-800">₹{(scenarioData.costBreakdown?.irrigationAndFuel ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Harvesting & Labor</span>
                <span className="font-extrabold text-slate-800">₹{(scenarioData.costBreakdown?.harvestingAndLabor ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Direct Market Advantage Box */}
            <div className="mt-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  KisanCare Direct Market Brokerage Bonus
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">
                  Selling directly to verified buyers saves 8% middleman commission, putting an extra <strong>+₹{(scenarioData.directMarketBonus?.savedCommissionINR ?? 0).toLocaleString()}</strong> in your pocket!
                </div>
              </div>
              <button
                onClick={() => setActiveTab("market")}
                className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shrink-0 transition"
              >
                Post Harvest to Market
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
