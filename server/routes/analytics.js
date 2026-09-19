import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const mandiPricesPath = path.join(__dirname, "../data/mandi_prices.json");
const listingsPath = path.join(__dirname, "../data/listings_store.json");

function loadData(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

// GET /api/analytics
router.get("/", (req, res) => {
  const prices = loadData(mandiPricesPath);
  const listings = loadData(listingsPath);

  const totalQuintalsListed = listings.reduce((sum, l) => sum + (l.quantityQuintals || 0), 0);
  const totalMarketValue = listings.reduce((sum, l) => sum + ((l.quantityQuintals || 0) * (l.expectedPricePerQuintal || 0)), 0);

  // Disease surveillance alerts (simulated live regional telemetry)
  const regionalOutbreakAlerts = [
    {
      id: "alert-1",
      crop: "Tomato",
      cropHi: "टमाटर",
      disease: "Early Blight Warning",
      diseaseHi: "अगेती झुलसा चेतावनी",
      severity: "High",
      affectedDistricts: ["Nashik", "Pune", "Ahmednagar"],
      recommendedAction: "Apply Sour Buttermilk (1:10) or Mancozeb before anticipated rains.",
      date: "Today, 08:30 AM"
    },
    {
      id: "alert-2",
      crop: "Cotton",
      cropHi: "कपास",
      disease: "Pink Bollworm Trap Threshold Exceeded",
      diseaseHi: "गुलाबी सुंडी अलर्ट",
      severity: "Moderate",
      affectedDistricts: ["Warangal", "Adilabad", "Khammam"],
      recommendedAction: "Install Gossyplure pheromone traps (8/acre) & deploy Tricho-cards.",
      date: "Yesterday"
    },
    {
      id: "alert-3",
      crop: "Potato",
      cropHi: "आलू",
      disease: "Late Blight Fog Alert",
      diseaseHi: "पछेती झुलसा कोहरा चेतावनी",
      severity: "High",
      affectedDistricts: ["Agra", "Aligarh", "Mathura"],
      recommendedAction: "Apply preventive Bordeaux mixture (1%) or Ridomil Gold immediately.",
      date: "Today, 06:15 AM"
    }
  ];

  res.json({
    success: true,
    stats: {
      activeFarmersRegistered: 14280,
      totalQuintalsListed,
      totalMarketValueINR: totalMarketValue,
      verifiedFposCount: 42,
      coldStoragesMapped: 18,
      sharedLogisticsTrips: 154,
      avgMiddlemenCommissionSavedPercent: 12.8
    },
    regionalOutbreakAlerts,
    topCommoditiesDemand: [
      { crop: "Tomato", demandIndex: 94, trend: "Rising", priceRange: "₹2,200 - ₹2,450" },
      { crop: "Rice (Basmati)", demandIndex: 91, trend: "Rising", priceRange: "₹3,980 - ₹4,200" },
      { crop: "Chilli (Guntur Teja)", demandIndex: 88, trend: "High Demand", priceRange: "₹19,800 - ₹22,400" },
      { crop: "Potato (Chipsona)", demandIndex: 82, trend: "Stable", priceRange: "₹1,720 - ₹1,850" },
      { crop: "Cotton (Bt)", demandIndex: 79, trend: "Rising", priceRange: "₹7,520 - ₹7,820" }
    ]
  });
});

export default router;
