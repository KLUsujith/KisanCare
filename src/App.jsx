import React from "react";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import Navbar from "./components/Navbar.jsx";
import CropDoctor from "./components/CropDoctor.jsx";
import CropRecommendation from "./components/CropRecommendation.jsx";
import IncomeEstimator from "./components/IncomeEstimator.jsx";
import BuySeeds from "./components/BuySeeds.jsx";
import MandiPrices from "./components/MandiPrices.jsx";
import Marketplace from "./components/Marketplace.jsx";
import ColdStorage from "./components/ColdStorage.jsx";
import LogisticsHub from "./components/LogisticsHub.jsx";
import MyFarm from "./components/MyFarm.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import VoiceAssistant from "./components/VoiceAssistant.jsx";
import LoginModal from "./components/LoginModal.jsx";
import DemoVideoModal from "./components/DemoVideoModal.jsx";
import { PhoneCall, ShieldCheck, Sprout } from "lucide-react";

function MainContent() {
  const { activeTab, setActiveTab, toastMessage, language, showLoginModal, setShowLoginModal, showDemoVideo, setShowDemoVideo, user } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50" lang={language}>
      <div>
        <Navbar />

        {/* Global Toast Alerts */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2">
            <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${
              toastMessage.type === "success" 
                ? "bg-emerald-800 text-white border-emerald-600" 
                : toastMessage.type === "warning" 
                ? "bg-amber-600 text-white border-amber-500" 
                : toastMessage.type === "error"
                ? "bg-red-700 text-white border-red-500"
                : "bg-slate-900 text-white border-slate-700"
            }`}>
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{toastMessage.message}</span>
            </div>
          </div>
        )}

        {/* Primary Tab View Selector */}
        <main>
          {activeTab === "crop-care" && <CropDoctor />}
          {activeTab === "recommendation" && <CropRecommendation />}
          {activeTab === "income" && <IncomeEstimator />}
          {activeTab === "seeds" && <BuySeeds />}
          {activeTab === "mandi" && <MandiPrices />}
          {activeTab === "market" && <Marketplace />}
          {activeTab === "storage" && <ColdStorage />}
          {activeTab === "logistics" && <LogisticsHub />}
          {activeTab === "myfarm" && <MyFarm />}
          {activeTab === "admin" && (
            (user?.role === "admin" || user?.isAdmin === true) ? (
              <AdminPanel />
            ) : (
              <div className="max-w-md mx-auto my-14 p-8 bg-white rounded-3xl shadow-xl text-center border border-amber-200">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">Admin Access Restricted</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  ఈ పేజీ అడ్మినిస్ట్రేటర్లకు మాత్రమే అందుబాటులో ఉంటుంది. రైతు ఖాతాలకు అడ్మిన్ డాష్‌బోర్డ్ అందుబాటులో ఉండదు.
                  <br />
                  <span className="text-slate-400 mt-1 block">
                    (Admin Dashboard is restricted to administrators only. Farmers cannot access this portal.)
                  </span>
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setActiveTab("crop-care")}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    రైతు హోమ్‌కి వెళ్లండి
                  </button>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow transition inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>అడ్మిన్ లాగిన్ / Admin Login</span>
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* Login / Registration Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Sample Walkthrough Demo Video Modal */}
      <DemoVideoModal isOpen={showDemoVideo} onClose={() => setShowDemoVideo(false)} />

      {/* Floating Interactive Voice Assistant */}
      <VoiceAssistant />

      {/* Farmer Helpline & Accreditation Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <span>KisanCare (కిసాన్ కేర్ - Smart Crop Care & Direct Market)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Designed for small and marginal farmers across Andhra Pradesh, Telangana, and India with AI diagnosis, area crop advisory, 3-scenario income estimations, certified seeds, APMC mandi rates, and direct market linkage.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              రైతు హెల్ప్‌లైన్ / Farmer Helplines
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Kisan Call Center: 1800-180-1551 (Toll-Free)</span>
              </div>
              <div className="text-slate-400">
                AP Rythu Bharosa Kendra (RBK) Support: 1907
              </div>
              <div className="text-slate-400">
                Telangana Rythu Bandhu Grievance: 040-2338-3520
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Scientific Standards & Disclaimer
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Advisories comply with Indian Council of Agricultural Research (ICAR) & ANGRAU protocols. Calculations are estimated historical scenarios and should be confirmed with your local Mandal Agricultural Officer (MAO).
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
