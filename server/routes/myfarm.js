import express from "express";

const router = express.Router();

// Default farm profile seeded for demo
let farmProfile = {
  farmerName: "Anjaneyulu Reddy (రైతు సోదరుడు)",
  phone: "9440177889",
  village: "Narsampet",
  villageTe: "నర్సంపేట",
  mandal: "Narsampet",
  district: "Warangal",
  state: "Andhra Pradesh / Telangana",
  totalAcres: 3.5,
  cultivableAcres: 3.5,
  soilType: "Red Sandy Loam with Black Pockets",
  soilTypeTe: "ఎర్ర ఇసుక నేల మరియు నల్లరేగడి",
  irrigationSource: "Borewell with Drip Irrigation (బోరుబావి + బిందు సేద్యం)",
  previousCrop: "Cotton (పత్తి)",
  previousYieldQuintals: 32,
  soilHealthCard: {
    organicCarbonPercent: 0.62,
    nitrogenStatus: "Medium",
    phosphorusStatus: "Low",
    potassiumStatus: "High",
    phLevel: 7.2
  },
  lastUpdated: new Date().toISOString()
};

// Farm performance history
const cropHistory = [
  {
    season: "Kharif 2025",
    crop: "Cotton (పత్తి)",
    acres: 3.5,
    yieldQuintals: 32,
    sellingPricePerQuintal: 7450,
    grossIncome: 238400,
    cultivationExpenses: 98000,
    netProfit: 140400,
    buyerName: "Enumamula APMC Yard"
  },
  {
    season: "Rabi 2024",
    crop: "Maize (మొక్కజొన్న)",
    acres: 2.0,
    yieldQuintals: 52,
    sellingPricePerQuintal: 2150,
    grossIncome: 111800,
    cultivationExpenses: 36000,
    netProfit: 75800,
    buyerName: "Local Poultry Feed Miller"
  }
];

// GET /api/myfarm
router.get("/", (req, res) => {
  res.json({
    success: true,
    profile: farmProfile
  });
});

// POST /api/myfarm
router.post("/", (req, res) => {
  const { 
    farmerName, 
    phone, 
    village, 
    mandal, 
    district, 
    state, 
    totalAcres, 
    soilType, 
    irrigationSource, 
    previousCrop 
  } = req.body;

  farmProfile = {
    ...farmProfile,
    farmerName: farmerName || farmProfile.farmerName,
    phone: phone || farmProfile.phone,
    village: village || farmProfile.village,
    mandal: mandal || farmProfile.mandal,
    district: district || farmProfile.district,
    state: state || farmProfile.state,
    totalAcres: Number(totalAcres) || farmProfile.totalAcres,
    cultivableAcres: Number(totalAcres) || farmProfile.cultivableAcres,
    soilType: soilType || farmProfile.soilType,
    irrigationSource: irrigationSource || farmProfile.irrigationSource,
    previousCrop: previousCrop || farmProfile.previousCrop,
    lastUpdated: new Date().toISOString()
  };

  res.json({
    success: true,
    message: "Farm profile updated successfully!",
    profile: farmProfile
  });
});

// GET /api/myfarm/history
router.get("/history", (req, res) => {
  res.json({
    success: true,
    history: cropHistory
  });
});

export default router;
