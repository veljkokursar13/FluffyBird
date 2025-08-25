import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { GAME_CONFIG } from '../constants/gameConfig';
import type { Pipe as DirPipe } from '../ai/pipeTypes';

/**
 * Renders a single pipe pair given world-space pipe data and a gap size.
 * All dimensional props are in world units; `toPx` converts them to the
 * local render scale so GameScreen only needs to forward game values.
 */
type PipeProps = {
  pipe: DirPipe;
  gap: number; // gap size in world units (px)
  worldHeight: number; // world screen height
  toPx: (u: number) => number; // convert world units to render px
  width?: number; // pipe width in world units
};

const pipeBody = require('../../assets/images/pipe-body.svg');
const pipeBottomCap = require('../../assets/images/pipe-bottom.svg');
const pipeTopCap = require('../../assets/images/pipe-top.svg');

export default function Pipe({ pipe, gap, worldHeight, toPx, width }: PipeProps) {
  const pipeWidthPx = width != null ? toPx(width) : undefined;
  const xPx = toPx(pipe.x);
  const gapCenterPx = toPx(pipe.gapY * worldHeight);
  const gapPx = toPx(gap);
  const screenHeightPx = toPx(worldHeight);
  const topHeight = Math.max(0, gapCenterPx - gapPx / 2);
  const bottomHeight = Math.max(0, screenHeightPx - (gapCenterPx + gapPx / 2));
  const bottomY = gapCenterPx + gapPx / 2;

  const commonWidth = pipeWidthPx != null ? { width: pipeWidthPx } : undefined;
  const capUnits = (GAME_CONFIG.pipe as any).capHeight ?? 0;
  const capPx = pipeWidthPx != null && GAME_CONFIG.pipe.width > 0
    ? Math.max(0, Math.round((capUnits / GAME_CONFIG.pipe.width) * pipeWidthPx))
    : 0;

  // Scale seam overlap slightly with width to hide gaps at larger sizes
  const seamOverlapPx = Math.max(2, Math.round((pipeWidthPx ?? GAME_CONFIG.pipe.width) * 0.06));

  const topCapHeight = Math.min(capPx, Math.max(0, topHeight));
  const bottomCapHeight = Math.min(capPx, Math.max(0, bottomHeight));

  return (
    <>
      {/* Top segment: body then cap (cap on top) */}
      <View style={[stylesPipe.columnTop, { left: xPx, height: topHeight }, commonWidth]}>
        {topHeight > 0 ? (
          <ExpoImage source={pipeBody} style={{ width: pipeWidthPx, height: topHeight + seamOverlapPx }} contentFit="fill" />
        ) : null}
        {topCapHeight > 0 ? (
          <ExpoImage source={pipeTopCap} style={{ position: 'absolute', left: 0, bottom: 0, width: pipeWidthPx, height: topCapHeight, zIndex: 1 }} contentFit="fill" />
        ) : null}
      </View>

      {/* Bottom segment: body first, then cap on top */}
      <View style={[stylesPipe.columnBottom, { left: xPx, top: bottomY, height: bottomHeight }, commonWidth]}>
        {bottomHeight > 0 ? (
          <ExpoImage source={pipeBody} style={{ position: 'absolute', left: 0, top: -seamOverlapPx, width: pipeWidthPx, height: bottomHeight + seamOverlapPx }} contentFit="fill" />
        ) : null}
        {bottomCapHeight > 0 ? (
          <ExpoImage source={pipeBottomCap} style={{ position: 'absolute', left: 0, top: 0, width: pipeWidthPx, height: bottomCapHeight, zIndex: 1 }} contentFit="fill" />
        ) : null}
      </View>
    </>
  );
}

const stylesPipe = StyleSheet.create({
  columnTop: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
    zIndex: 3,
  },
  columnBottom: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 3,
  },
  capAlign: {
    alignSelf: 'center',
  },
});