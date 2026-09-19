$ErrorActionPreference = "Stop"

Write-Host "=== TEST 1: Health Check ==="
$health = Invoke-RestMethod -Uri "http://localhost:5001/api/health"
Write-Host "Health Status:" $health.status "Platform:" $health.platform

Write-Host "`n=== TEST 2: AI Diagnosis for Tomato Early Blight ==="
$diag1 = Invoke-RestMethod -Uri "http://localhost:5001/api/diagnose" -Method Post -Body (@{ sampleId = "tomato-early-blight" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Tomato Diagnosis:" $diag1.diagnosis.diseaseName "Severity:" $diag1.diagnosis.severityScore "% Heatmap points:" $diag1.diagnosis.heatmapPoints.Count

Write-Host "`n=== TEST 3: AI Diagnosis for Cotton Pink Bollworm ==="
$diag2 = Invoke-RestMethod -Uri "http://localhost:5001/api/diagnose" -Method Post -Body (@{ sampleId = "cotton-pink-bollworm" } | ConvertTo-Json) -ContentType "application/json"
Write-Host "Cotton Diagnosis:" $diag2.diagnosis.diseaseName "Pathogen:" $diag2.diagnosis.pathogen

Write-Host "`n=== TEST 4: Mandi Live Prices & Best Mandi Recommender ==="
$mandi = Invoke-RestMethod -Uri "http://localhost:5001/api/mandi-prices?crop=Tomato"
Write-Host "Tomato Mandis Found:" $mandi.totalRecords "Highest Paying:" $mandi.highestPriceMandi.mandiName "Price: Rs" $mandi.highestPriceMandi.modalPrice

Write-Host "`n=== TEST 5: Create Direct Farmer Produce Listing ==="
$newListingBody = @{
    farmerName = "Suresh Balaji Jadhav"
    phone = "9822998877"
    village = "Dindori"
    district = "Nashik"
    state = "Maharashtra"
    crop = "Tomato"
    variety = "Vaishali Hybrid"
    quantityQuintals = 40
    expectedPricePerQuintal = 2350
    harvestDate = "Harvesting tomorrow"
    isOrganic = $true
    grade = "Grade A Export"
    description = "Pesticide residue free tomatoes grown with organic compost."
} | ConvertTo-Json
$listingRes = Invoke-RestMethod -Uri "http://localhost:5001/api/listings" -Method Post -Body $newListingBody -ContentType "application/json"
Write-Host "Listing Created:" $listingRes.success "ID:" $listingRes.listing.id

Write-Host "`n=== TEST 6: Buyer Price Bid Submission ==="
$bidBody = @{
    buyerName = "Sahyadri Agro Hub"
    buyerPhone = "9822012345"
    bidPricePerQuintal = 2380
} | ConvertTo-Json
$bidRes = Invoke-RestMethod -Uri "http://localhost:5001/api/listings/$($listingRes.listing.id)/inquiry" -Method Post -Body $bidBody -ContentType "application/json"
Write-Host "Bid Registered:" $bidRes.success "New Highest Bid: Rs" $bidRes.listing.highestBid

Write-Host "`n=== TEST 7: Cold Storage Directory & Reservation ==="
$cold = Invoke-RestMethod -Uri "http://localhost:5001/api/cold-storage"
Write-Host "Cold Storages Found:" $cold.count "First Facility:" $cold.facilities[0].name
$bookBody = @{
    facilityId = $cold.facilities[0].id
    farmerName = "Suresh Jadhav"
    phone = "9822998877"
    crop = "Potato"
    bagsCount = 150
    storageDurationMonths = 2
} | ConvertTo-Json
$bookRes = Invoke-RestMethod -Uri "http://localhost:5001/api/cold-storage/book" -Method Post -Body $bookBody -ContentType "application/json"
Write-Host "Storage Booking:" $bookRes.bookingId "Estimated Total Cost: Rs" $bookRes.estimatedCost

Write-Host "`n=== TEST 8: Rural Logistics & Freight Calculator with Shared Pooling ==="
$freightBody = @{
    distanceKm = 45
    weightQuintals = 20
    vehicleType = "mini"
    useSharedPool = $true
} | ConvertTo-Json
$freightRes = Invoke-RestMethod -Uri "http://localhost:5001/api/logistics/estimate" -Method Post -Body $freightBody -ContentType "application/json"
Write-Host "Estimated Freight: Rs" $freightRes.estimatedFreight "Shared Pool Savings: Rs" $freightRes.sharedPoolSavings "Cost/Qtl: Rs" $freightRes.costPerQuintal

Write-Host "`n=== TEST 9: Market Intelligence & Disease Outbreak Surveillance ==="
$analytics = Invoke-RestMethod -Uri "http://localhost:5001/api/analytics"
Write-Host "Farmers Registered:" $analytics.stats.activeFarmersRegistered "Outbreak Alerts:" $analytics.regionalOutbreakAlerts.Count

Write-Host "`n>>> ALL 9 TESTS PASSED SUCCESSFULLY! <<<"
