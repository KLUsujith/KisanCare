import React, { createContext, useContext, useState, useEffect } from "react";
import { languages, translations } from "../i18n/index.js";
import { speakText, stopSpeaking } from "../utils/speech.js";
import { getOfflineListings, syncOfflineListingsToServer } from "../utils/offlineStorage.js";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("kisancare_lang") || "te"; // Default to Telugu as requested
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("kisancare_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [farmProfile, setFarmProfile] = useState(() => {
    try {
      const stored = localStorage.getItem("kisancare_farm");
      return stored ? JSON.parse(stored) : {
        totalAcres: 3.5,
        state: "Andhra Pradesh",
        district: "Guntur",
        mandal: "Tenali",
        village: "Tenali Rural",
        soilType: "Deep Black Clayey Soil",
        irrigationSource: "Borewell with Drip",
        previousCrop: "Cotton (పత్తి)"
      };
    } catch (e) {
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(() => {
    // Auto-open login modal if no user is saved
    try {
      const stored = localStorage.getItem("kisancare_user");
      return !stored;
    } catch (e) {
      return true;
    }
  });
  const [role, setRole] = useState(() => user?.role || "farmer");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState("crop-care");
  const [toastMessage, setToastMessage] = useState(null);

  const t = translations[language] || translations["te"] || translations["en"];

  const refreshSyncCount = () => {
    const list = getOfflineListings();
    setPendingSyncCount(list.length);
  };

  useEffect(() => {
    refreshSyncCount();

    const handleOnline = async () => {
      setIsOnline(true);
      showToast("Online: Synchronizing records with Cloud...", "success");
      const synced = await syncOfflineListingsToServer();
      refreshSyncCount();
      if (synced > 0) {
        showToast(`Synced ${synced} record(s) with cloud database!`, "success");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast("Offline Mode: Data safely cached locally.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const changeLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem("kisancare_lang", code);
    stopSpeaking();
    setIsSpeaking(false);
  };

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role || "farmer");
    localStorage.setItem("kisancare_user", JSON.stringify(userData));
    if (userData.acresOwned) {
      setFarmProfile(prev => ({
        ...prev,
        totalAcres: userData.acresOwned,
        district: userData.district || prev.district,
        state: userData.state || prev.state
      }));
    }
  };

  const logout = () => {
    setUser(null);
    setRole("farmer");
    if (activeTab === "admin") {
      setActiveTab("crop-care");
    }
    localStorage.removeItem("kisancare_user");
    showToast("Logged out successfully.", "info");
  };

  const updateFarmProfile = (newProfile) => {
    setFarmProfile(newProfile);
    localStorage.setItem("kisancare_farm", JSON.stringify(newProfile));
  };

  const showToast = (message, type = "info") => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const playVoice = (text) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText(text, language, () => {
      setIsSpeaking(false);
    });
  };

  const stopVoice = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        languages,
        changeLanguage,
        t,
        user,
        login,
        logout,
        farmProfile,
        updateFarmProfile,
        showLoginModal,
        setShowLoginModal,
        role,
        setRole,
        isOnline,
        setIsOnline,
        pendingSyncCount,
        refreshSyncCount,
        isSpeaking,
        playVoice,
        stopVoice,
        activeTab,
        setActiveTab,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
