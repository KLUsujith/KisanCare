import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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

// GET /api/cold-storage
router.get("/cold-storage", (req, res) => {
  const { crop, district, maxDistance } = req.query;
  let facilities = loadData(coldStoragePath);

  if (crop && crop !== "all") {
    facilities = facilities.filter(f => 
      f.specialityCrops.some(c => c.toLowerCase().includes(crop.toLowerCase()))
    );
  }
  if (district && district !== "all") {
    facilities = facilities.filter(f => f.district.toLowerCase() === district.toLowerCase());
  }
  if (maxDistance) {
    facilities = facilities.filter(f => f.distanceKm <= Number(maxDistance));
  }

  res.json({
    success: true,
    count: facilities.length,
    facilities
  });
});

// POST /api/cold-storage/book (Space reservation inquiry)
router.post("/cold-storage/book", (req, res) => {
  const { facilityId, farmerName, phone, crop, bagsCount, storageDurationMonths } = req.body;

  if (!farmerName || !phone || !bagsCount) {
    return res.status(400).json({ success: false, error: "Farmer name, phone, and bag count are required." });
  }

  const facilities = loadData(coldStoragePath);
  const facility = facilities.find(f => f.id === facilityId) || facilities[0];

  const estimatedTotalCost = (facility.tariffPerBag || 35) * Number(bagsCount) * Number(storageDurationMonths || 1);

  res.json({
    success: true,
    bookingId: `CS-RES-${Math.floor(100000 + Math.random() * 900000)}`,
    facilityName: facility.name,
    estimatedCost: estimatedTotalCost,
    message: `Reservation slot requested at ${facility.name}! Cold storage manager ${facility.managerName} (${facility.phone}) will verify space allocation via call/SMS.`
  });
});

// GET /api/logistics
router.get("/logistics", (req, res) => {
  const { district, vehicleType, sharedPoolOnly } = req.query;
  let transporters = loadData(transportersPath);

  if (district && district !== "all") {
    transporters = transporters.filter(t => t.baseDistrict.toLowerCase().includes(district.toLowerCase()));
  }
  if (vehicleType && vehicleType !== "all") {
    transporters = transporters.filter(t => t.vehicleType.toLowerCase().includes(vehicleType.toLowerCase()));
  }
  if (sharedPoolOnly === "true") {
    transporters = transporters.filter(t => t.sharedPoolAvailable === true);
  }

  res.json({
    success: true,
    count: transporters.length,
    transporters
  });
});

// POST /api/logistics/estimate (Freight cost calculator)
router.post("/logistics/estimate", (req, res) => {
  const { distanceKm, weightQuintals, vehicleType, useSharedPool } = req.body;

  const km = Math.max(1, Number(distanceKm) || 25);
  const quintals = Math.max(1, Number(weightQuintals) || 10);

  // Rate parameters
  let baseRateKm = 22;
  let baseFare = 350;

  if (vehicleType === "medium") {
    baseRateKm = 38;
    baseFare = 600;
  } else if (vehicleType === "light") {
    baseRateKm = 18;
    baseFare = 250;
  }

  // Weight handling fee (loading + unloading) approx ₹15 per quintal
  const laborCharge = quintals * 15;
  const transitCost = baseFare + (km * baseRateKm);

  let totalEstimate = transitCost + laborCharge;
  let sharedSavings = 0;

  if (useSharedPool) {
    // Shared pooling saves roughly 35-45% for small loads
    sharedSavings = Math.round(totalEstimate * 0.40);
    totalEstimate -= sharedSavings;
  }

  res.json({
    success: true,
    distanceKm: km,
    weightQuintals: quintals,
    estimatedFreight: Math.round(totalEstimate),
    sharedPoolSavings: sharedSavings,
    costPerQuintal: Math.round(totalEstimate / quintals),
    breakdown: {
      baseFare,
      distanceCharge: km * baseRateKm,
      laborCharge,
      sharedDiscountApplied: sharedSavings
    }
  });
});

export default router;
