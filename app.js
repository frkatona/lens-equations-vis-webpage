const DISTANCE_MAX_METERS = 100;
const SAMPLE_COUNT = 220;
const BLUR_SAMPLE_COUNT = 260;
const DISTANCE_MARGIN_METERS = 0.05;
const DISTANCE_FLOOR_METERS = 0.18;

const presets = {
  portrait: {
    focalLength: 85,
    focusDistance: 2,
    fNumber: 2,
    coc: 0.03,
    probeDistance: 3,
  },
  macro: {
    focalLength: 100,
    focusDistance: 0.6,
    fNumber: 4,
    coc: 0.02,
    probeDistance: 0.72,
  },
  landscape: {
    focalLength: 24,
    focusDistance: 5,
    fNumber: 11,
    coc: 0.03,
    probeDistance: 15,
  },
  sports: {
    focalLength: 200,
    focusDistance: 20,
    fNumber: 2.8,
    coc: 0.03,
    probeDistance: 32,
  },
  phone: {
    focalLength: 6,
    focusDistance: 1.2,
    fNumber: 1.8,
    coc: 0.008,
    probeDistance: 2.4,
  },
};

const state = { ...presets.portrait };

const elements = {
  focalLengthRange: document.getElementById("focalLengthRange"),
  focalLengthNumber: document.getElementById("focalLengthNumber"),
  focalLengthDisplay: document.getElementById("focalLengthDisplay"),
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
  imageDistanceValue: document.getElementById("imageDistanceValue"),
  magnificationValue: document.getElementById("magnificationValue"),
  apertureValue: document.getElementById("apertureValue"),
  probeBlurValue: document.getElementById("probeBlurValue"),
  nearDofValue: document.getElementById("nearDofValue"),
  farDofValue: document.getElementById("farDofValue"),
  totalDofValue: document.getElementById("totalDofValue"),
  hyperfocalValue: document.getElementById("hyperfocalValue"),
  summaryText: document.getElementById("summaryText"),
  imageChart: document.getElementById("imageChart"),
  magnificationChart: document.getElementById("magnificationChart"),
  blurChart: document.getElementById("blurChart"),
  presetButtons: Array.from(document.querySelectorAll("[data-preset]")),
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeNumber(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function distanceMinMeters() {
  return Math.max(
    DISTANCE_FLOOR_METERS,
    state.focalLength / 1000 + DISTANCE_MARGIN_METERS
  );
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

function magnification(focalLengthMm, subjectDistanceMm) {
  const imageDistance = imageDistanceMm(focalLengthMm, subjectDistanceMm);
  return -imageDistance / subjectDistanceMm;
}

function apertureDiameterMm(focalLengthMm, fNumber) {
  return focalLengthMm / fNumber;
}

function blurDiameterMm(
  focalLengthMm,
  fNumber,
  focusDistanceMm,
  subjectDistanceMm
) {
  const focusImageDistance = imageDistanceMm(focalLengthMm, focusDistanceMm);
  const subjectImageDistance = imageDistanceMm(focalLengthMm, subjectDistanceMm);
  const aperture = apertureDiameterMm(focalLengthMm, fNumber);

  if (
    !Number.isFinite(focusImageDistance) ||
    !Number.isFinite(subjectImageDistance)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  return (
    aperture * Math.abs(focusImageDistance - subjectImageDistance) / subjectImageDistance
  );
}

function hyperfocalMm(focalLengthMm, fNumber, cocMm) {
  return (focalLengthMm * focalLengthMm) / (fNumber * cocMm) + focalLengthMm;
}

function depthOfFieldMm(focalLengthMm, fNumber, cocMm, focusDistanceMm) {
  const hyperfocal = hyperfocalMm(focalLengthMm, fNumber, cocMm);
  const near =
    (hyperfocal * focusDistanceMm) /
    (hyperfocal + (focusDistanceMm - focalLengthMm));
  const farDenominator = hyperfocal - (focusDistanceMm - focalLengthMm);
  const far =
    farDenominator <= 0
      ? Number.POSITIVE_INFINITY
      : (hyperfocal * focusDistanceMm) / farDenominator;

  return {
    hyperfocal,
    near,
    far,
    total: Number.isFinite(far) ? far - near : Number.POSITIVE_INFINITY,
  };
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

function formatRatioMagnitude(value) {
  return `${Math.abs(value).toFixed(Math.abs(value) < 0.1 ? 3 : 2)}x`;
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

  if (ticks.length === 0) {
    ticks.push(min, max);
  }

  return ticks;
}

function makeDistanceTicks(min, max) {
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

  return ticks.filter((value, index, list) => {
    if (index === 0) {
      return true;
    }

    return value / list[index - 1] > 1.28;
  });
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

  return {
    ctx,
    width: rect.width,
    height: rect.height,
  };
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

function drawPanelBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.86)");
  gradient.addColorStop(1, "rgba(247, 240, 229, 0.9)");
  roundRectPath(ctx, 0, 0, width, height, 18);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "rgba(27, 42, 50, 0.08)";
  ctx.stroke();
}

function drawChartFrame(
  ctx,
  width,
  height,
  yTicks,
  xTicks,
  mapX,
  mapY,
  yFormatter,
  xFormatter,
  yLabel
) {
  const left = 58;
  const right = 16;
  const top = 16;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  drawPanelBackground(ctx, width, height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, plotWidth, plotHeight);
  ctx.clip();

  yTicks.forEach((tick) => {
    const y = mapY(tick);
    ctx.strokeStyle = "rgba(27, 42, 50, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
  });

  xTicks.forEach((tick) => {
    const x = mapX(tick);
    ctx.strokeStyle = "rgba(27, 42, 50, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, height - bottom);
    ctx.stroke();
  });
  ctx.restore();

  ctx.strokeStyle = "rgba(27, 42, 50, 0.28)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, height - bottom);
  ctx.lineTo(width - right, height - bottom);
  ctx.stroke();

  ctx.fillStyle = "#56646b";
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  yTicks.forEach((tick) => {
    ctx.fillText(yFormatter(tick), left - 10, mapY(tick));
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  xTicks.forEach((tick) => {
    ctx.fillText(xFormatter(tick), mapX(tick), height - bottom + 8);
  });

  ctx.save();
  ctx.translate(16, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#56646b";
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();

  ctx.fillStyle = "#56646b";
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("subject distance", width - right, height - 6);

  return {
    left,
    right,
    top,
    bottom,
    plotWidth,
    plotHeight,
  };
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
  ctx.fillStyle = color;
  ctx.fillText(label, x + 10, y + (align === "top" ? -8 : 8));
  ctx.restore();
}

function drawImageChart(metrics) {
  const { ctx, width, height } = prepareCanvas(elements.imageChart);
  const minDistance = distanceMinMeters();
  const maxDistance = DISTANCE_MAX_METERS;

  const points = [];
  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const t = index / (SAMPLE_COUNT - 1);
    const distanceMeters = minDistance * Math.pow(maxDistance / minDistance, t);
    const y = imageDistanceMm(metrics.focalLengthMm, distanceMeters * 1000);
    points.push({ x: distanceMeters, y });
  }

  const yMax = Math.max(
    ...points.map((point) => point.y).filter((value) => Number.isFinite(value))
  );
  const yMin = metrics.focalLengthMm * 0.92;
  const xTicks = makeDistanceTicks(minDistance, maxDistance);
  const yTicks = makeLinearTicks(yMin, yMax, 5);
  const xToPx = (value) => {
    const left = 58;
    const right = 16;
    const plotWidth = width - left - right;
    const position =
      Math.log(value / minDistance) / Math.log(maxDistance / minDistance);
    return left + position * plotWidth;
  };
  const yToPx = (value) => {
    const top = 16;
    const bottom = 34;
    const plotHeight = height - top - bottom;
    return height - bottom - ((value - yMin) / (yMax - yMin)) * plotHeight;
  };

  drawChartFrame(
    ctx,
    width,
    height,
    yTicks,
    xTicks,
    xToPx,
    yToPx,
    (tick) => `${tick.toFixed(tick < 100 ? 1 : 0)} mm`,
    (tick) => formatDistanceMeters(tick),
    "image distance s'"
  );

  drawSeries(ctx, points, xToPx, yToPx, "#c26a2c", 3);
  drawMarker(
    ctx,
    xToPx(metrics.focusDistanceMeters),
    yToPx(metrics.imageDistanceMm),
    "focus point",
    "#1b7176",
    "top"
  );
}

function drawMagnificationChart(metrics) {
  const { ctx, width, height } = prepareCanvas(elements.magnificationChart);
  const minDistance = distanceMinMeters();
  const maxDistance = DISTANCE_MAX_METERS;
  const points = [];

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const t = index / (SAMPLE_COUNT - 1);
    const distanceMeters = minDistance * Math.pow(maxDistance / minDistance, t);
    const mag = Math.abs(magnification(metrics.focalLengthMm, distanceMeters * 1000));
    points.push({ x: distanceMeters, y: mag });
  }

  const maxMagnitude = Math.max(...points.map((point) => point.y));
  const yMin = 0;
  const yMax = maxMagnitude * 1.04;
  const xTicks = makeDistanceTicks(minDistance, maxDistance);
  const yTicks = makeLinearTicks(yMin, yMax, 5);

  const xToPx = (value) => {
    const left = 58;
    const right = 16;
    const plotWidth = width - left - right;
    const position =
      Math.log(value / minDistance) / Math.log(maxDistance / minDistance);
    return left + position * plotWidth;
  };
  const yToPx = (value) => {
    const top = 16;
    const bottom = 34;
    const plotHeight = height - top - bottom;
    return height - bottom - ((value - yMin) / (yMax - yMin || 1)) * plotHeight;
  };

  drawChartFrame(
    ctx,
    width,
    height,
    yTicks,
    xTicks,
    xToPx,
    yToPx,
    (tick) => `${tick.toFixed(tick < 1 ? 2 : 1)}x`,
    (tick) => formatDistanceMeters(tick),
    "|m|"
  );

  drawSeries(ctx, points, xToPx, yToPx, "#1b7176", 3);
  drawMarker(
    ctx,
    xToPx(metrics.focusDistanceMeters),
    yToPx(Math.abs(metrics.magnification)),
    "focus point",
    "#c26a2c",
    "top"
  );
}

function drawBlurChart(metrics) {
  const { ctx, width, height } = prepareCanvas(elements.blurChart);
  const baseMin = distanceMinMeters();
  const nearBound = Number.isFinite(metrics.nearDofMeters)
    ? Math.max(baseMin, metrics.nearDofMeters * 0.82)
    : Math.max(baseMin, metrics.focusDistanceMeters * 0.7);
  const farBound = Number.isFinite(metrics.farDofMeters)
    ? Math.min(
        DISTANCE_MAX_METERS,
        Math.max(metrics.farDofMeters * 1.18, metrics.focusDistanceMeters * 1.25)
      )
    : Math.min(DISTANCE_MAX_METERS, metrics.focusDistanceMeters * 4);
  const probeMinBound = Math.min(metrics.focusDistanceMeters, metrics.probeDistanceMeters) * 0.82;
  const probeMaxBound = Math.max(metrics.focusDistanceMeters, metrics.probeDistanceMeters) * 1.18;
  const minDistance = Math.max(
    baseMin,
    Math.min(nearBound, probeMinBound)
  );
  const maxDistance = Math.min(
    DISTANCE_MAX_METERS,
    Math.max(farBound, probeMaxBound, minDistance * 1.6)
  );

  const points = [];
  for (let index = 0; index < BLUR_SAMPLE_COUNT; index += 1) {
    const t = index / (BLUR_SAMPLE_COUNT - 1);
    const distanceMeters = minDistance * Math.pow(maxDistance / minDistance, t);
    const blur = blurDiameterMm(
      metrics.focalLengthMm,
      metrics.fNumber,
      metrics.focusDistanceMm,
      distanceMeters * 1000
    );
    points.push({ x: distanceMeters, y: blur });
  }

  const finiteBlurs = points
    .map((point) => point.y)
    .filter((value) => Number.isFinite(value));
  const maxBlur = Math.max(
    metrics.cocMm * 6,
    metrics.probeBlurMm * 1.15,
    percentile(finiteBlurs, 0.88)
  );
  const yMin = 0;
  const yMax = maxBlur * 1.05;
  const xTicks = makeDistanceTicks(minDistance, maxDistance);
  const yTicks = makeLinearTicks(yMin, yMax, 5);

  const xToPx = (value) => {
    const left = 58;
    const right = 16;
    const plotWidth = width - left - right;
    const position =
      Math.log(value / minDistance) / Math.log(maxDistance / minDistance);
    return left + position * plotWidth;
  };
  const yToPx = (value) => {
    const top = 16;
    const bottom = 34;
    const plotHeight = height - top - bottom;
    return height - bottom - ((value - yMin) / (yMax - yMin || 1)) * plotHeight;
  };

  const frame = drawChartFrame(
    ctx,
    width,
    height,
    yTicks,
    xTicks,
    xToPx,
    yToPx,
    (tick) => `${tick.toFixed(tick < 0.1 ? 3 : 2)} mm`,
    (tick) => formatDistanceMeters(tick),
    "blur circle c(z)"
  );

  ctx.save();
  ctx.beginPath();
  ctx.rect(frame.left, frame.top, frame.plotWidth, frame.plotHeight);
  ctx.clip();

  const shadeStart = Math.max(minDistance, metrics.nearDofMeters);
  const shadeEnd = Number.isFinite(metrics.farDofMeters)
    ? Math.min(maxDistance, metrics.farDofMeters)
    : maxDistance;
  if (shadeEnd > shadeStart) {
    ctx.fillStyle = "rgba(27, 113, 118, 0.12)";
    ctx.fillRect(
      xToPx(shadeStart),
      frame.top,
      xToPx(shadeEnd) - xToPx(shadeStart),
      frame.plotHeight
    );
  }

  const thresholdY = yToPx(metrics.cocMm);
  ctx.strokeStyle = "rgba(194, 106, 44, 0.9)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(frame.left, thresholdY);
  ctx.lineTo(width - frame.right, thresholdY);
  ctx.stroke();
  ctx.setLineDash([]);

  drawSeries(ctx, points, xToPx, yToPx, "#1b7176", 3);
  ctx.restore();

  drawMarker(
    ctx,
    xToPx(metrics.focusDistanceMeters),
    yToPx(0),
    "focus",
    "#c26a2c",
    "top"
  );
  drawMarker(
    ctx,
    xToPx(clamp(metrics.probeDistanceMeters, minDistance, maxDistance)),
    yToPx(Math.min(metrics.probeBlurMm, yMax)),
    "probe",
    "#8c3f19",
    "bottom"
  );

  ctx.fillStyle = "#c26a2c";
  ctx.font = '12px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText("CoC threshold", frame.left + 10, thresholdY - 8);
}

function updateDerivedMetrics() {
  const focalLengthMm = state.focalLength;
  const focusDistanceMm = state.focusDistance * 1000;
  const probeDistanceMm = state.probeDistance * 1000;
  const imageDistance = imageDistanceMm(focalLengthMm, focusDistanceMm);
  const magnificationValue = magnification(focalLengthMm, focusDistanceMm);
  const aperture = apertureDiameterMm(focalLengthMm, state.fNumber);
  const probeBlur = blurDiameterMm(
    focalLengthMm,
    state.fNumber,
    focusDistanceMm,
    probeDistanceMm
  );
  const dof = depthOfFieldMm(
    focalLengthMm,
    state.fNumber,
    state.coc,
    focusDistanceMm
  );

  const metrics = {
    focalLengthMm,
    focusDistanceMm,
    focusDistanceMeters: state.focusDistance,
    probeDistanceMm,
    probeDistanceMeters: state.probeDistance,
    fNumber: state.fNumber,
    cocMm: state.coc,
    imageDistanceMm: imageDistance,
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

  elements.imageDistanceValue.textContent = formatMillimeters(imageDistance);
  elements.magnificationValue.textContent = formatMagnification(magnificationValue);
  elements.apertureValue.textContent = formatMillimeters(aperture);
  elements.probeBlurValue.textContent = formatMillimeters(probeBlur);
  elements.nearDofValue.textContent = formatDistanceMeters(dof.near / 1000);
  elements.farDofValue.textContent = Number.isFinite(dof.far)
    ? formatDistanceMeters(dof.far / 1000)
    : "Infinity";
  elements.totalDofValue.textContent = Number.isFinite(dof.total)
    ? formatDistanceMeters(dof.total / 1000)
    : "Infinity";
  elements.hyperfocalValue.textContent = formatDistanceMeters(dof.hyperfocal / 1000);

  const blurRelation = probeBlur <= state.coc ? "inside" : "outside";
  const blurRatio = probeBlur / state.coc;
  const blurFactorText =
    blurRelation === "inside"
      ? `${blurRatio.toFixed(2)}x of the limit`
      : `${blurRatio.toFixed(1)}x over the limit`;
  elements.summaryText.textContent = `At ${state.focalLength.toFixed(
    0
  )} mm focused at ${formatDistanceMeters(
    state.focusDistance
  )}, the sensor plane lands ${formatMillimeters(
    imageDistance
  )} behind the lens and the image is ${formatRatioMagnitude(
    magnificationValue
  )} tall on the sensor. A subject at ${formatDistanceMeters(
    state.probeDistance
  )} throws a ${formatMillimeters(
    probeBlur
  )} blur circle, which is ${blurRelation} the ${formatMillimeters(
    state.coc
  )} CoC criterion at ${blurFactorText}.`;

  return metrics;
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
  state.focusDistance = clamp(state.focusDistance, minDistance, DISTANCE_MAX_METERS);
  state.probeDistance = clamp(state.probeDistance, minDistance, DISTANCE_MAX_METERS);

  elements.focalLengthRange.value = state.focalLength.toFixed(0);
  elements.focalLengthNumber.value = state.focalLength.toFixed(0);
  elements.focalLengthDisplay.textContent = `${state.focalLength.toFixed(0)} mm`;

  elements.focusDistanceRange.value = unmapLogSlider(
    state.focusDistance,
    minDistance,
    DISTANCE_MAX_METERS
  ).toFixed(0);
  elements.focusDistanceNumber.min = minDistance.toFixed(2);
  elements.focusDistanceNumber.value = state.focusDistance.toFixed(2);
  elements.focusDistanceDisplay.textContent = formatDistanceMeters(
    state.focusDistance
  );

  elements.fNumberRange.value = state.fNumber.toFixed(1);
  elements.fNumberNumber.value = state.fNumber.toFixed(1);
  elements.fNumberDisplay.textContent = formatFNumber(state.fNumber);

  elements.cocRange.value = state.coc.toFixed(3);
  elements.cocNumber.value = state.coc.toFixed(3);
  elements.cocDisplay.textContent = formatMillimeters(state.coc);

  elements.probeDistanceRange.value = unmapLogSlider(
    state.probeDistance,
    minDistance,
    DISTANCE_MAX_METERS
  ).toFixed(0);
  elements.probeDistanceNumber.min = minDistance.toFixed(2);
  elements.probeDistanceNumber.value = state.probeDistance.toFixed(2);
  elements.probeDistanceDisplay.textContent = formatDistanceMeters(
    state.probeDistance
  );

  syncPresetButtons();
}

function render() {
  syncControls();
  const metrics = updateDerivedMetrics();
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
    state[key] = mapLogSlider(
      safeNumber(rangeElement.value, 0),
      minDistance,
      DISTANCE_MAX_METERS
    );
    render();
  });

  numberElement.addEventListener("input", () => {
    const minDistance = distanceMinMeters();
    state[key] = clamp(
      safeNumber(numberElement.value, state[key]),
      minDistance,
      DISTANCE_MAX_METERS
    );
    render();
  });
}

bindLinearPair(
  elements.focalLengthRange,
  elements.focalLengthNumber,
  "focalLength",
  10,
  300
);
bindLinearPair(
  elements.fNumberRange,
  elements.fNumberNumber,
  "fNumber",
  1.2,
  22
);
bindLinearPair(elements.cocRange, elements.cocNumber, "coc", 0.005, 0.06);
bindDistancePair(
  elements.focusDistanceRange,
  elements.focusDistanceNumber,
  "focusDistance"
);
bindDistancePair(
  elements.probeDistanceRange,
  elements.probeDistanceNumber,
  "probeDistance"
);

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

window.addEventListener("resize", render);

render();
