import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  ShoppingBag, 
  PlusCircle, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Building2, 
  ShieldCheck, 
  X,
  Send,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { saveOfflineListing, getOfflineListings } from "../utils/offlineStorage.js";

export default function Marketplace() {
  const { t, language, isOnline, showToast, refreshSyncCount } = useApp();

  const [activeSubTab, setActiveSubTab] = useState("listings"); // 'listings' | 'buyers'
  const [listings, setListings] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listing creation modal state
  const [showPostModal, setShowPostModal] = useState(false);
  const [formData, setFormData] = useState({
    crop: "Tomato",
    variety: "Hybrid Red",
    quantityQuintals: "",
    expectedPricePerQuintal: "",
    harvestDate: "Ready for picking",
    farmerName: "",
    phone: "",
    village: "",
    district: "",
    isOrganic: false,
    grade: "Grade A",
    description: ""
  });

  // Bid / Quote modal state
  const [biddingListing, setBiddingListing] = useState(null);
  const [buyerQuotePrice, setBuyerQuotePrice] = useState("");
  const [buyerName, setBuyerName] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      if (data.success) {
        // Merge with local offline pending items if any
        const offlineItems = getOfflineListings();
        setListings([...offlineItems, ...data.listings]);
      }
    } catch (e) {
      console.warn("Could not fetch listings, loading offline data:", e);
      const offlineItems = getOfflineListings();
      setListings(offlineItems);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyers = async () => {
    try {
      const res = await fetch("/api/buyers");
      const data = await res.json();
      if (data.success) {
        setBuyers(data.buyers);
      }
    } catch (e) {
      console.warn("Error fetching buyers:", e);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchBuyers();
  }, []);

  // Handle Post Listing Submit
  const handlePostListing = async (e) => {
    e.preventDefault();

    if (!formData.farmerName || !formData.phone || !formData.quantityQuintals || !formData.expectedPricePerQuintal) {
      showToast("Please fill in all required fields (Name, Phone, Quantity, Price)", "error");
      return;
    }

    if (!isOnline) {
      // Offline workflow
      const savedItem = saveOfflineListing(formData);
      refreshSyncCount();
      setShowPostModal(false);
      showToast("Offline Mode: Harvest listing saved locally! It will automatically sync when online.", "success");
      fetchListings();
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setShowPostModal(false);
        fetchListings();
      }
    } catch (err) {
      // Network failure: save offline fallback
      saveOfflineListing(formData);
      refreshSyncCount();
      setShowPostModal(false);
      showToast("Network dropped. Saved to offline queue!", "warning");
      fetchListings();
    }
  };

  // Handle Buyer Bid Submit
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!biddingListing) return;

    try {
      const res = await fetch(`/api/listings/${biddingListing.id}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName || "Verified Agro Buyer",
          bidPricePerQuintal: buyerQuotePrice
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Bid of ₹${buyerQuotePrice}/Qtl registered with farmer!`, "success");
        setBiddingListing(null);
        setBuyerQuotePrice("");
        fetchListings();
      }
    } catch (e) {
      showToast("Could not send bid, please call farmer directly.", "warning");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      
      {/* Top Header & Post Button */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </span>
            {t.marketTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.marketSub}
          </p>
        </div>

        {/* Sell Harvest Action Button */}
        <button
          onClick={() => setShowPostModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t.sellProduceBtn}</span>
        </button>
      </div>

      {/* Subtabs: Farm Listings vs Verified Buyers/FPOs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveSubTab("listings")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === "listings"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.activeListings} ({listings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("buyers")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeSubTab === "buyers"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Verified Buyers & FPOs ({buyers.length})</span>
        </button>
      </div>

      {/* VIEW 1: Farm Produce Listings Feed */}
      {activeSubTab === "listings" && (
        <>
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading Direct Produce Listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              No produce currently listed. Click "+ Post Your Harvest" to be the first!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((item) => {
                const isOffline = item.offlinePending;
                const whatsappUrl = `https://wa.me/${item.whatsapp || item.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Namaste ${item.farmerName} ji, I saw your ${item.quantityQuintals} Quintals of ${item.crop} listed on KisanSetu. I am interested in purchasing.`
                )}`;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 shadow-sm border transition relative flex flex-col justify-between ${
                      isOffline ? "border-amber-400 bg-amber-50/20" : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <div>
                      {/* Offline Pending Badge */}
                      {isOffline && (
                        <div className="mb-2 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          Offline Queue (Pending Auto-Sync)
                        </div>
                      )}

                      {/* Header: Crop & Organic Tag */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-lg text-slate-900">
                              {item.crop}
                            </span>
                            {item.isOrganic && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                {t.organicBadge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.variety} • {item.grade}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-emerald-700">
                            ₹{item.expectedPricePerQuintal.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">
                            / Quintal
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Harvest Readiness */}
                      <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">
                            Total Quantity
                          </span>
                          <span className="font-extrabold text-slate-800">
                            {item.quantityQuintals} Quintals
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">
                            Harvest Status
                          </span>
                          <span className="font-semibold text-slate-700 truncate block">
                            {item.harvestDate}
                          </span>
                        </div>
                      </div>

                      {/* Farmer & Location Info */}
                      <div className="mt-3 text-xs text-slate-600 space-y-1">
                        <div className="font-bold text-slate-800 flex items-center justify-between">
                          <span>{item.farmerName}</span>
                          {item.highestBid && (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                              Top Bid: ₹{item.highestBid}/Qtl
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.village}, {item.district}, {item.state}</span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 italic line-clamp-2 mt-1">
                            "{item.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: WhatsApp, Call, Make Bid */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${item.phone}`}
                        className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call</span>
                      </a>

                      <button
                        onClick={() => {
                          setBiddingListing(item);
                          setBuyerQuotePrice(item.expectedPricePerQuintal);
                        }}
                        className="py-2 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Bid</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: Verified Buyers & FPOs Directory */}
      {activeSubTab === "buyers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-base text-slate-900">
                        {buyer.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {buyer.regNo}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    ★ {buyer.rating}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{buyer.district}, {buyer.state}</span>
                </div>

                {/* Buying Crops Tags */}
                <div className="mt-3">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                    Crops Purchased:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {buyer.buyingCrops.map((c) => (
                      <span key={c} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded-md font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Terms & Price Advantage */}
                <div className="mt-3 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <div className="text-emerald-900 font-bold">
                    Benefit: {buyer.priceAdvantage}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Payment: {buyer.paymentTerms}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {buyer.description}
                </p>
              </div>

              {/* Direct Connect Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${buyer.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Namaste ${buyer.contactPerson}, I am contacting you through KisanSetu regarding produce supply.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${buyer.phone}`}
                  className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call Buyer</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Post Harvest Listing Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                {t.postModalTitle}
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostListing} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.cropNameLabel} *</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Cotton">Cotton (कपास)</option>
                    <option value="Rice / Paddy">Rice / Paddy (धान)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Chilli">Chilli (मिर्च)</option>
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Onion">Onion (प्याज़)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.varietyLabel}</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g. Vaishali / Basmati"
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.quantityLabel} *</label>
                  <input
                    type="number"
                    value={formData.quantityQuintals}
                    onChange={(e) => setFormData({ ...formData, quantityQuintals: e.target.value })}
                    placeholder="e.g. 25"
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.priceExpectationLabel} *</label>
                  <input
                    type="number"
                    value={formData.expectedPricePerQuintal}
                    onChange={(e) => setFormData({ ...formData, expectedPricePerQuintal: e.target.value })}
                    placeholder="e.g. 2300"
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.farmerNameLabel} *</label>
                  <input
                    type="text"
                    value={formData.farmerName}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    placeholder="e.g. Ramesh Patil"
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.farmerPhoneLabel} *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9822012345"
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.villageLabel}</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Pimpalgaon"
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.districtLabel}</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Nashik"
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Organic Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 font-bold text-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>{t.isOrganicLabel}</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md transition mt-4"
              >
                {t.submitListingBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Buyer Bid / Quote Submission */}
      {biddingListing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-black text-slate-900 text-sm">
                Submit Price Quote to {biddingListing.farmerName}
              </h3>
              <button onClick={() => setBiddingListing(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
                <div>Produce: <strong>{biddingListing.crop} ({biddingListing.quantityQuintals} Qtl)</strong></div>
                <div>Farmer Asking Price: <strong>₹{biddingListing.expectedPricePerQuintal}/Qtl</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Offered Price (₹/Quintal) *</label>
                <input
                  type="number"
                  value={buyerQuotePrice}
                  onChange={(e) => setBuyerQuotePrice(e.target.value)}
                  required
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 text-base font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name / Company</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Sahyadri FPO / Reliance Fresh Hub"
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition shadow-md"
              >
                Send Quote to Farmer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
