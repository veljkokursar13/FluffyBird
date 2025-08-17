import { Image as ExpoImage } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { GAME_CONFIG } from '../constants/gameConfig';

type PipeProps = {
  x: number; // px
  topHeight: number; // px
  bottomHeight: number; // px
  width?: number; // px
  bottomY?: number; // px from top of container
};

const pipeBody = require('../../assets/images/pipe-body.svg');
const pipeBottomCap = require('../../assets/images/pipe-bottom.svg');
const pipeTopCap = require('../../assets/images/pipe-top.svg');

export default function Pipe({ x, topHeight, bottomHeight, width, bottomY }: PipeProps) {
  const commonWidth = width != null ? { width } : undefined;
  const capUnits = (GAME_CONFIG.pipe as any).capHeight ?? 0;
  const capPx = width != null && GAME_CONFIG.pipe.width > 0
    ? Math.max(0, Math.round((capUnits / GAME_CONFIG.pipe.width) * width))
    : 0;
  const topCapHeight = Math.min(capPx, Math.max(0, topHeight));
  const bottomCapHeight = Math.min(capPx, Math.max(0, bottomHeight));
  const seamOverlap = 4; // hide seam between cap and body

  return (
    <>
      {/* Top segment */}
      <View style={[stylesPipe.columnTop, { left: x, height: topHeight }, commonWidth]}>
        {topHeight > 0 && (
          <ExpoImage source={pipeBody} style={{ width, height: topHeight }} contentFit="fill" />
        )}
        {topCapHeight > 0 && (
          <ExpoImage
            source={pipeTopCap}
            style={{ width, height: topCapHeight + seamOverlap, position: 'absolute', bottom: -seamOverlap }}
            contentFit="fill"
          />
        )}
      </View>

      {/* Bottom segment */}
      <View style={[stylesPipe.columnBottom, { left: x, top: bottomY, height: bottomHeight }, commonWidth]}>
        {bottomHeight > 0 && (
          <ExpoImage source={pipeBody} style={{ width, height: bottomHeight }} contentFit="fill" />
        )}
        {bottomCapHeight > 0 && (
          <ExpoImage
            source={pipeBottomCap}
            style={{ width, height: bottomCapHeight + seamOverlap, position: 'absolute', top: -seamOverlap }}
            contentFit="fill"
          />
        )}
      </View>
    </>
  );
}

const stylesPipe = StyleSheet.create({
  columnTop: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  columnBottom: {
    position: 'absolute',
    overflow: 'hidden',
  },
});