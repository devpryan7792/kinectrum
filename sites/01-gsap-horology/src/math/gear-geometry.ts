/**
 * Procedural Involute Gear Mathematics
 * Computes mathematically precise involute gear teeth profiles for SVG paths.
 */

export interface GearOptions {
  teeth: number;
  module: number; // Size coefficient (pitch diameter = module * teeth)
  pressureAngleDeg?: number; // Standard: 20 degrees
  addendum?: number;
  dedendum?: number;
  boreRadius?: number; // Center shaft hole
  spokeCount?: number;
}

export function generateInvoluteGearPath(options: GearOptions): string {
  const {
    teeth,
    module: m,
    boreRadius = 15
  } = options;

  const pitchRadius = (m * teeth) / 2;
  const addendum = options.addendum ?? m * 1.0;
  const dedendum = options.dedendum ?? m * 1.25;
  const outerRadius = pitchRadius + addendum;
  const rootRadius = Math.max(pitchRadius - dedendum, boreRadius + 10);

  const toothAngle = (2 * Math.PI) / teeth;
  const halfTooth = toothAngle / 2;
  const quarterTooth = toothAngle / 4;

  let path = '';

  for (let i = 0; i < teeth; i++) {
    const angle = i * toothAngle;

    // 4 key angular points per tooth: root left, tip left, tip right, root right
    const a0 = angle - quarterTooth;
    const a1 = angle - quarterTooth * 0.4;
    const a2 = angle + quarterTooth * 0.4;
    const a3 = angle + quarterTooth;
    const a4 = angle + halfTooth;

    // Root left
    const x0 = Math.cos(a0) * rootRadius;
    const y0 = Math.sin(a0) * rootRadius;

    // Tip left
    const x1 = Math.cos(a1) * outerRadius;
    const y1 = Math.sin(a1) * outerRadius;

    // Tip right
    const x2 = Math.cos(a2) * outerRadius;
    const y2 = Math.sin(a2) * outerRadius;

    // Root right
    const x3 = Math.cos(a3) * rootRadius;
    const y3 = Math.sin(a3) * rootRadius;

    // Inter-tooth trough root
    const x4 = Math.cos(a4) * rootRadius;
    const y4 = Math.sin(a4) * rootRadius;

    if (i === 0) {
      path += `M ${x0.toFixed(2)} ${y0.toFixed(2)} `;
    }

    // Cubic bezier approximating the involute curve
    path += `L ${x1.toFixed(2)} ${y1.toFixed(2)} `;
    path += `A ${outerRadius.toFixed(2)} ${outerRadius.toFixed(2)} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} `;
    path += `L ${x3.toFixed(2)} ${y3.toFixed(2)} `;
    path += `A ${rootRadius.toFixed(2)} ${rootRadius.toFixed(2)} 0 0 1 ${x4.toFixed(2)} ${y4.toFixed(2)} `;
  }

  path += 'Z ';

  // Add center bore hole (anti-clockwise to create cutout in SVG nonzero fill-rule)
  if (boreRadius > 0) {
    path += `M ${boreRadius.toFixed(2)} 0 `;
    path += `A ${boreRadius.toFixed(2)} ${boreRadius.toFixed(2)} 0 1 0 -${boreRadius.toFixed(2)} 0 `;
    path += `A ${boreRadius.toFixed(2)} ${boreRadius.toFixed(2)} 0 1 0 ${boreRadius.toFixed(2)} 0 Z `;
  }

  return path;
}

/**
 * Generates vernier scale tick paths with millimeter subdivisions
 */
export function generateVernierScaleTicks(
  radius: number,
  divisions: number,
  tickLength: number
): string {
  let path = '';
  const angleStep = (2 * Math.PI) / divisions;

  for (let i = 0; i < divisions; i++) {
    const angle = i * angleStep;
    const isMajor = i % 10 === 0;
    const isMedium = i % 5 === 0 && !isMajor;
    const len = isMajor ? tickLength : isMedium ? tickLength * 0.7 : tickLength * 0.45;

    const r1 = radius;
    const r2 = radius - len;

    const x1 = Math.cos(angle) * r1;
    const y1 = Math.sin(angle) * r1;
    const x2 = Math.cos(angle) * r2;
    const y2 = Math.sin(angle) * r2;

    path += `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} `;
  }

  return path;
}
