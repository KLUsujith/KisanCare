import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Sprout, 
  Globe, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  UserCheck, 
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Warehouse,
  Truck,
  Activity,
  Package,
  Coins,
  MapPin,
  LogIn,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Film
} from "lucide-react";

export default function Navbar() {
  const { 
    language, 
    languages, 
    changeLanguage, 
    t, 
    user,
    logout,
    farmProfile,
    setShowLoginModal,
    showDemoVideo,
    setShowDemoVideo,
    isOnline, 
    setIsOnline,
    pendingSyncCount,
    isSpeaking,
    stopVoice,
    activeTab,
    setActiveTab,
    refreshSyncCount,
    showToast
  } = useApp();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const navItems = [
    { id: "crop-care", label: "Crop Doctor (డాక్టర్)", icon: Sprout, color: "text-emerald-500" },
    { id: "recommendation", label: "Crop Advisory (సిఫార్సు)", icon: MapPin, color: "text-blue-500" },
    { id: "income", label: "Income Estimator (ఆదాయం)", icon: Coins, color: "text-amber-500" },
    { id: "seeds", label: "Buy Seeds (విత్తనాలు)", icon: Package, color: "text-purple-500" },
    { id: "mandi", label: "Mandi Rates (మార్కెట్ ధరలు)", icon: TrendingUp, color: "text-green-600" },
    { id: "market", label: "Buyers & FPOs (కొనుగోలుదారులు)", icon: ShoppingBag, color: "text-emerald-600" },
    { id: "storage", label: "Cold Storage (శీతల గిడ్డంగి)", icon: Warehouse, color: "text-cyan-500" },
    { id: "logistics", label: "Logistics (రవాణా)", icon: Truck, color: "text-orange-500" },
    { id: "myfarm", label: "My Farm (నా పొలం)", icon: Activity, color: "text-teal-500" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-agri-800 text-white shadow-md border-b border-agri-900">
      
      {/* Offline Status Alert Bar */}
      {!isOnline && (
        <div className="bg-amber-600 text-amber-50 px-4 py-1.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>ఆఫ్‌లైన్ మోడ్ (Offline): Local data is available. Actions will auto-sync when online.</span>
          </div>
          {pendingSyncCount > 0 && (
            <span className="bg-amber-800 px-2 py-0.5 rounded text-[11px] font-bold">
              {pendingSyncCount} Pending Sync
            </span>
          )}
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab("crop-care")} 
            className="flex items-center space-x-2 cursor-pointer select-none"
          >
            <div className="bg-emerald-500 p-2 rounded-2xl text-white shadow-inner flex items-center justify-center">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-emerald-300">
                  KisanCare
                </span>
                <span className="bg-emerald-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded text-emerald-100 uppercase">
                  కిసాన్ కేర్
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-100/80 hidden sm:block">
                Smart Crop Care & Direct Market Access
              </p>
            </div>
          </div>

          {/* Right Controls: User Profile / Language / Online */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* User Login / Profile Pill */}
            {user ? (
              <div className="flex items-center bg-agri-900/90 py-1 px-2.5 rounded-xl border border-agri-700/60 text-xs">
                {(user.role === "admin" || user.isAdmin) ? (
                  <div 
                    onClick={() => setActiveTab("admin")}
                    className="cursor-pointer flex items-center space-x-1.5 mr-2"
                    title="Admin Dashboard"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-extrabold text-white truncate max-w-[110px] sm:max-w-[150px]">
                      {(user?.name || "Admin").split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-700/80 text-blue-100 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </div>
                ) : (
                  <div 
                    onClick={() => setActiveTab("myfarm")}
                    className="cursor-pointer flex items-center space-x-1.5 mr-2"
                    title="My Farm Profile"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-extrabold text-white truncate max-w-[110px] sm:max-w-[150px]">
                      {(user?.name || "రైతు").split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-700/80 text-emerald-100 px-1.5 py-0.5 rounded">
                      {farmProfile?.totalAcres || user?.acresOwned || 3.5} Ac
                    </span>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 pl-1 border-l border-agri-700"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>లాగిన్ / Login</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="bg-agri-900/90 hover:bg-agri-900 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-agri-700/60 flex items-center space-x-1.5 transition"
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden sm:inline">{currentLangObj.name}</span>
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs divide-y divide-slate-100"
                  onClick={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 font-bold text-slate-400 uppercase text-[10px]">
                    భాష ఎంచుకోండి / Select Language
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 transition ${language === l.code ? "bg-emerald-100 font-bold text-emerald-900" : ""}`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{l.flag}</span>
                        <span className="font-semibold">{l.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Watch Demo Video Button */}
            <button
              onClick={() => setShowDemoVideo(true)}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1.5 rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              title="Watch 16-Second Platform Demo Video"
            >
              <Film className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">డెమో వీడియో / Demo</span>
            </button>

            {/* Online / Offline Simulator Toggle */}
            <button
              onClick={() => {
                const nextStatus = !isOnline;
                setIsOnline(nextStatus);
                showToast(nextStatus ? "Internet Restored: Synced with cloud!" : "Switched to Offline Mode (Simulated)", nextStatus ? "success" : "warning");
              }}
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                isOnline 
                  ? "bg-emerald-700/80 text-emerald-100 border-emerald-500/40" 
                  : "bg-amber-600 text-white border-amber-400 animate-pulse"
              }`}
              title="Click to toggle Online/Offline simulation"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">
                {isOnline ? "Online" : "Offline"}
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-xl bg-agri-700 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Scrollable Tab Bar */}
        <nav className="hidden md:flex space-x-1 border-t border-agri-700/60 py-1.5 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
                  isActive
                    ? "bg-white text-agri-800 shadow-sm"
                    : "text-emerald-100 hover:bg-agri-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Dashboard Tab - STRICTLY only visible to Admin role */}
          {(user?.role === "admin" || user?.isAdmin === true) && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 whitespace-nowrap transition ${
                activeTab === "admin"
                  ? "bg-white text-blue-900 shadow-sm font-black"
                  : "bg-blue-900/70 text-blue-200 hover:bg-blue-800 border border-blue-600/40"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span>Admin Dashboard (అడ్మిన్)</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Drawer (When hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-agri-900 border-t border-agri-700 px-3 py-3 space-y-1 animate-in slide-in-from-top">
          {/* Watch Demo Video in mobile drawer */}
          <button
            onClick={() => {
              setShowDemoVideo(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 bg-amber-400 text-slate-950 shadow mb-2"
          >
            <Film className="w-4 h-4 text-slate-900" />
            <span>🎬 డెమో వీడియో చూడండి (Watch Platform Demo)</span>
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 ${
                  activeTab === item.id ? "bg-emerald-600 text-white" : "text-emerald-100 hover:bg-agri-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Dashboard Drawer Item - STRICTLY only visible to Admin role */}
          {(user?.role === "admin" || user?.isAdmin === true) && (
            <button
              onClick={() => {
                setActiveTab("admin");
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 ${
                activeTab === "admin" ? "bg-blue-600 text-white font-black" : "text-blue-200 bg-blue-950/60 hover:bg-blue-900 border border-blue-700/40"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-300" />
              <span>Admin Dashboard (అడ్మిన్ పోర్టల్)</span>
            </button>
          )}
        </div>
      )}

      {/* Fixed Mobile Bottom Bar (Large Icons for Basic Smartphones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl py-1 px-1 flex justify-around items-center">
        <button
          onClick={() => setActiveTab("crop-care")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl ${activeTab === "crop-care" ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}
        >
          <Sprout className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">డాక్టర్</span>
        </button>

        <button
          onClick={() => setActiveTab("recommendation")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl ${activeTab === "recommendation" ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">పంట సిఫార్సు</span>
        </button>

        <button
          onClick={() => setActiveTab("income")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl ${activeTab === "income" ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ఆదాయం</span>
        </button>

        <button
          onClick={() => setActiveTab("seeds")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl ${activeTab === "seeds" ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">విత్తనాలు</span>
        </button>

        <button
          onClick={() => setActiveTab("mandi")}
          className={`flex flex-col items-center py-1 px-2 rounded-xl ${activeTab === "mandi" ? "text-emerald-700 font-extrabold" : "text-slate-500"}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ధరలు</span>
        </button>
      </div>
    </header>
  );
}
