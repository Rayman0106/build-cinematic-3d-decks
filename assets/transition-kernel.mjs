/* Portable registration math. No renderer, network, assets or global state. */
const clamp01 = x => Math.max(0, Math.min(1, x));
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function finite(values, label) {
  if (!values.every(Number.isFinite)) throw new TypeError(`${label}: finite numbers required`);
}
function pointsOf(points) {
  if (!Array.isArray(points)) throw new TypeError('Contour must be an array');
  const clean = [];
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2) throw new TypeError('Contour points must be [x,y]');
    finite(p, 'Contour');
    if (!clean.length || distance(clean.at(-1), p) > 1e-9) clean.push(p.slice());
  }
  if (clean.length > 1 && distance(clean[0], clean.at(-1)) < 1e-9) clean.pop();
  if (clean.length < 3) throw new RangeError('Contour needs at least three distinct points');
  return clean;
}
export function progress(seconds, start, end) {
  finite([seconds, start, end], 'Time');
  if (end <= start) throw new RangeError('end must exceed start');
  const u = clamp01((seconds - start) / (end - start));
  return u ** 3 * (u * (u * 6 - 15) + 10);
}
export function shortAngleLerp(from, to, amount) {
  finite([from, to, amount], 'Angle');
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * clamp01(amount);
}
export function coverTransform(imageWidth, imageHeight, box, objectPosition = [.5, .5]) {
  const {x = 0, y = 0, width, height} = box;
  if (!Array.isArray(objectPosition) || objectPosition.length !== 2) throw new TypeError('objectPosition must be [x,y]');
  finite([imageWidth, imageHeight, x, y, width, height, ...objectPosition], 'Photo fit');
  if ([imageWidth, imageHeight, width, height].some(v => v <= 0)) throw new RangeError('Dimensions must be positive');
  if (objectPosition.some(v => v < 0 || v > 1)) throw new RangeError('Only 0–1 percentage object-position is supported');
  const scale = Math.max(width / imageWidth, height / imageHeight);
  return {scale, x: x + (width - imageWidth * scale) * objectPosition[0],
    y: y + (height - imageHeight * scale) * objectPosition[1]};
}
export function photoPoint(point, fit) {
  if (!Array.isArray(point) || point.length !== 2) throw new TypeError('Photo point must be [x,y]');
  finite([...point, fit.x, fit.y, fit.scale], 'Photo point');
  return [fit.x + point[0] * fit.scale, fit.y + point[1] * fit.scale];
}
export function affinePoint(point, matrix) {
  if (!Array.isArray(point) || point.length !== 2) throw new TypeError('Affine point must be [x,y]');
  if (!Array.isArray(matrix) || matrix.length !== 6) throw new TypeError('CSS affine matrix needs six values');
  finite([...point, ...matrix], 'Affine');
  const [a,b,c,d,e,f] = matrix;
  return [a * point[0] + c * point[1] + e, b * point[0] + d * point[1] + f];
}
export function ndcToLogical(ndc, width, height) {
  finite([ndc.x, ndc.y, ndc.z, width, height], 'Projection');
  if (width <= 0 || height <= 0) throw new RangeError('Viewport must be positive');
  return {point: [(ndc.x + 1) * width / 2, (1 - ndc.y) * height / 2], depth: ndc.z,
    inside: Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && Math.abs(ndc.z) <= 1};
}
export function signedArea(points) {
  return points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0) / 2;
}
export function resampleClosed(points, count = 96) {
  if (!Number.isInteger(count) || count < 3) throw new RangeError('Sample count must be an integer >= 3');
  const clean = pointsOf(points), lengths = clean.map((p, i) => distance(p, clean[(i + 1) % clean.length]));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  if (total <= 1e-9) throw new RangeError('Degenerate contour');
  const result = []; let edge = 0, before = 0;
  for (let i = 0; i < count; i++) {
    const station = total * i / count;
    while (edge < clean.length - 1 && before + lengths[edge] < station) before += lengths[edge++];
    const a = clean[edge], b = clean[(edge + 1) % clean.length], u = (station - before) / lengths[edge];
    result.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return result;
}
function normalized(points) {
  const center = points.reduce((sum, p) => [sum[0] + p[0] / points.length, sum[1] + p[1] / points.length], [0,0]);
  const radius = Math.sqrt(points.reduce((sum, p) => sum + distance(p, center) ** 2 / points.length, 0));
  if (radius <= 1e-9) throw new RangeError('Degenerate contour');
  return points.map(p => [(p[0] - center[0]) / radius, (p[1] - center[1]) / radius]);
}
export function alignClosedContours(from, to, count = 96) {
  const source = pointsOf(from), target = pointsOf(to);
  const aArea = signedArea(source), bArea = signedArea(target);
  if (Math.abs(aArea) < 1e-9 || Math.abs(bArea) < 1e-9) throw new RangeError('Contours need nonzero area');
  const reversed = Math.sign(aArea) !== Math.sign(bArea);
  if (reversed) target.reverse();
  const a = resampleClosed(source, count), b = resampleClosed(target, count), an = normalized(a), bn = normalized(b);
  let shift = 0, cost = Infinity;
  for (let offset = 0; offset < count; offset++) {
    let value = 0;
    for (let i = 0; i < count; i++) value += distance(an[i], bn[(i + offset) % count]) ** 2;
    if (value < cost) {cost = value; shift = offset;}
  }
  return {from: a, to: b.map((_, i) => b[(i + shift) % count]), shift, reversed, normalizedError: cost / count};
}
export function interpolateContour(pair, amount) {
  finite([amount], 'Contour progress');
  if (pair.from.length !== pair.to.length || !pair.from.length) throw new RangeError('Aligned sample counts must match');
  const u = clamp01(amount);
  return pair.from.map((p, i) => [p[0] + (pair.to[i][0] - p[0]) * u, p[1] + (pair.to[i][1] - p[1]) * u]);
}
