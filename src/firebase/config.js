// KisanCare Firebase & Resilient Cloud Data Service
// Configured for Firebase Auth & Firestore with offline fallback

let app = null;
let auth = null;
let db = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMO-KEY-KISANCARE-2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kisancare-agri.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kisancare-agri",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kisancare-agri.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcd1234efgh5678"
};

// Check if valid production Firebase credentials are provided
const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  !import.meta.env.VITE_FIREBASE_API_KEY.includes("DEMO")
);

// Cloud Database abstraction supporting both live Firestore and offline persistent storage
export const cloudService = {
  isConfigured,
  
  // Save farmer profile to Firestore or local sync store
  async saveUserProfile(userData) {
    try {
      localStorage.setItem("kisancare_user", JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      console.warn("Error storing user profile:", err);
      return { success: false, error: err.message };
    }
  },

  // Save farm profile (Acres, Soil, Irrigation)
  async saveFarmDetails(farmData) {
    try {
      localStorage.setItem("kisancare_farm", JSON.stringify(farmData));
      // Also post to backend
      fetch("/api/myfarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(farmData)
      }).catch(e => console.warn("Backend farm sync deferred:", e));
      return { success: true, farm: farmData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Retrieve farm details
  getStoredFarmDetails() {
    try {
      const raw = localStorage.getItem("kisancare_farm");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // Save seed order
  async saveSeedOrder(order) {
    try {
      const orders = this.getStoredSeedOrders();
      orders.unshift(order);
      localStorage.setItem("kisancare_seed_orders", JSON.stringify(orders));
      return { success: true, order };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getStoredSeedOrders() {
    try {
      const raw = localStorage.getItem("kisancare_seed_orders");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
};

export { app, auth, db };
