const FOCAL_LENGTH_MIN_MM = 6;
const FOCAL_LENGTH_MAX_MM = 400;
const F_NUMBER_MIN = 1.4;
const F_NUMBER_MAX = 22;
const EXPOSURE_REFERENCE_F_NUMBER = 2.8;
const COMMON_FOCAL_LENGTHS_MM = Object.freeze([
  6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 35, 40, 50, 55, 70, 85, 90, 100, 105, 135, 150, 200, 300, 400,
]);
const COMMON_F_NUMBERS = Object.freeze([1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11.0, 16.0, 22.0]);
const COC_MIN_MM = 0.003;
const COC_MAX_MM = 0.05;
const DISTANCE_MAX_METERS = 100;
const SAMPLE_COUNT = 220;
const BLUR_SAMPLE_COUNT = 260;
const DISTANCE_MARGIN_METERS = 0.02;
const DISTANCE_FLOOR_METERS = 0.1;
const MAX_PRACTICAL_FOCUS_MAGNIFICATION = 0.25;
const BAR_SCALE_LIMITS = Object.freeze({
  focusDistanceMm: { min: DISTANCE_FLOOR_METERS * 1000, max: DISTANCE_MAX_METERS * 1000 },
  imageDistanceMm: { min: 4, max: 10000 },
  magnificationAbs: { min: 0.0001, max: 30 },
  apertureDiameterMm: { min: 0.18, max: 250 },
  probeBlurMm: { min: 0.001, max: 250 },
  totalDofMm: { min: 0.1, max: 100000 },
  hyperfocalMm: { min: 10, max: 20000000 },
});
const DISPLAY_STORAGE_KEY = "lens-equations-display";
const DISPLAY_STORAGE_VERSION = 2;
const DISPLAY_THEMES = ["sand", "slate", "forest", "midnight", "ember", "aurora"];
const DISPLAY_DEFAULTS = Object.freeze({
  theme: "midnight",
  verbose: false,
  transparency: 20,
  width: 1320,
  blur: 18,
  radius: 26,
  foregroundDistance: 1.74,
  backgroundDistance: 6.6,
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
let selectedPresetKey = "portrait";

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
  sceneForegroundRange: document.getElementById("sceneForegroundRange"),
  sceneForegroundDisplay: document.getElementById("sceneForegroundDisplay"),
  sceneBackgroundRange: document.getElementById("sceneBackgroundRange"),
  sceneBackgroundDisplay: document.getElementById("sceneBackgroundDisplay"),
  resetDisplayButton: document.getElementById("resetDisplayButton"),
  focalLengthRange: document.getElementById("focalLengthRange"),
  focalLengthTicks: document.getElementById("focalLengthTicks"),
  focalLengthNumber: document.getElementById("focalLengthNumber"),
  focalLengthDisplay: document.getElementById("focalLengthDisplay"),
  focalLengthLabel: document.getElementById("focalLengthLabel"),
  sensorDistanceRange: document.getElementById("sensorDistanceRange"),
  sensorDistanceNumber: document.getElementById("sensorDistanceNumber"),
  sensorDistanceDisplay: document.getElementById("sensorDistanceDisplay"),
  sensorDistanceLabel: document.getElementById("sensorDistanceLabel"),
  focusDistanceRange: document.getElementById("focusDistanceRange"),
  focusDistanceNumber: document.getElementById("focusDistanceNumber"),
  focusDistanceDisplay: document.getElementById("focusDistanceDisplay"),
  focusDistanceLabel: document.getElementById("focusDistanceLabel"),
  fNumberRange: document.getElementById("fNumberRange"),
  fNumberTicks: document.getElementById("fNumberTicks"),
  fNumberNumber: document.getElementById("fNumberNumber"),
  fNumberDisplay: document.getElementById("fNumberDisplay"),
  fNumberLightLoss: document.getElementById("fNumberLightLoss"),
  fNumberLabel: document.getElementById("fNumberLabel"),
  cocRange: document.getElementById("cocRange"),
  cocNumber: document.getElementById("cocNumber"),
  cocDisplay: document.getElementById("cocDisplay"),
  cocLabel: document.getElementById("cocLabel"),
  probeDistanceRange: document.getElementById("probeDistanceRange"),
  probeDistanceNumber: document.getElementById("probeDistanceNumber"),
  probeDistanceDisplay: document.getElementById("probeDistanceDisplay"),
  probeDistanceLabel: document.getElementById("probeDistanceLabel"),
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
  zoomBarrelInner: document.getElementById("zoomBarrelInner"),
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
  zoomProjectionSlice: document.getElementById("zoomProjectionSlice"),
  zoomProbeBlurDisc: document.getElementById("zoomProbeBlurDisc"),
  zoomCocRing: document.getElementById("zoomCocRing"),
  zoomFieldCone: document.getElementById("zoomFieldCone"),
  zoomRayTop: document.getElementById("zoomRayTop"),
  zoomRayMid: document.getElementById("zoomRayMid"),
  zoomRayBottom: document.getElementById("zoomRayBottom"),
  zoomLensDemo: document.getElementById("zoomLensDemo"),
  zoomScaleTrack: document.getElementById("zoomScaleTrack"),
  zoomScaleFill: document.getElementById("zoomScaleFill"),
  zoomScaleThumb: document.getElementById("zoomScaleThumb"),
  scenePreviewReference: document.getElementById("scenePreviewReference"),
  scenePreview: document.getElementById("scenePreview"),
  sceneReferenceForegroundZone: document.getElementById("sceneReferenceForegroundZone"),
  sceneReferenceSubjectZone: document.getElementById("sceneReferenceSubjectZone"),
  sceneReferenceBackgroundZone: document.getElementById("sceneReferenceBackgroundZone"),
  sceneBackgroundLayer: document.getElementById("sceneBackgroundLayer"),
  sceneSubjectLayer: document.getElementById("sceneSubjectLayer"),
  sceneForegroundLayer: document.getElementById("sceneForegroundLayer"),
  sceneDistanceDragLayers: Array.from(document.querySelectorAll("[data-scene-distance-drag]")),
  sceneForegroundChip: document.getElementById("sceneForegroundChip"),
  sceneSubjectChip: document.getElementById("sceneSubjectChip"),
  sceneBackgroundChip: document.getElementById("sceneBackgroundChip"),
  sceneForegroundDistanceText: document.getElementById("sceneForegroundDistanceText"),
  sceneSubjectDistanceText: document.getElementById("sceneSubjectDistanceText"),
  sceneBackgroundDistanceText: document.getElementById("sceneBackgroundDistanceText"),
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
  sceneForegroundGroup: elements.sceneForegroundRange.closest(".drawer-group"),
  sceneBackgroundGroup: elements.sceneBackgroundRange.closest(".drawer-group"),
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
  sceneCard: document.querySelector(".scene-card"),
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

function snapToAllowedValue(value, allowedValues) {
  if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
    return value;
  }

  return allowedValues.reduce((closest, candidate) => {
    const candidateDistance = Math.abs(candidate - value);
    const closestDistance = Math.abs(closest - value);
    if (candidateDistance < closestDistance) {
      return candidate;
    }
    if (candidateDistance === closestDistance && candidate < closest) {
      return candidate;
    }
    return closest;
  });
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
  const opticalFloorMeters = Math.max(DISTANCE_FLOOR_METERS, focalLengthMm / 1000 + DISTANCE_MARGIN_METERS);
  const practicalFloorMeters = practicalMinFocusDistanceMm(focalLengthMm) / 1000;
  return Math.max(opticalFloorMeters, practicalFloorMeters);
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

function sliderPercentForLogValue(value, min, max) {
  return clamp(unmapLogSlider(value, min, max) / 10, 0, 100);
}

function populateRangeTicks(container, allowedValues, min, max) {
  if (!container) {
    return;
  }

  const ticks = allowedValues.map((value) => {
    const tick = document.createElement("span");
    tick.className = "range-tick";
    tick.style.setProperty("--tick-position", sliderPercentForLogValue(value, min, max).toFixed(4));
    return tick;
  });

  container.replaceChildren(...ticks);
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

function maxPracticalSensorDistanceMm(focalLengthMm) {
  return focalLengthMm * (1 + MAX_PRACTICAL_FOCUS_MAGNIFICATION);
}

function practicalMinFocusDistanceMm(focalLengthMm) {
  return subjectDistanceMmFromImageDistanceMm(focalLengthMm, maxPracticalSensorDistanceMm(focalLengthMm));
}

function magnification(focalLengthMm, subjectDistanceMm) {
  return -imageDistanceMm(focalLengthMm, subjectDistanceMm) / subjectDistanceMm;
}

function apertureDiameterMm(focalLengthMm, fNumber) {
  return focalLengthMm / fNumber;
}

function relativeLightTransmission(currentFNumber, referenceFNumber = F_NUMBER_MIN) {
  return Math.max((referenceFNumber / currentFNumber) ** 2, 0);
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
  return makeLinearTicks(min, max, targetCount - 1);
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
  const left = 104;
  const right = 18;
  const top = 18;
  const bottom = 58;
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
  visibleYTicks.forEach((tick) => ctx.fillText(yFormatter(tick), left - 18, mapY(tick)));
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  visibleXTicks.forEach((tick) => ctx.fillText(xFormatter(tick), mapX(tick), height - bottom + 10));
  ctx.save();
  ctx.translate(10, top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '10px "Avenir Next", "Trebuchet MS", sans-serif';
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

function interpolateLineY(x, startX, startY, endX, endY) {
  const deltaX = endX - startX;
  if (Math.abs(deltaX) < 0.001) {
    return (startY + endY) / 2;
  }
  const t = clamp((x - startX) / deltaX, 0, 1);
  return startY + (endY - startY) * t;
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

function scenePlaneDistances(metrics) {
  const minDistance = distanceMinMetersForFocalLength(metrics.focalLengthMm);
  const subjectDistance = clamp(metrics.probeDistanceMeters, minDistance, DISTANCE_MAX_METERS);
  const foregroundDistance = clamp(displayState.foregroundDistance, minDistance, DISTANCE_MAX_METERS);
  const backgroundDistance = clamp(displayState.backgroundDistance, minDistance, DISTANCE_MAX_METERS);
  return { foregroundDistance, subjectDistance, backgroundDistance };
}

function previewBlurPixels(blurMm, cocMm) {
  if (!Number.isFinite(blurMm) || blurMm <= 0) {
    return 0;
  }
  const reference = Math.max(cocMm, 0.003);
  const ratio = Math.max(blurMm / reference, 0);
  return clamp(Math.pow(ratio, 0.64) * 1.85, 0, 24);
}

function setSceneLayerDepth(element, blurPx, baseScale = 1) {
  const opacity = 1 - clamp(blurPx / 64, 0, 0.22);
  const scale = baseScale + blurPx * 0.0025;
  element.style.setProperty("--layer-blur", `${blurPx.toFixed(2)}px`);
  element.style.setProperty("--layer-opacity", opacity.toFixed(3));
  element.style.setProperty("--layer-scale", scale.toFixed(3));
}

function updateOutputBars(metrics) {
  const focusDistanceScale = BAR_SCALE_LIMITS.focusDistanceMm;
  const magnificationScale = BAR_SCALE_LIMITS.magnificationAbs;
  const apertureScale = BAR_SCALE_LIMITS.apertureDiameterMm;
  const probeBlurScale = BAR_SCALE_LIMITS.probeBlurMm;
  const totalDofScale = BAR_SCALE_LIMITS.totalDofMm;
  const hyperfocalScale = BAR_SCALE_LIMITS.hyperfocalMm;

  elements.imageDistanceBarValue.textContent = formatDistanceMeters(metrics.focusDistanceMeters);
  setBarHeight(elements.imageDistanceBar, scaleLogBar(metrics.focusDistanceMm, focusDistanceScale.min, focusDistanceScale.max));
  elements.imageDistanceNote.textContent = `fixed log ${formatDistanceMeters(focusDistanceScale.min / 1000)} to ${formatDistanceMeters(focusDistanceScale.max / 1000)}`;

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
  const barrelInnerY = 88;
  const barrelInnerHeight = 104;
  const frontRadiusX = 18;
  const frontRadiusY = 58;
  const middleRadiusX = 16;
  const middleRadiusY = 54;
  const rearRadiusX = 16;
  const rearRadiusY = 48;
  const sensorPlaneTopY = 72;
  const sensorPlaneBottomY = 208;
  const sensorPlaneHalfHeight = (sensorPlaneBottomY - sensorPlaneTopY) / 2;
  const frontX = 202;
  const middleX = 324 + zoom * 56;
  const rearX = 404 + zoom * 78;
  const barrelInnerX = frontX - frontRadiusX - 6;
  const barrelInnerRightX = Math.max(middleX + middleRadiusX + 18, rearX + rearRadiusX + 10);
  const sceneHalfHeight = 82 - zoom * 52;
  const rearHalfHeight = 18 - zoom * 2;
  const apertureOpenness = clamp(metrics.apertureDiameterMm / apertureDiameterMm(metrics.focalLengthMm, F_NUMBER_MIN), 0.06, 1);
  const irisX = 350 + zoom * 52;
  const irisRadius = 4.5 + apertureOpenness * 9.5;
  const irisClearHalfHeight = Math.max(irisRadius - 1.4, 2.8);
  const fieldAngle = (2 * Math.atan(18 / metrics.focalLengthMm) * 180) / Math.PI;
  const sensorBounds = sensorDistanceBoundsMm(metrics.focalLengthMm);
  const lensPlaneX = rearX + rearRadiusX + 4;
  const sensorTrackMinX = lensPlaneX + 18;
  const sensorTrackMaxX = 546;
  const sensorTravel = normalizeRange(metrics.sensorDistanceMm, sensorBounds.min, sensorBounds.max);
  const sensorX = sensorTrackMinX + sensorTravel * (sensorTrackMaxX - sensorTrackMinX);
  const projectionFitX = sensorTrackMinX + (sensorTrackMaxX - sensorTrackMinX) * (0.26 + (1 - zoom) * 0.18);
  const rearExitSlope = (sensorPlaneHalfHeight - rearHalfHeight) / Math.max(projectionFitX - rearX, 1);
  const projectedSensorHalfHeight = clamp(rearHalfHeight + rearExitSlope * (sensorX - rearX), 12, 96);
  const projectedSensorTopY = centerY - projectedSensorHalfHeight;
  const projectedSensorBottomY = centerY + projectedSensorHalfHeight;
  const cocDisplayMax = Math.max(metrics.probeBlurMm, metrics.cocMm * 1.6, 0.06);
  const cocRadius = mapDemoRadiusMm(metrics.cocMm, cocDisplayMax, 6, 13);
  const probeBlurRadius = mapDemoRadiusMm(metrics.probeBlurMm, cocDisplayMax, 4, 28);
  const apertureTransmission = clamp(relativeLightTransmission(metrics.fNumber, F_NUMBER_MIN), 0, 1);
  const visualBundleIntensity = 0.24 + 0.76 * Math.pow(apertureTransmission, 0.32);
  const verbose = displayState.verbose;
  const sceneTopY = centerY - sceneHalfHeight;
  const sceneBottomY = centerY + sceneHalfHeight;
  const apertureTopY = centerY - irisClearHalfHeight;
  const apertureBottomY = centerY + irisClearHalfHeight;
  const frontConeX = frontX - 12;
  const frontRayX = frontX - 10;
  const frontConeTopY = interpolateLineY(frontConeX, sceneX, sceneTopY, irisX, apertureTopY);
  const frontConeBottomY = interpolateLineY(frontConeX, sceneX, sceneBottomY, irisX, apertureBottomY);
  const frontRayTopY = interpolateLineY(frontRayX, sceneX, sceneTopY, irisX, apertureTopY);
  const frontRayBottomY = interpolateLineY(frontRayX, sceneX, sceneBottomY, irisX, apertureBottomY);
  const middleConeTopY = interpolateLineY(middleX, sceneX, sceneTopY, irisX, apertureTopY);
  const middleConeBottomY = interpolateLineY(middleX, sceneX, sceneBottomY, irisX, apertureBottomY);
  const rearConeTopY = interpolateLineY(rearX, irisX, apertureTopY, sensorX, projectedSensorTopY);
  const rearConeBottomY = interpolateLineY(rearX, irisX, apertureBottomY, sensorX, projectedSensorBottomY);

  elements.zoomBarrelInner.setAttribute("x", barrelInnerX.toFixed(1));
  elements.zoomBarrelInner.setAttribute("y", barrelInnerY.toFixed(1));
  elements.zoomBarrelInner.setAttribute("width", (barrelInnerRightX - barrelInnerX).toFixed(1));
  elements.zoomBarrelInner.setAttribute("height", barrelInnerHeight.toFixed(1));
  elements.zoomFrontGroup.setAttribute("cx", frontX.toFixed(1));
  elements.zoomFrontGroup.setAttribute("rx", frontRadiusX.toFixed(1));
  elements.zoomFrontGroup.setAttribute("ry", frontRadiusY.toFixed(1));
  elements.zoomMiddleGroup.setAttribute("cx", middleX.toFixed(1));
  elements.zoomMiddleGroup.setAttribute("rx", middleRadiusX.toFixed(1));
  elements.zoomMiddleGroup.setAttribute("ry", middleRadiusY.toFixed(1));
  elements.zoomRearGroup.setAttribute("cx", rearX.toFixed(1));
  elements.zoomRearGroup.setAttribute("rx", rearRadiusX.toFixed(1));
  elements.zoomRearGroup.setAttribute("ry", rearRadiusY.toFixed(1));
  elements.zoomIris.setAttribute("cx", irisX.toFixed(1));
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
  elements.zoomSensorDistanceText.setAttribute("y", "250");
  elements.zoomSensorDistanceText.textContent = verbose ? `s' = ${formatMillimeters(metrics.sensorDistanceMm)}` : `s' ${formatMillimeters(metrics.sensorDistanceMm)}`;
  elements.zoomProjectionSlice.setAttribute("x1", sensorX.toFixed(1));
  elements.zoomProjectionSlice.setAttribute("x2", sensorX.toFixed(1));
  elements.zoomProjectionSlice.setAttribute("y1", projectedSensorTopY.toFixed(1));
  elements.zoomProjectionSlice.setAttribute("y2", projectedSensorBottomY.toFixed(1));
  elements.zoomProbeBlurDisc.setAttribute("cx", sensorX.toFixed(1));
  elements.zoomProbeBlurDisc.setAttribute("cy", centerY.toFixed(1));
  elements.zoomProbeBlurDisc.setAttribute("r", probeBlurRadius.toFixed(1));
  elements.zoomCocRing.setAttribute("cx", sensorX.toFixed(1));
  elements.zoomCocRing.setAttribute("cy", centerY.toFixed(1));
  elements.zoomCocRing.setAttribute("r", cocRadius.toFixed(1));
  elements.zoomFieldCone.style.opacity = (0.26 + visualBundleIntensity * 0.44).toFixed(3);
  elements.zoomRayTop.style.opacity = visualBundleIntensity.toFixed(3);
  elements.zoomRayMid.style.opacity = (0.34 + visualBundleIntensity * 0.52).toFixed(3);
  elements.zoomRayBottom.style.opacity = visualBundleIntensity.toFixed(3);

  const cone = [
    { x: sceneX, y: sceneTopY },
    { x: frontConeX, y: frontConeTopY },
    { x: middleX, y: middleConeTopY },
    { x: irisX, y: apertureTopY },
    { x: rearX, y: rearConeTopY },
    { x: sensorX, y: projectedSensorTopY },
    { x: sensorX, y: projectedSensorBottomY },
    { x: rearX, y: rearConeBottomY },
    { x: irisX, y: apertureBottomY },
    { x: middleX, y: middleConeBottomY },
    { x: frontConeX, y: frontConeBottomY },
  ];
  const topRay = [
    { x: sceneX, y: sceneTopY },
    { x: frontRayX, y: frontRayTopY },
    { x: middleX, y: middleConeTopY },
    { x: irisX, y: apertureTopY },
    { x: rearX, y: rearConeTopY },
    { x: sensorX, y: projectedSensorTopY },
  ];
  const midRay = [
    { x: sceneX, y: centerY },
    { x: frontRayX, y: centerY },
    { x: middleX, y: centerY },
    { x: irisX, y: centerY },
    { x: rearX, y: centerY },
    { x: sensorX, y: centerY },
  ];
  const bottomRay = [
    { x: sceneX, y: sceneBottomY },
    { x: frontRayX, y: frontRayBottomY },
    { x: middleX, y: middleConeBottomY },
    { x: irisX, y: apertureBottomY },
    { x: rearX, y: rearConeBottomY },
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

function updateScenePreview(metrics) {
  const scene = scenePlaneDistances(metrics);
  const foregroundBlurMm = blurDiameterMm(metrics.focalLengthMm, metrics.fNumber, metrics.focusDistanceMm, scene.foregroundDistance * 1000);
  const subjectBlurMm = blurDiameterMm(metrics.focalLengthMm, metrics.fNumber, metrics.focusDistanceMm, scene.subjectDistance * 1000);
  const backgroundBlurMm = blurDiameterMm(metrics.focalLengthMm, metrics.fNumber, metrics.focusDistanceMm, scene.backgroundDistance * 1000);

  setSceneLayerDepth(elements.sceneBackgroundLayer, previewBlurPixels(backgroundBlurMm, metrics.cocMm), 1);
  setSceneLayerDepth(elements.sceneSubjectLayer, previewBlurPixels(subjectBlurMm, metrics.cocMm), 1);
  setSceneLayerDepth(elements.sceneForegroundLayer, previewBlurPixels(foregroundBlurMm, metrics.cocMm), 1.02);
  elements.sceneForegroundDistanceText.textContent = `foreground ${formatDistanceMeters(scene.foregroundDistance)}`;
  elements.sceneSubjectDistanceText.textContent = `subject ${formatDistanceMeters(scene.subjectDistance)}`;
  elements.sceneBackgroundDistanceText.textContent = `background ${formatDistanceMeters(scene.backgroundDistance)}`;

  return {
    ...scene,
    foregroundBlurMm,
    subjectBlurMm,
    backgroundBlurMm,
  };
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

function updateHelpText(metrics, sceneMetrics) {
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
  setHelp(helpTargets.sceneForegroundGroup, helpText("Scene foreground distance.", `Current foreground plane = ${formatDistanceMeters(sceneMetrics.foregroundDistance)}.`, "This adjusts the foreground layer in the scene comparison only."));
  setHelp(helpTargets.sceneBackgroundGroup, helpText("Scene background distance.", `Current background plane = ${formatDistanceMeters(sceneMetrics.backgroundDistance)}.`, "This adjusts the background layer in the scene comparison only."));

  setHelp(helpTargets.focalLengthControl, helpText("Focal length f.", `Current f = ${formatMillimeters(metrics.focalLengthMm)}.`, focusEquation, "Longer f usually means tighter framing and larger magnification."));
  setHelp(helpTargets.sensorDistanceControl, helpText("Sensor distance s'.", `Current s' = ${formatMillimeters(metrics.sensorDistanceMm)}.`, focusEquation, `Close-focus travel is capped around ${formatRatioMagnitude(MAX_PRACTICAL_FOCUS_MAGNIFICATION)} magnification so s' stays in a practical range.`, "This image-plane distance is locked to the focus distance by the thin-lens equation."));
  setHelp(helpTargets.focusDistanceControl, helpText("Focus distance s.", `Current s = ${formatDistanceMeters(metrics.focusDistanceMeters)}.`, focusEquation, `Minimum focus rises with focal length to keep close-focus magnification around ${formatRatioMagnitude(MAX_PRACTICAL_FOCUS_MAGNIFICATION)} or lower.`, "Subject distance is measured from the lens plane in this thin-lens model."));
  setHelp(helpTargets.fNumberControl, helpText("F-number N.", `Current N = ${formatFNumber(metrics.fNumber)}.`, `Aperture diameter D = f / N = ${formatMillimeters(metrics.apertureDiameterMm)}.`, `Exposure multiplier vs ${formatFNumber(EXPOSURE_REFERENCE_F_NUMBER)} = ${formatScaleRatio(relativeLightTransmission(metrics.fNumber, EXPOSURE_REFERENCE_F_NUMBER))}.`, "Smaller N means a wider opening and usually shallower depth of field."));
  setHelp(helpTargets.cocControl, helpText("Circle of confusion (CoC).", `Current CoC = ${formatMillimeters(metrics.cocMm)}.`, "Depth of field is the span where the blur circle stays at or below this limit.", hyperfocalEquation));
  setHelp(helpTargets.probeDistanceControl, helpText("Probe distance z.", `Current z = ${formatDistanceMeters(metrics.probeDistanceMeters)}.`, `z' = f z / (z - f) = ${probeImageText}.`, `Probe blur c(z) = D |s'_focus - z'| / z' = ${formatMillimeters(metrics.probeBlurMm)}.`));

  setHelp(helpTargets.summaryText, helpText("Live thin-lens summary.", focusEquation, `Magnification m = -s' / s = ${formatMagnification(metrics.magnification)}.`, `Probe blur c(z) = ${formatMillimeters(metrics.probeBlurMm)}.`));

  setHelp(helpTargets.nearDofPill, helpText("Near depth-of-field limit.", hyperfocalEquation, nearEquation));
  setHelp(helpTargets.farDofPill, helpText("Far depth-of-field limit.", hyperfocalEquation, farEquation));
  setHelp(helpTargets.totalDofPill, helpText("Total depth of field.", nearEquation, farEquation, totalEquation));

  setHelp(helpTargets.imageDistanceBar, helpText("Focus distance s.", `Current s = ${formatDistanceMeters(metrics.focusDistanceMeters)}.`, "This is the subject distance currently locked in by the sensor-position setting.", "Adjusting s' moves this value through the thin-lens equation."));
  setHelp(helpTargets.magnificationBar, helpText("Magnification m.", `m = -s' / s = ${formatMagnification(metrics.magnification)}.`, "The bar uses |m| so the size change stays easy to compare."));
  setHelp(helpTargets.apertureBar, helpText("Aperture diameter D.", `D = f / N = ${formatMillimeters(metrics.apertureDiameterMm)}.`, "This is the effective opening size used in the blur calculation."));
  setHelp(helpTargets.probeBlurBar, helpText("Probe blur c(z).", `z' = f z / (z - f) = ${probeImageText}.`, `c(z) = D |s'_focus - z'| / z' = ${formatMillimeters(metrics.probeBlurMm)}.`, `The threshold marker is the CoC limit: ${formatMillimeters(metrics.cocMm)}.`));
  setHelp(helpTargets.totalDofBar, helpText("Total depth of field.", hyperfocalEquation, nearEquation, farEquation, totalEquation));
  setHelp(helpTargets.hyperfocalBar, helpText("Hyperfocal distance H.", "This is the focus distance that pushes the far DOF limit to Infinity.", hyperfocalEquation));

  setHelp([helpTargets.zoomDemoCard, elements.zoomLensDemo], helpText("Variable lens demo.", `Effective focal length is shown as ${formatMillimeters(metrics.focalLengthMm)}.`, `The moving sensor plane and dimension line show s' = ${formatMillimeters(metrics.sensorDistanceMm)}.`, "The iris now pinches the amber bundle as N closes down, while the teal span still shows the projected image height at the sensor plane.", "If that span is shorter than the sensor, the image fits inside it; if it runs past the sensor ends, the sensor is cropping the projection.", `The amber ring marks the CoC threshold c = ${formatMillimeters(metrics.cocMm)} and the filled disc shows the current probe blur.`, "Approximate field slice: 2 * atan(sensor_half / f)."));
  setHelp([helpTargets.sceneCard, elements.scenePreview], helpText("Scene blur comparison.", "Left panel stays sharp as a before view; right panel applies the live optical blur.", `Foreground plane is around ${formatDistanceMeters(sceneMetrics.foregroundDistance)} with blur ${formatMillimeters(sceneMetrics.foregroundBlurMm)}.`, `Subject plane follows z = ${formatDistanceMeters(sceneMetrics.subjectDistance)} with blur ${formatMillimeters(sceneMetrics.subjectBlurMm)}.`, `Background plane is around ${formatDistanceMeters(sceneMetrics.backgroundDistance)} with blur ${formatMillimeters(sceneMetrics.backgroundBlurMm)}.`, "The before view uses left, center, and right thirds for foreground, subject, and background dragging.", "Each layer uses the current thin-lens blur from the live f, N, s, z, and CoC settings."));
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
    const storedVersion = Math.max(0, Math.floor(safeNumber(stored.version, 0)));
    const storedTheme = DISPLAY_THEMES.includes(stored.theme) ? stored.theme : DISPLAY_DEFAULTS.theme;
    displayState.theme = storedVersion < DISPLAY_STORAGE_VERSION && storedTheme === "sand" ? DISPLAY_DEFAULTS.theme : storedTheme;
    displayState.verbose = typeof stored.verbose === "boolean" ? stored.verbose : DISPLAY_DEFAULTS.verbose;
    displayState.transparency = quantize(clamp(safeNumber(stored.transparency, DISPLAY_DEFAULTS.transparency), 0, 60));
    displayState.width = quantize(clamp(safeNumber(stored.width, DISPLAY_DEFAULTS.width), 960, 1600), 20);
    displayState.blur = quantize(clamp(safeNumber(stored.blur, DISPLAY_DEFAULTS.blur), 0, 28));
    displayState.radius = quantize(clamp(safeNumber(stored.radius, DISPLAY_DEFAULTS.radius), 18, 34));
    displayState.foregroundDistance = clamp(safeNumber(stored.foregroundDistance, DISPLAY_DEFAULTS.foregroundDistance), DISTANCE_FLOOR_METERS, DISTANCE_MAX_METERS);
    displayState.backgroundDistance = clamp(safeNumber(stored.backgroundDistance, DISPLAY_DEFAULTS.backgroundDistance), DISTANCE_FLOOR_METERS, DISTANCE_MAX_METERS);
  } catch {
    Object.assign(displayState, DISPLAY_DEFAULTS);
  }
}

function saveDisplaySettings() {
  try {
    window.localStorage.setItem(
      DISPLAY_STORAGE_KEY,
      JSON.stringify({ version: DISPLAY_STORAGE_VERSION, ...displayState }),
    );
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
  const minDistance = distanceMinMeters();
  displayState.foregroundDistance = clamp(displayState.foregroundDistance, minDistance, DISTANCE_MAX_METERS);
  displayState.backgroundDistance = clamp(displayState.backgroundDistance, minDistance, DISTANCE_MAX_METERS);
  elements.verboseToggle.checked = displayState.verbose;
  elements.transparencyRange.value = displayState.transparency.toFixed(0);
  elements.transparencyDisplay.textContent = `${displayState.transparency.toFixed(0)}%`;
  elements.contentWidthRange.value = displayState.width.toFixed(0);
  elements.contentWidthDisplay.textContent = formatPixels(displayState.width);
  elements.blurStrengthRange.value = displayState.blur.toFixed(0);
  elements.blurStrengthDisplay.textContent = formatPixels(displayState.blur);
  elements.radiusRange.value = displayState.radius.toFixed(0);
  elements.radiusDisplay.textContent = formatPixels(displayState.radius);
  elements.sceneForegroundRange.value = unmapLogSlider(displayState.foregroundDistance, minDistance, DISTANCE_MAX_METERS).toFixed(0);
  elements.sceneForegroundDisplay.textContent = formatDistanceMeters(displayState.foregroundDistance);
  elements.sceneBackgroundRange.value = unmapLogSlider(displayState.backgroundDistance, minDistance, DISTANCE_MAX_METERS).toFixed(0);
  elements.sceneBackgroundDisplay.textContent = formatDistanceMeters(displayState.backgroundDistance);
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
let zoomScaleImmediateTimer = 0;

function pulseZoomScaleImmediateMode() {
  if (!elements.zoomScaleTrack) {
    return;
  }

  elements.zoomScaleTrack.classList.add("is-live");
  window.clearTimeout(zoomScaleImmediateTimer);
  zoomScaleImmediateTimer = window.setTimeout(() => {
    elements.zoomScaleTrack.classList.remove("is-live");
    zoomScaleImmediateTimer = 0;
  }, 90);
}

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
    const active = button.dataset.preset === selectedPresetKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function syncControls() {
  const minDistance = distanceMinMeters();
  const sensorBounds = sensorDistanceBoundsMm(state.focalLength);
  const verbose = displayState.verbose;
  state.focusDistance = clamp(state.focusDistance, minDistance, DISTANCE_MAX_METERS);
  state.probeDistance = clamp(state.probeDistance, minDistance, DISTANCE_MAX_METERS);
  const sensorDistance = imageDistanceMm(state.focalLength, state.focusDistance * 1000);
  elements.focalLengthLabel.textContent = verbose ? "f (focal length)" : "f";
  elements.fNumberLabel.textContent = verbose ? "N (f-number)" : "N";
  elements.focusDistanceLabel.textContent = verbose ? "s (focus distance)" : "s";
  elements.sensorDistanceLabel.textContent = verbose ? "s' (sensor distance)" : "s'";
  elements.cocLabel.textContent = verbose ? "CoC (circle of confusion)" : "CoC";
  elements.probeDistanceLabel.textContent = verbose ? "z (probe distance)" : "z";
  elements.focalLengthRange.value = unmapLogSlider(state.focalLength, FOCAL_LENGTH_MIN_MM, FOCAL_LENGTH_MAX_MM).toFixed(0);
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
  elements.fNumberRange.value = unmapLogSlider(state.fNumber, F_NUMBER_MIN, F_NUMBER_MAX).toFixed(0);
  elements.fNumberNumber.value = state.fNumber.toFixed(1);
  elements.fNumberDisplay.textContent = formatFNumber(state.fNumber);
  elements.fNumberLightLoss.textContent = `exposure multiplier: ${formatScaleRatio(relativeLightTransmission(state.fNumber, EXPOSURE_REFERENCE_F_NUMBER))} vs ${formatFNumber(EXPOSURE_REFERENCE_F_NUMBER)}`;
  elements.cocRange.value = unmapLogSlider(state.coc, COC_MIN_MM, COC_MAX_MM).toFixed(0);
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
  syncDisplayControls();
  const metrics = updateDerivedMetrics();
  updateZoomDemo(metrics);
  const sceneMetrics = updateScenePreview(metrics);
  updateHelpText(metrics, sceneMetrics);
  updateOutputBars(metrics);
  drawImageChart(metrics);
  drawMagnificationChart(metrics);
  drawBlurChart(metrics);
}

function selectedPreset() {
  return selectedPresetKey ? presets[selectedPresetKey] || null : null;
}

function resetControlToSelectedPreset(controlKey) {
  const preset = selectedPreset();
  if (!preset) {
    return;
  }

  if (controlKey === "sensorDistance") {
    state.focalLength = preset.focalLength;
    state.focusDistance = preset.focusDistance;
  } else if (controlKey in preset) {
    state[controlKey] = preset[controlKey];
  } else {
    return;
  }

  render();
}

function bindLogPair(rangeElement, numberElement, key, min, max, step = 1) {
  rangeElement.addEventListener("input", () => {
    state[key] = quantize(
      clamp(mapLogSlider(safeNumber(rangeElement.value, 0), min, max), min, max),
      step,
    );
    render();
  });
  numberElement.addEventListener("input", () => {
    state[key] = quantize(clamp(safeNumber(numberElement.value, state[key]), min, max), step);
    render();
  });
}

function bindSnappedLogPair(rangeElement, numberElement, key, min, max, allowedValues, options = {}) {
  const { immediateWhileDragging = false } = options;
  const updateValue = (rawValue) => {
    state[key] = snapToAllowedValue(clamp(rawValue, min, max), allowedValues);
    render();
  };

  rangeElement.addEventListener("input", () => {
    if (immediateWhileDragging) {
      pulseZoomScaleImmediateMode();
    }
    updateValue(mapLogSlider(safeNumber(rangeElement.value, 0), min, max));
  });

  numberElement.addEventListener("change", () => {
    updateValue(safeNumber(numberElement.value, state[key]));
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

function bindPresetReset(rangeElement, controlKey) {
  rangeElement.addEventListener("dblclick", (event) => {
    if (!selectedPreset()) {
      return;
    }
    event.preventDefault();
    resetControlToSelectedPreset(controlKey);
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

function bindDisplayDistanceRange(rangeElement, key) {
  rangeElement.addEventListener("input", () => {
    const minDistance = distanceMinMeters();
    displayState[key] = mapLogSlider(safeNumber(rangeElement.value, 0), minDistance, DISTANCE_MAX_METERS);
    applyDisplaySettings(true);
    saveDisplaySettings();
  });
}

let activeSceneDistanceDrag = null;
let activeSceneReferenceZone = "";

function setActiveSceneReferenceZone(key) {
  activeSceneReferenceZone = key === "foreground" || key === "subject" || key === "background" ? key : "";
  [
    ["foreground", elements.sceneReferenceForegroundZone, elements.sceneForegroundChip],
    ["subject", elements.sceneReferenceSubjectZone, elements.sceneSubjectChip],
    ["background", elements.sceneReferenceBackgroundZone, elements.sceneBackgroundChip],
  ].forEach(([zoneKey, zoneElement, chipElement]) => {
    const isActive = zoneKey === activeSceneReferenceZone;
    zoneElement?.classList.toggle("is-active", isActive);
    chipElement?.classList.toggle("is-active", isActive);
  });
}

function sceneReferenceZoneKeyFromClientX(clientX) {
  if (!elements.scenePreviewReference) {
    return "";
  }

  const bounds = elements.scenePreviewReference.getBoundingClientRect();
  if (bounds.width <= 0) {
    return "";
  }

  const relativeX = clamp(clientX - bounds.left, 0, Math.max(bounds.width - 1, 0));
  const thirdWidth = bounds.width / 3;
  if (relativeX < thirdWidth) {
    return "foreground";
  }
  if (relativeX < thirdWidth * 2) {
    return "subject";
  }
  return "background";
}

function readSceneDistanceValue(key) {
  if (key === "foreground") {
    return displayState.foregroundDistance;
  }
  if (key === "background") {
    return displayState.backgroundDistance;
  }
  return state.probeDistance;
}

function writeSceneDistanceValue(key, nextDistance) {
  if (key === "foreground") {
    displayState.foregroundDistance = nextDistance;
  } else if (key === "background") {
    displayState.backgroundDistance = nextDistance;
  } else {
    state.probeDistance = nextDistance;
  }
}

function sceneDistanceFromDrag(startDistance, startMinDistance, deltaPx, widthPx) {
  const safeWidth = Math.max(widthPx, 1);
  const safeMinDistance = Math.max(startMinDistance, DISTANCE_FLOOR_METERS);
  const rangeRatio = DISTANCE_MAX_METERS / safeMinDistance;
  return clamp(startDistance * Math.pow(rangeRatio, deltaPx / safeWidth), safeMinDistance, DISTANCE_MAX_METERS);
}

function beginSceneDistanceDrag(key, event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  event.preventDefault();
  activeSceneDistanceDrag = {
    key,
    pointerId: event.pointerId,
    startX: event.clientX,
    startDistance: readSceneDistanceValue(key),
    startMinDistance: distanceMinMeters(),
    element: event.currentTarget,
    previewElement: event.currentTarget.ownerSVGElement || elements.scenePreview,
  };
  activeSceneDistanceDrag.element.classList.add("is-dragging");
  if (activeSceneDistanceDrag.previewElement === elements.scenePreviewReference) {
    setActiveSceneReferenceZone(key);
  }
  if (typeof activeSceneDistanceDrag.element.setPointerCapture === "function") {
    activeSceneDistanceDrag.element.setPointerCapture(event.pointerId);
  }
}

function updateSceneDistanceDrag(event) {
  if (!activeSceneDistanceDrag || event.pointerId !== activeSceneDistanceDrag.pointerId) {
    return;
  }

  const previewWidth = activeSceneDistanceDrag.previewElement.getBoundingClientRect().width;
  const nextDistance = sceneDistanceFromDrag(
    activeSceneDistanceDrag.startDistance,
    activeSceneDistanceDrag.startMinDistance,
    event.clientX - activeSceneDistanceDrag.startX,
    previewWidth,
  );
  if (activeSceneDistanceDrag.previewElement === elements.scenePreviewReference) {
    setActiveSceneReferenceZone(activeSceneDistanceDrag.key);
  }
  writeSceneDistanceValue(activeSceneDistanceDrag.key, nextDistance);
  render();
}

function endSceneDistanceDrag(event) {
  if (!activeSceneDistanceDrag || event.pointerId !== activeSceneDistanceDrag.pointerId) {
    return;
  }

  const dragState = activeSceneDistanceDrag;
  dragState.element.classList.remove("is-dragging");
  if (
    typeof dragState.element.releasePointerCapture === "function" &&
    dragState.element.hasPointerCapture?.(event.pointerId)
  ) {
    dragState.element.releasePointerCapture(event.pointerId);
  }
  const shouldPersistDisplayDistance = dragState.key !== "subject";
  if (dragState.previewElement === elements.scenePreviewReference) {
    setActiveSceneReferenceZone("");
  }
  activeSceneDistanceDrag = null;
  if (shouldPersistDisplayDistance) {
    saveDisplaySettings();
  }
}

bindSnappedLogPair(
  elements.focalLengthRange,
  elements.focalLengthNumber,
  "focalLength",
  FOCAL_LENGTH_MIN_MM,
  FOCAL_LENGTH_MAX_MM,
  COMMON_FOCAL_LENGTHS_MM,
  { immediateWhileDragging: true },
);
bindSnappedLogPair(elements.fNumberRange, elements.fNumberNumber, "fNumber", F_NUMBER_MIN, F_NUMBER_MAX, COMMON_F_NUMBERS);
bindLogPair(elements.cocRange, elements.cocNumber, "coc", COC_MIN_MM, COC_MAX_MM, 0.001);
bindSensorDistancePair(elements.sensorDistanceRange, elements.sensorDistanceNumber);
bindDistancePair(elements.focusDistanceRange, elements.focusDistanceNumber, "focusDistance");
bindDistancePair(elements.probeDistanceRange, elements.probeDistanceNumber, "probeDistance");
bindPresetReset(elements.focalLengthRange, "focalLength");
bindPresetReset(elements.sensorDistanceRange, "sensorDistance");
bindPresetReset(elements.focusDistanceRange, "focusDistance");
bindPresetReset(elements.fNumberRange, "fNumber");
bindPresetReset(elements.cocRange, "coc");
bindPresetReset(elements.probeDistanceRange, "probeDistance");
populateRangeTicks(elements.focalLengthTicks, COMMON_FOCAL_LENGTHS_MM, FOCAL_LENGTH_MIN_MM, FOCAL_LENGTH_MAX_MM);
populateRangeTicks(elements.fNumberTicks, COMMON_F_NUMBERS, F_NUMBER_MIN, F_NUMBER_MAX);

elements.presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = presets[button.dataset.preset];
    if (!preset) {
      return;
    }
    selectedPresetKey = button.dataset.preset;
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
bindDisplayDistanceRange(elements.sceneForegroundRange, "foregroundDistance");
bindDisplayDistanceRange(elements.sceneBackgroundRange, "backgroundDistance");
elements.sceneDistanceDragLayers.forEach((layer) => {
  const key = layer.dataset.sceneDistanceDrag;
  if (!key) {
    return;
  }
  layer.addEventListener("pointerdown", (event) => beginSceneDistanceDrag(key, event));
});
elements.scenePreviewReference.addEventListener("pointermove", (event) => {
  if (activeSceneDistanceDrag?.previewElement === elements.scenePreviewReference) {
    return;
  }
  setActiveSceneReferenceZone(sceneReferenceZoneKeyFromClientX(event.clientX));
});
elements.scenePreviewReference.addEventListener("pointerleave", () => {
  if (activeSceneDistanceDrag?.previewElement === elements.scenePreviewReference) {
    return;
  }
  setActiveSceneReferenceZone("");
});
window.addEventListener("pointermove", updateSceneDistanceDrag);
window.addEventListener("pointerup", endSceneDistanceDrag);
window.addEventListener("pointercancel", endSceneDistanceDrag);

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
