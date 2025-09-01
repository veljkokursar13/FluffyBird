import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { GAME_CONFIG } from '@/src/core/config';

type PipeProps = {
  x: number; // px
  topHeight: number; // px
  bottomHeight: number; // px
  width?: number; // px
  bottomY?: number; // px from top of container
};

const pipeBody = require('../../../../assets/images/pipe-body.svg');
const pipeBottomCap = require('../../../../assets/images/pipe-bottom.svg');
const pipeTopCap = require('../../../../assets/images/pipe-top.svg');

export default function Pipe({ x, topHeight, bottomHeight, width, bottomY }: PipeProps) {
  const commonWidth = width != null ? { width } : undefined;
  const capUnits = (GAME_CONFIG.pipe as any).capHeight ?? 0;
  const capPx = width != null && GAME_CONFIG.pipe.width > 0
    ? Math.max(0, Math.round((capUnits / GAME_CONFIG.pipe.width) * width))
    : 0;

  // Scale seam overlap slightly with width to hide gaps at larger sizes
  const seamOverlapPx = Math.max(2, Math.round((width ?? GAME_CONFIG.pipe.width) * 0.06));

  const topCapHeight = Math.min(capPx, Math.max(0, topHeight));
  const bottomCapHeight = Math.min(capPx, Math.max(0, bottomHeight));

  return (
    <>
      {/* Top segment: body then cap (cap on top) */}
      <View style={[stylesPipe.columnTop, { left: x, height: topHeight }, commonWidth]}>
        {topHeight > 0 ? (
          <ExpoImage source={pipeBody} style={{ width, height: topHeight + seamOverlapPx }} contentFit="fill" />
        ) : null}
        {topCapHeight > 0 ? (
          <ExpoImage source={pipeTopCap} style={{ position: 'absolute', left: 0, bottom: 0, width, height: topCapHeight, zIndex: 1 }} contentFit="fill" />
        ) : null}
      </View>

      {/* Bottom segment: body first, then cap on top */}
      <View style={[stylesPipe.columnBottom, { left: x, top: bottomY, height: bottomHeight }, commonWidth]}>
        {bottomHeight > 0 ? (
          <ExpoImage source={pipeBody} style={{ position: 'absolute', left: 0, top: -seamOverlapPx, width, height: bottomHeight + seamOverlapPx }} contentFit="fill" />
        ) : null}
        {bottomCapHeight > 0 ? (
          <ExpoImage source={pipeBottomCap} style={{ position: 'absolute', left: 0, top: 0, width, height: bottomCapHeight, zIndex: 1 }} contentFit="fill" />
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