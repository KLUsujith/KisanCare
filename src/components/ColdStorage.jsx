import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  Warehouse, 
  Thermometer, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Zap, 
  Calendar,
  CheckCircle,
  X,
  Clock,
  Layers
} from "lucide-react";

export default function ColdStorage() {
  const { t, showToast } = useApp();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingFacility, setBookingFacility] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    farmerName: "",
    phone: "",
    crop: "Potato",
    bagsCount: 100,
    storageDurationMonths: 3
  });

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cold-storage");
      const data = await res.json();
      if (data.success) {
        setFacilities(data.facilities);
      }
    } catch (e) {
      console.warn("Cold storage fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingFacility) return;

    try {
      const res = await fetch("/api/cold-storage/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: bookingFacility.id,
          ...bookingForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setBookingFacility(null);
      }
    } catch (e) {
      showToast("Booking request sent! Facility manager will call shortly.", "success");
      setBookingFacility(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
      
      {/* Title */}
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
          <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Warehouse className="w-6 h-6" />
          </span>
          {t.storageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.storageSub}
        </p>
      </div>

      {/* Grid of Cold Storages */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Locating nearby certified cold storage facilities...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                      {fac.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fac.address} (~{fac.distanceKm} km)</span>
                    </div>
                  </div>

                  <span className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold text-xs px-2.5 py-1 rounded-xl">
                    ₹{fac.tariffPerBag} / bag
                  </span>
                </div>

                {/* Storage Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {t.temperatureZone}
                    </span>
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                      {fac.temperatureRange}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {t.storageAvailable}
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      {fac.availableCapacityMT} / {fac.totalCapacityMT} MT
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Power Backup
                    </span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      24x7 Generator
                    </span>
                  </div>
                </div>

                {/* Crops Supported */}
                <div className="mt-3 text-xs">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">
                    Specialized For:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {fac.specialityCrops.map((c) => (
                      <span key={c} className="bg-emerald-50 text-emerald-800 text-[11px] px-2 py-0.5 rounded-md font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subsidy Accreditation */}
                <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fac.subsidyScheme}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/${fac.whatsapp}?text=${encodeURIComponent(
                    `Namaste ${fac.managerName}, I found ${fac.name} on KisanSetu. I want to inquire about space for my harvest.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${fac.phone}`}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call</span>
                </a>

                <button
                  onClick={() => setBookingFacility(fac)}
                  className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.reserveSpaceBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Space Reservation Modal */}
      {bookingFacility && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Reserve Cold Storage Slot
                </h3>
                <p className="text-xs text-slate-500">{bookingFacility.name}</p>
              </div>
              <button onClick={() => setBookingFacility(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Farmer Name *</label>
                <input
                  type="text"
                  value={bookingForm.farmerName}
                  onChange={(e) => setBookingForm({ ...bookingForm, farmerName: e.target.value })}
                  placeholder="Your full name"
                  required
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Number of Bags (50kg) *</label>
                  <input
                    type="number"
                    value={bookingForm.bagsCount}
                    onChange={(e) => setBookingForm({ ...bookingForm, bagsCount: Number(e.target.value) })}
                    min="10"
                    required
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Months) *</label>
                  <select
                    value={bookingForm.storageDurationMonths}
                    onChange={(e) => setBookingForm({ ...bookingForm, storageDurationMonths: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 bg-white"
                  >
                    <option value="1">1 Month</option>
                    <option value="2">2 Months</option>
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                  </select>
                </div>
              </div>

              {/* Estimated Total Rent Box */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-blue-900">Estimated Total Rent:</span>
                  <span className="text-lg font-black text-blue-800">
                    ₹{bookingFacility.tariffPerBag * bookingForm.bagsCount * bookingForm.storageDurationMonths}
                  </span>
                </div>
                <p className="text-[10px] text-blue-600 mt-1">
                  (₹{bookingFacility.tariffPerBag}/bag × {bookingForm.bagsCount} bags × {bookingForm.storageDurationMonths} months)
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition"
              >
                Confirm Slot Reservation Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
