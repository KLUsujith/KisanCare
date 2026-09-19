import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const mandiPricesPath = path.join(__dirname, "../data/mandi_prices.json");
const buyersPath = path.join(__dirname, "../data/buyers_fpos.json");
const listingsPath = path.join(__dirname, "../data/listings_store.json");

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
    console.error("Save error:", e);
    return false;
  }
}

// GET /api/mandi-prices
router.get("/mandi-prices", (req, res) => {
  const { crop, state, search } = req.query;
  let prices = loadData(mandiPricesPath);

  if (crop && crop !== "all") {
    prices = prices.filter(p => p.crop.toLowerCase().includes(crop.toLowerCase()));
  }
  if (state && state !== "all") {
    prices = prices.filter(p => p.state.toLowerCase() === state.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    prices = prices.filter(p => 
      p.crop.toLowerCase().includes(s) || 
      p.mandiName.toLowerCase().includes(s) || 
      p.district.toLowerCase().includes(s) ||
      p.state.toLowerCase().includes(s)
    );
  }

  // Calculate highest paying mandi for user comparison
  const highestPriceMandi = [...prices].sort((a, b) => b.modalPrice - a.modalPrice)[0];

  res.json({
    success: true,
    totalRecords: prices.length,
    highestPriceMandi,
    prices
  });
});

// GET /api/buyers
router.get("/buyers", (req, res) => {
  const { crop, state, type } = req.query;
  let buyers = loadData(buyersPath);

  if (crop && crop !== "all") {
    buyers = buyers.filter(b => b.buyingCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())));
  }
  if (state && state !== "all") {
    buyers = buyers.filter(b => b.state.toLowerCase().includes(state.toLowerCase()));
  }
  if (type && type !== "all") {
    buyers = buyers.filter(b => b.type.toLowerCase().includes(type.toLowerCase()));
  }

  res.json({
    success: true,
    count: buyers.length,
    buyers
  });
});

// GET /api/listings
router.get("/listings", (req, res) => {
  const { crop, district, isOrganic } = req.query;
  let listings = loadData(listingsPath);

  if (crop && crop !== "all") {
    listings = listings.filter(l => l.crop.toLowerCase().includes(crop.toLowerCase()));
  }
  if (district && district !== "all") {
    listings = listings.filter(l => l.district.toLowerCase() === district.toLowerCase());
  }
  if (isOrganic === "true") {
    listings = listings.filter(l => l.isOrganic === true);
  }

  res.json({
    success: true,
    count: listings.length,
    listings
  });
});

// POST /api/listings (Farmers post produce for sale)
router.post("/listings", (req, res) => {
  try {
    const {
      farmerName,
      phone,
      whatsapp,
      village,
      district,
      state,
      crop,
      variety,
      quantityQuintals,
      expectedPricePerQuintal,
      harvestDate,
      isOrganic,
      grade,
      description
    } = req.body;

    if (!farmerName || !phone || !crop || !quantityQuintals || !expectedPricePerQuintal) {
      return res.status(400).json({ success: false, error: "Required fields missing." });
    }

    const currentListings = loadData(listingsPath);
    const newListing = {
      id: `list-${Date.now()}`,
      farmerName,
      phone,
      whatsapp: whatsapp || phone.replace(/\s+/g, ""),
      village: village || "Gram Panchayat Hub",
      district: district || "Local District",
      state: state || "State",
      crop,
      variety: variety || "Standard Hybrid",
      quantityQuintals: Number(quantityQuintals),
      expectedPricePerQuintal: Number(expectedPricePerQuintal),
      mandiPriceBenchmark: Math.round(Number(expectedPricePerQuintal) * 0.96),
      harvestDate: harvestDate || "Ready for immediate delivery",
      isOrganic: Boolean(isOrganic),
      grade: grade || "Grade A Standard",
      description: description || "Fresh farm harvest directly from grower with zero middlemen commission.",
      createdAt: new Date().toISOString(),
      status: "Active",
      inquiriesCount: 0,
      highestBid: null
    };

    currentListings.unshift(newListing);
    saveData(listingsPath, currentListings);

    res.json({
      success: true,
      message: "Produce listed successfully in direct farmer marketplace!",
      listing: newListing
    });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ success: false, error: "Failed to create listing." });
  }
});

// POST /api/listings/:id/inquiry (Buyers submit price bids or inquiry)
router.post("/listings/:id/inquiry", (req, res) => {
  const { id } = req.params;
  const { buyerName, buyerPhone, bidPricePerQuintal, message } = req.body;

  const currentListings = loadData(listingsPath);
  const targetIndex = currentListings.findIndex(l => l.id === id);

  if (targetIndex === -1) {
    return res.status(404).json({ success: false, error: "Listing not found." });
  }

  const listing = currentListings[targetIndex];
  listing.inquiriesCount = (listing.inquiriesCount || 0) + 1;
  if (bidPricePerQuintal && (!listing.highestBid || bidPricePerQuintal > listing.highestBid)) {
    listing.highestBid = Number(bidPricePerQuintal);
  }

  currentListings[targetIndex] = listing;
  saveData(listingsPath, currentListings);

  res.json({
    success: true,
    message: "Inquiry & price quote registered with farmer!",
    listing
  });
});

export default router;
