import buyersFposData from "../data/buyers_fpos.json";
import coldStoragesData from "../data/cold_storages.json";
import cropsDiseasesData from "../data/crops_diseases.json";
import listingsStoreData from "../data/listings_store.json";
import mandalData from "../data/mandal_data.json";
import mandiPricesData from "../data/mandi_prices.json";
import regionalSuitabilityData from "../data/regional_suitability.json";
import seedStoreData from "../data/seed_store.json";
import transportersData from "../data/transporters.json";

// In-memory persistent state for client runtime (synced to localStorage)
function getStorage(key, defaultVal) {
  try {
    const s = localStorage.getItem("kc_mock_" + key);
    return s ? JSON.parse(s) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem("kc_mock_" + key, JSON.stringify(val));
  } catch (e) {}
}

let activeMandiPrices = getStorage("mandi_prices", mandiPricesData);
let activeSeeds = getStorage("seed_store", seedStoreData);
let activeListings = getStorage("listings_store", listingsStoreData);
let activeColdStorages = getStorage("cold_storages", coldStoragesData);
let activeTransporters = getStorage("transporters", transportersData);
let activeBuyers = getStorage("buyers_fpos", buyersFposData);

function makeJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export function initClientApiInterceptor() {
  if (typeof window === "undefined") return;

  const originalFetch = window.fetch;

  window.fetch = async function (resource, init = {}) {
    const rawUrl = typeof resource === "string" ? resource : resource?.url || "";
    
    // Check if this is an API call
    if (rawUrl.startsWith("/api/") || rawUrl.includes("/api/")) {
      // First try network fetch (works when local Node server is running on port 5001)
      try {
        const networkRes = await originalFetch(resource, init);
        const contentType = networkRes.headers.get("content-type") || "";
        // If server answered with valid JSON, use it!
        if (networkRes.ok && contentType.includes("application/json")) {
          return networkRes;
        }
      } catch (err) {
        // Network unavailable, offline, or GitHub Pages static environment
      }

      // Process via client mock engine
      try {
        return handleMockRoute(rawUrl, init);
      } catch (routeErr) {
        console.warn("Client API mock error:", routeErr);
        return makeJsonResponse({ success: false, error: routeErr.message }, 500);
      }
    }

    // Non-API requests pass directly to standard fetch
    return originalFetch(resource, init);
  };
}

function parseBody(init) {
  if (!init || !init.body) return {};
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body);
    } catch (e) {
      return {};
    }
  }
  return init.body;
}

function getQuery(urlStr) {
  const query = {};
  const qIdx = urlStr.indexOf("?");
  if (qIdx !== -1) {
    const searchParams = new URLSearchParams(urlStr.substring(qIdx));
    for (const [k, v] of searchParams.entries()) {
      query[k] = v;
    }
  }
  return query;
}

function getCleanPath(urlStr) {
  let path = urlStr;
  const qIdx = path.indexOf("?");
  if (qIdx !== -1) path = path.substring(0, qIdx);
  const apiIdx = path.indexOf("/api/");
  if (apiIdx !== -1) return path.substring(apiIdx);
  return path;
}

function handleMockRoute(rawUrl, init) {
  const method = (init.method || "GET").toUpperCase();
  const path = getCleanPath(rawUrl);
  const query = getQuery(rawUrl);
  const body = parseBody(init);

  // 1. AUTH: Farmer Login
  if (path === "/api/auth/farmer-login" && method === "POST") {
    const phone = body.phone || "9440177889";
    const user = {
      id: "farmer-" + phone.slice(-4),
      name: phone.includes("9848") ? "Venkata Subba Rao" : "K. Anjaneyulu Reddy (రైతు)",
      phone,
      role: "farmer",
      isAdmin: false,
      acresOwned: phone.includes("9848") ? 3.5 : 4.5,
      village: phone.includes("9848") ? "Tenali Rural" : "Narsampet",
      mandal: phone.includes("9848") ? "Tenali" : "Narsampet",
      district: phone.includes("9848") ? "Guntur" : "Warangal",
      state: phone.includes("9848") ? "Andhra Pradesh" : "Telangana",
      language: "te"
    };
    return makeJsonResponse({ success: true, user, token: "mock-token-" + Date.now() });
  }

  // 2. AUTH: Register Farmer
  if (path === "/api/auth/register-farmer" && method === "POST") {
    const user = {
      id: "farmer-" + Date.now(),
      name: body.name || "Kisan Mitra",
      phone: body.phone || "9999999999",
      role: "farmer",
      isAdmin: false,
      acresOwned: Number(body.acresOwned) || 3.0,
      village: body.village || "Gram Panchayat",
      mandal: body.mandal || "Local Mandal",
      district: body.district || "Guntur",
      state: body.state || "Andhra Pradesh",
      language: body.preferredLanguage || "te"
    };
    return makeJsonResponse({ success: true, message: `Account created for ${user.name}!`, user });
  }

  // 3. AUTH: Admin Login
  if (path === "/api/auth/admin-login" && method === "POST") {
    const u = (body.username || "").toLowerCase();
    const p = body.password || "";
    const pin = body.pin || "";
    if ((u === "admin" || u.includes("admin")) && (p === "admin123" || pin === "9999")) {
      const adminUser = {
        id: "admin-master-01",
        name: "KisanCare Super Admin (అడ్మిన్)",
        username: "admin@kisancare.gov.in",
        role: "admin",
        isAdmin: true,
        department: "Directorate of Agriculture & APMC Market Oversight",
        state: "Andhra Pradesh & Telangana",
        language: "en"
      };
      return makeJsonResponse({ success: true, message: "Admin authenticated successfully.", user: adminUser });
    }
    return makeJsonResponse({ success: false, error: "Invalid credentials. Use admin / admin123" }, 401);
  }

  // 4. DIAGNOSE
  if (path === "/api/diagnose" && method === "POST") {
    const sampleId = body.sampleId || "";
    let matched = null;
    let confidence = 95;
    let severity = 38;

    if (sampleId.includes("cotton")) {
      matched = cropsDiseasesData.find(d => d.id === "cotton-pink-bollworm") || cropsDiseasesData[1];
      confidence = 94;
      severity = 48;
    } else if (sampleId.includes("rice")) {
      matched = cropsDiseasesData.find(d => d.id === "rice-blast") || cropsDiseasesData[2];
      confidence = 96;
      severity = 42;
    } else if (sampleId.includes("potato")) {
      matched = cropsDiseasesData.find(d => d.id === "potato-late-blight") || cropsDiseasesData[3];
      confidence = 97;
      severity = 62;
    } else if (sampleId.includes("healthy")) {
      matched = cropsDiseasesData.find(d => d.id === "healthy-leaf") || cropsDiseasesData[4];
      confidence = 99;
      severity = 0;
    } else {
      matched = cropsDiseasesData.find(d => d.id === "tomato-early-blight") || cropsDiseasesData[0];
    }

    return makeJsonResponse({
      success: true,
      diagnosis: {
        ...matched,
        confidence,
        severityScore: severity,
        detectedAt: new Date().toISOString()
      }
    });
  }

  // 5. ADVISORY: Mandals
  if (path === "/api/advisory/mandals") {
    return makeJsonResponse({ success: true, data: mandalData });
  }

  // 6. ADVISORY: Area Suitability
  if (path === "/api/advisory/area-suitability" && method === "POST") {
    const targetDistrict = body.district || "Guntur";
    const stateRecord = mandalData.find(s => s.district.toLowerCase() === targetDistrict.toLowerCase()) || mandalData[0];
    const mandalRecord = stateRecord.mandals.find(m => m.mandal.toLowerCase() === (body.mandal || "Tenali").toLowerCase()) || stateRecord.mandals[0];
    const regionalMatch = regionalSuitabilityData.find(r => r.district.toLowerCase() === targetDistrict.toLowerCase()) || regionalSuitabilityData[0];
    const acresNum = Number(body.acres) || 1;

    const suitableCrops = regionalMatch.recommendedCrops.map(c => ({
      crop: c.crop,
      cropHi: c.cropHi,
      cropTe: c.cropTe,
      variety: c.varietyRecommended,
      suitabilityScore: c.suitabilityScore,
      season: body.season || c.season,
      growingDurationDays: c.durationDays,
      waterRequirement: c.waterRequirement,
      suitableSoil: mandalRecord.soilTypes[0] || regionalMatch.predominantSoil,
      inputCostPerAcre: c.cultivationCostPerAcre,
      expectedYieldPerAcreQuintals: c.avgYieldPerAcreQuintals,
      totalExpectedYieldForAcres: Math.round(c.avgYieldPerAcreQuintals * acresNum),
      totalInputCostForAcres: Math.round(c.cultivationCostPerAcre * acresNum),
      soilFitRationale: c.soilFitReason,
      irrigationSourceNote: body.irrigation || mandalRecord.irrigationOptions[0]
    }));

    return makeJsonResponse({
      success: true,
      location: {
        state: stateRecord.state,
        stateTe: stateRecord.stateTe,
        district: stateRecord.district,
        districtTe: stateRecord.districtTe,
        mandal: mandalRecord.mandal,
        mandalTe: mandalRecord.mandalTe,
        avgRainfall: mandalRecord.avgRainfall
      },
      acresEntered: acresNum,
      recommendedCrops: suitableCrops,
      expertDisclaimer: "IMPORTANT: Recommendations are scientific regional estimates. Always confirm with your local Mandal Agricultural Officer (MAO) before final sowing."
    });
  }

  // 7. ADVISORY: Scenario Income
  if (path === "/api/advisory/scenario-income" && method === "POST") {
    const cropName = body.crop || "Chilli";
    const landAcres = Math.max(0.5, Number(body.acres) || 1);
    const districtName = body.district || "Guntur";

    const region = regionalSuitabilityData.find(r => r.district.toLowerCase() === districtName.toLowerCase()) || regionalSuitabilityData[0];
    let cropData = region.recommendedCrops.find(c => c.crop.toLowerCase().includes(cropName.toLowerCase())) || region.recommendedCrops[0];

    const mandiRecord = mandiPricesData.find(m => m.crop.toLowerCase().includes(cropName.toLowerCase())) || mandiPricesData[0];

    const modalPrice = body.manualSellingPrice ? Number(body.manualSellingPrice) : mandiRecord.modalPriceINR;
    const baseYield = body.manualYieldPerAcre ? Number(body.manualYieldPerAcre) : cropData.avgYieldPerAcreQuintals;
    const baseCostPerAcre = body.manualInputCostPerAcre ? Number(body.manualInputCostPerAcre) : cropData.cultivationCostPerAcre;

    const totalInputCost = Math.round(baseCostPerAcre * landAcres);

    const calcScenario = (yieldMultiplier, priceMultiplier) => {
      const yieldPerAcre = Math.round((baseYield * yieldMultiplier) * 10) / 10;
      const totalYieldQuintals = Math.round(yieldPerAcre * landAcres);
      const pricePerQuintal = Math.round(modalPrice * priceMultiplier);
      const grossRevenue = Math.round(totalYieldQuintals * pricePerQuintal);
      const netIncome = Math.max(0, grossRevenue - totalInputCost);
      const roiPercent = Math.round((netIncome / (totalInputCost || 1)) * 100);
      return { yieldPerAcreQuintals: yieldPerAcre, totalYieldQuintals, pricePerQuintalINR: pricePerQuintal, grossRevenue, inputCostTotal: totalInputCost, estimatedNetIncome: netIncome, roiPercent };
    };

    return makeJsonResponse({
      success: true,
      crop: cropData.crop,
      variety: cropData.varietyRecommended,
      acres: landAcres,
      district: districtName,
      scenarios: {
        low: calcScenario(0.75, 0.85),
        expected: calcScenario(1.0, 1.0),
        high: calcScenario(1.25, 1.18)
      },
      mspBenchmark: mandiRecord.mspBenchmarkINR || 2275,
      costBreakdown: {
        seedsAndNursery: Math.round(totalInputCost * 0.22),
        fertilizersAndBio: Math.round(totalInputCost * 0.28),
        irrigationAndElectricity: Math.round(totalInputCost * 0.15),
        laborAndHarvest: Math.round(totalInputCost * 0.35)
      }
    });
  }

  // 8. SEEDS
  if (path === "/api/seeds") {
    let seeds = activeSeeds;
    if (query.crop && query.crop !== "all") {
      seeds = seeds.filter(s => s.crop.toLowerCase().includes(query.crop.toLowerCase()));
    }
    const acresNum = Number(query.acres) || 1;
    const results = seeds.map(s => {
      let multiplier = 2;
      if (s.id.includes("tomato") || s.id.includes("onion")) multiplier = 6;
      else if (s.id.includes("rice") || s.id.includes("wheat")) multiplier = 1;
      else if (s.id.includes("potato")) multiplier = 12;
      return {
        ...s,
        recommendedPacksForAcres: Math.ceil(acresNum * multiplier),
        estimatedSeedCostINR: Math.ceil(acresNum * multiplier) * s.subsidizedPriceINR
      };
    });
    return makeJsonResponse({ success: true, count: results.length, catalog: results });
  }

  // 9. SEEDS ORDER
  if (path === "/api/seeds/order" && method === "POST") {
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    return makeJsonResponse({
      success: true,
      orderId,
      message: `విత్తనాల ఆర్డర్ విజయవంతంగా నమోదైంది! Order ${orderId} confirmed.`
    });
  }

  // 10. MANDI PRICES
  if (path === "/api/mandi-prices") {
    let prices = activeMandiPrices;
    if (query.crop && query.crop !== "all") {
      prices = prices.filter(p => p.crop.toLowerCase().includes(query.crop.toLowerCase()));
    }
    return makeJsonResponse({ success: true, count: prices.length, prices });
  }

  // 11. BUYERS
  if (path === "/api/buyers") {
    return makeJsonResponse({ success: true, buyers: activeBuyers });
  }

  // 12. LISTINGS
  if (path === "/api/listings") {
    if (method === "POST") {
      const newListing = {
        id: "lst-" + Date.now(),
        farmerName: body.farmerName || "Farmer",
        farmerPhone: body.farmerPhone || "9999999999",
        crop: body.crop || "Chilli",
        variety: body.variety || "Hybrid",
        quantityQuintals: Number(body.quantityQuintals) || 10,
        expectedPricePerQuintal: Number(body.expectedPricePerQuintal) || 20000,
        village: body.village || "Local Village",
        district: body.district || "Guntur",
        state: body.state || "Andhra Pradesh",
        date: "Just now",
        verifiedFarmer: true
      };
      activeListings.unshift(newListing);
      setStorage("listings_store", activeListings);
      return makeJsonResponse({ success: true, message: "Produce listing published successfully!", listing: newListing });
    }
    return makeJsonResponse({ success: true, count: activeListings.length, listings: activeListings });
  }

  // 13. COLD STORAGE
  if (path === "/api/cold-storage") {
    let storages = activeColdStorages;
    if (query.district && query.district !== "all") {
      storages = storages.filter(s => s.district.toLowerCase() === query.district.toLowerCase());
    }
    return makeJsonResponse({ success: true, count: storages.length, facilities: storages });
  }

  // 14. COLD STORAGE BOOKING
  if (path === "/api/cold-storage/book" && method === "POST") {
    const bookingId = "CSB-" + Math.floor(100000 + Math.random() * 900000);
    return makeJsonResponse({
      success: true,
      bookingId,
      message: `శీతల గిడ్డంగి రిజర్వేషన్ నమోదైంది! Booking reference: ${bookingId}`
    });
  }

  // 15. LOGISTICS
  if (path === "/api/logistics") {
    return makeJsonResponse({ success: true, count: activeTransporters.length, transporters: activeTransporters });
  }

  // 16. LOGISTICS ESTIMATE
  if (path === "/api/logistics/estimate" && method === "POST") {
    const distanceKm = Math.max(1, Number(body.distanceKm) || 25);
    const weightQuintals = Math.max(1, Number(body.weightQuintals) || 20);
    const baseFreightINR = Math.round(distanceKm * 28 + weightQuintals * 35);
    const sharedPoolSavingsPercent = 42;
    const pooledFreightINR = Math.round(baseFreightINR * (1 - sharedPoolSavingsPercent / 100));
    return makeJsonResponse({
      success: true,
      estimate: {
        distanceKm,
        weightQuintals,
        individualDedicatedTripINR: baseFreightINR,
        sharedTruckPoolINR: pooledFreightINR,
        savingsPercent: sharedPoolSavingsPercent,
        savingsINR: baseFreightINR - pooledFreightINR,
        recommendedVehicle: weightQuintals > 50 ? "Eicher 17ft (9 Ton)" : "Tata Ace (1.5 Ton)"
      }
    });
  }

  // 17. MY FARM
  if (path === "/api/myfarm") {
    if (method === "POST") {
      return makeJsonResponse({ success: true, message: "Farm profile updated successfully!" });
    }
    return makeJsonResponse({
      success: true,
      profile: {
        farmerName: "K. Anjaneyulu Reddy (రైతు)",
        phone: "9440177889",
        totalAcres: 4.5,
        state: "Telangana",
        district: "Warangal",
        mandal: "Narsampet",
        village: "Narsampet",
        soilType: "Deep Black Clayey Soil (నల్లరేగడి నేల)",
        irrigationSource: "Borewell with Drip (బోరుబావి + బిందు సేద్యం)",
        previousCrop: "Cotton (పత్తి)",
        previousYieldQuintals: 35,
        soilHealthCard: {
          nitrogenKgPerHa: "Medium (240 kg/ha)",
          phosphorusKgPerHa: "High (28 kg/ha)",
          potassiumKgPerHa: "Sufficient (320 kg/ha)",
          pH: 7.4,
          organicCarbonPercent: 0.58
        }
      }
    });
  }

  // 18. MY FARM HISTORY
  if (path === "/api/myfarm/history") {
    return makeJsonResponse({
      success: true,
      history: [
        { year: "2023 - 2024", crop: "Chilli (Sitara Gold)", season: "Kharif", acres: 3.5, yieldQuintals: 78, netProfitINR: 185000 },
        { year: "2022 - 2023", crop: "Cotton (RCH 659)", season: "Kharif", acres: 4.5, yieldQuintals: 42, netProfitINR: 142000 }
      ]
    });
  }

  // 19. ADMIN OVERVIEW
  if (path === "/api/admin/overview") {
    return makeJsonResponse({
      success: true,
      catalogSummary: {
        seedProductsCount: activeSeeds.length,
        activeMandiRecordsCount: activeMandiPrices.length,
        verifiedBuyersCount: activeBuyers.length,
        coldStorageFacilitiesMapped: activeColdStorages.length,
        transportersActive: activeTransporters.length,
        pendingSyncRecords: 0
      }
    });
  }

  // 20. ADMIN UPDATE MANDI
  if (path === "/api/admin/mandi" && method === "POST") {
    const existing = activeMandiPrices.find(m => m.crop.toLowerCase() === (body.crop || "").toLowerCase() && m.mandiName.toLowerCase() === (body.mandiName || "").toLowerCase());
    if (existing) {
      existing.modalPriceINR = Number(body.modalPrice) || existing.modalPriceINR;
      existing.minPriceINR = Number(body.minPrice) || existing.minPriceINR;
      existing.maxPriceINR = Number(body.maxPrice) || existing.maxPriceINR;
      existing.trend = body.trend || existing.trend;
      existing.lastUpdated = "Today";
    } else {
      activeMandiPrices.unshift({
        id: "mandi-" + Date.now(),
        crop: body.crop,
        cropHi: body.crop,
        cropTe: body.crop,
        mandiName: body.mandiName,
        district: body.district,
        state: body.state,
        modalPriceINR: Number(body.modalPrice),
        minPriceINR: Number(body.minPrice),
        maxPriceINR: Number(body.maxPrice),
        trend: body.trend || "up",
        lastUpdated: "Just now"
      });
    }
    setStorage("mandi_prices", activeMandiPrices);
    return makeJsonResponse({ success: true, message: `Mandi price updated for ${body.crop} at ${body.mandiName}!` });
  }

  // 21. ADMIN ADD SEED
  if (path === "/api/admin/seeds" && method === "POST") {
    activeSeeds.unshift({
      id: "seed-" + Date.now(),
      crop: body.crop,
      cropHi: body.crop,
      cropTe: body.crop,
      variety: body.variety,
      certifyingAgency: body.certifyingAgency,
      yieldPotential: body.yieldPotential,
      packSize: body.packSize,
      pricePerPackINR: Number(body.pricePerPackINR),
      subsidizedPriceINR: Number(body.subsidizedPriceINR)
    });
    setStorage("seed_store", activeSeeds);
    return makeJsonResponse({ success: true, message: `Certified seed variety ${body.variety} added!` });
  }

  // 22. ANALYTICS
  if (path === "/api/analytics") {
    return makeJsonResponse({
      success: true,
      stats: {
        activeFarmersRegistered: 18450,
        totalQuintalsListed: 24500,
        avgMiddlemenCommissionSavedPercent: 12.8,
        verifiedFposCount: 42,
        coldStoragesMapped: 68
      },
      regionalOutbreakAlerts: [
        { id: "alert-1", crop: "Tomato", disease: "Early Blight Warning", severity: "High", affectedDistricts: ["Guntur", "Krishna"], recommendedAction: "Apply Sour Buttermilk (1:10) or Mancozeb before rains.", date: "Today, 08:30 AM" },
        { id: "alert-2", crop: "Cotton", disease: "Pink Bollworm Trap Threshold", severity: "Moderate", affectedDistricts: ["Warangal", "Khammam"], recommendedAction: "Install Gossyplure pheromone traps & Tricho-cards.", date: "Yesterday" }
      ],
      topCommoditiesDemand: [
        { crop: "Chilli (Sitara Gold)", priceRange: "₹20,500/Qtl", trend: "Strong Buy", demandIndex: 94 },
        { crop: "Cotton (Hybrid)", priceRange: "₹7,450/Qtl", trend: "Stable", demandIndex: 82 },
        { crop: "Tomato (Sahu)", priceRange: "₹1,850/Qtl", trend: "High Demand", demandIndex: 88 }
      ]
    });
  }

  // Default fallback for any unknown API route
  return makeJsonResponse({ success: true, message: "OK (client mode)", path });
}
