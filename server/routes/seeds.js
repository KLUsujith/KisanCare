import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const seedsPath = path.join(__dirname, "../data/seed_store.json");

function loadSeeds() {
  try {
    const raw = fs.readFileSync(seedsPath, "utf-8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// In-memory orders store
const ordersStore = [];

// GET /api/seeds
router.get("/", (req, res) => {
  const { crop, acres } = req.query;
  let seeds = loadSeeds();

  if (crop && crop !== "all") {
    seeds = seeds.filter(s => s.crop.toLowerCase().includes(crop.toLowerCase()));
  }

  const acresNum = Number(acres) || 1;

  // Calculate recommended packets for the given acres
  const results = seeds.map(s => {
    let packsNeeded = 1;
    if (s.id.includes("tomato")) {
      // 60g/acre -> 10g packs -> 6 packs/acre
      packsNeeded = Math.ceil(acresNum * 6);
    } else if (s.id.includes("cotton")) {
      // 2 packs per acre
      packsNeeded = Math.ceil(acresNum * 2);
    } else if (s.id.includes("rice")) {
      // 1 5kg bag per acre
      packsNeeded = Math.ceil(acresNum * 1);
    } else if (s.id.includes("potato")) {
      // 12 bags per acre
      packsNeeded = Math.ceil(acresNum * 12);
    } else if (s.id.includes("wheat")) {
      // 1 40kg bag per acre
      packsNeeded = Math.ceil(acresNum * 1);
    } else if (s.id.includes("chilli")) {
      // 2 50g packs per acre
      packsNeeded = Math.ceil(acresNum * 2);
    } else if (s.id.includes("onion")) {
      // 6 500g packs per acre
      packsNeeded = Math.ceil(acresNum * 6);
    }

    return {
      ...s,
      calculatedPacksForAcres: packsNeeded,
      totalAcreCostINR: packsNeeded * (s.subsidizedPriceINR || s.pricePerPackINR)
    };
  });

  res.json({
    success: true,
    acres: acresNum,
    count: results.length,
    seeds: results
  });
});

// POST /api/seeds/order
router.post("/order", (req, res) => {
  const { seedId, packsCount, farmerName, phone, deliveryAddress, acres, paymentMode } = req.body;

  if (!seedId || !farmerName || !phone) {
    return res.status(400).json({ success: false, error: "Seed, farmer name, and phone are required." });
  }

  const seeds = loadSeeds();
  const seed = seeds.find(s => s.id === seedId) || seeds[0];
  const qty = Number(packsCount) || 1;
  const unitPrice = seed.subsidizedPriceINR || seed.pricePerPackINR;
  const totalPrice = unitPrice * qty;

  const newOrder = {
    orderId: `KS-SEED-${Math.floor(100000 + Math.random() * 900000)}`,
    seedName: `${seed.crop} (${seed.variety})`,
    certifyingAgency: seed.certifyingAgency,
    quantityPacks: qty,
    packSize: seed.packSize,
    totalPriceINR: totalPrice,
    subsidyApplied: seed.subsidyAvailable,
    farmerName,
    phone,
    deliveryAddress: deliveryAddress || "Gram Panchayat Krishi Seva Kendra",
    acresTargeted: acres || 1,
    paymentMode: paymentMode || "Cash on Delivery / KCC (Kisan Credit Card)",
    orderDate: new Date().toISOString(),
    status: "Confirmed - Dispatched from Seed Hub",
    expectedDelivery: "Within 48 Hours"
  };

  ordersStore.unshift(newOrder);

  res.json({
    success: true,
    message: `Order placed successfully! Certified seeds will be delivered to ${newOrder.deliveryAddress}. Tracking ID: ${newOrder.orderId}`,
    order: newOrder
  });
});

// GET /api/seeds/orders
router.get("/orders", (req, res) => {
  res.json({
    success: true,
    orders: ordersStore
  });
});

export default router;
