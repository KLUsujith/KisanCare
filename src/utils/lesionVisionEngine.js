// Computer Vision Pixel Analysis Engine for Agricultural Leaf Diagnosis

/**
 * Analyzes image pixels on an offscreen canvas to detect:
 * 1. Foliage area vs background
 * 2. Necrotic (brown/black dead tissue) lesions
 * 3. Chlorotic (yellow/pale halos) zones
 * 4. Lesion centroids, spread radii, and bounding boxes
 */
export function scanLeafPixels(imgElement, width = 400, height = 400) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
  ctx.drawImage(imgElement, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  let totalFoliagePixels = 0;
  let healthyGreenPixels = 0;
  let necroticPixels = 0;
  let chloroticPixels = 0;

  // Grid for spatial lesion clustering (20px cells)
  const cellSize = 25;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);
  const grid = Array.from({ length: rows }, () => 
    Array.from({ length: cols }, () => ({
      count: 0,
      sumX: 0,
      sumY: 0,
      maxIntensity: 0,
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity
    }))
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      if (a < 50) continue; // Skip transparent pixels

      const brightness = (r + g + b) / 3;

      // Filter out backdrop (pure white paper backdrop or pitch black margins)
      if ((r > 240 && g > 240 && b > 240) || (r < 18 && g < 18 && b < 18)) {
        continue;
      }

      totalFoliagePixels++;

      // Excess Green Index (EGI)
      const egi = 2 * g - r - b;

      // Detect Necrosis (dead fungal/bacterial/pest tissue):
      // Red > Green or brownish hue with low brightness, or dark spots on leaf
      const isDarkBrown = (r > g && r > b * 1.15 && brightness < 145);
      const isBlackSpot = (brightness < 75 && Math.abs(r - g) < 30 && b < 70);
      const isNecrotic = isDarkBrown || isBlackSpot;

      // Detect Chlorosis (Yellow halo / nutrient loss):
      // High R and G, low B (yellow tint), distinct from healthy deep green
      const isYellowHalo = (r > 125 && g > 125 && b < 95 && Math.abs(r - g) < 40 && !isNecrotic);

      if (isNecrotic) {
        necroticPixels++;
        const gx = Math.min(cols - 1, Math.floor(x / cellSize));
        const gy = Math.min(rows - 1, Math.floor(y / cellSize));
        const cell = grid[gy][gx];
        cell.count += 2;
        cell.sumX += x;
        cell.sumY += y;
        cell.minX = Math.min(cell.minX, x);
        cell.maxX = Math.max(cell.maxX, x);
        cell.minY = Math.min(cell.minY, y);
        cell.maxY = Math.max(cell.maxY, y);
        cell.maxIntensity = Math.max(cell.maxIntensity, 0.9);
      } else if (isYellowHalo) {
        chloroticPixels++;
        const gx = Math.min(cols - 1, Math.floor(x / cellSize));
        const gy = Math.min(rows - 1, Math.floor(y / cellSize));
        const cell = grid[gy][gx];
        cell.count += 1;
        cell.sumX += x;
        cell.sumY += y;
        cell.minX = Math.min(cell.minX, x);
        cell.maxX = Math.max(cell.maxX, x);
        cell.minY = Math.min(cell.minY, y);
        cell.maxY = Math.max(cell.maxY, y);
        cell.maxIntensity = Math.max(cell.maxIntensity, 0.7);
      } else if (egi > 10 && g > r && g > b) {
        healthyGreenPixels++;
      }
    }
  }

  // Prevent divide by zero if plain empty backdrop
  const validFoliage = Math.max(1, totalFoliagePixels);
  const necroticPercent = Math.round((necroticPixels / validFoliage) * 100);
  const chloroticPercent = Math.round((chloroticPixels / validFoliage) * 100);
  const healthyPercent = Math.max(0, 100 - (necroticPercent + chloroticPercent));
  const totalInfectionArea = Math.min(100, necroticPercent + chloroticPercent);

  // Extract Lesion Centroids from significant grid cells
  const candidateLesions = [];
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const cell = grid[gy][gx];
      if (cell.count >= 20) { // Threshold for cluster
        const centerX = Math.round(cell.sumX / (cell.count / (cell.maxIntensity > 0.8 ? 2 : 1)));
        const centerY = Math.round(cell.sumY / (cell.count / (cell.maxIntensity > 0.8 ? 2 : 1)));
        const spreadWidth = Math.max(15, cell.maxX - cell.minX);
        const spreadHeight = Math.max(15, cell.maxY - cell.minY);
        const radius = Math.min(65, Math.max(20, Math.round(Math.max(spreadWidth, spreadHeight) * 0.75)));

        candidateLesions.push({
          x: centerX,
          y: centerY,
          radius,
          intensity: Math.min(1.0, +(0.7 + (cell.count / 200)).toFixed(2)),
          box: {
            x: Math.max(5, cell.minX - 5),
            y: Math.max(5, cell.minY - 5),
            w: Math.min(width - 10, spreadWidth + 10),
            h: Math.min(height - 10, spreadHeight + 10)
          },
          label: cell.maxIntensity > 0.8 ? "Necrosis Core" : "Chlorosis Halo"
        });
      }
    }
  }

  // Merge nearby overlapping lesion centroids (within 45px)
  const mergedLesions = [];
  for (const c of candidateLesions) {
    const existing = mergedLesions.find(m => {
      const dx = m.x - c.x;
      const dy = m.y - c.y;
      return Math.sqrt(dx * dx + dy * dy) < 45;
    });

    if (existing) {
      existing.x = Math.round((existing.x + c.x) / 2);
      existing.y = Math.round((existing.y + c.y) / 2);
      existing.radius = Math.max(existing.radius, c.radius);
      existing.intensity = Math.max(existing.intensity, c.intensity);
    } else {
      mergedLesions.push(c);
    }
  }

  // Limit to top 5 most prominent lesion markers
  mergedLesions.sort((a, b) => b.radius * b.intensity - a.radius * a.intensity);
  const finalHeatmapPoints = mergedLesions.slice(0, 5);

  return {
    foliageAreaPixels: totalFoliagePixels,
    healthyPercent,
    necroticPercent,
    chloroticPercent,
    totalInfectionArea,
    heatmapPoints: finalHeatmapPoints,
    isHealthyLeaf: totalInfectionArea < 6 && finalHeatmapPoints.length === 0
  };
}

/**
 * Draws High-Precision Diagnostic Heatmap & Targeting Overlays on Canvas
 */
export function drawAdvancedLesionOverlays(ctx, points, mode = "heatmap", activePointIndex = null, scanLineY = -1) {
  if (!points || points.length === 0) return;

  points.forEach((point, idx) => {
    const isSelected = activePointIndex === idx;

    // 1. HEATMAP MODE: Concentric glowing radial aura
    if (mode === "heatmap" || mode === "all") {
      const gradient = ctx.createRadialGradient(point.x, point.y, 4, point.x, point.y, point.radius);
      if (point.intensity >= 0.85) {
        gradient.addColorStop(0, `rgba(239, 68, 68, ${point.intensity})`);
        gradient.addColorStop(0.4, `rgba(249, 115, 22, ${point.intensity * 0.75})`);
        gradient.addColorStop(0.8, `rgba(234, 179, 8, 0.3)`);
        gradient.addColorStop(1, "rgba(234, 179, 8, 0)");
      } else {
        gradient.addColorStop(0, `rgba(245, 158, 11, ${point.intensity})`);
        gradient.addColorStop(0.5, `rgba(234, 179, 8, ${point.intensity * 0.6})`);
        gradient.addColorStop(1, "rgba(234, 179, 8, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      ctx.fill();

      // Precision concentric contour ring
      ctx.strokeStyle = point.intensity >= 0.85 ? "#ef4444" : "#f59e0b";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.setLineDash(isSelected ? [] : [5, 3]);
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.radius * 0.75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. BOUNDING BOXES & TARGETING CROSSHAIRS
    if (mode === "boxes" || mode === "all" || isSelected) {
      const boxW = point.radius * 1.8;
      const boxH = point.radius * 1.8;
      const startX = point.x - boxW / 2;
      const startY = point.y - boxH / 2;

      ctx.strokeStyle = isSelected ? "#10b981" : "#ef4444";
      ctx.lineWidth = 1.8;
      
      // Corner brackets
      const cornerLen = Math.min(15, boxW * 0.25);
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(startX, startY + cornerLen);
      ctx.lineTo(startX, startY);
      ctx.lineTo(startX + cornerLen, startY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(startX + boxW - cornerLen, startY);
      ctx.lineTo(startX + boxW, startY);
      ctx.lineTo(startX + boxW, startY + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(startX, startY + boxH - cornerLen);
      ctx.lineTo(startX, startY + boxH);
      ctx.lineTo(startX + cornerLen, startY + boxH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(startX + boxW - cornerLen, startY + boxH);
      ctx.lineTo(startX + boxW, startY + boxH);
      ctx.lineTo(startX + boxW, startY + boxH - cornerLen);
      ctx.stroke();

      // Center Crosshair
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(point.x - 6, point.y);
      ctx.lineTo(point.x + 6, point.y);
      ctx.moveTo(point.x, point.y - 6);
      ctx.lineTo(point.x, point.y + 6);
      ctx.stroke();
    }

    // 3. Precision Lesion Tag Pill
    const tagText = `#L${idx + 1} • ${point.label || "Lesion"} (${Math.round(point.intensity * 100)}%)`;
    ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, sans-serif";
    const textWidth = ctx.measureText(tagText).width;
    const pillW = textWidth + 14;
    const pillH = 18;
    const pillX = Math.max(5, Math.min(400 - pillW - 5, point.x - pillW / 2));
    const pillY = Math.max(20, point.y - point.radius - 12);

    // Pill background
    ctx.fillStyle = isSelected ? "rgba(16, 185, 129, 0.95)" : "rgba(15, 23, 42, 0.9)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 5);
    ctx.fill();

    // Pill border
    ctx.strokeStyle = isSelected ? "#34d399" : "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tagText, pillX + pillW / 2, pillY + pillH / 2);
  });

  // 4. ANIMATED LASER SCANNER LINE
  if (scanLineY >= 0 && scanLineY <= 400) {
    const scanGrad = ctx.createLinearGradient(0, scanLineY - 25, 0, scanLineY);
    scanGrad.addColorStop(0, "rgba(16, 185, 129, 0)");
    scanGrad.addColorStop(1, "rgba(16, 185, 129, 0.35)");
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanLineY - 25, 400, 25);

    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, scanLineY);
    ctx.lineTo(400, scanLineY);
    ctx.stroke();

    // Laser glow beam
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, scanLineY);
    ctx.lineTo(400, scanLineY);
    ctx.stroke();
  }
}
