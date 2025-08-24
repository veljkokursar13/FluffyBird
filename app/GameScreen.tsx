import { playSound, stopSound as stopTap } from "@/src/state/gameplaysound";
import { useSoundStore } from '@/src/state/sound';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, PixelRatio, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Bird from "../src/components/Bird";
import { BushesFull, Cloud, Skyline, Soil } from "../src/components/CloudAndSoil";
import Hud from "../src/components/Hud";
import Pipe from "../src/components/Pipe";
import { GAME_CONFIG } from "../src/constants/gameConfig";
import { computeBirdTiltDeg, registerTap } from "../src/game/bird";
import { detectWorldCollision } from "../src/game/collision";
import { advancePipesMut, applyBirdPhysics, recyclePipes } from "../src/game/physics";
import { createPipeSpawner, pipeMovement, tickPipeSpawner } from "../src/game/pipes";
import useScore from "../src/game/score";
import { createWorld } from "../src/game/world";
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
  const spawnerRef = useRef(createPipeSpawner());
  const flapRef = useRef(false);
  const birdXUnits = 12; // horizontal bird position in world units

  // Minimal render state
  const [renderState, setRenderState] = useState(() => {
    const w = worldRef.current;
    return {
      birdY: w.bird.y,
      pipes: w.pipes.map((p) => ({ id: (p as any).id, x: p.x, gapY: p.gapY, gap: (p as any).gap ?? cfg.pipe.gap })),
      clouds: w.clouds.map((c) => ({ ...c })),
      soil: w.soil.map((s) => ({ ...s })),
      flapPulse: false,
    };
  });
  const { dead: isGameOver, kill: markDead, revive } = useDeadBird(false);
  const birdCenterXUnits = birdXUnits + cfg.bird.width / 2;
  const { score, reset: resetScore } = useScore({
    birdX: birdCenterXUnits,
    pipes: renderState.pipes.map((p) => ({ id: (p as any).id, x: p.x, width: cfg.pipe.width })),
  });
  const [paused, setPaused] = useState(false);
  const onTap = useCallback(() => {
    // Disable flap after death
    if (!isGameOver && !paused) {
      flapRef.current = true;
      registerTap(worldRef.current.bird, 1500);
      if (!muted) {
        playSound(false);
      }
    }
  }, [isGameOver, muted, paused]);

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
      }

      // Collision detection (units handled in detectWorldCollision)
      const hit = detectWorldCollision(w, cfg, birdXUnits);
      if (hit.any && !isGameOver) {
        // stop flap and mark game over; keep velocity so bird can fall/rotate naturally
        flapRef.current = false;
        markDead();
      }

      setRenderState((prev) => ({
        birdY: w.bird.y,
        pipes: w.pipes.map((p) => ({ id: (p as any).id, x: p.x, gapY: p.gapY, gap: (p as any).gap ?? cfg.pipe.gap })),
        clouds: w.clouds.map((c) => ({ ...c })),
        soil: w.soil.map((s) => ({ ...s })),
        flapPulse: didFlap,
      }));
    },
    [cfg, isGameOver, score, muted]
  );

  const { start, stop } = useGameLoop({ onUpdate: (dt) => update(dt) }, { autoStart: true });
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
  useEffect(() => {
    if (isGameOver) {
      stop();
      stopTap();
    }
  }, [isGameOver, stop]);

  // Convert to px for rendering (local scale)
  // When dead, tilt the bird downward; optionally clamp to ground if beyond ground line
  const groundYUnits = cfg.world.screenHeight - cfg.world.groundHeight;
  const rotationDeg = computeBirdTiltDeg(worldRef.current.bird.vy, cfg, isGameOver);
  const birdTopPx = toPxLocal(Math.min(renderState.birdY, groundYUnits - cfg.bird.height));
  const birdLeftPx = toPxLocal(birdXUnits);
  const pipeWidthPx = toPxLocal(cfg.pipe.width);
  const screenHeightPx = toPxLocal(cfg.world.screenHeight);
  const groundTopPx = toPxLocal(cfg.world.screenHeight - cfg.world.groundHeight);
  const skylineH = toPxLocal(30);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
          onPress={() => setPaused((p) => !p)}
          style={{ position: 'absolute', top: 12, right: 48, padding: 8, zIndex: 20 }}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume game' : 'Pause game'}
        >
          <Ionicons name={paused ? 'play' : 'pause'} size={24} color="#fff" />
        </TouchableOpacity>
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
        {renderState.pipes.map((p, i) => {
          const xPx = toPxLocal(p.x);
          const gapYpx = toPxLocal(p.gapY);
          const gapPxLocal = toPxLocal((p as any).gap ?? cfg.pipe.gap);
          const topHeight = Math.max(0, gapYpx - gapPxLocal / 2);
          const bottomHeight = Math.max(0, screenHeightPx - (gapYpx + gapPxLocal / 2));
          const bottomYpx = gapYpx + gapPxLocal / 2;
          return (
            <Pipe key={(p as any).id ?? i} x={xPx} topHeight={topHeight} bottomHeight={bottomHeight} width={pipeWidthPx} bottomY={bottomYpx} />
          );
        })}
        <Hud score={score} />
        {paused && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 25,
          }}>
            <View style={{
              backgroundColor: '#ffffff',
              paddingVertical: 20,
              paddingHorizontal: 24,
              borderRadius: 14,
              width: Math.min(px.w - 40, 320),
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 6,
            }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0b1020', marginBottom: 12 }}>Paused</Text>
              <TouchableOpacity
                style={[styles.button, { marginTop: 4 }]}
                activeOpacity={0.85}
                onPress={() => setPaused(false)}
              >
                <Text style={styles.buttonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace('/')}
                accessibilityRole="link"
                accessibilityLabel="Back to Menu"
              >
                <Text style={{ marginTop: 12, color: '#0b1020', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 18 }}>Back to Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {isGameOver && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30,
          }}>
            <BlurView
              intensity={50}
              tint="dark"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.85}
              onPress={() => {
                worldRef.current = createWorld(cfg);
                spawnerRef.current = createPipeSpawner();
                revive();
                resetScore();
                const w = worldRef.current;
                setRenderState({
                  birdY: w.bird.y,
                  pipes: w.pipes.map((p) => ({ id: (p as any).id, x: p.x, gapY: p.gapY, gap: (p as any).gap ?? cfg.pipe.gap })),
                  clouds: w.clouds.map((c) => ({ ...c })),
                  soil: w.soil.map((s) => ({ ...s })),
                  flapPulse: false,
                });
              }}
            >
              <Text style={styles.buttonText}>Reset</Text>
              
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace('/')}
              accessibilityRole="link"
              accessibilityLabel="Back to Menu"
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: '#ffffff', textDecorationLine: 'underline', fontWeight: 'bold', fontSize: 18 }}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
