import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const suitabilityPath = path.join(__dirname, "../data/regional_suitability.json");
const mandalDataPath = path.join(__dirname, "../data/mandal_data.json");
const mandiPricesPath = path.join(__dirname, "../data/mandi_prices.json");

function loadData(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// GET /api/advisory/mandals
router.get("/mandals", (req, res) => {
  const mandalList = loadData(mandalDataPath);
  res.json({
    success: true,
    data: mandalList
  });
});

// POST /api/advisory/area-suitability (Find best crops for State/District/Mandal)
router.post("/area-suitability", (req, res) => {
  const { state, district, mandal, soilType, irrigation, season, acres } = req.body;
  const mandalList = loadData(mandalDataPath);
  const regionalSuit = loadData(suitabilityPath);

  // Search district in mandal data
  const targetDistrict = district || "Guntur";
  const stateRecord = mandalList.find(s => s.district.toLowerCase() === targetDistrict.toLowerCase()) || mandalList[0];
  const mandalRecord = stateRecord.mandals.find(m => m.mandal.toLowerCase() === (mandal || "Tenali").toLowerCase()) || stateRecord.mandals[0];

  // Match with regional detailed crop specs
  const regionalMatch = regionalSuit.find(r => r.district.toLowerCase() === targetDistrict.toLowerCase()) || regionalSuit[0];

  const suitableCrops = regionalMatch.recommendedCrops.map(c => ({
    crop: c.crop,
    cropHi: c.cropHi,
    cropTe: c.cropTe,
    variety: c.varietyRecommended,
    suitabilityScore: c.suitabilityScore,
    season: season || c.season,
    growingDurationDays: c.durationDays,
    waterRequirement: c.waterRequirement,
    suitableSoil: mandalRecord.soilTypes[0] || regionalMatch.predominantSoil,
    inputCostPerAcre: c.cultivationCostPerAcre,
    expectedYieldPerAcreQuintals: c.avgYieldPerAcreQuintals,
    totalExpectedYieldForAcres: Math.round(c.avgYieldPerAcreQuintals * (Number(acres) || 1)),
    totalInputCostForAcres: Math.round(c.cultivationCostPerAcre * (Number(acres) || 1)),
    soilFitRationale: c.soilFitReason,
    irrigationSourceNote: irrigation || mandalRecord.irrigationOptions[0]
  }));

  res.json({
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
    acresEntered: Number(acres) || 1,
    recommendedCrops: suitableCrops,
    expertDisclaimer: "IMPORTANT: Crop recommendations and yield figures are historical regional estimates. Soil fertility, pest pressure, and seasonal rainfall vary significantly. Always verify with your local Mandal Agricultural Officer (MAO) or nearest Krishi Vigyan Kendra (KVK) before final sowing."
  });
});

// POST /api/advisory/scenario-income (Low, Expected, High multi-scenario calculator)
router.post("/scenario-income", (req, res) => {
  const { 
    crop, 
    acres, 
    manualSellingPrice, 
    manualYieldPerAcre, 
    manualInputCostPerAcre,
    district 
  } = req.body;

  const landAcres = Math.max(0.5, Number(acres) || 1);
  const regionalSuit = loadData(suitabilityPath);
  const mandiPrices = loadData(mandiPricesPath);

  // Find crop specs
  const region = regionalSuit.find(r => r.district.toLowerCase() === (district || "Guntur").toLowerCase()) || regionalSuit[0];
  let cropData = region.recommendedCrops.find(c => c.crop.toLowerCase().includes((crop || "Chilli").toLowerCase()));
  if (!cropData) {
    cropData = region.recommendedCrops[0];
  }

  // Find live APMC market price benchmark
  const mandiItem = mandiPrices.find(m => m.crop.toLowerCase().includes(cropData.crop.toLowerCase())) || mandiPrices[0];

  // Base parameters (using manual overrides if farmer adjusted them)
  const basePricePerQtl = Number(manualSellingPrice) || mandiItem.modalPrice || 2200;
  const baseYieldPerAcre = Number(manualYieldPerAcre) || cropData.avgYieldPerAcreQuintals || 20;
  const baseCostPerAcre = Number(manualInputCostPerAcre) || cropData.cultivationCostPerAcre || 30000;

  // Total cultivation costs
  const totalCost = Math.round(baseCostPerAcre * landAcres);

  // Itemized breakdown based on agricultural norms
  const breakdown = {
    seeds: Math.round(totalCost * 0.12),
    landPreparation: Math.round(totalCost * 0.15),
    fertilizersAndManure: Math.round(totalCost * 0.25),
    plantProtectionSprays: Math.round(totalCost * 0.20),
    irrigationAndFuel: Math.round(totalCost * 0.10),
    harvestingAndLabor: Math.round(totalCost * 0.18)
  };

  // SCENARIO 1: Expected Scenario (Average normal year)
  const expectedYieldTotal = Math.round(baseYieldPerAcre * landAcres);
  const expectedGrossRevenue = Math.round(expectedYieldTotal * basePricePerQtl);
  const expectedNetIncome = expectedGrossRevenue - totalCost;

  // SCENARIO 2: Low Scenario (Pest damage, drought, or mandi price crash: -25% Yield, -15% Price)
  const lowYieldPerAcre = +(baseYieldPerAcre * 0.75).toFixed(1);
  const lowPricePerQtl = Math.round(basePricePerQtl * 0.85);
  const lowYieldTotal = Math.round(lowYieldPerAcre * landAcres);
  const lowGrossRevenue = Math.round(lowYieldTotal * lowPricePerQtl);
  const lowNetIncome = lowGrossRevenue - totalCost;

  // SCENARIO 3: High Scenario (Optimal monsoon, pest-free, bumper rate: +20% Yield, +15% Price)
  const highYieldPerAcre = +(baseYieldPerAcre * 1.20).toFixed(1);
  const highPricePerQtl = Math.round(basePricePerQtl * 1.15);
  const highYieldTotal = Math.round(highYieldPerAcre * landAcres);
  const highGrossRevenue = Math.round(highYieldTotal * highPricePerQtl);
  const highNetIncome = highGrossRevenue - totalCost;

  // Direct Market Advantage (KisanCare eliminates 8% Arhatiya brokerage)
  const directMarketCommissionBonus = Math.round(expectedGrossRevenue * 0.08);

  res.json({
    success: true,
    crop: cropData.crop,
    cropHi: cropData.cropHi,
    cropTe: cropData.cropTe,
    acres: landAcres,
    parametersUsed: {
      sellingPricePerQtl: basePricePerQtl,
      yieldPerAcre: baseYieldPerAcre,
      inputCostPerAcre: baseCostPerAcre,
      totalCultivationCost: totalCost,
      isManualOverridden: Boolean(manualSellingPrice || manualYieldPerAcre || manualInputCostPerAcre)
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
        roiPercent: Math.round((lowNetIncome / totalCost) * 100),
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
        roiPercent: Math.round((expectedNetIncome / totalCost) * 100),
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
        roiPercent: Math.round((highNetIncome / totalCost) * 100),
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
});

export default router;
