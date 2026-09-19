// Offline Queue & Storage Utilities for Low-Connectivity Operations

const OFFLINE_LISTINGS_KEY = "kisansetu_offline_listings";
const OFFLINE_DIAGNOSES_KEY = "kisansetu_offline_diagnoses";

export function getOfflineListings() {
  try {
    const raw = localStorage.getItem(OFFLINE_LISTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOfflineListing(listing) {
  try {
    const list = getOfflineListings();
    const item = {
      ...listing,
      id: `offline-${Date.now()}`,
      offlinePending: true,
      savedAt: new Date().toISOString()
    };
    list.unshift(item);
    localStorage.setItem(OFFLINE_LISTINGS_KEY, JSON.stringify(list));
    return item;
  } catch (e) {
    console.error("Failed to save offline listing:", e);
    return null;
  }
}

export function removeOfflineListing(id) {
  try {
    let list = getOfflineListings();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(OFFLINE_LISTINGS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Error removing offline listing:", e);
  }
}

export async function syncOfflineListingsToServer() {
  const pending = getOfflineListings();
  if (!pending || pending.length === 0) return 0;

  let syncedCount = 0;
  for (const item of pending) {
    try {
      const payload = { ...item };
      delete payload.id;
      delete payload.offlinePending;
      delete payload.savedAt;

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        removeOfflineListing(item.id);
        syncedCount++;
      }
    } catch (e) {
      console.warn("Sync failed for item:", item.id, e);
    }
  }

  return syncedCount;
}
