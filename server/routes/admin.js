import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const seedsPath = path.join(__dirname, "../data/seed_store.json");
const mandiPricesPath = path.join(__dirname, "../data/mandi_prices.json");
const buyersPath = path.join(__dirname, "../data/buyers_fpos.json");
const coldStoragePath = path.join(__dirname, "../data/cold_storages.json");
const transportersPath = path.join(__dirname, "../data/transporters.json");

function loadData(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    return false;
  }
}

// GET /api/admin/overview
router.get("/overview", (req, res) => {
  const seeds = loadData(seedsPath);
  const mandi = loadData(mandiPricesPath);
  const buyers = loadData(buyersPath);
  const coldStorage = loadData(coldStoragePath);
  const transporters = loadData(transportersPath);

  res.json({
    success: true,
    catalogSummary: {
      seedProductsCount: seeds.length,
      activeMandiRecordsCount: mandi.length,
      verifiedBuyersCount: buyers.filter(b => b.verifiedGovt).length,
      coldStorageFacilitiesMapped: coldStorage.length,
      transportersActive: transporters.length,
      lastSyncTimestamp: new Date().toISOString()
    }
  });
});

// POST /api/admin/mandi (Update or add mandi rate)
router.post("/mandi", (req, res) => {
  const { crop, mandiName, district, state, modalPrice, minPrice, maxPrice, trend } = req.body;
  const mandiList = loadData(mandiPricesPath);

  const newRecord = {
    id: `mandi-${Date.now()}`,
    crop,
    mandiName,
    district,
    state,
    modalPrice: Number(modalPrice),
    minPrice: Number(minPrice) || Math.round(Number(modalPrice) * 0.9),
    maxPrice: Number(maxPrice) || Math.round(Number(modalPrice) * 1.1),
    trend: trend || "stable",
    changePercent: "+0.0%",
    dailyArrivals: 5000,
    recommended: true
  };

  mandiList.unshift(newRecord);
  saveData(mandiPricesPath, mandiList);

  res.json({
    success: true,
    message: `Mandi price record updated for ${crop} at ${mandiName}!`,
    record: newRecord
  });
});

// POST /api/admin/seeds (Add new certified seed product)
router.post("/seeds", (req, res) => {
  const { crop, variety, certifyingAgency, yieldPotential, pricePerPackINR, subsidizedPriceINR, packSize } = req.body;
  const seedList = loadData(seedsPath);

  const newSeed = {
    id: `seed-${Date.now()}`,
    crop,
    variety,
    certifyingAgency: certifyingAgency || "ICAR / State Seed Corporation",
    yieldPotential: yieldPotential || "High Yielding",
    germinationRate: "90%",
    purityPercentage: "98%",
    packSize: packSize || "1 Kg",
    pricePerPackINR: Number(pricePerPackINR) || 500,
    subsidizedPriceINR: Number(subsidizedPriceINR) || Math.round(Number(pricePerPackINR) * 0.75),
    subsidyAvailable: "Govt Subsidized Seed Grant",
    inStockPacks: 100,
    deliveryDays: "2 - 3 Days"
  };

  seedList.unshift(newSeed);
  saveData(seedsPath, seedList);

  res.json({
    success: true,
    message: `Seed product ${variety} added to certified store catalog!`,
    seed: newSeed
  });
});

export default router;
