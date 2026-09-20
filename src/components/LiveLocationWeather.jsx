import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { 
  DISTRICT_COORDINATES, 
  getLiveGeoCoordinates, 
  reverseGeocodeLocation, 
  fetchLiveWeatherForecast,
  findNearestDistrict
} from "../utils/weatherService.js";
import { 
  MapPin, 
  Navigation, 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Volume2, 
  Calendar, 
  ShieldCheck, 
  ChevronRight,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";

export default function LiveLocationWeather({ onLocationChange, compact = false }) {
  const { farmProfile, updateFarmProfile, language, playVoice, showToast } = useApp();

  // Find initial coordinates based on farmProfile district
  const initialDistrictObj = DISTRICT_COORDINATES.find(
    d => d.name.toLowerCase() === (farmProfile?.district || "Guntur").toLowerCase()
  ) || DISTRICT_COORDINATES[0];

  const [coords, setCoords] = useState({
    latitude: initialDistrictObj.lat,
    longitude: initialDistrictObj.lon,
    accuracy: null
  });

  const [locationName, setLocationName] = useState({
    locality: farmProfile?.mandal || initialDistrictObj.defaultMandal,
    district: farmProfile?.district || initialDistrictObj.name,
    districtTe: initialDistrictObj.nameTe,
    state: farmProfile?.state || initialDistrictObj.state,
    isGpsDetected: false
  });

  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [detectingGps, setDetectingGps] = useState(false);
  const [showDistrictSelector, setShowDistrictSelector] = useState(false);
  const [selectedForecastDay, setSelectedForecastDay] = useState(0);

  // Fetch Weather whenever coordinates change
  const loadWeather = async (lat, lon, locDisplayName) => {
    setLoadingWeather(true);
    try {
      const data = await fetchLiveWeatherForecast(lat, lon, locDisplayName || locationName.district);
      setWeatherData(data);
    } catch (err) {
      console.warn("Weather fetch failed:", err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather(coords.latitude, coords.longitude, locationName.district);
  }, [coords.latitude, coords.longitude]);

  // Handle GPS Live Detection
  const handleDetectLiveLocation = async () => {
    setDetectingGps(true);
    showToast("Requesting GPS Satellite Location...", "info");
    try {
      const geo = await getLiveGeoCoordinates();
      setCoords({
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy
      });

      const rev = await reverseGeocodeLocation(geo.latitude, geo.longitude);
      const newLoc = {
        locality: rev.locality,
        district: rev.district,
        districtTe: rev.districtTe,
        state: rev.state,
        isGpsDetected: true
      };

      setLocationName(newLoc);

      // Sync with global farm profile
      if (updateFarmProfile) {
        updateFarmProfile({
          ...(farmProfile || {}),
          district: rev.district,
          state: rev.state,
          mandal: rev.locality,
          gpsCoords: { latitude: geo.latitude, longitude: geo.longitude }
        });
      }

      if (onLocationChange) {
        onLocationChange(newLoc, geo);
      }

      showToast(`📍 Live GPS Detected: ${rev.locality}, ${rev.district}!`, "success");
      loadWeather(geo.latitude, geo.longitude, rev.district);
    } catch (err) {
      console.warn("GPS Detection issue:", err.message);
      showToast(err.message || "GPS access denied. Select your district below.", "warning");
    } finally {
      setDetectingGps(false);
    }
  };

  // Handle Manual District Selection
  const handleSelectDistrict = (districtObj) => {
    setCoords({
      latitude: districtObj.lat,
      longitude: districtObj.lon,
      accuracy: null
    });

    const newLoc = {
      locality: districtObj.defaultMandal,
      district: districtObj.name,
      districtTe: districtObj.nameTe,
      state: districtObj.state,
      isGpsDetected: false
    };

    setLocationName(newLoc);
    setShowDistrictSelector(false);

    if (updateFarmProfile) {
      updateFarmProfile({
        ...(farmProfile || {}),
        district: districtObj.name,
        state: districtObj.state,
        mandal: districtObj.defaultMandal
      });
    }

    if (onLocationChange) {
      onLocationChange(newLoc, { latitude: districtObj.lat, longitude: districtObj.lon });
    }

    showToast(`Location set to ${districtObj.name} (${districtObj.nameTe})`, "info");
    loadWeather(districtObj.lat, districtObj.lon, districtObj.name);
  };

  // Voice speech for 5-Day Weather
  const handleListenWeather = () => {
    if (!weatherData) return;
    const curr = weatherData.current;
    const todayForecast = weatherData.daily[0];

    const text = language === "te"
      ? `${locationName.districtTe || locationName.district} ప్రాంతంలో ప్రస్తుత ఉష్ణోగ్రత ${curr.temperature} డిగ్రీలు, ${curr.conditionTe}. గాలి వేగం గంటకు ${curr.windSpeed} కిలోమీటర్లు, తేమ ${curr.relativeHumidity} శాతం. వచ్చే 5 రోజులలో వర్ష సూచన: ${todayForecast.rainProbability} శాతం. ${curr.advisory.tagTe}.`
      : `Live weather for ${locationName.locality}, ${locationName.district}: Temperature is ${curr.temperature}°C, ${curr.conditionEn}. Wind speed is ${curr.windSpeed} km/h, humidity ${curr.relativeHumidity}%. 5-day rain probability peak is ${todayForecast.rainProbability}%. Agricultural advisory: ${curr.advisory.tagEn}.`;

    playVoice(text);
  };

  const curr = weatherData?.current;
  const activeDay = weatherData?.daily?.[selectedForecastDay] || weatherData?.daily?.[0];

  const getWeatherIconComponent = (iconName, className = "w-6 h-6") => {
    switch (iconName) {
      case "Sun":
        return <Sun className={className} />;
      case "CloudSun":
        return <CloudSun className={className} />;
      case "CloudRain":
        return <CloudRain className={className} />;
      case "CloudDrizzle":
        return <CloudDrizzle className={className} />;
      case "CloudLightning":
        return <CloudLightning className={className} />;
      default:
        return <CloudSun className={className} />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-5">
      
      {/* 1. TOP BAR: LIVE LOCATION IDENTIFIER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`p-2 rounded-2xl text-white ${locationName.isGpsDetected ? "bg-emerald-600 animate-pulse" : "bg-blue-600"}`}>
              {locationName.isGpsDetected ? <Navigation className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {locationName.locality}, {locationName.district}
                </h2>
                <span className="text-xs font-bold text-slate-500">
                  ({locationName.districtTe || locationName.district})
                </span>
                {locationName.isGpsDetected ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live GPS
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                    Regional
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {locationName.state} • {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
                {coords.accuracy && ` (±${coords.accuracy}m GPS accuracy)`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Detect Live Location + Change District + Listen */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* GPS Auto Detect Button */}
          <button
            onClick={handleDetectLiveLocation}
            disabled={detectingGps}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            title="Access real-time device GPS location"
          >
            <Navigation className={`w-3.5 h-3.5 ${detectingGps ? "animate-spin" : ""}`} />
            <span>{detectingGps ? "Detecting GPS..." : "Detect Live GPS (నా లొకేషన్)"}</span>
          </button>

          {/* Change District Dropdown Button */}
          <button
            onClick={() => setShowDistrictSelector(!showDistrictSelector)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Change Location (మార్చండి)</span>
          </button>

          {/* Audio Voice Broadcast */}
          {weatherData && (
            <button
              onClick={handleListenWeather}
              className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition"
              title="Listen to 5-Day Weather Audio Briefing"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => loadWeather(coords.latitude, coords.longitude, locationName.district)}
            disabled={loadingWeather}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
            title="Refresh Live Satellite Weather"
          >
            <RefreshCw className={`w-4 h-4 ${loadingWeather ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* District Selector Drawer (when opened) */}
      {showDistrictSelector && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Select Andhra Pradesh & Telangana District (జిల్లాను ఎంచుకోండి):
            </span>
            <button 
              onClick={() => setShowDistrictSelector(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {DISTRICT_COORDINATES.map((dist) => (
              <button
                key={dist.name}
                onClick={() => handleSelectDistrict(dist)}
                className={`p-2 text-left rounded-xl text-xs font-bold border transition ${
                  locationName.district === dist.name
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-white text-slate-800 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
                }`}
              >
                <div className="truncate">{dist.name}</div>
                <div className={`text-[10px] ${locationName.district === dist.name ? "text-emerald-100" : "text-slate-400"}`}>
                  {dist.nameTe}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. LIVE CURRENT WEATHER DASHBOARD */}
      {loadingWeather ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <span>Connecting to Live Meteorological Satellites & Weather Radar...</span>
        </div>
      ) : curr ? (
        <div className="space-y-4">
          
          {/* Hero Weather Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Main Temperature & Condition Pill */}
            <div className="md:col-span-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-100">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Live Farm Weather (ప్రత్యక్ష వాతావరణం)</span>
                  </span>
                  <span className="text-[10px] text-emerald-200/90 font-bold">
                    Open-Meteo Satellite Feed
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-amber-300 border border-white/20">
                      {getWeatherIconComponent(curr.icon, "w-10 h-10")}
                    </div>
                    <div>
                      <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                        {curr.temperature}°C
                      </div>
                      <div className="text-xs text-emerald-100 font-semibold mt-0.5">
                        {language === "te" ? curr.conditionTe : curr.conditionEn} • Feels {curr.apparentTemperature}°C
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1 text-emerald-100/90 font-medium">
                    <div>💧 Humidity: <strong>{curr.relativeHumidity}%</strong></div>
                    <div>💨 Wind: <strong>{curr.windSpeed} km/h</strong></div>
                    <div>🌧️ Rain: <strong>{curr.precipitationMm} mm</strong></div>
                  </div>
                </div>
              </div>

              {/* Spray Window Banner */}
              <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-bold flex items-center gap-1">
                  <span>Optimal Spray Window:</span>
                  <strong className="text-white bg-white/20 px-2 py-0.5 rounded-md">{curr.sprayWindow}</strong>
                </span>
                <span className="text-[11px] text-emerald-300 font-bold">
                  {weatherData?.daily?.[0]?.rainProbability}% Rain Risk Today
                </span>
              </div>
            </div>

            {/* Live Agricultural Agro-Advisory Banner */}
            <div className="md:col-span-6 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Agro-Meteorological Spray & Irrigation Advisory
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ICAR Guidelines
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  curr.advisory.status === "risk" 
                    ? "bg-red-50 border-red-200 text-red-950" 
                    : curr.advisory.status === "caution"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : curr.advisory.status === "irrigate"
                    ? "bg-blue-50 border-blue-200 text-blue-950"
                    : "bg-emerald-50 border-emerald-200 text-emerald-950"
                }`}>
                  <div className="font-black text-xs sm:text-sm flex items-center gap-2">
                    {curr.advisory.status === "risk" ? (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>{language === "te" ? curr.advisory.tagTe : curr.advisory.tagEn}</span>
                  </div>
                  <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                    {language === "te" ? curr.advisory.descTe : curr.advisory.descEn}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Coordinates: {coords.latitude.toFixed(2)}°N, {coords.longitude.toFixed(2)}°E</span>
                <span className="font-bold text-emerald-700">5-Day Weather Forecast Below ↓</span>
              </div>
            </div>
          </div>

          {/* 3. 5-DAY DETAILED WEATHER FORECAST SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>5-Day Weather Forecast & Field Actions (5 రోజుల వాతావరణ అంచనా)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Click any day for specific field advisory
              </span>
            </div>

            {/* 5 Day Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {weatherData.daily.map((day, idx) => {
                const isSelected = selectedForecastDay === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedForecastDay(idx)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      {/* Day Label & Date */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs text-slate-800">
                          {day.dayLabel} ({language === "te" ? day.dayLabelTe : day.dayLabel})
                        </span>
                        {idx === 0 && (
                          <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                            NOW
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mb-3">
                        {day.dateFormatted}
                      </div>

                      {/* Icon and Condition */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={day.color}>
                          {getWeatherIconComponent(day.icon, "w-7 h-7")}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {day.tempMax}° / {day.tempMin}°
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[90px]">
                            {language === "te" ? day.conditionTe : day.conditionEn}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rain Probability Bar */}
                    <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Rain Chance:</span>
                        <strong className={day.rainProbability > 40 ? "text-blue-600" : "text-slate-700"}>
                          {day.rainProbability}%
                        </strong>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${day.rainProbability > 50 ? "bg-blue-600" : "bg-emerald-500"}`} 
                          style={{ width: `${Math.min(100, day.rainProbability)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[9px] pt-0.5">
                        <span>💨 {day.windSpeedMax} km/h</span>
                        <span>🌧️ {day.rainSumMm} mm</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Field Advisory Detailed Callout */}
            {activeDay && (
              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-emerald-300">
                      Advisory for {activeDay.dayLabel} ({activeDay.dateFormatted}) • {activeDay.conditionEn} ({activeDay.conditionTe})
                    </div>
                    <div className="text-xs text-slate-200 mt-0.5 font-medium">
                      {language === "te" ? activeDay.advisory.descTe : activeDay.advisory.descEn}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                    activeDay.advisory.status === "risk"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : activeDay.advisory.status === "caution"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}>
                    {activeDay.advisory.status === "risk" ? "⚠️ Hold Spraying" : "✓ Field Safe"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
