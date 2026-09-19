import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Activity, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Warehouse, 
  AlertOctagon, 
  CheckCircle2, 
  BarChart3,
  Calendar
} from "lucide-react";

export default function AdminDashboard() {
  const { t } = useApp();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalytics(data);
        }
      })
      .catch((e) => console.warn("Analytics fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading agricultural market pulse & disease alerts...
      </div>
    );
  }

  const { stats, regionalOutbreakAlerts, topCommoditiesDemand } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <Activity className="w-6 h-6" />
          </span>
          {t.analyticsTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Surveillance heatmap, farm-gate price momentum, and real-time middleman commission savings.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.activeFarmers}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            {stats.activeFarmersRegistered.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Across 12 Indian states</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.volumeListed}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
            {stats.totalQuintalsListed} Qtl
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Direct farm harvest offers</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {t.commissionSaved}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {stats.avgMiddlemenCommissionSavedPercent}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Saved vs APMC Arhatiya cut</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Verified FPOs & Stores
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {stats.verifiedFposCount} / {stats.coldStoragesMapped}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Direct institutional tie-ups</span>
        </div>
      </div>

      {/* Disease Outbreak Surveillance Alerts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-3">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          {t.outbreakAlertsTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {regionalOutbreakAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex flex-col justify-between space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {alert.crop}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{alert.date}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1.5">{alert.disease}</h4>
                <div className="text-xs text-slate-600 mt-1">
                  Districts: <strong>{alert.affectedDistricts.join(", ")}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-red-100 text-xs text-red-900 bg-white/60 p-2 rounded-lg font-medium">
                Action: {alert.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commodity Demand Index */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          {t.demandIndexTitle}
        </h2>

        <div className="space-y-3">
          {topCommoditiesDemand.map((com, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>{com.crop}</span>
                <span className="text-emerald-700 font-extrabold">{com.priceRange} ({com.trend})</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${com.demandIndex}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
