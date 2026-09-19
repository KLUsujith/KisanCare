import express from "express";

const router = express.Router();

// Registered farmers storage
const REGISTERED_FARMERS = [
  {
    id: "farmer-1",
    name: "K. Anjaneyulu Reddy (రైతు)",
    phone: "9440177889",
    password: "farmer123",
    role: "farmer",
    acresOwned: 4.5,
    village: "Narsampet",
    mandal: "Narsampet",
    district: "Warangal",
    state: "Telangana",
    preferredCrop: "Cotton / Chilli",
    language: "te"
  },
  {
    id: "farmer-2",
    name: "Venkata Subba Rao",
    phone: "9848011223",
    password: "farmer123",
    role: "farmer",
    acresOwned: 3.5,
    village: "Tenali Rural",
    mandal: "Tenali",
    district: "Guntur",
    state: "Andhra Pradesh",
    preferredCrop: "Chilli (మిరప)",
    language: "te"
  }
];

// Admin Credentials
const ADMIN_CREDENTIALS = {
  username: "admin@kisancare.gov.in",
  altUsername: "admin",
  password: "admin123",
  pin: "9999"
};

// 1. POST /api/auth/admin-login (Strict Admin Access)
router.post("/admin-login", (req, res) => {
  const { username, password, pin } = req.body;

  const isValidUser = username && (
    username.toLowerCase() === ADMIN_CREDENTIALS.username || 
    username.toLowerCase() === ADMIN_CREDENTIALS.altUsername
  );

  const isValidPass = (password && password === ADMIN_CREDENTIALS.password) || (pin && pin === ADMIN_CREDENTIALS.pin);

  if (!isValidUser || !isValidPass) {
    return res.status(401).json({
      success: false,
      error: "Invalid Admin Credentials. Please enter username 'admin' and password 'admin123' (or PIN 9999)."
    });
  }

  const adminUser = {
    id: "admin-master-01",
    name: "KisanCare Super Admin (అడ్మిన్)",
    username: ADMIN_CREDENTIALS.username,
    role: "admin",
    isAdmin: true,
    department: "Directorate of Agriculture & APMC Market Oversight",
    state: "Andhra Pradesh & Telangana",
    language: "en"
  };

  res.json({
    success: true,
    message: "Admin authenticated successfully. Admin Dashboard access granted.",
    user: adminUser,
    token: `admin-token-${Date.now()}`
  });
});

// 2. POST /api/auth/register-farmer (Create New Farmer Account)
router.post("/register-farmer", (req, res) => {
  const { name, phone, password, village, mandal, district, state, acresOwned, preferredLanguage } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Farmer name and 10-digit mobile number are required." });
  }

  // Check if already registered
  let existing = REGISTERED_FARMERS.find(f => f.phone === phone);
  if (existing) {
    // Update existing
    existing.name = name;
    existing.acresOwned = Number(acresOwned) || existing.acresOwned;
    existing.village = village || existing.village;
    existing.mandal = mandal || existing.mandal;
    existing.district = district || existing.district;
    existing.state = state || existing.state;
    existing.language = preferredLanguage || existing.language;
  } else {
    existing = {
      id: `farmer-${Date.now()}`,
      name,
      phone,
      password: password || "123456",
      role: "farmer",
      isAdmin: false,
      acresOwned: Number(acresOwned) || 2.5,
      village: village || "Gram Panchayat",
      mandal: mandal || "Local Mandal",
      district: district || "Guntur",
      state: state || "Andhra Pradesh",
      language: preferredLanguage || "te"
    };
    REGISTERED_FARMERS.push(existing);
  }

  res.json({
    success: true,
    message: `Farmer account created successfully for ${existing.name}!`,
    user: existing,
    token: `farmer-token-${Date.now()}`
  });
});

// 3. POST /api/auth/farmer-login (Farmer Login via Password or OTP)
router.post("/farmer-login", (req, res) => {
  const { phone, password, otp } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, error: "Mobile number is required." });
  }

  const existing = REGISTERED_FARMERS.find(f => f.phone === phone);

  if (otp) {
    if (otp !== "123456" && otp !== "999999") {
      return res.status(400).json({ success: false, error: "Invalid OTP. Use simulation code: 123456" });
    }
  } else if (password) {
    if (existing && existing.password !== password && password !== "farmer123") {
      return res.status(401).json({ success: false, error: "Incorrect password. (Default: farmer123)" });
    }
  }

  const user = existing || {
    id: `farmer-${Date.now()}`,
    name: "Kisan Mitra (రైతు)",
    phone,
    role: "farmer",
    isAdmin: false,
    acresOwned: 3.5,
    village: "Tenali",
    mandal: "Tenali",
    district: "Guntur",
    state: "Andhra Pradesh",
    language: "te"
  };

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    user,
    token: `farmer-token-${Date.now()}`
  });
});

// 4. POST /api/auth/send-otp
router.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, error: "Please provide a valid 10-digit mobile number." });
  }

  const generatedOtp = "123456";
  res.json({
    success: true,
    message: `OTP sent to +91-${phone}. Use code: 123456`,
    simulatedOtp: generatedOtp
  });
});

// 5. POST /api/auth/verify-otp
router.post("/verify-otp", (req, res) => {
  const { phone, otp, name } = req.body;
  if (otp !== "123456" && otp !== "999999") {
    return res.status(400).json({ success: false, error: "Invalid OTP code. Enter 123456." });
  }

  const existing = REGISTERED_FARMERS.find(f => f.phone === phone);
  const user = existing || {
    id: `farmer-${Date.now()}`,
    name: name || "Kisan Mitra (రైతు)",
    phone,
    role: "farmer",
    isAdmin: false,
    acresOwned: 3.5,
    village: "Tenali Rural",
    mandal: "Tenali",
    district: "Guntur",
    state: "Andhra Pradesh",
    language: "te"
  };

  res.json({
    success: true,
    message: "Login successful!",
    user,
    token: `token-${Date.now()}`
  });
});

export default router;
