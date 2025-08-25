import { Pipe, DirectorParams, Telemetry, PipeDirectorConfig, WorldDims } from './pipeTypes';
import { mulberry32, clamp, lerp } from './rng';

export class PipeDirector {
  private params: DirectorParams;
  private prevGapY = 0.5;     // last gap center (0..1)
  private rand: () => number;
  private idSeq = 1;

  constructor(
    seed: number,
    private cfg: PipeDirectorConfig,
    private dims: WorldDims,
    initial?: Partial<DirectorParams>
  ) {
    this.rand = mulberry32(seed);
    this.params = {
      gapPx:       initial?.gapPx ?? 140,
      speedPxPerSec: initial?.speedPxPerSec ?? 280,
      spacingPx:   initial?.spacingPx ?? 220,
      variancePx:  initial?.variancePx ?? 20,
    };
  }

  /** Returns current director parameters */
  getParams() { return { ...this.params }; }

  /** Fetch updated parameters from external AI service */
  async adapt(t: Telemetry) {
    try {
      const res = await fetch('http://localhost:8000/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
      if (!res.ok) {
        throw new Error(`AI service responded ${res.status}`);
      }
      const data = await res.json() as Partial<DirectorParams>;
      this.params.gapPx = clamp(
        data.gapPx ?? this.params.gapPx,
        this.cfg.minGapPx,
        this.cfg.maxGapPx,
      );
      this.params.speedPxPerSec = clamp(
        data.speedPxPerSec ?? this.params.speedPxPerSec,
        this.cfg.minSpeed,
        this.cfg.maxSpeed,
      );
      this.params.spacingPx = clamp(
        data.spacingPx ?? this.params.spacingPx,
        this.cfg.minSpacing,
        this.cfg.maxSpacing,
      );
      this.params.variancePx = data.variancePx ?? this.params.variancePx;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PipeDirector adapt failed', err);
    }
  }

  /** Spawn a sequence of N pipes starting after 'startX' */
  spawnSequence(count: number, startX: number): Pipe[] {
    const out: Pipe[] = [];
    const bandMin = this.cfg.minGapY;
    const bandMax = this.cfg.maxGapY;
    const varNorm = this.params.variancePx / this.dims.heightPx; // convert px → 0..1

    let x = startX;
    let gY = this.prevGapY;

    for (let i = 0; i < count; i++) {
      // Smooth vertical randomness: small jitter + slow drift
      const jitter = (this.rand() * 2 - 1) * varNorm;   // symmetric
      const target = clamp(gY + jitter, bandMin, bandMax);

      // Low-pass (prevents sudden teleports)
      gY = lerp(gY, target, 0.55);

      out.push({ id: this.idSeq++, x, gapY: gY });
      x += this.params.spacingPx;
    }

    this.prevGapY = gY;
    return out;
  }

  /** Move & recycle: returns new visible queue and optionally spawns more at the end */
  tickMoveAndRecycle(pipes: Pipe[], dtSec: number, rightEdgePx: number): Pipe[] {
    const speed = this.params.speedPxPerSec;
    const moved = pipes.map(p => ({ ...p, x: p.x - speed * dtSec }));

    // Drop off-screen
    const visible = moved.filter(p => p.x + 10 > -rightEdgePx * 0.1); // small buffer

    // Keep a runway of future pipes
    const need = Math.max(0, 6 - visible.length);
    if (need > 0) {
      const lastX = visible.length ? visible[visible.length - 1].x : rightEdgePx * 1.2;
      const startX = lastX + this.params.spacingPx;
      const extra = this.spawnSequence(need, startX);
      return [...visible, ...extra];
    }
    return visible;
  }
}
