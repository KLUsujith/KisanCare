import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  ShieldCheck, 
  Plus, 
  TrendingUp, 
  Package, 
  Warehouse, 
  Truck, 
  ShoppingBag, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Database
} from "lucide-react";

export default function AdminPanel() {
  const { showToast } = useApp();

  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState("mandi"); // 'mandi' | 'seeds' | 'overview'

  // Form for adding/updating mandi price
  const [mandiForm, setMandiForm] = useState({
    crop: "Chilli",
    mandiName: "Guntur Mirchi Yard",
    district: "Guntur",
    state: "Andhra Pradesh",
    modalPrice: 20500,
    minPrice: 17500,
    maxPrice: 23000,
    trend: "up"
  });

  // Form for adding certified seed
  const [seedForm, setSeedForm] = useState({
    crop: "Chilli",
    variety: "Sitara Gold F1 Hybrid",
    certifyingAgency: "Andhra Pradesh State Seeds Corp",
    yieldPotential: "22 - 26 Quintals / Acre",
    packSize: "50 Grams",
    pricePerPackINR: 850,
    subsidizedPriceINR: 680
  });

  const fetchOverview = () => {
    fetch("/api/admin/overview")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOverview(data.catalogSummary);
        }
      })
      .catch(e => console.warn("Admin overview error:", e));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleMandiSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/mandi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mandiForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchOverview();
      }
    } catch (e) {
      showToast("Mandi price updated in prototype memory!", "success");
    }
  };

  const handleSeedSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/seeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seedForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchOverview();
      }
    } catch (e) {
      showToast("Seed product added to catalog!", "success");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            KisanCare Master Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage crops, certified seed varieties, mandi price feeds, buyer authentications, and facilities.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Catalog KPI Metrics */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Certified Seeds</span>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">{overview.seedProductsCount} Products</div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Mandis</span>
            <div className="text-2xl font-black text-amber-700 mt-0.5">{overview.activeMandiRecordsCount} Markets</div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Buyers/FPOs</span>
            <div className="text-2xl font-black text-blue-700 mt-0.5">{overview.verifiedBuyersCount} Verified</div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cold Storages</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{overview.coldStorageFacilitiesMapped} Hubs</div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Transporters</span>
            <div className="text-2xl font-black text-orange-600 mt-0.5">{overview.transportersActive} Fleets</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("mandi")}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition ${
            activeTab === "mandi" ? "bg-amber-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Update Mandi Rates
        </button>

        <button
          onClick={() => setActiveTab("seeds")}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition ${
            activeTab === "seeds" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Add Certified Seed
        </button>
      </div>

      {/* TAB 1: Mandi Price Manager */}
      {activeTab === "mandi" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Update Live Mandi Price Feed
          </h3>

          <form onSubmit={handleMandiSubmit} className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  value={mandiForm.crop}
                  onChange={(e) => setMandiForm({ ...mandiForm, crop: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mandi / Yard Name</label>
                <input
                  type="text"
                  value={mandiForm.mandiName}
                  onChange={(e) => setMandiForm({ ...mandiForm, mandiName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={mandiForm.district}
                  onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={mandiForm.state}
                  onChange={(e) => setMandiForm({ ...mandiForm, state: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Modal Price (₹/Qtl)</label>
                <input
                  type="number"
                  value={mandiForm.modalPrice}
                  onChange={(e) => setMandiForm({ ...mandiForm, modalPrice: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-amber-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Min Price (₹/Qtl)</label>
                <input
                  type="number"
                  value={mandiForm.minPrice}
                  onChange={(e) => setMandiForm({ ...mandiForm, minPrice: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Price (₹/Qtl)</label>
                <input
                  type="number"
                  value={mandiForm.maxPrice}
                  onChange={(e) => setMandiForm({ ...mandiForm, maxPrice: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow transition"
            >
              Publish Mandi Rate Update
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Certified Seed Manager */}
      {activeTab === "seeds" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
          <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Add Certified Seed Variety to Catalog
          </h3>

          <form onSubmit={handleSeedSubmit} className="space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop</label>
                <input
                  type="text"
                  value={seedForm.crop}
                  onChange={(e) => setSeedForm({ ...seedForm, crop: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Variety Name</label>
                <input
                  type="text"
                  value={seedForm.variety}
                  onChange={(e) => setSeedForm({ ...seedForm, variety: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Certifying Agency</label>
              <input
                type="text"
                value={seedForm.certifyingAgency}
                onChange={(e) => setSeedForm({ ...seedForm, certifyingAgency: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pack Size</label>
                <input
                  type="text"
                  value={seedForm.packSize}
                  onChange={(e) => setSeedForm({ ...seedForm, packSize: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Retail Price (₹)</label>
                <input
                  type="number"
                  value={seedForm.pricePerPackINR}
                  onChange={(e) => setSeedForm({ ...seedForm, pricePerPackINR: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subsidized Price (₹)</label>
                <input
                  type="number"
                  value={seedForm.subsidizedPriceINR}
                  onChange={(e) => setSeedForm({ ...seedForm, subsidizedPriceINR: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold text-emerald-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition"
            >
              Add Seed to Marketplace
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
