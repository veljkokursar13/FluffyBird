import { playSound, stopSound as stopTap } from "@/src/state/gameplaysound";
import { useSoundStore } from '@/src/state/sound';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, PixelRatio, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bird from "../src/components/Bird";
import { BushesFull, Cloud, Skyline, Soil } from "../src/components/CloudAndSoil";
import Hud from "../src/components/Hud";
import Pipe from "../src/components/Pipe";
import { GAME_CONFIG } from "../src/constants/gameConfig";
import { detectWorldCollision } from "../src/game/collision";
import { applyBirdPhysics, updateClouds, updateSoil } from "../src/game/physics";
import { createWorld } from "../src/game/world";
import { PipeDirector } from "@/src/ai/PipeDirector";
import type { Pipe as DirPipe } from "@/src/ai/pipeTypes";
import useGameLoop, { useDeadBird } from "../src/hooks/useGameLoop";
import styles from "../src/styles/gameStyles";

export default function GameScreen() {
  const { muted, toggle } = useSoundStore();
  const cfg = GAME_CONFIG;

  // Measure container to derive a render-only scale
  const [px, setPx] = useState({ w: 0, h: 0 });
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPx({ w: width, h: height });
  }, []);
  const unitsPerPx = px.h ? cfg.world.screenHeight / px.h : 1;
  const toPxLocal = (u: number) => {
    const val = u / unitsPerPx;
    return Math.round(PixelRatio.roundToNearestPixel(val));
  };

  // World lives outside React (mutable)
  const worldRef = useRef(createWorld(cfg));
  worldRef.current.pipes = [];
  const flapRef = useRef(false);
  const birdXUnits = 12; // horizontal bird position in world units

  const directorRef = useRef<PipeDirector>();
  if (!directorRef.current) {
    const dims = { widthPx: cfg.world.screenWidth, heightPx: cfg.world.screenHeight };
    const pipeCfg = cfg.pipe;
    directorRef.current = new PipeDirector(
      1337,
      {
        minGapPx: pipeCfg.minGapSize ?? pipeCfg.gap,
        maxGapPx: pipeCfg.maxGapSize ?? pipeCfg.gap,
        minSpeed: pipeCfg.speed * 0.8,
        maxSpeed: pipeCfg.speed * 1.4,
        minSpacing: pipeCfg.minPairSpacing ?? pipeCfg.spacing ?? 26,
        maxSpacing: pipeCfg.maxPairSpacing ?? pipeCfg.spacing ?? 40,
        minGapY: (pipeCfg.minGapY ?? 0) / cfg.world.screenHeight,
        maxGapY: (pipeCfg.maxGapY ?? cfg.world.screenHeight) / cfg.world.screenHeight,
      },
      dims,
      {
        gapPx: pipeCfg.gap,
        speedPxPerSec: pipeCfg.speed,
        spacingPx: pipeCfg.spacing ?? 26,
        variancePx: 4,
      }
    );
  }

  const [pipes, setPipes] = useState<(DirPipe & { passed?: boolean })[]>(() =>
    directorRef.current!
      .spawnSequence(6, cfg.world.screenWidth * 1.1)
      .map((p) => ({ ...p, passed: false }))
  );
  const pipesRef = useRef(pipes);

  // Minimal render state
  const [renderState, setRenderState] = useState(() => {
    const w = worldRef.current;
    return {
      birdY: w.bird.y,
      clouds: w.clouds.map((c) => ({ ...c })),
      soil: w.soil.map((s) => ({ ...s })),
      bushes: (w as any).bushes ? (w as any).bushes.map((b: any) => ({ ...b })) : [],
      flapPulse: false,
    };
  });
  const { dead: isGameOver, kill: markDead, revive } = useDeadBird(false);
  const [score, setScore] = useState(0);

  const onTap = useCallback(() => {
    // Disable flap after death
    if (!isGameOver) {
      flapRef.current = true;
      const now = Date.now();
      const taps = worldRef.current.bird.tapTimes ?? [];
      taps.push(now);
      worldRef.current.bird.tapTimes = taps.filter((t) => now - t <= 1500);
      if (!muted) {
        playSound(false);
      }
    }
  }, [isGameOver, muted]);

  const update = useCallback(
    (dt: number) => {
      const w = worldRef.current;

      const didFlap = flapRef.current;
      applyBirdPhysics(w, cfg, dt, didFlap);
      flapRef.current = false;

      if (!isGameOver) {
        const prevPipes = pipesRef.current;
        const updated = directorRef.current!
          .tickMoveAndRecycle(prevPipes as DirPipe[], dt, cfg.world.screenWidth)
          .map((p) => ({
            ...p,
            passed: prevPipes.find((prev) => prev.id === p.id)?.passed || false,
          }));
        pipesRef.current = updated;
        setPipes(updated);

        updateClouds(w, cfg, dt);
        updateSoil(w, cfg, dt);

        // Increment score when pipe center passes the bird's center (count once per pipe)
        const birdCenterX = birdXUnits + cfg.bird.width / 2;
        let inc = 0;
        pipesRef.current.forEach((p) => {
          const pipeCenterX = p.x + cfg.pipe.width / 2;
          if (!p.passed && pipeCenterX < birdCenterX) {
            p.passed = true;
            inc += 1;
          }
        });
        if (inc > 0) setScore((s) => s + inc);
      }

      // Collision detection (units)
      w.pipes = pipesRef.current.map((p) => ({
        x: p.x,
        gapY: p.gapY * cfg.world.screenHeight,
        gap: directorRef.current!.getParams().gapPx,
        passed: p.passed,
      }));
      const hit = detectWorldCollision(w, cfg, birdXUnits);
      if (hit.any && !isGameOver) {
        // stop flap and mark game over; keep velocity so bird can fall/rotate naturally
        flapRef.current = false;
        markDead();
      }

      setRenderState((prev) => ({
        birdY: w.bird.y,
        clouds: w.clouds.map((c) => ({ ...c })),
        soil: w.soil.map((s) => ({ ...s })),
        bushes: (w as any).bushes ? (w as any).bushes.map((b: any) => ({ ...b })) : [],
        flapPulse: didFlap,
      }));
    },
    [cfg, isGameOver, muted]
  );

  const { start, stop } = useGameLoop({ onUpdate: (dt) => update(dt) }, { autoStart: true });
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) {
      stop();
      stopTap();
    } else {
      start();
    }
  }, [paused, start, stop]);
  useEffect(() => {
    if (muted) stopTap();
  }, [muted]);

  // Convert to px for rendering (local scale)
  // When dead, tilt the bird downward; optionally clamp to ground if beyond ground line
  const groundYUnits = cfg.world.screenHeight - cfg.world.groundHeight;
  const isOnGround = renderState.birdY >= groundYUnits - cfg.bird.height;
  let rotationDeg = 0;
  if (isGameOver) {
    rotationDeg = 70;
  } else {
    const vy = worldRef.current.bird.vy;
    const upTilt = -15;   // nose up when rising
    const downTilt = 35;  // nose down when falling
    if (vy < 0) {
      const t = Math.min(1, Math.abs(vy) / (cfg.bird.jumpVelocity * 0.8));
      rotationDeg = upTilt * t;
    } else {
      const t = Math.min(1, vy / (cfg.bird.maxFallSpeed * 0.7));
      rotationDeg = downTilt * t;
    }
  }
  const birdTopPx = toPxLocal(Math.min(renderState.birdY, groundYUnits - cfg.bird.height));
  const birdLeftPx = toPxLocal(birdXUnits);
  const groundTopPx = toPxLocal(cfg.world.screenHeight - cfg.world.groundHeight);
  const skylineH = toPxLocal(30);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#87ceeb' }}>
      <LinearGradient
        colors={[
          'rgb(135, 206, 250)',
          'rgb(176, 224, 255)',
          'rgb(212, 241, 255)',
          'rgb(254, 250, 224)'
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.container,
          styles.gameContainer,
        ]}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onResponderRelease={onTap}
      >
        <TouchableOpacity
          onPress={toggle}
          style={{ position: 'absolute', top: 12, right: 12, padding: 8, zIndex: 20 }}
          accessibilityRole="button"
          accessibilityLabel={muted ? 'Unmute sound' : 'Mute sound'}
        >
          <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={24} color="#fff" />
        </TouchableOpacity>
        {/* Render clouds behind everything */}
        {renderState.clouds.map((cloud, i) => (
          <Cloud
            key={i}
            cloud={cloud}
            x={toPxLocal(cloud.x)}
            y={toPxLocal(cloud.y)}
            width={toPxLocal(cloud.width)}
            height={toPxLocal(cloud.height)}
          />
        ))}
        {/* Skyline above soil */}
        <Skyline
          x={0}
          y={groundTopPx - skylineH}
          width={px.w}
          height={skylineH}
        />
        {/* Full-width bushes layer (far behind near), behind pipes */}
        <BushesFull
          x={0}
          y={groundTopPx - toPxLocal(16)}
          width={px.w}
          nearHeightPx={toPxLocal(16)}
          farHeightPx={toPxLocal(20)}
        />
        {/* Render soil/ground */}
        {renderState.soil.map((soilSegment, i) => (
          <Soil
            key={i}
            soil={soilSegment}
            x={toPxLocal(soilSegment.x)}
            y={toPxLocal(soilSegment.y)}
            width={toPxLocal(soilSegment.width)}
            height={toPxLocal(soilSegment.height)}
          />
        ))}
        <Bird
          style={{ top: birdTopPx, left: birdLeftPx }}
          width={toPxLocal(cfg.bird.width)}
          height={toPxLocal(cfg.bird.height)}
          flapping={renderState.flapPulse && !isGameOver}
          rotationDeg={rotationDeg}
        />
        {pipes.map((p) => (
          <Pipe
            key={p.id}
            pipe={p}
            gap={directorRef.current!.getParams().gapPx}
            worldHeight={cfg.world.screenHeight}
            toPx={toPxLocal}
            width={cfg.pipe.width}
          />
        ))}
        <Hud score={score} />
        {isGameOver && (
          <View style={{ 
            position: 'absolute', 
            bottom: 50,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10
          }}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => {
                worldRef.current = createWorld(cfg);
                revive();
                setScore(0);
                worldRef.current = createWorld(cfg);
                worldRef.current.pipes = [];
                const fresh = directorRef.current!
                  .spawnSequence(6, cfg.world.screenWidth * 1.1)
                  .map((p) => ({ ...p, passed: false }));
                pipesRef.current = fresh;
                setPipes(fresh);
                const w = worldRef.current;
                setRenderState({
                  birdY: w.bird.y,
                  clouds: w.clouds.map((c) => ({ ...c })),
                  soil: w.soil.map((s) => ({ ...s })),
                  bushes: (w as any).bushes ? (w as any).bushes.map((b: any) => ({ ...b })) : [],
                  flapPulse: false,
                });
              }}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
