"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Rocket, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SKILLS } from "./data";
import {
  stepBall,
  checkBumperCollision,
  createBall,
  initBumpersLayout,
  type PhysicsBall,
  type BumperData,
} from "./pinball-engine";

export function PinballGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<PhysicsBall[]>([]);
  const bumpersRef = useRef<BumperData[]>([]);
  const hitSkillsRef = useRef(new Set<string>());
  const animFrameRef = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(5);
  const [gameState, setGameState] = useState<"idle" | "playing">("idle");
  const [hitSkill, setHitSkill] = useState<string | null>(null);

  const initBumpers = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    bumpersRef.current = initBumpersLayout(rect.width, rect.height, SKILLS.length);
  }, []);

  useEffect(() => {
    initBumpers();
    const handleResize = () => initBumpers();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initBumpers]);

  const launchBall = useCallback(() => {
    if (ballsLeft <= 0 || !containerRef.current) return;
    setBallsLeft((c) => c - 1);
    setGameState("playing");

    const rect = containerRef.current.getBoundingClientRect();
    const newBall = createBall(rect.width, rect.height);
    ballsRef.current = [...ballsRef.current, newBall];
  }, [ballsLeft]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let running = true;

    const tick = () => {
      if (!running) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const bumpers = bumpersRef.current;

      for (let i = 0; i < bumpers.length; i++) {
        const bp = bumpers[i];
        const grd = ctx.createRadialGradient(bp.x - 5, bp.y - 5, 2, bp.x, bp.y, bp.r);
        grd.addColorStop(0, "rgba(255,255,255,0.9)");
        grd.addColorStop(0.3, "rgba(255,255,255,0.4)");
        grd.addColorStop(1, "rgba(255,255,255,0.05)");
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, bp.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = `bold ${Math.max(10, bp.r * 0.45)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const name = SKILLS[i].name;
        ctx.fillText(name.length > 10 ? name.slice(0, 10) + "…" : name, bp.x, bp.y);
      }

      const currentBalls = ballsRef.current;
      const survivingBalls: PhysicsBall[] = [];

      for (const ball of currentBalls) {
        const stepped = stepBall(ball, w, h);
        if (!stepped) continue;

        const result = checkBumperCollision(stepped, bumpers);
        if (result.hit && !hitSkillsRef.current.has(SKILLS[result.bumperIndex].name)) {
          hitSkillsRef.current.add(SKILLS[result.bumperIndex].name);
          setScore((s) => s + 100);
          setHitSkill(SKILLS[result.bumperIndex].name);
          setTimeout(() => setHitSkill(null), 800);
        }
        survivingBalls.push(result.ball);
      }

      ballsRef.current = survivingBalls;

      for (const b of survivingBalls) {
        const grd = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, b.r);
        grd.addColorStop(0, "#f0fdf4");
        grd.addColorStop(0.3, "#86efac");
        grd.addColorStop(1, "#16a34a");
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      if (survivingBalls.length === 0) {
        setGameState("idle");
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    if (gameState === "playing" && ballsRef.current.length > 0) {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="size-4 fill-primary text-primary" aria-hidden />
            <span className="font-semibold text-foreground">{score}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Balls: <span className="font-semibold text-foreground">{ballsLeft}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Skills:{" "}
            <span className="font-semibold text-primary">
              {hitSkillsRef.current.size}/{SKILLS.length}
            </span>
          </div>
        </div>

        <Button
          onClick={launchBall}
          disabled={ballsLeft <= 0}
          size="sm"
        >
          <Rocket className="size-4" />
          Launch {ballsLeft > 0 ? `(${ballsLeft})` : "(refill)"}
        </Button>
      </div>

      {ballsLeft <= 0 && gameState === "idle" && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-center text-xs text-foreground">
          No more balls left! Click{" "}
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => {
              setBallsLeft(5);
              hitSkillsRef.current.clear();
              setScore(0);
            }}
            className="h-auto px-1 py-0 text-xs"
          >
            here
          </Button>{" "}
          to restart.
        </div>
      )}

      <div
        ref={containerRef}
        className="relative h-[500px] w-full overflow-hidden rounded-lg border border-primary/20 bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--primary)_12%,var(--background)),var(--background))]"
      >
        {hitSkill && (
          <div
            key={hitSkill}
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 animate-ping text-3xl font-bold text-primary"
          >
            +100
          </div>
        )}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {gameState === "idle" && ballsLeft > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Button
              onClick={launchBall}
              size="lg"
            >
              <Rocket className="size-5" />
              Launch Ball
            </Button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-8">
          <div className="h-3 w-12 -skew-x-12 rounded-full border border-primary/20 bg-primary/30" />
          <div className="h-3 w-12 skew-x-12 rounded-full border border-primary/20 bg-primary/30" />
        </div>
      </div>

      <div className="mt-3 text-center text-[10px] text-muted-foreground/60">
        Click &quot;Launch Ball&quot; to play · Hit skill bumpers to score
      </div>
    </div>
  );
}
