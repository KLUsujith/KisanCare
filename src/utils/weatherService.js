// Free Open-Meteo & Geolocation Weather Service for KisanCare (AP & Telangana)

export const DISTRICT_COORDINATES = [
  { name: "Guntur", nameTe: "గుంటూరు", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 16.3067, lon: 80.4365, defaultMandal: "Tenali" },
  { name: "Warangal", nameTe: "వరంగల్", state: "Telangana", stateTe: "తెలంగాణ", lat: 17.9689, lon: 79.5941, defaultMandal: "Narsampet" },
  { name: "Krishna", nameTe: "కృష్ణా", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 16.5062, lon: 80.6480, defaultMandal: "Machilipatnam" },
  { name: "Karimnagar", nameTe: "కరీంనగర్", state: "Telangana", stateTe: "తెలంగాణ", lat: 18.4386, lon: 79.1288, defaultMandal: "Huzurabad" },
  { name: "Kurnool", nameTe: "కర్నూలు", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 15.8281, lon: 78.0373, defaultMandal: "Adoni" },
  { name: "Khammam", nameTe: "ఖమ్మం", state: "Telangana", stateTe: "తెలంగాణ", lat: 17.2473, lon: 80.1514, defaultMandal: "Madhira" },
  { name: "Chittoor", nameTe: "చిత్తూరు", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 13.2172, lon: 79.1003, defaultMandal: "Madanapalle" },
  { name: "Nalgonda", nameTe: "నల్గొండ", state: "Telangana", stateTe: "తెలంగాణ", lat: 17.0575, lon: 79.2689, defaultMandal: "Miryalaguda" },
  { name: "Visakhapatnam", nameTe: "విశాఖపట్నం", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 17.6868, lon: 83.2185, defaultMandal: "Anakapalle" },
  { name: "Nizamabad", nameTe: "నిజామాబాద్", state: "Telangana", stateTe: "తెలంగాణ", lat: 18.6725, lon: 78.0941, defaultMandal: "Bodhan" },
  { name: "West Godavari", nameTe: "పశ్చిమ గోదావరి", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 16.7107, lon: 81.0952, defaultMandal: "Tadepalligudem" },
  { name: "East Godavari", nameTe: "తూర్పు గోదావరి", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 16.9891, lon: 82.2475, defaultMandal: "Rajahmundry" },
  { name: "Prakasam", nameTe: "ప్రకాశం", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 15.5057, lon: 80.0499, defaultMandal: "Ongole" },
  { name: "Anantapur", nameTe: "అనంతపురం", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 14.6819, lon: 77.6006, defaultMandal: "Dharmavaram" },
  { name: "Mahabubnagar", nameTe: "మహబూబ్‌నగర్", state: "Telangana", stateTe: "తెలంగాణ", lat: 16.7488, lon: 77.9855, defaultMandal: "Jadcherla" },
  { name: "YSR Kadapa", nameTe: "వైఎస్సార్ కడప", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 14.4673, lon: 78.8242, defaultMandal: "Proddatur" },
  { name: "Srikakulam", nameTe: "శ్రీకాకుళం", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 18.2949, lon: 83.8938, defaultMandal: "Amadalavalasa" },
  { name: "Vizianagaram", nameTe: "విజయనగరం", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 18.1067, lon: 83.3956, defaultMandal: "Bobbili" },
  { name: "Rangareddy", nameTe: "రంగారెడ్డి", state: "Telangana", stateTe: "తెలంగాణ", lat: 17.3850, lon: 78.4867, defaultMandal: "Ibrahimpatnam" },
  { name: "Medak", nameTe: "మెదక్", state: "Telangana", stateTe: "తెలంగాణ", lat: 18.0470, lon: 78.2612, defaultMandal: "Siddipet" },
  { name: "Adilabad", nameTe: "ఆదిలాబాద్", state: "Telangana", stateTe: "తెలంగాణ", lat: 19.6641, lon: 78.5320, defaultMandal: "Nirmal" },
  { name: "SPSR Nellore", nameTe: "నెల్లూరు", state: "Andhra Pradesh", stateTe: "ఆంధ్రప్రదేశ్", lat: 14.4426, lon: 79.9865, defaultMandal: "Kavali" }
];

// Haversine distance calculator in KM
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestDistrict(lat, lon) {
  let nearest = DISTRICT_COORDINATES[0];
  let minDistance = Infinity;

  for (const d of DISTRICT_COORDINATES) {
    const dist = getDistanceKm(lat, lon, d.lat, d.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }

  return { ...nearest, distanceKm: Math.round(minDistance) };
}

// Request Browser Live Location
export function getLiveGeoCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 10)
        });
      },
      (error) => {
        let msg = "Location access denied. Using district default.";
        if (error.code === 1) msg = "Location permission denied by user.";
        else if (error.code === 2) msg = "Location unavailable.";
        else if (error.code === 3) msg = "Location request timed out.";
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

// Reverse geocode via BigDataCloud client API with nearest-district fallback
export async function reverseGeocodeLocation(lat, lon) {
  const nearest = findNearestDistrict(lat, lon);
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return {
        locality: data.locality || data.city || nearest.defaultMandal,
        district: data.principalSubdivision ? (data.localityInfo?.administrative?.[2]?.name || nearest.name) : nearest.name,
        state: data.principalSubdivision || nearest.state,
        country: data.countryName || "India",
        latitude: lat,
        longitude: lon,
        isGps: true,
        districtTe: nearest.nameTe
      };
    }
  } catch (e) {
    // Fallback to nearest precomputed district
  }

  return {
    locality: nearest.defaultMandal,
    district: nearest.name,
    state: nearest.state,
    country: "India",
    latitude: lat,
    longitude: lon,
    isGps: true,
    districtTe: nearest.nameTe
  };
}

// Map WMO weather codes to human-readable labels and agricultural icons
export function interpretWmoCode(code) {
  if (code === 0) {
    return {
      condition: "Clear Sky (నిర్మలమైన ఆకాశం)",
      conditionEn: "Clear Sky",
      conditionTe: "నిర్మలమైన ఆకాశం",
      icon: "Sun",
      color: "text-amber-500",
      bgGradient: "from-amber-400 to-orange-500",
      isRain: false
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      condition: "Partly Cloudy (పాక్షికంగా మేఘావృతం)",
      conditionEn: "Partly Cloudy",
      conditionTe: "పాక్షికంగా మేఘావృతం",
      icon: "CloudSun",
      color: "text-amber-600",
      bgGradient: "from-amber-200 to-slate-400",
      isRain: false
    };
  }
  if (code >= 45 && code <= 48) {
    return {
      condition: "Foggy / Dew (పొగమంచు / మంచు బిందువులు)",
      conditionEn: "Foggy / Dew",
      conditionTe: "పొగమంచు",
      icon: "CloudFog",
      color: "text-slate-400",
      bgGradient: "from-slate-300 to-slate-500",
      isRain: false
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      condition: "Light Drizzle (తేలికపాటి జల్లులు)",
      conditionEn: "Light Drizzle",
      conditionTe: "తేలికపాటి జల్లులు",
      icon: "CloudDrizzle",
      color: "text-blue-400",
      bgGradient: "from-blue-300 to-blue-500",
      isRain: true
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      condition: "Moderate Rain (మోస్తరు వర్షం)",
      conditionEn: "Moderate Rain",
      conditionTe: "మోస్తరు వర్షం",
      icon: "CloudRain",
      color: "text-blue-600",
      bgGradient: "from-blue-400 to-blue-700",
      isRain: true
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      condition: "Heavy Rain Showers (భారీ వర్షపు జల్లులు)",
      conditionEn: "Rain Showers",
      conditionTe: "భారీ వర్షం",
      icon: "CloudRain",
      color: "text-indigo-600",
      bgGradient: "from-blue-600 to-indigo-800",
      isRain: true
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      condition: "Thunderstorm Alert (ఉరుములతో కూడిన వర్షం)",
      conditionEn: "Thunderstorm",
      conditionTe: "ఉరుములతో కూడిన వర్షం",
      icon: "CloudLightning",
      color: "text-purple-600",
      bgGradient: "from-indigo-600 to-purple-900",
      isRain: true
    };
  }

  return {
    condition: "Fair Weather (సాధారణ వాతావరణం)",
    conditionEn: "Fair Weather",
    conditionTe: "సాధారణ వాతావరణం",
    icon: "Sun",
    color: "text-emerald-500",
    bgGradient: "from-emerald-400 to-teal-600",
    isRain: false
  };
}

// Generate Agricultural Crop Advisory
export function getAgroAdvisory(weather, language = "te") {
  const { tempMax, rainProb, rainSumMm, windSpeed, humidity } = weather;

  if (rainProb >= 60 || rainSumMm >= 10) {
    return {
      status: "risk",
      tagEn: "🌧️ Rain Alert: Hold Spraying & Sowing",
      tagTe: "🌧️ భారీ వర్ష సూచన: పిచికారీ మరియు విత్తడం వాయిదా వేయండి",
      descEn: `High rain chance (${rainProb}%). Chemical washes away quickly. Ensure drainage channels in field are open.`,
      descTe: `అధిక వర్షపాతం (${rainProb}%) అవకాశం ఉన్నందున పురుగుమందుల పిచికారీని వాయిదా వేయండి. పొలంలో నీరు నిల్వ ఉండకుండా కాలువలను సరిచేయండి.`
    };
  }

  if (windSpeed >= 20) {
    return {
      status: "caution",
      tagEn: "💨 High Wind: Spray Drift Danger",
      tagTe: "💨 వేగంగా వీచే గాలులు: పిచికారీ వద్దు",
      descEn: `Wind speed is ${windSpeed} km/h. High risk of spray drifting to neighboring fields. Wait for calm air.`,
      descTe: `గాలుల వేగం గంటకు ${windSpeed} కి.మీ ఉన్నందున మందు ఆకులకు అంటకుండా కొట్టుకుపోతుంది. గాలి తగ్గాక మాత్రమే పిచికారీ చేయండి.`
    };
  }

  if (tempMax >= 36) {
    return {
      status: "irrigate",
      tagEn: "☀️ Intense Heat: Evening Drip Irrigation",
      tagTe: "☀️ తీవ్రమైన ఎండ: సాయంత్రం వేళ నీటిపారుదల",
      descEn: `High daytime temperature (${tempMax}°C). Schedule drip irrigation in late afternoon to reduce evapotranspiration.`,
      descTe: `పగటి ఉష్ణోగ్రత ${tempMax}°C ఉన్నందున పంట వడలిపోకుండా సాయంత్రం వేళల్లో డ్రిప్ ద్వారా నీటిని అందించండి.`
    };
  }

  if (rainProb <= 20 && windSpeed <= 12) {
    return {
      status: "optimal",
      tagEn: "🟢 Optimal Window: Safe for Spraying & Fertilizer",
      tagTe: "🟢 అనుకూల సమయం: పిచికారీ & ఎరువుల వాడకానికి అనుకూలం",
      descEn: `Ideal weather (Wind: ${windSpeed} km/h, Rain: ${rainProb}%). Recommended spray time: 6:30 AM – 10:00 AM.`,
      descTe: `వాతావరణం అనుకూలంగా ఉంది (గాలి: ${windSpeed} km/h, వర్షం: ${rainProb}%). ఉదయం 6:30 నుండి 10:00 గంటల మధ్య పిచికారీ చేయండి.`
    };
  }

  return {
    status: "normal",
    tagEn: "⛅ Normal Conditions: Standard Field Operations",
    tagTe: "⛅ సాధారణ వాతావరణం: సాధారణ వ్యవసాయ పనులు చేయవచ్చు",
    descEn: `Normal seasonal conditions. Continue regular monitoring for pest and disease symptoms.`,
    descTe: `సాధారణ వ్యవసాయ పనులకు అనుకూలంగా ఉంది. చీడపీడల రాకను పరిశీలిస్తూ ఉండండి.`
  };
}

// Fallback 5-Day Forecast Generator
function generateFallbackForecast(lat, lon, locationName = "Guntur") {
  const days = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];
  const daysTe = ["ఈరోజు", "రేపు", "3వ రోజు", "4వ రోజు", "5వ రోజు"];
  const dates = [];
  const today = new Date();

  const daily = [];
  const baseTemps = [
    { max: 32, min: 23, rain: 12, mm: 0, code: 1, wind: 9, humidity: 64 },
    { max: 31, min: 22, rain: 25, mm: 1.2, code: 2, wind: 11, humidity: 68 },
    { max: 30, min: 22, rain: 65, mm: 14.5, code: 63, wind: 18, humidity: 82 },
    { max: 31, min: 23, rain: 40, mm: 3.0, code: 51, wind: 14, humidity: 76 },
    { max: 33, min: 24, rain: 15, mm: 0, code: 0, wind: 8, humidity: 60 }
  ];

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const spec = baseTemps[i];
    const wmo = interpretWmoCode(spec.code);
    const advisory = getAgroAdvisory({
      tempMax: spec.max,
      rainProb: spec.rain,
      rainSumMm: spec.mm,
      windSpeed: spec.wind,
      humidity: spec.humidity
    });

    daily.push({
      dayIndex: i,
      dayLabel: i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" }),
      dayLabelTe: daysTe[i],
      dateFormatted: dateStr,
      tempMax: spec.max,
      tempMin: spec.min,
      weatherCode: spec.code,
      condition: wmo.condition,
      conditionEn: wmo.conditionEn,
      conditionTe: wmo.conditionTe,
      icon: wmo.icon,
      color: wmo.color,
      bgGradient: wmo.bgGradient,
      rainProbability: spec.rain,
      rainSumMm: spec.mm,
      windSpeedMax: spec.wind,
      humidity: spec.humidity,
      advisory
    });
  }

  return {
    isLive: false,
    source: "Regional Historical Climatology (KisanCare Local)",
    locationName,
    latitude: lat,
    longitude: lon,
    current: {
      temperature: 30.5,
      apparentTemperature: 32.0,
      relativeHumidity: 65,
      windSpeed: 9.5,
      precipitationMm: 0,
      weatherCode: 1,
      condition: "Partly Cloudy (పాక్షికంగా మేఘావృతం)",
      conditionEn: "Partly Cloudy",
      conditionTe: "పాక్షికంగా మేఘావృతం",
      icon: "CloudSun",
      color: "text-amber-500",
      bgGradient: "from-amber-400 to-orange-500",
      sprayWindow: "6:30 AM – 9:45 AM",
      advisory: getAgroAdvisory({ tempMax: 32, rainProb: 12, rainSumMm: 0, windSpeed: 9.5, humidity: 65 })
    },
    daily
  };
}

// Fetch Live 5-Day Weather from Open-Meteo API
export async function fetchLiveWeatherForecast(lat, lon, locationName = "Guntur") {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`Weather API responded with status ${res.status}`);
    }

    const data = await res.json();
    const curr = data.current;
    const dailyData = data.daily;

    const currWmo = interpretWmoCode(curr.weather_code);
    const currAdvisory = getAgroAdvisory({
      tempMax: Math.round(curr.temperature_2m),
      rainProb: dailyData.precipitation_probability_max?.[0] ?? (curr.precipitation > 0 ? 80 : 15),
      rainSumMm: curr.precipitation || 0,
      windSpeed: Math.round(curr.wind_speed_10m),
      humidity: curr.relative_humidity_2m
    });

    const daysTe = ["ఈరోజు", "రేపు", "3వ రోజు", "4వ రోజు", "5వ రోజు"];
    const daily = [];
    const count = Math.min(5, dailyData.time.length);

    for (let i = 0; i < count; i++) {
      const dateObj = new Date(dailyData.time[i]);
      const dateStr = dateObj.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      const wCode = dailyData.weather_code[i];
      const wmo = interpretWmoCode(wCode);
      const tempMax = Math.round(dailyData.temperature_2m_max[i]);
      const tempMin = Math.round(dailyData.temperature_2m_min[i]);
      const rainProb = Math.round(dailyData.precipitation_probability_max?.[i] ?? 10);
      const rainSum = Math.round((dailyData.precipitation_sum?.[i] ?? 0) * 10) / 10;
      const windSpeed = Math.round(dailyData.wind_speed_10m_max?.[i] ?? 10);

      const advisory = getAgroAdvisory({
        tempMax,
        rainProb,
        rainSumMm: rainSum,
        windSpeed,
        humidity: curr.relative_humidity_2m
      });

      daily.push({
        dayIndex: i,
        dayLabel: i === 0 ? "Today" : dateObj.toLocaleDateString("en-US", { weekday: "short" }),
        dayLabelTe: daysTe[i] || `${i + 1}వ రోజు`,
        dateFormatted: dateStr,
        tempMax,
        tempMin,
        weatherCode: wCode,
        condition: wmo.condition,
        conditionEn: wmo.conditionEn,
        conditionTe: wmo.conditionTe,
        icon: wmo.icon,
        color: wmo.color,
        bgGradient: wmo.bgGradient,
        rainProbability: rainProb,
        rainSumMm: rainSum,
        windSpeedMax: windSpeed,
        humidity: curr.relative_humidity_2m,
        advisory
      });
    }

    return {
      isLive: true,
      source: "Open-Meteo Live Satellite & Radar",
      locationName,
      latitude: lat,
      longitude: lon,
      current: {
        temperature: Math.round(curr.temperature_2m * 10) / 10,
        apparentTemperature: Math.round(curr.apparent_temperature * 10) / 10,
        relativeHumidity: curr.relative_humidity_2m,
        windSpeed: Math.round(curr.wind_speed_10m * 10) / 10,
        precipitationMm: curr.precipitation || 0,
        weatherCode: curr.weather_code,
        condition: currWmo.condition,
        conditionEn: currWmo.conditionEn,
        conditionTe: currWmo.conditionTe,
        icon: currWmo.icon,
        color: currWmo.color,
        bgGradient: currWmo.bgGradient,
        sprayWindow: "6:30 AM – 9:30 AM",
        advisory: currAdvisory
      },
      daily
    };
  } catch (err) {
    console.warn("Using fallback weather:", err.message);
    return generateFallbackForecast(lat, lon, locationName);
  }
}
