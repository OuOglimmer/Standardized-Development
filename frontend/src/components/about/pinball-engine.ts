export interface PhysicsBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export interface BumperData {
  x: number;
  y: number;
  r: number;
}

let nextId = 0;

export function createBall(w: number, h: number, vxOff = 0, vyOff = 0): PhysicsBall {
  return {
    id: nextId++,
    x: w / 2 + (Math.random() - 0.5) * 40,
    y: h - 45,
    vx: (Math.random() - 0.5) * 4 + vxOff,
    vy: -10 - Math.random() * 4 + vyOff,
    r: 8,
  };
}

export const GRAVITY = 0.25;
export const DAMPING = 0.75;

export function stepBall(ball: PhysicsBall, w: number, h: number): PhysicsBall | null {
  let { x, y, vx, vy, r, id } = ball;
  vy += GRAVITY;
  x += vx;
  y += vy;

  if (x - r < 0) { x = r; vx = Math.abs(vx) * DAMPING; }
  if (x + r > w) { x = w - r; vx = -Math.abs(vx) * DAMPING; }
  if (y - r < 0) { y = r; vy = Math.abs(vy) * DAMPING; }
  if (y - r > h) return null;

  return { id, x, y, vx, vy, r };
}

export interface CollisionResult {
  hit: boolean;
  ball: PhysicsBall;
  bumperIndex: number;
}

export function checkBumperCollision(
  ball: PhysicsBall,
  bumpers: BumperData[],
): CollisionResult {
  let { x, y, vx, vy, r, id } = ball;

  for (let i = 0; i < bumpers.length; i++) {
    const bp = bumpers[i];
    const dx = x - bp.x;
    const dy = y - bp.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = r + bp.r;
    if (dist < minDist && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;
      x += nx * overlap;
      y += ny * overlap;
      const dot = vx * nx + vy * ny;
      vx -= 2 * dot * nx;
      vy -= 2 * dot * ny;
      vx *= 1.08;
      vy *= 1.08;
      return { hit: true, ball: { id, x, y, vx, vy, r }, bumperIndex: i };
    }
  }
  return { hit: false, ball: { id, x, y, vx, vy, r }, bumperIndex: -1 };
}

export function initBumpersLayout(
  w: number,
  h: number,
  count: number,
): BumperData[] {
  const positions: BumperData[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const gapX = (w - 120) / 3;
    const r = 24 + (i % 3) * 4;
    positions.push({
      x: 60 + col * gapX + r,
      y: 60 + row * 80 + r,
      r,
    });
  }
  return positions;
}
