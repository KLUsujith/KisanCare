import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Package, 
  Search, 
  ShoppingCart, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  Trash2, 
  X, 
  Plus, 
  Minus,
  CreditCard,
  Building,
  Volume2
} from "lucide-react";

export default function BuySeeds() {
  const { farmProfile, user, language, playVoice, showToast } = useApp();

  const [seeds, setSeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [acres, setAcres] = useState(farmProfile?.totalAcres || 3.5);

  // Cart state
  const [cart, setCart] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Order details form
  const [orderForm, setOrderForm] = useState({
    farmerName: user?.name || "K. Anjaneyulu Reddy",
    phone: user?.phone || "9440177889",
    deliveryAddress: `${farmProfile?.village || "Tenali Rural"}, ${farmProfile?.district || "Guntur"}, ${farmProfile?.state || "Andhra Pradesh"}`,
    paymentMethod: "Cash on Delivery / KCC (కిసాన్ క్రెడిట్ కార్డు)"
  });

  const cropsList = ["All Crops", "Tomato", "Cotton", "Rice / Paddy", "Potato", "Chilli", "Wheat", "Onion"];

  const fetchSeeds = async () => {
    setLoading(true);
    try {
      let url = `/api/seeds?acres=${acres}`;
      if (selectedCrop !== "all" && selectedCrop !== "All Crops") {
        url += `&crop=${encodeURIComponent(selectedCrop)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSeeds(data.seeds);
      }
    } catch (e) {
      console.warn("Seeds fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeeds();
  }, [selectedCrop, acres]);

  // Cart actions
  const addToCart = (seed, packsCount = 1) => {
    const existingIndex = cart.findIndex(item => item.id === seed.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += packsCount;
      setCart(updated);
    } else {
      setCart([...cart, { ...seed, quantity: packsCount }]);
    }
    showToast(`Added ${packsCount} pack(s) of ${seed.variety} to cart!`, "success");
  };

  const updateQuantity = (seedId, delta) => {
    setCart(cart.map(item => {
      if (item.id === seedId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (seedId) => {
    setCart(cart.filter(item => item.id !== seedId));
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + ((item.subsidizedPriceINR || item.pricePerPackINR) * item.quantity), 0);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order Submission
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const primaryItem = cart[0];
      const res = await fetch("/api/seeds/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedId: primaryItem.id,
          packsCount: totalCartCount,
          farmerName: orderForm.farmerName,
          phone: orderForm.phone,
          deliveryAddress: orderForm.deliveryAddress,
          acres: acres,
          paymentMode: orderForm.paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderConfirmed(data.order);
        setCart([]);
        setShowCartDrawer(false);
        showToast("Seed booking confirmed! Order ID: " + data.order.orderId, "success");
      }
    } catch (err) {
      // Local fallback confirmation
      const demoOrder = {
        orderId: `KS-SEED-${Math.floor(100000 + Math.random() * 900000)}`,
        totalPriceINR: totalCartPrice,
        deliveryAddress: orderForm.deliveryAddress,
        expectedDelivery: "Within 48 Hours to Village Krishi Kendra"
      };
      setOrderConfirmed(demoOrder);
      setCart([]);
      setShowCartDrawer(false);
    }
  };

  const filteredSeeds = seeds.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.crop.toLowerCase().includes(q) || s.variety.toLowerCase().includes(q) || s.certifyingAgency.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-6">
      
      {/* Header & Cart Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Package className="w-6 h-6" />
            </span>
            Certified Seed Marketplace (ప్రమాణీకరించిన విత్తనాలు)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ICAR & State Seed Corporation certified high-yield & disease-resistant seeds with government subsidy.
          </p>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setShowCartDrawer(true)}
          className="relative py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 self-start md:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>View Seed Cart ({totalCartCount})</span>
          {totalCartCount > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
              ₹{totalCartPrice.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Filter Bar & Target Land Calculator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop, variety, agency..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          {/* Seed Requirement Acreage Sync */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-xs">
            <span className="font-extrabold text-emerald-950">Seed Requirement for:</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="50"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="w-16 p-1 border border-emerald-300 rounded-lg text-center font-black text-emerald-800 bg-white"
            />
            <span className="font-bold text-emerald-900">Acres</span>
          </div>
        </div>

        {/* Crop Pills Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {cropsList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c === "All Crops" ? "all" : c)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                (selectedCrop === "all" && c === "All Crops") || selectedCrop === c
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Certified Seed Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading certified seeds catalog...
        </div>
      ) : filteredSeeds.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No seed varieties match your search. Try adjusting the crop filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSeeds.map((seed) => (
            <div
              key={seed.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Variety and Subsidy Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {seed.crop}
                    </span>
                    <h3 className="font-black text-base text-slate-900 mt-1">
                      {seed.variety}
                    </h3>
                  </div>

                  {seed.subsidyAvailable && (
                    <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                      Govt. Subsidy
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{seed.certifyingAgency}</span>
                </div>

                {/* Disease Resistance Profile */}
                <div className="mt-3 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-semibold">
                  🛡️ {seed.resistance}
                </div>

                {/* Specs: Germination, Purity, Yield */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase font-bold block">Germination</span>
                    <span className="font-extrabold text-slate-800">{seed.germinationRate}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase font-bold block">Purity</span>
                    <span className="font-extrabold text-slate-800">{seed.purityPercentage}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-[9px] uppercase font-bold block">Duration</span>
                    <span className="font-extrabold text-slate-800">{seed.maturityDays}</span>
                  </div>
                </div>

                {/* Seed Requirement for Farmer's Acres */}
                <div className="mt-3.5 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-baseline font-bold text-amber-950">
                    <span>For your {acres} Acres:</span>
                    <span className="text-sm font-black text-amber-800">{seed.calculatedPacksForAcres} Pack(s)</span>
                  </div>
                  <div className="text-[11px] text-amber-800 flex justify-between">
                    <span>Pack size: {seed.packSize}</span>
                    <span>Total Sowing Cost: <strong>₹{seed.totalAcreCostINR?.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Pricing Box */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{seed.subsidizedPriceINR || seed.pricePerPackINR}
                    </span>
                    <span className="text-xs text-slate-400 font-bold ml-1">/ pack</span>
                    {seed.subsidizedPriceINR && seed.subsidizedPriceINR < seed.pricePerPackINR && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        ₹{seed.pricePerPackINR}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {seed.deliveryDays}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add 1 Pack vs Add Exactly For My Acres */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => addToCart(seed, 1)}
                  className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>1 Pack</span>
                </button>

                <button
                  onClick={() => addToCart(seed, seed.calculatedPacksForAcres)}
                  className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>All for {acres} Ac</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cart Drawer / Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-base text-slate-900">
                    Seed Cart ({totalCartCount} Packs)
                  </h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  Your seed cart is empty. Click "+ 1 Pack" or "All for Acres" on any seed variety!
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">{item.crop} ({item.variety})</div>
                        <div className="text-[11px] text-slate-500">₹{item.subsidizedPriceINR || item.pricePerPackINR} × {item.quantity} = <strong>₹{((item.subsidizedPriceINR || item.pricePerPackINR) * item.quantity).toLocaleString()}</strong></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-600 hover:bg-slate-100"><Minus className="w-3 h-3" /></button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-600 hover:bg-slate-100"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer / Checkout Button */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Seed Amount:</span>
                  <span className="text-2xl font-black text-emerald-700">₹{totalCartPrice.toLocaleString()}</span>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Delivery Location *</label>
                    <input
                      type="text"
                      value={orderForm.deliveryAddress}
                      onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                      required
                      placeholder="Village / Gram Panchayat Kendra"
                      className="w-full p-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Payment Method</label>
                    <select
                      value={orderForm.paymentMethod}
                      onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-xl bg-white font-semibold"
                    >
                      <option value="Cash on Delivery / KCC">Pay on Village Delivery (Cash / Kisan Credit Card)</option>
                      <option value="Direct DBT Subsidy Linked">Direct DBT Subsidy Linked</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition"
                  >
                    Confirm Seed Booking (₹{totalCartPrice.toLocaleString()})
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Prototype booking request. No card or netbanking required.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Seed Order Request Booked!
            </h3>
            <p className="text-xs text-slate-600">
              Tracking ID: <strong className="font-mono">{orderConfirmed.orderId}</strong>
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              Delivery to: <strong>{orderConfirmed.deliveryAddress}</strong>
              <div className="mt-1 text-emerald-700 font-bold">Dispatch: {orderConfirmed.expectedDelivery || "Within 48 Hours"}</div>
            </div>
            <button
              onClick={() => setOrderConfirmed(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
            >
              Done / కొనసాగించండి
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
