import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import { LayoutChangeEvent, PixelRatio, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bird from "../src/components/Bird";
import { Cloud, Soil } from "../src/components/CloudAndSoil";
import Hud from "../src/components/Hud";
import Pipe from "../src/components/Pipe";
import { GAME_CONFIG } from "../src/constants/gameConfig";
import { detectWorldCollision } from "../src/game/collision";
import { advancePipesMut, applyBirdPhysics, recyclePipes, updateClouds, updateSoil } from "../src/game/physics";
import { createPipeSpawner, pipeMovement, tickPipeSpawner } from "../src/game/pipes";
import { createWorld } from "../src/game/world";
import useGameLoop, { useDeadBird } from "../src/hooks/useGameLoop";
import styles from "../src/styles/gameStyles";

export default function GameScreen() {
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
  const spawnerRef = useRef(createPipeSpawner());
  const flapRef = useRef(false);
  const birdXUnits = 12; // horizontal bird position in world units

  // Minimal render state
  const [renderState, setRenderState] = useState(() => {
    const w = worldRef.current;
    return {
      birdY: w.bird.y,
      pipes: w.pipes.map((p) => ({ x: p.x, gapY: p.gapY })),
      clouds: w.clouds.map((c) => ({ ...c })),
      soil: w.soil.map((s) => ({ ...s })),
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
      worldRef.current.bird.tapTimes = taps.filter((t) => now - t <= 500);
    }
  }, [isGameOver]);

  const update = useCallback(
    (dt: number) => {
      const w = worldRef.current;

      const didFlap = flapRef.current;
      applyBirdPhysics(w, cfg, dt, didFlap);
      flapRef.current = false;

      if (!isGameOver) {
        const speed = pipeMovement({score}, cfg.pipe.speed);
        // simple spawner call
        tickPipeSpawner(spawnerRef.current, w, dt, score);
        // move world
        advancePipesMut(w, cfg, dt, speed);
        recyclePipes(w, cfg);
        updateClouds(w, cfg, dt);
        updateSoil(w, cfg, dt);
        // Increment score when pipe center passes the bird's center (count once per pipe)
        const birdCenterX = birdXUnits + cfg.bird.width / 2;
        let inc = 0;
        w.pipes.forEach((p) => {
          const pipeCenterX = p.x + cfg.pipe.width / 2;
          if (!p.passed && pipeCenterX < birdCenterX) {
            p.passed = true;
            inc += 1;
          }
        });
        if (inc > 0) setScore((s) => s + inc);
      }

      // Collision detection (units)
      const birdRect = {
        x: birdXUnits,
        y: w.bird.y,
        width: cfg.bird.width,
        height: cfg.bird.height,
      };
      const pipeRects = w.pipes.flatMap((p) => {
        const topHeight = Math.max(0, p.gapY - cfg.pipe.gap / 2);
        const bottomHeight = Math.max(
          0,
          cfg.world.screenHeight - (p.gapY + cfg.pipe.gap / 2)
        );
        return [
          { x: p.x, y: 0, width: cfg.pipe.width, height: topHeight },
          {
            x: p.x,
            y: cfg.world.screenHeight - bottomHeight,
            width: cfg.pipe.width,
            height: bottomHeight,
          },
        ];
      });
      const hit = detectWorldCollision(w, cfg, birdXUnits);
      if (hit.any && !isGameOver) {
        // stop flap and mark game over; keep velocity so bird can fall/rotate naturally
        flapRef.current = false;
        markDead();
      }

      setRenderState((prev) => ({
        birdY: w.bird.y,
        pipes: w.pipes.map((p) => ({ x: p.x, gapY: p.gapY })),
        clouds: w.clouds.map((c) => ({ ...c })),
        soil: w.soil.map((s) => ({ ...s })),
        flapPulse: didFlap,
      }));
    },
    [cfg, isGameOver, score]
  );

  useGameLoop({ onUpdate: (dt) => update(dt) }, { autoStart: true });

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
  const pipeWidthPx = toPxLocal(cfg.pipe.width);
  const gapPx = toPxLocal(cfg.pipe.gap);
  const screenHeightPx = toPxLocal(cfg.world.screenHeight);

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
        {renderState.pipes.map((p, i) => {
          const xPx = Math.floor(toPxLocal(p.x));
          const gapYpx = toPxLocal(p.gapY);
          const topHeight = Math.max(0, gapYpx - gapPx / 2);
          const bottomHeight = Math.max(0, screenHeightPx - (gapYpx + gapPx / 2));
          const bottomYpx = gapYpx + gapPx / 2;
          return (
            <Pipe key={i} x={xPx} topHeight={topHeight} bottomHeight={bottomHeight} width={pipeWidthPx} bottomY={bottomYpx} />
          );
        })}
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
                spawnerRef.current = createPipeSpawner();
                revive();
                setScore(0);
                const w = worldRef.current;
                setRenderState({
                  birdY: w.bird.y,
                  pipes: w.pipes.map((p) => ({ x: p.x, gapY: p.gapY })),
                  clouds: w.clouds.map((c) => ({ ...c })),
                  soil: w.soil.map((s) => ({ ...s })),
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
