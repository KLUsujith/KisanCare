$ErrorActionPreference = "Stop"

Write-Host "====================================================="
Write-Host "🌾 KISANCARE (కిసాన్ కేర్) - COMPLETE END-TO-END VERIFICATION"
Write-Host "====================================================="

# 1. Health
$health = Invoke-RestMethod -Uri "http://localhost:5001/api/health"
Write-Host "`n[1] Health Check: $($health.status) | Uptime: $($health.uptimeSeconds)s"

# 2. Auth OTP
$otpSend = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/send-otp" -Method Post -Body (@{ phone = "9440177889" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "[2] Auth OTP Sent: $($otpSend.success) | Sim OTP: $($otpSend.simulatedOtp)"

$otpVerify = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/verify-otp" -Method Post -Body (@{ phone = "9440177889"; otp = "123456" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "    Logged In User: $($otpVerify.user.name) | Role: $($otpVerify.user.role) | Acres: $($otpVerify.user.acresOwned)"

# 3. My Farm Profile
$farm = Invoke-RestMethod -Uri "http://localhost:5001/api/myfarm"
Write-Host "[3] My Farm Profile: $($farm.profile.farmerName) | Land: $($farm.profile.totalAcres) Acres | Soil: $($farm.profile.soilType)"

# 4. Area Suitability (Guntur -> Tenali)
$suitBody = @{
    state = "Andhra Pradesh"
    district = "Guntur"
    mandal = "Tenali"
    soilType = "Deep Black Clayey Soil"
    irrigation = "Canal"
    acres = 3.5
} | ConvertTo-Json
$suit = Invoke-RestMethod -Uri "http://localhost:5001/api/advisory/area-suitability" -Method Post -Body $suitBody -ContentType "application/json"
Write-Host "[4] Area Suitability: $($suit.location.mandal), $($suit.location.district) | Top Crop: $($suit.recommendedCrops[0].crop) ($($suit.recommendedCrops[0].cropTe)) | Score: $($suit.recommendedCrops[0].suitabilityScore)%"

# 5. Scenario Income Estimator (Low, Expected, High)
$incBody = @{
    crop = "Chilli"
    acres = 3.5
    district = "Guntur"
} | ConvertTo-Json
$income = Invoke-RestMethod -Uri "http://localhost:5001/api/advisory/scenario-income" -Method Post -Body $incBody -ContentType "application/json"
Write-Host "[5] Multi-Scenario Income Estimator (for 3.5 Acres of Chilli):"
Write-Host "    - Low Scenario Net Income: Rs $($income.scenarios.low.estimatedNetIncome)"
Write-Host "    - Expected Scenario Net Income: Rs $($income.scenarios.expected.estimatedNetIncome)"
Write-Host "    - High Scenario Net Income: Rs $($income.scenarios.high.estimatedNetIncome)"
Write-Host "    - Direct Market Bonus Saved: Rs $($income.directMarketBonus.savedCommissionINR)"

# 6. Buy Seeds Store & Order
$seeds = Invoke-RestMethod -Uri "http://localhost:5001/api/seeds?acres=3.5&crop=Tomato"
Write-Host "[6] Certified Seeds: Found $($seeds.count) products | First: $($seeds.seeds[0].variety) | Packs Needed for 3.5 Ac: $($seeds.seeds[0].calculatedPacksForAcres)"

$orderBody = @{
    seedId = $seeds.seeds[0].id
    packsCount = $seeds.seeds[0].calculatedPacksForAcres
    farmerName = "K. Anjaneyulu Reddy"
    phone = "9440177889"
    deliveryAddress = "Tenali Mandal Krishi Kendra, Guntur, AP"
    acres = 3.5
    paymentMode = "Cash on Village Delivery"
} | ConvertTo-Json
$orderRes = Invoke-RestMethod -Uri "http://localhost:5001/api/seeds/order" -Method Post -Body $orderBody -ContentType "application/json"
Write-Host "    Seed Order Booked: $($orderRes.order.orderId) | Total: Rs $($orderRes.order.totalPriceINR) | Tracking: $($orderRes.order.status)"

# 7. Admin Dashboard Overview
$admin = Invoke-RestMethod -Uri "http://localhost:5001/api/admin/overview"
Write-Host "[7] Admin Catalog Overview: Seeds: $($admin.catalogSummary.seedProductsCount) | Mandis: $($admin.catalogSummary.activeMandiRecordsCount) | Buyers: $($admin.catalogSummary.verifiedBuyersCount)"

# 8. AI Leaf Diagnosis
$diag = Invoke-RestMethod -Uri "http://localhost:5001/api/diagnose" -Method Post -Body (@{ sampleId = "tomato-early-blight" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "[8] AI Leaf Diagnosis: Disease: $($diag.diagnosis.diseaseName) | Confidence: $($diag.diagnosis.confidence)% | Severity: $($diag.diagnosis.severityCategory)"

# 9. Cold Storage & Shared Logistics
$storage = Invoke-RestMethod -Uri "http://localhost:5001/api/cold-storage"
$freight = Invoke-RestMethod -Uri "http://localhost:5001/api/logistics/estimate" -Method Post -Body (@{ distanceKm = 40; weightQuintals = 25; useSharedPool = $true } | ConvertTo-Json) -ContentType "application/json"
Write-Host "[9] Facilities: Cold Storages: $($storage.count) | Shared Freight (40km, 25 Qtl): Rs $($freight.estimatedFreight) (Saved Rs $($freight.sharedPoolSavings) with pooling)"

Write-Host "`n>>> ALL 9 MODULES FULLY OPERATIONAL & VERIFIED! <<<"
