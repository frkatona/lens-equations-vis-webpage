const FOCAL_LENGTH_MIN_MM = 6;
const FOCAL_LENGTH_MAX_MM = 400;
const F_NUMBER_MIN = 1.2;
const F_NUMBER_MAX = 32;
const COC_MIN_MM = 0.003;
const COC_MAX_MM = 0.05;
const DISTANCE_MAX_METERS = 100;
const SAMPLE_COUNT = 220;
const BLUR_SAMPLE_COUNT = 260;
const DISTANCE_MARGIN_METERS = 0.02;
const DISTANCE_FLOOR_METERS = 0.1;
const BAR_SCALE_LIMITS = Object.freeze({
  imageDistanceMm: { min: 4, max: 10000 },
  magnificationAbs: { min: 0.0001, max: 30 },
  apertureDiameterMm: { min: 0.18, max: 250 },
  probeBlurMm: { min: 0.001, max: 250 },
  totalDofMm: { min: 0.1, max: 100000 },
  hyperfocalMm: { min: 10, max: 20000000 },
});
const DISPLAY_STORAGE_KEY = "lens-equations-display";
const DISPLAY_THEMES = ["sand", "slate", "forest", "midnight", "ember", "aurora"];
const DISPLAY_DEFAULTS = Object.freeze({
  theme: "sand",
  verbose: false,
  transparency: 20,
  width: 1320,
  blur: 18,
  radius: 26,
});

const presets = {
  portrait: { focalLength: 85, focusDistance: 2, fNumber: 2, coc: 0.03, probeDistance: 3 },
  macro: { focalLength: 100, focusDistance: 0.6, fNumber: 4, coc: 0.02, probeDistance: 0.72 },
  landscape: { focalLength: 24, focusDistance: 5, fNumber: 11, coc: 0.03, probeDistance: 15 },
  sports: { focalLength: 200, focusDistance: 20, fNumber: 2.8, coc: 0.03, probeDistance: 32 },
  phone: { focalLength: 6, focusDistance: 1.2, fNumber: 1.8, coc: 0.008, probeDistance: 2.4 },
};

const state = { ...presets.portrait };
const displayState = { ...DISPLAY_DEFAULTS };

const elements = {
  displayMenuToggle: document.getElementById("displayMenuToggle"),
  displayMenuClose: document.getElementById("displayMenuClose"),
  displayScrim: document.getElementById("displayScrim"),
  displayDrawer: document.getElementById("displayDrawer"),
  verboseToggle: document.getElementById("verboseToggle"),
  transparencyRange: document.getElementById("transparencyRange"),
  transparencyDisplay: document.getElementById("transparencyDisplay"),
  contentWidthRange: document.getElementById("contentWidthRange"),
  contentWidthDisplay: document.getElementById("contentWidthDisplay"),
  blurStrengthRange: document.getElementById("blurStrengthRange"),
  blurStrengthDisplay: document.getElementById("blurStrengthDisplay"),
  radiusRange: document.getElementById("radiusRange"),
  radiusDisplay: document.getElementById("radiusDisplay"),
  resetDisplayButton: document.getElementById("resetDisplayButton"),
  focalLengthRange: document.getElementById("focalLengthRange"),
  focalLengthNumber: document.getElementById("focalLengthNumber"),
  focalLengthDisplay: document.getElementById("focalLengthDisplay"),
  sensorDistanceRange: document.getElementById("sensorDistanceRange"),
  sensorDistanceNumber: document.getElementById("sensorDistanceNumber"),
  sensorDistanceDisplay: document.getElementById("sensorDistanceDisplay"),
  focusDistanceRange: document.getElementById("focusDistanceRange"),
  focusDistanceNumber: document.getElementById("focusDistanceNumber"),
  focusDistanceDisplay: document.getElementById("focusDistanceDisplay"),
  fNumberRange: document.getElementById("fNumberRange"),
  fNumberNumber: document.getElementById("fNumberNumber"),
  fNumberDisplay: document.getElementById("fNumberDisplay"),
  cocRange: document.getElementById("cocRange"),
  cocNumber: document.getElementById("cocNumber"),
  cocDisplay: document.getElementById("cocDisplay"),
  probeDistanceRange: document.getElementById("probeDistanceRange"),
  probeDistanceNumber: document.getElementById("probeDistanceNumber"),
  probeDistanceDisplay: document.getElementById("probeDistanceDisplay"),
  nearDofValue: document.getElementById("nearDofValue"),
  farDofValue: document.getElementById("farDofValue"),
  totalDofValue: document.getElementById("totalDofValue"),
  imageDistanceBarValue: document.getElementById("imageDistanceBarValue"),
  imageDistanceBar: document.getElementById("imageDistanceBar"),
  imageDistanceNote: document.getElementById("imageDistanceNote"),
  magnificationBarValue: document.getElementById("magnificationBarValue"),
  magnificationBar: document.getElementById("magnificationBar"),
  magnificationNote: document.getElementById("magnificationNote"),
  apertureBarValue: document.getElementById("apertureBarValue"),
  apertureBar: document.getElementById("apertureBar"),
  apertureNote: document.getElementById("apertureNote"),
  probeBlurBarValue: document.getElementById("probeBlurBarValue"),
  probeBlurBar: document.getElementById("probeBlurBar"),
  probeBlurNote: document.getElementById("probeBlurNote"),
  probeBlurThreshold: document.getElementById("probeBlurThreshold"),
  totalDofBarValue: document.getElementById("totalDofBarValue"),
  totalDofBar: document.getElementById("totalDofBar"),
  totalDofNote: document.getElementById("totalDofNote"),
  hyperfocalBarValue: document.getElementById("hyperfocalBarValue"),
  hyperfocalBar: document.getElementById("hyperfocalBar"),
  hyperfocalNote: document.getElementById("hyperfocalNote"),
  summaryText: document.getElementById("summaryText"),
  zoomStateLabel: document.getElementById("zoomStateLabel"),
  zoomFocalValue: document.getElementById("zoomFocalValue"),
  zoomFieldText: document.getElementById("zoomFieldText"),
  zoomSensorLabel: document.getElementById("zoomSensorLabel"),
  zoomFrontGroup: document.getElementById("zoomFrontGroup"),
  zoomMiddleGroup: document.getElementById("zoomMiddleGroup"),
  zoomRearGroup: document.getElementById("zoomRearGroup"),
  zoomIris: document.getElementById("zoomIris"),
  zoomLensPlane: document.getElementById("zoomLensPlane"),
  zoomSensorPlane: document.getElementById("zoomSensorPlane"),
  zoomSensorDistanceGuideStart: document.getElementById("zoomSensorDistanceGuideStart"),
  zoomSensorDistanceGuideEnd: document.getElementById("zoomSensorDistanceGuideEnd"),
  zoomSensorDistanceLine: document.getElementById("zoomSensorDistanceLine"),
  zoomSensorDistanceStartTick: document.getElementById("zoomSensorDistanceStartTick"),
  zoomSensorDistanceEndTick: document.getElementById("zoomSensorDistanceEndTick"),
  zoomSensorDistanceText: document.getElementById("zoomSensorDistanceText"),
  zoomProbeBlurDisc: document.getElementById("zoomProbeBlurDisc"),
  zoomCocRing: document.getElementById("zoomCocRing"),
  zoomFieldCone: document.getElementById("zoomFieldCone"),
  zoomRayTop: document.getElementById("zoomRayTop"),
  zoomRayMid: document.getElementById("zoomRayMid"),
  zoomRayBottom: document.getElementById("zoomRayBottom"),
  zoomLensDemo: document.getElementById("zoomLensDemo"),
  zoomScaleFill: document.getElementById("zoomScaleFill"),
  zoomScaleThumb: document.getElementById("zoomScaleThumb"),
  imageChart: document.getElementById("imageChart"),
  magnificationChart: document.getElementById("magnificationChart"),
  blurChart: document.getElementById("blurChart"),
  presetButtons: Array.from(document.querySelectorAll("[data-preset]")),
  themeButtons: Array.from(document.querySelectorAll("[data-theme-option]")),
};

const helpTargets = {
  themeGroup: document.querySelector(".theme-grid"),
  transparencyGroup: elements.transparencyRange.closest(".drawer-group"),
  contentWidthGroup: elements.contentWidthRange.closest(".drawer-group"),
  blurGroup: elements.blurStrengthRange.closest(".drawer-group"),
  radiusGroup: elements.radiusRange.closest(".drawer-group"),
  focalLengthControl: elements.focalLengthRange.closest(".control"),
  sensorDistanceControl: elements.sensorDistanceRange.closest(".control"),
  focusDistanceControl: elements.focusDistanceRange.closest(".control"),
  fNumberControl: elements.fNumberRange.closest(".control"),
  cocControl: elements.cocRange.closest(".control"),
  probeDistanceControl: elements.probeDistanceRange.closest(".control"),
  summaryText: elements.summaryText,
  nearDofPill: elements.nearDofValue.closest(".quick-pill"),
  farDofPill: elements.farDofValue.closest(".quick-pill"),
  totalDofPill: elements.totalDofValue.closest(".quick-pill"),
  imageDistanceBar: elements.imageDistanceBarValue.closest(".bar-column"),
  magnificationBar: elements.magnificationBarValue.closest(".bar-column"),
  apertureBar: elements.apertureBarValue.closest(".bar-column"),
  probeBlurBar: elements.probeBlurBarValue.closest(".bar-column"),
  totalDofBar: elements.totalDofBarValue.closest(".bar-column"),
  hyperfocalBar: elements.hyperfocalBarValue.closest(".bar-column"),
  zoomDemoCard: document.querySelector(".zoom-demo-card"),
  imageChartCard: elements.imageChart.closest(".chart-card"),
  magnificationChartCard: elements.magnificationChart.closest(".chart-card"),
  blurChartCard: elements.blurChart.closest(".chart-card"),
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function quantize(value, step = 1) {
  return Math.round(value / step) * step;
}

function rgbaTuple(rgbTuple, alpha) {
  return `rgba(${rgbTuple}, ${alpha})`;
}

function hexToRgba(hex, alpha = 1) {
  const normalized = hex.trim().replace("#", "");
  if (normalized.length !== 3 && normalized.length !== 6) {
    return hex;
  }
  const expanded = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized;
  const r = Number.parseInt(expanded.slice(0, 2), 16);
  const g = Number.parseInt(expanded.slice(2, 4), 16);
  const b = Number.parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function readVisualPalette() {
  const styles = getComputedStyle(document.body);
  return {
    ink: styles.getPropertyValue("--ink").trim() || "#1b2a32",
    muted: styles.getPropertyValue("--muted").trim() || "#56646b",
    teal: styles.getPropertyValue("--teal").trim() || "#1b7176",
    amber: styles.getPropertyValue("--amber").trim() || "#c26a2c",
    rust: styles.getPropertyValue("--rust").trim() || "#8c3f19",
    panelRgb: styles.getPropertyValue("--panel-rgb").trim() || "255, 251, 245",
    surfaceRgb: styles.getPropertyValue("--surface-rgb").trim() || "255, 255, 255",
    track: styles.getPropertyValue("--track").trim() || "rgba(27, 42, 50, 0.09)",
  };
}

function helpText(...lines) {
  return lines.join("\n");
}

function setHelp(targets, text) {
  const list = Array.isArray(targets) ? targets : [targets];
  list.filter(Boolean).forEach((target) => {
    target.classList.add("has-help");
    target.setAttribute("title", text);
  });
}

function distanceMinMetersForFocalLength(focalLengthMm) {
  return Math.max(DISTANCE_FLOOR_METERS, focalLengthMm / 1000 + DISTANCE_MARGIN_METERS);
}

function distanceMinMeters() {
  return distanceMinMetersForFocalLength(state.focalLength);
}

function mapLogSlider(sliderValue, min, max) {
  const t = clamp(sliderValue, 0, 1000) / 1000;
  return min * Math.pow(max / min, t);
}

function unmapLogSlider(value, min, max) {
  if (value <= min) {
    return 0;
  }
  if (value >= max) {
    return 1000;
  }
  return (Math.log(value / min) / Math.log(max / min)) * 1000;
}

function imageDistanceMm(focalLengthMm, subjectDistanceMm) {
  if (subjectDistanceMm <= focalLengthMm) {
    return Number.POSITIVE_INFINITY;
  }
  return (focalLengthMm * subjectDistanceMm) / (subjectDistanceMm - focalLengthMm);
}

function subjectDistanceMmFromImageDistanceMm(focalLengthMm, imageDistanceMmValue) {
  if (imageDistanceMmValue <= focalLengthMm) {
    return Number.POSITIVE_INFINITY;
  }
  return (focalLengthMm * imageDistanceMmValue) / (imageDistanceMmValue - focalLengthMm);
}

function magnification(focalLengthMm, subjectDistanceMm) {
  return -imageDistanceMm(focalLengthMm, subjectDistanceMm) / subjectDistanceMm;
}

function apertureDiameterMm(focalLengthMm, fNumber) {
  return focalLengthMm / fNumber;
}

function blurDiameterMm(focalLengthMm, fNumber, focusDistanceMm, subjectDistanceMm) {
  const focusImageDistance = imageDistanceMm(focalLengthMm, focusDistanceMm);
  const subjectImageDistance = imageDistanceMm(focalLengthMm, subjectDistanceMm);
  const aperture = apertureDiameterMm(focalLengthMm, fNumber);
  if (!Number.isFinite(focusImageDistance) || !Number.isFinite(subjectImageDistance)) {
    return Number.POSITIVE_INFINITY;
  }
  return aperture * Math.abs(focusImageDistance - subjectImageDistance) / subjectImageDistance;
}

function hyperfocalMm(focalLengthMm, fNumber, cocMm) {
  return (focalLengthMm * focalLengthMm) / (fNumber * cocMm) + focalLengthMm;
}

function depthOfFieldMm(focalLengthMm, fNumber, cocMm, focusDistanceMm) {
  const hyperfocal = hyperfocalMm(focalLengthMm, fNumber, cocMm);
  const near = (hyperfocal * focusDistanceMm) / (hyperfocal + (focusDistanceMm - focalLengthMm));
  const farDenominator = hyperfocal - (focusDistanceMm - focalLengthMm);
  const far = farDenominator <= 0 ? Number.POSITIVE_INFINITY : (hyperfocal * focusDistanceMm) / farDenominator;
  return { hyperfocal, near, far, total: Number.isFinite(far) ? far - near : Number.POSITIVE_INFINITY };
}

function formatDistanceMeters(meters) {
  if (!Number.isFinite(meters)) {
    return "Infinity";
  }
  if (meters < 1) {
    return `${(meters * 100).toFixed(1)} cm`;
  }
  if (meters < 10) {
    return `${meters.toFixed(2)} m`;
  }
  return `${meters.toFixed(1)} m`;
}

function formatMillimeters(mm) {
  if (!Number.isFinite(mm)) {
    return "Infinity";
  }
  if (Math.abs(mm) < 0.1) {
    return `${mm.toFixed(3)} mm`;
  }
  if (Math.abs(mm) < 10) {
    return `${mm.toFixed(2)} mm`;
  }
  return `${mm.toFixed(1)} mm`;
}

function formatMagnification(value) {
  const precision = Math.abs(value) < 0.1 ? 3 : 2;
  return `${value.toFixed(precision)}x`;
}

function formatFNumber(value) {
  return `f/${value.toFixed(1)}`;
}

function formatPixels(value) {
  return `${value.toFixed(0)} px`;
}

function formatInputMillimeters(value) {
  if (Math.abs(value) < 10) {
    return value.toFixed(3);
  }
  if (Math.abs(value) < 100) {
    return value.toFixed(2);
  }
  return value.toFixed(1);
}

function formatRatioMagnitude(value) {
  return `${Math.abs(value).toFixed(Math.abs(value) < 0.1 ? 3 : 2)}x`;
}

function formatScaleRatio(value) {
  const magnitude = Math.abs(value);
  const precision = magnitude < 0.01 ? 4 : magnitude < 0.1 ? 3 : magnitude < 1 ? 2 : 1;
  return `${magnitude.toFixed(precision)}x`;
}

function formatRatio(value) {
  if (!Number.isFinite(value)) {
    return "Infinity";
  }
  return `${value.toFixed(value < 10 ? 2 : 1)}x`;
}

function niceStep(min, max, tickCount) {
  const span = Math.max(max - min, Number.EPSILON);
  const raw = span / Math.max(tickCount, 2);
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / power;
  if (normalized < 1.5) {
    return power;
  }
  if (normalized < 3) {
    return 2 * power;
  }
  if (normalized < 7) {
    return 5 * power;
  }
  return 10 * power;
}

function makeLinearTicks(min, max, tickCount = 5) {
  const step = niceStep(min, max, tickCount);
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let value = start; value <= max + step * 0.5; value += step) {
    ticks.push(Number.parseFloat(value.toFixed(10)));
  }
  if (ticks.length < 2) {
    return Array.from(new Set([min, max].map((value) => Number.parseFloat(value.toFixed(10))))).sort((a, b) => a - b);
  }
  return ticks;
}

function makeDistanceTicks(min, max, targetCount = 5) {
  if (max / min < 1.8) {
    return makeLinearTicks(min, max, targetCount - 1);
  }
  const ticks = [];
  const minPower = Math.floor(Math.log10(min));
  const maxPower = Math.ceil(Math.log10(max));
  const multipliers = [1, 2, 5];
  for (let power = minPower - 1; power <= maxPower + 1; power += 1) {
    const base = Math.pow(10, power);
    multipliers.forEach((multiplier) => {
      const value = multiplier * base;
      if (value >= min && value <= max) {
        ticks.push(value);
      }
    });
  }
  const filtered = ticks.filter((value, index, list) => index === 0 || value / list[index - 1] > 1.28);
  if (filtered.length >= 3) {
    return filtered;
  }
  const geometricTicks = [];
  for (let index = 0; index < targetCount; index += 1) {
    const t = targetCount === 1 ? 0 : index / (targetCount - 1);
    geometricTicks.push(min * Math.pow(max / min, t));
  }
  return geometricTicks.map((value) => Number.parseFloat(value.toFixed(10)));
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = clamp(Math.floor(ratio * (sorted.length - 1)), 0, sorted.length - 1);
  return sorted[index];
}

function prepareCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(10, Math.round(rect.width * dpr));
  const height = Math.max(10, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}

function chartFrameBox(width, height) {
  const left = 94;
  const right = 18;
  const top = 18;
  const bottom = 56;
  return {
    left,
    right,
    top,
    bottom,
    plotWidth: Math.max(width - left - right, 10),
    plotHeight: Math.max(height - top - bottom, 10),
  };
}

function filterTicksBySpacing(ticks, mapTick, minSpacing) {
  if (ticks.length <= 2) {
    return ticks;
  }
  const filtered = [];
  let lastPx = Number.NaN;
  ticks.forEach((tick) => {
    const px = mapTick(tick);
    if (!filtered.length || Math.abs(px - lastPx) >= minSpacing) {
      filtered.push(tick);
      lastPx = px;
    }
  });
  const lastTick = ticks[ticks.length - 1];
  if (filtered[filtered.length - 1] !== lastTick) {
    const lastPx = mapTick(lastTick);
    const priorPx = mapTick(filtered[filtered.length - 1]);
    if (Math.abs(lastPx - priorPx) >= minSpacing * 0.7) {
      filtered.push(lastTick);
    }
  }
  return filtered;
}

function normalizeRange(value, min, max) {
  if (!Number.isFinite(value) || max <= min) {
    return 1;
  }
  return clamp((value - min) / (max - min), 0, 1);
}

function sensorDistanceBoundsMm(focalLengthMm) {
  const minFocusDistanceMm = distanceMinMetersForFocalLength(focalLengthMm) * 1000;
  return {
    min: imageDistanceMm(focalLengthMm, DISTANCE_MAX_METERS * 1000),
    max: imageDistanceMm(focalLengthMm, minFocusDistanceMm),
  };
}

function scaleLogBar(value, min, max) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  if (value <= 0 || min <= 0 || max <= min) {
    return 0;
  }
  const clampedValue = clamp(value, min, max);
  return normalizeRange(Math.log10(clampedValue), Math.log10(min), Math.log10(max));
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPanelBackground(ctx, width, height, palette) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, rgbaTuple(palette.surfaceRgb, 0.86));
  gradient.addColorStop(1, rgbaTuple(palette.panelRgb, 0.9));
  roundRectPath(ctx, 0, 0, width, height, 18);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = hexToRgba(palette.ink, 0.08);
  ctx.stroke();
}

function drawChartFrame(ctx, width, height, yTicks, xTicks, mapX, mapY, yFormatter, xFormatter, yLabel, palette, xLabel = "s") {
  const { left, right, top, bottom, plotWidth, plotHeight } = chartFrameBox(width, height);
  const visibleXTicks = filterTicksBySpacing(xTicks, mapX, 62);
  const visibleYTicks = filterTicksBySpacing(yTicks, mapY, 28);
  drawPanelBackground(ctx, width, height, palette);
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, plotWidth, plotHeight);
  ctx.clip();
  visibleYTicks.forEach((tick) => {
    const y = mapY(tick);
    ctx.strokeStyle = hexToRgba(palette.ink, 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
  });
  visibleXTicks.forEach((tick) => {
    const x = mapX(tick);
    ctx.strokeStyle = hexToRgba(palette.ink, 0.06);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, height - bottom);
    ctx.stroke();
  });
  ctx.restore();
  ctx.strokeStyle = hexToRgba(palette.ink, 0.28);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, height - bottom);
  ctx.lineTo(width - right, height - bottom);
  ctx.stroke();
  ctx.fillStyle = palette.muted;
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  visibleYTicks.forEach((tick) => ctx.fillText(yFormatter(tick), left - 16, mapY(tick)));
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  visibleXTicks.forEach((tick) => ctx.fillText(xFormatter(tick), mapX(tick), height - bottom + 10));
  ctx.save();
  ctx.translate(14, top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '11px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(xLabel, left + plotWidth / 2, height - 12);
  return { left, right, top, bottom, plotWidth, plotHeight };
}

function drawSeries(ctx, points, mapX, mapY, color, width = 2.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  let moved = false;
  points.forEach((point) => {
    if (!Number.isFinite(point.y)) {
      return;
    }
    const x = mapX(point.x);
    const y = mapY(point.y);
    if (!moved) {
      ctx.moveTo(x, y);
      moved = true;
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function drawMarker(ctx, x, y, label, color, align = "top") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = align === "top" ? "bottom" : "top";
  ctx.fillText(label, x + 10, y + (align === "top" ? -8 : 8));
  ctx.restore();
}

function drawImageChart(metrics) {
  const { ctx, width, height } = prepareCanvas(elements.imageChart);
  const palette = readVisualPalette();
  const minDistance = distanceMinMeters();
  const maxDistance = DISTANCE_MAX_METERS;
  const frame = chartFrameBox(width, height);
  const points = [];
  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const t = index / (SAMPLE_COUNT - 1);
    const distanceMeters = minDistance * Math.pow(maxDistance / minDistance, t);
    points.push({ x: distanceMeters, y: imageDistanceMm(metrics.focalLengthMm, distanceMeters * 1000) });
  }
  const yMax = Math.max(...points.map((point) => point.y).filter((value) => Number.isFinite(value)));
  const yMin = metrics.focalLengthMm * 0.92;
  const xTicks = makeDistanceTicks(minDistance, maxDistance);
  const yTicks = makeLinearTicks(yMin, yMax, 5);
  const xToPx = (value) => {
    const position = Math.log(value / minDistance) / Math.log(maxDistance / minDistance);
    return frame.left + position * frame.plotWidth;
  };
  const yToPx = (value) => {
    return height - frame.bottom - ((value - yMin) / (yMax - yMin || 1)) * frame.plotHeight;
  };
  drawChartFrame(ctx, width, height, yTicks, xTicks, xToPx, yToPx, (tick) => `${tick.toFixed(tick < 100 ? 1 : 0)} mm`, (tick) => formatDistanceMeters(tick), "s'", palette, "s");
  drawSeries(ctx, points, xToPx, yToPx, palette.amber, 3);
  drawMarker(ctx, xToPx(metrics.focusDistanceMeters), yToPx(metrics.imageDistanceMm), "focus", palette.teal, "top");
}

function drawMagnificationChart(metrics) {
  const { ctx, width, height } = prepareCanvas(elements.magnificationChart);
  const palette = readVisualPalette();
  const minDistance = distanceMinMeters();
  const maxDistance = DISTANCE_MAX_METERS;
  const frame = chartFrameBox(width, height);
  const points = [];
  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const t = index / (SAMPLE_COUNT - 1);
    const distanceMeters = minDistance * Math.pow(maxDistance / minDistance, t);
    points.push({ x: distanceMeters, y: Math.abs(magnification(metrics.focalLengthMm, distanceMeters * 1000)) });
  }
  const maxMagnitude = Math.max(...points.map((point) => point.y));
  const yMin = 0;
  const yMax = maxMagnitude * 1.04;
  const xTicks = makeDistanceTicks(minDistance, maxDistance);
  const yTicks = makeLinearTicks(yMin, yMax, 5);
  const xToPx = (value) => {
    const position = Math.log(value / minDistance) / Math.log(maxDistance / minDistance);
    return frame.left + position * frame.plotWidth;
  };
  const yToPx = (value) => {
    return height - frame.bottom - ((value - yMin) / (yMax - yMin || 1)) * frame.plotHeight;
  };
  drawChartFrame(ctx, width, height, yTicks, xTicks, xToPx, yToPx, (tick) => `${tick.toFixed(tick < 1 ? 2 : 1)}x`, (tick) => formatDistanceMeters(tick), "|m|", palette, "s");
  drawSeries(ctx, points, xToPx, yToPx, palette.teal, 3);
  drawMarker(ctx, xToPx(metrics.focusDistanceMeters), yToPx(Math.abs(metrics.magnification)), "focus", palette.amber, "top");
}

function drawBlurChart(metrics) {
  const { ctx, width, height } = prepareCanvas(elements.blurChart);
  const palette = readVisualPalette();
  const baseMin = distanceMinMeters();
  const nearBound = Number.isFinite(metrics.nearDofMeters) ? Math.max(baseMin, metrics.nearDofMeters * 0.82) : Math.max(baseMin, metrics.focusDistanceMeters * 0.7);
  const farBound = Number.isFinite(metrics.farDofMeters) ? Math.min(DISTANCE_MAX_METERS, Math.max(metrics.farDofMeters * 1.18, metrics.focusDistanceMeters * 1.25)) : Math.min(DISTANCE_MAX_METERS, metrics.focusDistanceMeters * 4);
  const probeMinBound = Math.min(metrics.focusDistanceMeters, metrics.probeDistanceMeters) * 0.82;
  const probeMaxBound = Math.max(metrics.focusDistanceMeters, metrics.probeDistanceMeters) * 1.18;
  const minDistance = Math.max(baseMin, Math.min(nearBound, probeMinBound));
  const maxDistance = Math.min(DISTANCE_MAX_METERS, Math.max(farBound, probeMaxBound, minDistance * 1.6));
  const layout = chartFrameBox(width, height);
  const points = [];
  for (let index = 0; index < BLUR_SAMPLE_COUNT; index += 1) {
    const t = index / (BLUR_SAMPLE_COUNT - 1);
    const distanceMeters = minDistance * Math.pow(maxDistance / minDistance, t);
    points.push({
      x: distanceMeters,
      y: blurDiameterMm(metrics.focalLengthMm, metrics.fNumber, metrics.focusDistanceMm, distanceMeters * 1000),
    });
  }
  const finiteBlurs = points.map((point) => point.y).filter((value) => Number.isFinite(value));
  const maxBlur = Math.max(metrics.cocMm * 6, metrics.probeBlurMm * 1.15, percentile(finiteBlurs, 0.88));
  const yMin = 0;
  const yMax = maxBlur * 1.05;
  const xTicks = makeDistanceTicks(minDistance, maxDistance);
  const yTicks = makeLinearTicks(yMin, yMax, 5);
  const xToPx = (value) => {
    const position = Math.log(value / minDistance) / Math.log(maxDistance / minDistance);
    return layout.left + position * layout.plotWidth;
  };
  const yToPx = (value) => {
    return height - layout.bottom - ((value - yMin) / (yMax - yMin || 1)) * layout.plotHeight;
  };
  const frame = drawChartFrame(ctx, width, height, yTicks, xTicks, xToPx, yToPx, (tick) => `${tick.toFixed(tick < 0.1 ? 3 : 2)} mm`, (tick) => formatDistanceMeters(tick), "c(z)", palette, "s");
  ctx.save();
  ctx.beginPath();
  ctx.rect(frame.left, frame.top, frame.plotWidth, frame.plotHeight);
  ctx.clip();
  const shadeStart = Math.max(minDistance, metrics.nearDofMeters);
  const shadeEnd = Number.isFinite(metrics.farDofMeters) ? Math.min(maxDistance, metrics.farDofMeters) : maxDistance;
  if (shadeEnd > shadeStart) {
    ctx.fillStyle = hexToRgba(palette.teal, 0.12);
    ctx.fillRect(xToPx(shadeStart), frame.top, xToPx(shadeEnd) - xToPx(shadeStart), frame.plotHeight);
  }
  const thresholdY = yToPx(metrics.cocMm);
  ctx.strokeStyle = hexToRgba(palette.amber, 0.9);
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(frame.left, thresholdY);
  ctx.lineTo(width - frame.right, thresholdY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawSeries(ctx, points, xToPx, yToPx, palette.teal, 3);
  ctx.restore();
  drawMarker(ctx, xToPx(metrics.focusDistanceMeters), yToPx(0), "focus", palette.amber, "top");
  drawMarker(ctx, xToPx(clamp(metrics.probeDistanceMeters, minDistance, maxDistance)), yToPx(Math.min(metrics.probeBlurMm, yMax)), "probe", palette.rust, "bottom");
  ctx.fillStyle = palette.amber;
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText("CoC threshold", frame.left + 10, thresholdY - 8);
}

function setBarWidth(element, ratio) {
  element.style.width = `${(clamp(ratio, 0, 1) * 100).toFixed(1)}%`;
}

function setBarHeight(element, ratio) {
  element.style.height = `${(clamp(ratio, 0, 1) * 100).toFixed(1)}%`;
}

function setMarkerLeft(element, ratio) {
  element.style.left = `${(clamp(ratio, 0, 1) * 100).toFixed(1)}%`;
}

function setMarkerBottom(element, ratio) {
  element.style.bottom = `${(clamp(ratio, 0, 1) * 100).toFixed(1)}%`;
}

function svgPath(points, close = false) {
  if (points.length === 0) {
    return "";
  }
  const segments = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  return `${segments.join(" ")}${close ? " Z" : ""}`;
}

function normalizeZoom(focalLengthMm) {
  const min = FOCAL_LENGTH_MIN_MM;
  const max = FOCAL_LENGTH_MAX_MM;
  return clamp((Math.log(focalLengthMm) - Math.log(min)) / (Math.log(max) - Math.log(min)), 0, 1);
}

function mapDemoRadiusMm(valueMm, maxValueMm, minRadiusPx, maxRadiusPx) {
  if (!Number.isFinite(valueMm) || valueMm <= 0) {
    return minRadiusPx;
  }
  const floor = 0.003;
  const ceiling = Math.max(maxValueMm, floor * 2);
  const position = Math.log10(1 + valueMm / floor) / Math.log10(1 + ceiling / floor);
  return minRadiusPx + position * (maxRadiusPx - minRadiusPx);
}

function zoomDescriptor(focalLengthMm) {
  if (focalLengthMm < 24) {
    return "Wide coverage";
  }
  if (focalLengthMm < 50) {
    return "General view";
  }
  if (focalLengthMm < 100) {
    return "Portrait reach";
  }
  return "Tele compression";
}

function updateOutputBars(metrics) {
  const imageDistanceScale = BAR_SCALE_LIMITS.imageDistanceMm;
  const magnificationScale = BAR_SCALE_LIMITS.magnificationAbs;
  const apertureScale = BAR_SCALE_LIMITS.apertureDiameterMm;
  const probeBlurScale = BAR_SCALE_LIMITS.probeBlurMm;
  const totalDofScale = BAR_SCALE_LIMITS.totalDofMm;
  const hyperfocalScale = BAR_SCALE_LIMITS.hyperfocalMm;

  elements.imageDistanceBarValue.textContent = formatMillimeters(metrics.imageDistanceMm);
  setBarHeight(elements.imageDistanceBar, scaleLogBar(metrics.imageDistanceMm, imageDistanceScale.min, imageDistanceScale.max));
  elements.imageDistanceNote.textContent = `fixed log ${formatMillimeters(imageDistanceScale.min)} to ${formatMillimeters(imageDistanceScale.max)}`;

  elements.magnificationBarValue.textContent = formatMagnification(metrics.magnification);
  setBarHeight(elements.magnificationBar, scaleLogBar(Math.abs(metrics.magnification), magnificationScale.min, magnificationScale.max));
  elements.magnificationNote.textContent = `fixed log |m| ${formatScaleRatio(magnificationScale.min)} to ${formatScaleRatio(magnificationScale.max)}`;

  elements.apertureBarValue.textContent = formatMillimeters(metrics.apertureDiameterMm);
  setBarHeight(elements.apertureBar, scaleLogBar(metrics.apertureDiameterMm, apertureScale.min, apertureScale.max));
  elements.apertureNote.textContent = `fixed log ${formatMillimeters(apertureScale.min)} to ${formatMillimeters(apertureScale.max)}`;

  elements.probeBlurBarValue.textContent = formatMillimeters(metrics.probeBlurMm);
  setBarHeight(elements.probeBlurBar, scaleLogBar(metrics.probeBlurMm, probeBlurScale.min, probeBlurScale.max));
  setMarkerBottom(elements.probeBlurThreshold, scaleLogBar(metrics.cocMm, probeBlurScale.min, probeBlurScale.max));
  elements.probeBlurNote.textContent = `fixed log ${formatMillimeters(probeBlurScale.min)} to ${formatMillimeters(probeBlurScale.max)}`;

  elements.totalDofBarValue.textContent = Number.isFinite(metrics.totalDofMm) ? formatDistanceMeters(metrics.totalDofMm / 1000) : "Infinity";
  setBarHeight(elements.totalDofBar, Number.isFinite(metrics.totalDofMm) ? scaleLogBar(metrics.totalDofMm, totalDofScale.min, totalDofScale.max) : 1);
  elements.totalDofNote.textContent = Number.isFinite(metrics.totalDofMm)
    ? `fixed log ${formatMillimeters(totalDofScale.min)} to ${formatDistanceMeters(totalDofScale.max / 1000)}`
    : `fixed log to ${formatDistanceMeters(totalDofScale.max / 1000)}`;

  elements.hyperfocalBarValue.textContent = formatDistanceMeters(metrics.hyperfocalMm / 1000);
  setBarHeight(elements.hyperfocalBar, scaleLogBar(metrics.hyperfocalMm, hyperfocalScale.min, hyperfocalScale.max));
  elements.hyperfocalNote.textContent = `fixed log ${formatMillimeters(hyperfocalScale.min)} to ${formatDistanceMeters(hyperfocalScale.max / 1000)}`;
}

function updateZoomDemo(metrics) {
  const zoom = normalizeZoom(metrics.focalLengthMm);
  const centerY = 140;
  const sceneX = 78;
  const frontX = 238 + zoom * 24;
  const middleX = 322 + zoom * 62;
  const rearX = 396 + zoom * 90;
  const sceneHalfHeight = 82 - zoom * 52;
  const sensorHalfHeight = 34;
  const frontHalfHeight = 48 - zoom * 4;
  const middleHalfHeight = 30 - zoom * 3;
  const rearHalfHeight = 18 - zoom * 2;
  const rearRadiusX = 14 + zoom * 7;
  const irisRadius = clamp(12 - (metrics.fNumber - 1.2) * 0.4, 5, 12);
  const fieldAngle = (2 * Math.atan(18 / metrics.focalLengthMm) * 180) / Math.PI;
  const sensorBounds = sensorDistanceBoundsMm(metrics.focalLengthMm);
  const lensPlaneX = rearX + rearRadiusX + 4;
  const sensorTrackMinX = lensPlaneX + 18;
  const sensorTrackMaxX = 546;
  const sensorTravel = normalizeRange(metrics.sensorDistanceMm, sensorBounds.min, sensorBounds.max);
  const sensorX = sensorTrackMinX + sensorTravel * (sensorTrackMaxX - sensorTrackMinX);
  const rearExitSlope = (sensorHalfHeight - rearHalfHeight) / Math.max(sensorTrackMinX - rearX, 1);
  const projectedSensorHalfHeight = clamp(rearHalfHeight + rearExitSlope * (sensorX - rearX), sensorHalfHeight, 86);
  const projectedSensorTopY = centerY - projectedSensorHalfHeight;
  const projectedSensorBottomY = centerY + projectedSensorHalfHeight;
  const cocDisplayMax = Math.max(metrics.probeBlurMm, metrics.cocMm * 1.6, 0.06);
  const cocRadius = mapDemoRadiusMm(metrics.cocMm, cocDisplayMax, 6, 13);
  const probeBlurRadius = mapDemoRadiusMm(metrics.probeBlurMm, cocDisplayMax, 4, 28);
  const verbose = displayState.verbose;

  elements.zoomFrontGroup.setAttribute("cx", frontX.toFixed(1));
  elements.zoomFrontGroup.setAttribute("rx", (18 + zoom * 6).toFixed(1));
  elements.zoomFrontGroup.setAttribute("ry", (58 - zoom * 5).toFixed(1));
  elements.zoomMiddleGroup.setAttribute("cx", middleX.toFixed(1));
  elements.zoomMiddleGroup.setAttribute("rx", (16 + zoom * 5).toFixed(1));
  elements.zoomMiddleGroup.setAttribute("ry", (54 - zoom * 4).toFixed(1));
  elements.zoomRearGroup.setAttribute("cx", rearX.toFixed(1));
  elements.zoomRearGroup.setAttribute("rx", rearRadiusX.toFixed(1));
  elements.zoomRearGroup.setAttribute("ry", (48 - zoom * 3).toFixed(1));
  elements.zoomIris.setAttribute("cx", (350 + zoom * 52).toFixed(1));
  elements.zoomIris.setAttribute("r", irisRadius.toFixed(1));
  elements.zoomLensPlane.setAttribute("x1", lensPlaneX.toFixed(1));
  elements.zoomLensPlane.setAttribute("x2", lensPlaneX.toFixed(1));
  elements.zoomSensorPlane.setAttribute("x1", sensorX.toFixed(1));
  elements.zoomSensorPlane.setAttribute("x2", sensorX.toFixed(1));
  elements.zoomSensorLabel.setAttribute("x", (sensorX + 8).toFixed(1));
  elements.zoomSensorDistanceGuideStart.setAttribute("x1", lensPlaneX.toFixed(1));
  elements.zoomSensorDistanceGuideStart.setAttribute("x2", lensPlaneX.toFixed(1));
  elements.zoomSensorDistanceGuideEnd.setAttribute("x1", sensorX.toFixed(1));
  elements.zoomSensorDistanceGuideEnd.setAttribute("x2", sensorX.toFixed(1));
  elements.zoomSensorDistanceLine.setAttribute("x1", lensPlaneX.toFixed(1));
  elements.zoomSensorDistanceLine.setAttribute("x2", sensorX.toFixed(1));
  elements.zoomSensorDistanceStartTick.setAttribute("x1", lensPlaneX.toFixed(1));
  elements.zoomSensorDistanceStartTick.setAttribute("x2", lensPlaneX.toFixed(1));
  elements.zoomSensorDistanceEndTick.setAttribute("x1", sensorX.toFixed(1));
  elements.zoomSensorDistanceEndTick.setAttribute("x2", sensorX.toFixed(1));
  elements.zoomSensorDistanceText.setAttribute("x", ((lensPlaneX + sensorX) / 2).toFixed(1));
  elements.zoomSensorDistanceText.textContent = verbose ? `s' = ${formatMillimeters(metrics.sensorDistanceMm)}` : `s' ${formatMillimeters(metrics.sensorDistanceMm)}`;
  elements.zoomProbeBlurDisc.setAttribute("cx", sensorX.toFixed(1));
  elements.zoomProbeBlurDisc.setAttribute("cy", centerY.toFixed(1));
  elements.zoomProbeBlurDisc.setAttribute("r", probeBlurRadius.toFixed(1));
  elements.zoomCocRing.setAttribute("cx", sensorX.toFixed(1));
  elements.zoomCocRing.setAttribute("cy", centerY.toFixed(1));
  elements.zoomCocRing.setAttribute("r", cocRadius.toFixed(1));

  const cone = [
    { x: sceneX, y: centerY - sceneHalfHeight },
    { x: frontX - 12, y: centerY - frontHalfHeight },
    { x: middleX, y: centerY - middleHalfHeight },
    { x: rearX, y: centerY - rearHalfHeight },
    { x: sensorX, y: projectedSensorTopY },
    { x: sensorX, y: projectedSensorBottomY },
    { x: rearX, y: centerY + rearHalfHeight },
    { x: middleX, y: centerY + middleHalfHeight },
    { x: frontX - 12, y: centerY + frontHalfHeight },
  ];
  const topRay = [
    { x: sceneX, y: centerY - sceneHalfHeight },
    { x: frontX - 10, y: centerY - sceneHalfHeight * 0.72 },
    { x: middleX, y: centerY - (sensorHalfHeight + 18 + zoom * 12) },
    { x: rearX, y: centerY - (sensorHalfHeight + 8) },
    { x: sensorX, y: projectedSensorTopY },
  ];
  const midRay = [
    { x: sceneX, y: centerY },
    { x: frontX - 10, y: centerY },
    { x: middleX, y: centerY },
    { x: rearX, y: centerY },
    { x: sensorX, y: centerY },
  ];
  const bottomRay = [
    { x: sceneX, y: centerY + sceneHalfHeight },
    { x: frontX - 10, y: centerY + sceneHalfHeight * 0.72 },
    { x: middleX, y: centerY + (sensorHalfHeight + 18 + zoom * 12) },
    { x: rearX, y: centerY + (sensorHalfHeight + 8) },
    { x: sensorX, y: projectedSensorBottomY },
  ];

  elements.zoomFieldCone.setAttribute("d", svgPath(cone, true));
  elements.zoomRayTop.setAttribute("d", svgPath(topRay));
  elements.zoomRayMid.setAttribute("d", svgPath(midRay));
  elements.zoomRayBottom.setAttribute("d", svgPath(bottomRay));
  elements.zoomStateLabel.textContent = zoomDescriptor(metrics.focalLengthMm);
  elements.zoomFocalValue.textContent = verbose ? `${metrics.focalLengthMm.toFixed(0)} mm effective` : `${metrics.focalLengthMm.toFixed(0)} mm`;
  elements.zoomFieldText.textContent = verbose ? `${fieldAngle.toFixed(0)} deg field slice` : `${fieldAngle.toFixed(0)} deg`;
  setBarWidth(elements.zoomScaleFill, zoom);
  setMarkerLeft(elements.zoomScaleThumb, zoom);
}

function updateDerivedMetrics() {
  const focalLengthMm = state.focalLength;
  const focusDistanceMm = state.focusDistance * 1000;
  const probeDistanceMm = state.probeDistance * 1000;
  const sensorDistance = imageDistanceMm(focalLengthMm, focusDistanceMm);
  const magnificationValue = magnification(focalLengthMm, focusDistanceMm);
  const aperture = apertureDiameterMm(focalLengthMm, state.fNumber);
  const probeBlur = blurDiameterMm(focalLengthMm, state.fNumber, focusDistanceMm, probeDistanceMm);
  const dof = depthOfFieldMm(focalLengthMm, state.fNumber, state.coc, focusDistanceMm);
  const metrics = {
    focalLengthMm,
    focusDistanceMm,
    focusDistanceMeters: state.focusDistance,
    probeDistanceMm,
    probeDistanceMeters: state.probeDistance,
    fNumber: state.fNumber,
    cocMm: state.coc,
    imageDistanceMm: sensorDistance,
    sensorDistanceMm: sensorDistance,
    magnification: magnificationValue,
    apertureDiameterMm: aperture,
    probeBlurMm: probeBlur,
    hyperfocalMm: dof.hyperfocal,
    nearDofMm: dof.near,
    farDofMm: dof.far,
    totalDofMm: dof.total,
    nearDofMeters: dof.near / 1000,
    farDofMeters: dof.far / 1000,
  };

  elements.nearDofValue.textContent = formatDistanceMeters(dof.near / 1000);
  elements.farDofValue.textContent = Number.isFinite(dof.far) ? formatDistanceMeters(dof.far / 1000) : "Infinity";
  elements.totalDofValue.textContent = Number.isFinite(dof.total) ? formatDistanceMeters(dof.total / 1000) : "Infinity";
  elements.summaryText.textContent = displayState.verbose
    ? `f ${state.focalLength.toFixed(0)} mm | s ${formatDistanceMeters(state.focusDistance)} | s' ${formatMillimeters(sensorDistance)} | c(z) ${formatMillimeters(probeBlur)} | DOF ${Number.isFinite(dof.total) ? formatDistanceMeters(dof.total / 1000) : "Infinity"}`
    : `${state.focalLength.toFixed(0)} mm | ${formatDistanceMeters(state.focusDistance)} | s' ${formatMillimeters(sensorDistance)} | DOF ${Number.isFinite(dof.total) ? formatDistanceMeters(dof.total / 1000) : "Infinity"}`;

  return metrics;
}

function updateHelpText(metrics) {
  const focusEquation = `1/f = 1/s + 1/s' with f=${formatMillimeters(metrics.focalLengthMm)}, s=${formatDistanceMeters(metrics.focusDistanceMeters)}, s'=${formatMillimeters(metrics.imageDistanceMm)}.`;
  const hyperfocalEquation = `H = f^2 / (N c) + f = ${formatDistanceMeters(metrics.hyperfocalMm / 1000)}.`;
  const nearEquation = `near = H s / (H + (s - f)) = ${formatDistanceMeters(metrics.nearDofMeters)}.`;
  const farEquation = Number.isFinite(metrics.farDofMeters)
    ? `far = H s / (H - (s - f)) = ${formatDistanceMeters(metrics.farDofMeters)}.`
    : "far = Infinity because the focus distance is at or beyond hyperfocal.";
  const totalEquation = Number.isFinite(metrics.totalDofMm)
    ? `total DOF = far - near = ${formatDistanceMeters(metrics.totalDofMm / 1000)}.`
    : "total DOF extends to Infinity.";
  const probeImageDistance = imageDistanceMm(metrics.focalLengthMm, metrics.probeDistanceMm);
  const probeImageText = Number.isFinite(probeImageDistance) ? formatMillimeters(probeImageDistance) : "Infinity";

  setHelp(helpTargets.themeGroup, helpText("Theme preset.", `Current theme: ${displayState.theme}.`, "Changes the background and card color palette only."));
  setHelp(helpTargets.transparencyGroup, helpText("Window transparency.", `Current transparency: ${displayState.transparency.toFixed(0)}%.`, "Adjusts panel alpha without changing any optics math."));
  setHelp(helpTargets.contentWidthGroup, helpText("Content width.", `Current max width: ${formatPixels(displayState.width)}.`, "Widens or narrows the overall page layout."));
  setHelp(helpTargets.blurGroup, helpText("Glass blur.", `Current backdrop blur: ${formatPixels(displayState.blur)}.`, "Controls the frosted-glass blur behind cards and the menu."));
  setHelp(helpTargets.radiusGroup, helpText("Corner radius.", `Current shared radius: ${formatPixels(displayState.radius)}.`, "Applies the same rounding to cards, bars, and the drawer."));

  setHelp(helpTargets.focalLengthControl, helpText("Focal length f.", `Current f = ${formatMillimeters(metrics.focalLengthMm)}.`, focusEquation, "Longer f usually means tighter framing and larger magnification."));
  setHelp(helpTargets.sensorDistanceControl, helpText("Sensor distance s'.", `Current s' = ${formatMillimeters(metrics.sensorDistanceMm)}.`, focusEquation, "This image-plane distance is locked to the focus distance by the thin-lens equation."));
  setHelp(helpTargets.focusDistanceControl, helpText("Focus distance s.", `Current s = ${formatDistanceMeters(metrics.focusDistanceMeters)}.`, focusEquation, "Subject distance is measured from the lens plane in this thin-lens model."));
  setHelp(helpTargets.fNumberControl, helpText("F-number N.", `Current N = ${formatFNumber(metrics.fNumber)}.`, `Aperture diameter D = f / N = ${formatMillimeters(metrics.apertureDiameterMm)}.`, "Smaller N means a wider opening and usually shallower depth of field."));
  setHelp(helpTargets.cocControl, helpText("Circle of confusion c.", `Current CoC = ${formatMillimeters(metrics.cocMm)}.`, "Depth of field is the span where the blur circle stays at or below this limit.", hyperfocalEquation));
  setHelp(helpTargets.probeDistanceControl, helpText("Probe distance z.", `Current z = ${formatDistanceMeters(metrics.probeDistanceMeters)}.`, `z' = f z / (z - f) = ${probeImageText}.`, `Probe blur c(z) = D |s'_focus - z'| / z' = ${formatMillimeters(metrics.probeBlurMm)}.`));

  setHelp(helpTargets.summaryText, helpText("Live thin-lens summary.", focusEquation, `Magnification m = -s' / s = ${formatMagnification(metrics.magnification)}.`, `Probe blur c(z) = ${formatMillimeters(metrics.probeBlurMm)}.`));

  setHelp(helpTargets.nearDofPill, helpText("Near depth-of-field limit.", hyperfocalEquation, nearEquation));
  setHelp(helpTargets.farDofPill, helpText("Far depth-of-field limit.", hyperfocalEquation, farEquation));
  setHelp(helpTargets.totalDofPill, helpText("Total depth of field.", nearEquation, farEquation, totalEquation));

  setHelp(helpTargets.imageDistanceBar, helpText("Image distance s'.", "Computed from the thin-lens equation.", `s' = f s / (s - f) = ${formatMillimeters(metrics.imageDistanceMm)}.`));
  setHelp(helpTargets.magnificationBar, helpText("Magnification m.", `m = -s' / s = ${formatMagnification(metrics.magnification)}.`, "The bar uses |m| so the size change stays easy to compare."));
  setHelp(helpTargets.apertureBar, helpText("Aperture diameter D.", `D = f / N = ${formatMillimeters(metrics.apertureDiameterMm)}.`, "This is the effective opening size used in the blur calculation."));
  setHelp(helpTargets.probeBlurBar, helpText("Probe blur c(z).", `z' = f z / (z - f) = ${probeImageText}.`, `c(z) = D |s'_focus - z'| / z' = ${formatMillimeters(metrics.probeBlurMm)}.`, `The threshold marker is the CoC limit: ${formatMillimeters(metrics.cocMm)}.`));
  setHelp(helpTargets.totalDofBar, helpText("Total depth of field.", hyperfocalEquation, nearEquation, farEquation, totalEquation));
  setHelp(helpTargets.hyperfocalBar, helpText("Hyperfocal distance H.", "This is the focus distance that pushes the far DOF limit to Infinity.", hyperfocalEquation));

  setHelp([helpTargets.zoomDemoCard, elements.zoomLensDemo], helpText("Variable lens demo.", `Effective focal length is shown as ${formatMillimeters(metrics.focalLengthMm)}.`, `The moving sensor plane and dimension line show s' = ${formatMillimeters(metrics.sensorDistanceMm)}.`, "The rear rays keep a fixed exit angle, so moving the sensor crops a different slice of the projected image.", `The amber ring marks the CoC threshold c = ${formatMillimeters(metrics.cocMm)} and the filled disc shows the current probe blur.`, "Approximate field slice: 2 * atan(sensor_half / f)."));
  setHelp([helpTargets.imageChartCard, elements.imageChart], helpText("Image distance chart.", "Y-axis equation: s' = f s / (s - f).", "The focus marker shows the currently selected subject distance s."));
  setHelp([helpTargets.magnificationChartCard, elements.magnificationChart], helpText("Magnification chart.", "Y-axis equation: |m| = |-s' / s|.", "The bar values keep the sign, but the plot shows magnitude only."));
  setHelp([helpTargets.blurChartCard, elements.blurChart], helpText("Blur and depth-of-field chart.", "Blur equation: c(z) = D |s'_focus - z'| / z', with z' = f z / (z - f).", "The shaded region is where c(z) <= CoC.", `Current CoC threshold: ${formatMillimeters(metrics.cocMm)}.`));
}

function loadDisplaySettings() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(DISPLAY_STORAGE_KEY) || "null");
    if (!stored || typeof stored !== "object") {
      return;
    }
    displayState.theme = DISPLAY_THEMES.includes(stored.theme) ? stored.theme : DISPLAY_DEFAULTS.theme;
    displayState.verbose = typeof stored.verbose === "boolean" ? stored.verbose : DISPLAY_DEFAULTS.verbose;
    displayState.transparency = quantize(clamp(safeNumber(stored.transparency, DISPLAY_DEFAULTS.transparency), 0, 60));
    displayState.width = quantize(clamp(safeNumber(stored.width, DISPLAY_DEFAULTS.width), 960, 1600), 20);
    displayState.blur = quantize(clamp(safeNumber(stored.blur, DISPLAY_DEFAULTS.blur), 0, 28));
    displayState.radius = quantize(clamp(safeNumber(stored.radius, DISPLAY_DEFAULTS.radius), 18, 34));
  } catch {
    Object.assign(displayState, DISPLAY_DEFAULTS);
  }
}

function saveDisplaySettings() {
  try {
    window.localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(displayState));
  } catch {
    // Ignore storage failures so the page still works from file:// or private contexts.
  }
}

function syncThemeButtons() {
  elements.themeButtons.forEach((button) => {
    const active = button.dataset.themeOption === displayState.theme;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function syncDisplayControls() {
  elements.verboseToggle.checked = displayState.verbose;
  elements.transparencyRange.value = displayState.transparency.toFixed(0);
  elements.transparencyDisplay.textContent = `${displayState.transparency.toFixed(0)}%`;
  elements.contentWidthRange.value = displayState.width.toFixed(0);
  elements.contentWidthDisplay.textContent = formatPixels(displayState.width);
  elements.blurStrengthRange.value = displayState.blur.toFixed(0);
  elements.blurStrengthDisplay.textContent = formatPixels(displayState.blur);
  elements.radiusRange.value = displayState.radius.toFixed(0);
  elements.radiusDisplay.textContent = formatPixels(displayState.radius);
  syncThemeButtons();
}

function setDisplayMenuOpen(isOpen, shouldRefocus = false) {
  elements.displayMenuToggle.classList.toggle("is-open", isOpen);
  elements.displayMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  elements.displayMenuToggle.setAttribute("aria-label", isOpen ? "Close display options" : "Open display options");
  elements.displayDrawer.classList.toggle("is-open", isOpen);
  elements.displayDrawer.setAttribute("aria-hidden", isOpen ? "false" : "true");
  elements.displayScrim.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  if (shouldRefocus) {
    const focusTarget = isOpen ? elements.displayMenuClose : elements.displayMenuToggle;
    focusTarget.focus();
  }
}

let renderFrame = 0;

function scheduleRender() {
  if (renderFrame) {
    return;
  }
  renderFrame = window.requestAnimationFrame(() => {
    renderFrame = 0;
    render();
  });
}

function applyDisplaySettings(shouldRedraw = false) {
  const transparency = displayState.transparency / 60;
  const panelAlpha = 0.92 - transparency * 0.42;
  const panelStrongAlpha = 0.98 - transparency * 0.22;
  const surfaceSoftAlpha = 0.66 - transparency * 0.3;
  const surfaceMidAlpha = 0.72 - transparency * 0.28;
  const surfaceStrongAlpha = 0.96 - transparency * 0.18;
  const statusAlpha = 0.68 - transparency * 0.24;

  document.body.dataset.theme = displayState.theme;
  document.body.dataset.verbose = displayState.verbose ? "true" : "false";
  document.documentElement.style.setProperty("--page-max-width", `${displayState.width}px`);
  document.documentElement.style.setProperty("--glass-blur", `${displayState.blur}px`);
  document.documentElement.style.setProperty("--panel-radius", `${displayState.radius}px`);
  document.documentElement.style.setProperty("--panel-alpha", panelAlpha.toFixed(3));
  document.documentElement.style.setProperty("--panel-strong-alpha", panelStrongAlpha.toFixed(3));
  document.documentElement.style.setProperty("--surface-soft-alpha", surfaceSoftAlpha.toFixed(3));
  document.documentElement.style.setProperty("--surface-mid-alpha", surfaceMidAlpha.toFixed(3));
  document.documentElement.style.setProperty("--surface-strong-alpha", surfaceStrongAlpha.toFixed(3));
  document.documentElement.style.setProperty("--status-alpha", statusAlpha.toFixed(3));
  syncDisplayControls();
  if (shouldRedraw) {
    scheduleRender();
  }
}

function syncPresetButtons() {
  elements.presetButtons.forEach((button) => {
    const preset = presets[button.dataset.preset];
    const active =
      preset &&
      Math.abs(preset.focalLength - state.focalLength) < 0.01 &&
      Math.abs(preset.focusDistance - state.focusDistance) < 0.01 &&
      Math.abs(preset.fNumber - state.fNumber) < 0.01 &&
      Math.abs(preset.coc - state.coc) < 0.0005 &&
      Math.abs(preset.probeDistance - state.probeDistance) < 0.01;
    button.classList.toggle("is-active", Boolean(active));
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function syncControls() {
  const minDistance = distanceMinMeters();
  const sensorBounds = sensorDistanceBoundsMm(state.focalLength);
  state.focusDistance = clamp(state.focusDistance, minDistance, DISTANCE_MAX_METERS);
  state.probeDistance = clamp(state.probeDistance, minDistance, DISTANCE_MAX_METERS);
  const sensorDistance = imageDistanceMm(state.focalLength, state.focusDistance * 1000);
  elements.focalLengthRange.value = state.focalLength.toFixed(0);
  elements.focalLengthNumber.value = state.focalLength.toFixed(0);
  elements.focalLengthDisplay.textContent = `${state.focalLength.toFixed(0)} mm`;
  elements.sensorDistanceRange.value = unmapLogSlider(sensorDistance, sensorBounds.min, sensorBounds.max).toFixed(0);
  elements.sensorDistanceNumber.min = formatInputMillimeters(sensorBounds.min);
  elements.sensorDistanceNumber.max = formatInputMillimeters(sensorBounds.max);
  elements.sensorDistanceNumber.value = formatInputMillimeters(sensorDistance);
  elements.sensorDistanceDisplay.textContent = formatMillimeters(sensorDistance);
  elements.focusDistanceRange.value = unmapLogSlider(state.focusDistance, minDistance, DISTANCE_MAX_METERS).toFixed(0);
  elements.focusDistanceNumber.min = minDistance.toFixed(2);
  elements.focusDistanceNumber.max = DISTANCE_MAX_METERS.toFixed(0);
  elements.focusDistanceNumber.value = state.focusDistance.toFixed(2);
  elements.focusDistanceDisplay.textContent = formatDistanceMeters(state.focusDistance);
  elements.fNumberRange.value = state.fNumber.toFixed(1);
  elements.fNumberNumber.value = state.fNumber.toFixed(1);
  elements.fNumberDisplay.textContent = formatFNumber(state.fNumber);
  elements.cocRange.value = state.coc.toFixed(3);
  elements.cocNumber.value = state.coc.toFixed(3);
  elements.cocDisplay.textContent = formatMillimeters(state.coc);
  elements.probeDistanceRange.value = unmapLogSlider(state.probeDistance, minDistance, DISTANCE_MAX_METERS).toFixed(0);
  elements.probeDistanceNumber.min = minDistance.toFixed(2);
  elements.probeDistanceNumber.max = DISTANCE_MAX_METERS.toFixed(0);
  elements.probeDistanceNumber.value = state.probeDistance.toFixed(2);
  elements.probeDistanceDisplay.textContent = formatDistanceMeters(state.probeDistance);
  syncPresetButtons();
}

function render() {
  syncControls();
  const metrics = updateDerivedMetrics();
  updateHelpText(metrics);
  updateOutputBars(metrics);
  updateZoomDemo(metrics);
  drawImageChart(metrics);
  drawMagnificationChart(metrics);
  drawBlurChart(metrics);
}

function bindLinearPair(rangeElement, numberElement, key, min, max) {
  rangeElement.addEventListener("input", () => {
    state[key] = clamp(safeNumber(rangeElement.value, state[key]), min, max);
    render();
  });
  numberElement.addEventListener("input", () => {
    state[key] = clamp(safeNumber(numberElement.value, state[key]), min, max);
    render();
  });
}

function bindDistancePair(rangeElement, numberElement, key) {
  rangeElement.addEventListener("input", () => {
    const minDistance = distanceMinMeters();
    state[key] = mapLogSlider(safeNumber(rangeElement.value, 0), minDistance, DISTANCE_MAX_METERS);
    render();
  });
  numberElement.addEventListener("input", () => {
    const minDistance = distanceMinMeters();
    state[key] = clamp(safeNumber(numberElement.value, state[key]), minDistance, DISTANCE_MAX_METERS);
    render();
  });
}

function bindSensorDistancePair(rangeElement, numberElement) {
  const updateFromSensorDistance = (rawValue) => {
    const sensorBounds = sensorDistanceBoundsMm(state.focalLength);
    const sensorDistance = clamp(rawValue, sensorBounds.min, sensorBounds.max);
    const subjectDistanceMm = subjectDistanceMmFromImageDistanceMm(state.focalLength, sensorDistance);
    state.focusDistance = clamp(subjectDistanceMm / 1000, distanceMinMeters(), DISTANCE_MAX_METERS);
    render();
  };

  rangeElement.addEventListener("input", () => {
    const sensorBounds = sensorDistanceBoundsMm(state.focalLength);
    updateFromSensorDistance(mapLogSlider(safeNumber(rangeElement.value, 0), sensorBounds.min, sensorBounds.max));
  });

  numberElement.addEventListener("input", () => {
    const currentSensorDistance = imageDistanceMm(state.focalLength, state.focusDistance * 1000);
    updateFromSensorDistance(safeNumber(numberElement.value, currentSensorDistance));
  });
}

function bindDisplayRange(rangeElement, key, min, max, step = 1) {
  rangeElement.addEventListener("input", () => {
    const nextValue = quantize(clamp(safeNumber(rangeElement.value, displayState[key]), min, max), step);
    displayState[key] = nextValue;
    applyDisplaySettings(true);
    saveDisplaySettings();
  });
}

bindLinearPair(elements.focalLengthRange, elements.focalLengthNumber, "focalLength", FOCAL_LENGTH_MIN_MM, FOCAL_LENGTH_MAX_MM);
bindLinearPair(elements.fNumberRange, elements.fNumberNumber, "fNumber", F_NUMBER_MIN, F_NUMBER_MAX);
bindLinearPair(elements.cocRange, elements.cocNumber, "coc", COC_MIN_MM, COC_MAX_MM);
bindSensorDistancePair(elements.sensorDistanceRange, elements.sensorDistanceNumber);
bindDistancePair(elements.focusDistanceRange, elements.focusDistanceNumber, "focusDistance");
bindDistancePair(elements.probeDistanceRange, elements.probeDistanceNumber, "probeDistance");

elements.presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    if (!preset) {
      return;
    }
    Object.assign(state, preset);
    render();
  });
});

elements.displayMenuToggle.addEventListener("click", () => {
  const isOpen = !elements.displayDrawer.classList.contains("is-open");
  setDisplayMenuOpen(isOpen, true);
});

elements.displayMenuClose.addEventListener("click", () => {
  setDisplayMenuOpen(false, true);
});

elements.displayScrim.addEventListener("click", () => {
  setDisplayMenuOpen(false);
});

elements.themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.themeOption;
    if (!DISPLAY_THEMES.includes(theme)) {
      return;
    }
    displayState.theme = theme;
    applyDisplaySettings(true);
    saveDisplaySettings();
  });
});

elements.verboseToggle.addEventListener("change", () => {
  displayState.verbose = elements.verboseToggle.checked;
  applyDisplaySettings(true);
  saveDisplaySettings();
});

bindDisplayRange(elements.transparencyRange, "transparency", 0, 60);
bindDisplayRange(elements.contentWidthRange, "width", 960, 1600, 20);
bindDisplayRange(elements.blurStrengthRange, "blur", 0, 28);
bindDisplayRange(elements.radiusRange, "radius", 18, 34);

elements.resetDisplayButton.addEventListener("click", () => {
  Object.assign(displayState, DISPLAY_DEFAULTS);
  applyDisplaySettings(true);
  saveDisplaySettings();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && elements.displayDrawer.classList.contains("is-open")) {
    setDisplayMenuOpen(false, true);
  }
});

window.addEventListener("resize", scheduleRender);

loadDisplaySettings();
applyDisplaySettings();
render();
