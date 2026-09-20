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
    const cropHint = (body.cropHint || "").toLowerCase();
    let matched = null;
    let confidence = 96;
    let severity = 38;
    let defaultPoints = [];

    if (sampleId.includes("cotton") || cropHint.includes("cotton")) {
      matched = cropsDiseasesData.find(d => d.id === "cotton-pink-bollworm") || cropsDiseasesData[1];
      confidence = 94;
      severity = 48;
      defaultPoints = [
        { x: 270, y: 275, radius: 38, intensity: 0.95, label: "Borehole & Frass Entry" },
        { x: 260, y: 255, radius: 30, intensity: 0.8, label: "Larval Feeding Zone" },
        { x: 110, y: 180, radius: 25, intensity: 0.6, label: "Leaf Margin Chew" }
      ];
    } else if (sampleId.includes("rice") || cropHint.includes("rice") || cropHint.includes("paddy")) {
      matched = cropsDiseasesData.find(d => d.id === "rice-blast") || cropsDiseasesData[2];
      confidence = 96;
      severity = 42;
      defaultPoints = [
        { x: 178, y: 150, radius: 40, intensity: 0.92, label: "Diamond Blast Lesion" },
        { x: 195, y: 230, radius: 35, intensity: 0.88, label: "Secondary Fungal Spot" },
        { x: 170, y: 280, radius: 25, intensity: 0.7, label: "Foliar Necrosis" }
      ];
    } else if (sampleId.includes("potato") || cropHint.includes("potato")) {
      matched = cropsDiseasesData.find(d => d.id === "potato-late-blight") || cropsDiseasesData[3];
      confidence = 97;
      severity = 62;
      defaultPoints = [
        { x: 175, y: 110, radius: 65, intensity: 0.95, label: "Phytophthora Water-Soaked Lesion" },
        { x: 160, y: 145, radius: 40, intensity: 0.85, label: "White Mold Zone" }
      ];
    } else if (sampleId.includes("chilli") || cropHint.includes("chilli") || cropHint.includes("mirchi")) {
      matched = cropsDiseasesData.find(d => d.id === "chilli-leaf-curl") || cropsDiseasesData[4] || cropsDiseasesData[0];
      confidence = 95;
      severity = 46;
      defaultPoints = [
        { x: 185, y: 170, radius: 42, intensity: 0.9, label: "Thrips Upward Cup Curling" },
        { x: 230, y: 220, radius: 38, intensity: 0.85, label: "Mite Puckering Zone" }
      ];
    } else if (sampleId.includes("healthy")) {
      matched = cropsDiseasesData.find(d => d.id === "healthy-crop" || d.id === "healthy-leaf") || cropsDiseasesData[ cropsDiseasesData.length - 1 ];
      confidence = 99;
      severity = 0;
      defaultPoints = [];
    } else {
      matched = cropsDiseasesData.find(d => d.id === "tomato-early-blight") || cropsDiseasesData[0];
      defaultPoints = [
        { x: 150, y: 210, radius: 45, intensity: 0.9, label: "Concentric Alternaria Necrosis" },
        { x: 240, y: 250, radius: 52, intensity: 0.85, label: "Target Spot Lesion" },
        { x: 170, y: 275, radius: 24, intensity: 0.65, label: "Chlorotic Margin" }
      ];
    }

    // If client computed custom pixel scan points from an uploaded leaf, use those!
    const finalPoints = (body.heatmapPoints && body.heatmapPoints.length > 0)
      ? body.heatmapPoints
      : defaultPoints;

    const finalSeverity = (typeof body.severityScore === "number")
      ? body.severityScore
      : severity;

    const severityCategory = finalSeverity === 0 ? "Healthy" : finalSeverity < 25 ? "Mild" : finalSeverity < 50 ? "Moderate" : "Severe";

    return makeJsonResponse({
      success: true,
      diagnosis: {
        ...matched,
        confidence: body.confidence || confidence,
        severityScore: finalSeverity,
        severityCategory,
        heatmapPoints: finalPoints,
        detectedAt: new Date().toISOString(),
        summaryVoiceText: {
          en: `Identified ${matched.diseaseName} on ${matched.crop} with ${confidence}% confidence. Severity is ${severityCategory} (${finalSeverity}% foliage affected). Recommended organic treatment: ${matched.organicRemedies?.[0]?.name}.`,
          te: `గుర్తింపు: ${matched.cropTe || matched.crop} పై ${matched.regionalNames?.te || matched.diseaseName} ప్రభావం ఉంది. తీవ్రత: ${severityCategory} (${finalSeverity}% ఆకులు దెబ్బతిన్నాయి). సేంద్రీయ పరిష్కారం: ${matched.organicRemedies?.[0]?.nameTe || matched.organicRemedies?.[0]?.name}.`,
          hi: `पहचान: ${matched.cropHi || matched.crop} पर ${matched.regionalNames?.hi || matched.diseaseName}। गंभीरता: ${severityCategory} (${finalSeverity}%)। अनुशंसित उपाय: ${matched.organicRemedies?.[0]?.nameHi || matched.organicRemedies?.[0]?.name}।`
        }
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

    const basePricePerQtl = Number(body.manualSellingPrice) || mandiRecord.modalPrice || mandiRecord.modalPriceINR || 2200;
    const baseYieldPerAcre = Number(body.manualYieldPerAcre) || cropData.avgYieldPerAcreQuintals || 20;
    const baseCostPerAcre = Number(body.manualInputCostPerAcre) || cropData.cultivationCostPerAcre || 30000;

    const totalCost = Math.round(baseCostPerAcre * landAcres);

    const breakdown = {
      seeds: Math.round(totalCost * 0.12),
      landPreparation: Math.round(totalCost * 0.15),
      fertilizersAndManure: Math.round(totalCost * 0.25),
      plantProtectionSprays: Math.round(totalCost * 0.20),
      irrigationAndFuel: Math.round(totalCost * 0.10),
      harvestingAndLabor: Math.round(totalCost * 0.18)
    };

    // SCENARIO 1: Expected Scenario
    const expectedYieldTotal = Math.round(baseYieldPerAcre * landAcres);
    const expectedGrossRevenue = Math.round(expectedYieldTotal * basePricePerQtl);
    const expectedNetIncome = expectedGrossRevenue - totalCost;

    // SCENARIO 2: Low Scenario (-25% yield, -15% price)
    const lowYieldPerAcre = +(baseYieldPerAcre * 0.75).toFixed(1);
    const lowPricePerQtl = Math.round(basePricePerQtl * 0.85);
    const lowYieldTotal = Math.round(lowYieldPerAcre * landAcres);
    const lowGrossRevenue = Math.round(lowYieldTotal * lowPricePerQtl);
    const lowNetIncome = lowGrossRevenue - totalCost;

    // SCENARIO 3: High Scenario (+20% yield, +15% price)
    const highYieldPerAcre = +(baseYieldPerAcre * 1.20).toFixed(1);
    const highPricePerQtl = Math.round(basePricePerQtl * 1.15);
    const highYieldTotal = Math.round(highYieldPerAcre * landAcres);
    const highGrossRevenue = Math.round(highYieldTotal * highPricePerQtl);
    const highNetIncome = highGrossRevenue - totalCost;

    const directMarketCommissionBonus = Math.round(expectedGrossRevenue * 0.08);

    return makeJsonResponse({
      success: true,
      crop: cropData.crop,
      cropHi: cropData.cropHi || cropData.crop,
      cropTe: cropData.cropTe || cropData.crop,
      variety: cropData.varietyRecommended,
      acres: landAcres,
      district: districtName,
      benchmarkMandi: mandiRecord.mandiName ? `${mandiRecord.mandiName} (₹${basePricePerQtl}/Qtl)` : "APMC Benchmark",
      parametersUsed: {
        sellingPricePerQtl: basePricePerQtl,
        yieldPerAcre: baseYieldPerAcre,
        inputCostPerAcre: baseCostPerAcre,
        totalCultivationCost: totalCost,
        isManualOverridden: Boolean(body.manualSellingPrice || body.manualYieldPerAcre || body.manualInputCostPerAcre)
      },
      costBreakdown: breakdown,
      scenarios: {
        low: {
          scenarioName: "Low Income (Adverse Climate / Low Mandi Rate)",
          scenarioNameTe: "తక్కువ రాబడి (ప్రతికూల వాతావరణం / ధరల పతనం)",
          yieldPerAcre: lowYieldPerAcre,
          totalYieldQuintals: lowYieldTotal,
          sellingPricePerQtl: lowPricePerQtl,
          grossRevenue: lowGrossRevenue,
          cultivationCost: totalCost,
          estimatedNetIncome: lowNetIncome,
          roiPercent: Math.round((lowNetIncome / (totalCost || 1)) * 100),
          status: lowNetIncome >= 0 ? "Modest Profit" : "Risk of Loss"
        },
        expected: {
          scenarioName: "Expected Income (Normal Season & Modal Price)",
          scenarioNameTe: "సాధారణ ఆశించిన రాబడి (సగటు మార్కెట్ ధర)",
          yieldPerAcre: baseYieldPerAcre,
          totalYieldQuintals: expectedYieldTotal,
          sellingPricePerQtl: basePricePerQtl,
          grossRevenue: expectedGrossRevenue,
          cultivationCost: totalCost,
          estimatedNetIncome: expectedNetIncome,
          roiPercent: Math.round((expectedNetIncome / (totalCost || 1)) * 100),
          status: "Profitable"
        },
        high: {
          scenarioName: "High Income (Optimal Season & Premium Quality)",
          scenarioNameTe: "అధిక రాబడి (అనుకూల వాతావరణం & నాణ్యమైన పంట)",
          yieldPerAcre: highYieldPerAcre,
          totalYieldQuintals: highYieldTotal,
          sellingPricePerQtl: highPricePerQtl,
          grossRevenue: highGrossRevenue,
          cultivationCost: totalCost,
          estimatedNetIncome: highNetIncome,
          roiPercent: Math.round((highNetIncome / (totalCost || 1)) * 100),
          status: "High Profit"
        }
      },
      directMarketBonus: {
        savedCommissionINR: directMarketCommissionBonus,
        totalNetIncomeWithKisanCare: expectedNetIncome + directMarketCommissionBonus,
        description: "Direct sale through KisanCare eliminates 6-10% Arhatiya brokerage, retaining additional cash directly in your bank account."
      },
      transparencyFormula: `Gross Revenue = (Yield per Acre [${baseYieldPerAcre} Qtl] × Acres [${landAcres}] × Mandi Price [₹${basePricePerQtl}]) = ₹${expectedGrossRevenue}. Net Income = Gross Revenue [₹${expectedGrossRevenue}] - Total Input Costs [₹${totalCost}] = ₹${expectedNetIncome}.`,
      disclaimer: "DISCLAIMER: These calculations represent statistical scenarios and DO NOT guarantee actual income. Weather fluctuations, market arrivals, crop quality, and timing of sale affect actual earnings."
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
      let packsNeeded = 1;
      const sid = (s.id || "").toLowerCase();
      if (sid.includes("tomato") || sid.includes("onion")) packsNeeded = Math.ceil(acresNum * 6);
      else if (sid.includes("rice") || sid.includes("wheat")) packsNeeded = Math.ceil(acresNum * 1);
      else if (sid.includes("cotton") || sid.includes("chilli")) packsNeeded = Math.ceil(acresNum * 2);
      else if (sid.includes("potato")) packsNeeded = Math.ceil(acresNum * 12);
      else packsNeeded = Math.ceil(acresNum * 2);

      const unitPrice = s.subsidizedPriceINR || s.pricePerPackINR || 450;
      return {
        ...s,
        recommendedPacksForAcres: packsNeeded,
        calculatedPacksForAcres: packsNeeded,
        estimatedSeedCostINR: packsNeeded * unitPrice,
        totalAcreCostINR: packsNeeded * unitPrice
      };
    });
    return makeJsonResponse({
      success: true,
      acres: acresNum,
      count: results.length,
      seeds: results,
      catalog: results
    });
  }

  // 9. SEEDS ORDER
  if (path === "/api/seeds/order" && method === "POST") {
    const orderId = `KS-SEED-${Math.floor(100000 + Math.random() * 900000)}`;
    const seeds = activeSeeds;
    const seed = seeds.find(s => s.id === body.seedId) || seeds[0] || { crop: "Chilli", variety: "Teja Super" };
    const qty = Number(body.packsCount) || 1;
    const unitPrice = seed.subsidizedPriceINR || seed.pricePerPackINR || 450;
    const newOrder = {
      orderId,
      seedName: `${seed.crop} (${seed.variety})`,
      certifyingAgency: seed.certifyingAgency || "NSC Certified",
      quantityPacks: qty,
      packSize: seed.packSize || "50g Pack",
      totalPriceINR: unitPrice * qty,
      subsidyApplied: seed.subsidyAvailable !== false,
      farmerName: body.farmerName || "Farmer",
      phone: body.phone || "9876543210",
      deliveryAddress: body.deliveryAddress || "Gram Panchayat Krishi Seva Kendra",
      acresTargeted: body.acres || 1,
      paymentMode: body.paymentMode || "Cash on Delivery / KCC",
      orderDate: new Date().toISOString(),
      status: "Confirmed - Dispatched from Seed Hub",
      expectedDelivery: "Within 48 Hours to Village Krishi Kendra"
    };

    return makeJsonResponse({
      success: true,
      orderId,
      order: newOrder,
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
