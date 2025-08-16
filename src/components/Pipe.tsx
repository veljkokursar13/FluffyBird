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

export default function Pipe({ x, topHeight, bottomHeight, width, bottomY }: PipeProps) {
  const commonWidth = width != null ? { width } : undefined;
  const capUnits = (GAME_CONFIG.pipe as any).capHeight ?? 0;
  const capPx = width != null && GAME_CONFIG.pipe.width > 0
    ? Math.max(0, Math.round((capUnits / GAME_CONFIG.pipe.width) * width))
    : 0;
  const topBodyHeight = Math.max(0, topHeight - capPx);
  const bottomBodyHeight = Math.max(0, bottomHeight - capPx);
  const topCapHeight = Math.min(capPx, topHeight);
  const bottomCapHeight = Math.min(capPx, bottomHeight);
  const capWidthPx = width != null ? Math.round(width * 1.15) : undefined;
  return (
    <>
      {/* Top segment: body then cap */}
      <View style={[stylesPipe.columnTop, { left: x, height: topHeight }, commonWidth]}>
        {topBodyHeight > 0 ? (
          <ExpoImage
            source={require('../../assets/images/pipe-body.svg')}
            style={[stylesPipe.pipeBody, { height: topBodyHeight }]}
            contentFit="stretch"
          />
        ) : null}
        {topCapHeight > 0 ? (
          <ExpoImage
            source={require('../../assets/images/pipe-top.svg')}
            style={[stylesPipe.pipeCap, { height: topCapHeight, width: capWidthPx }]}
            contentFit="stretch"
          />
        ) : null}
      </View>

      {/* Bottom segment: cap then body */}
      <View style={[stylesPipe.columnBottom, { left: x, height: bottomHeight, bottom: bottomY }, commonWidth]}>
        {bottomCapHeight > 0 ? (
          <ExpoImage
            source={require('../../assets/images/pipe-bottom.svg')}
            style={[stylesPipe.pipeCap, { height: bottomCapHeight, width: capWidthPx }]}
            contentFit="stretch"
          />
        ) : null}
        {bottomBodyHeight > 0 ? (
          <ExpoImage
            source={require('../../assets/images/pipe-body.svg')}
            style={[stylesPipe.pipeBody, { height: bottomBodyHeight }]}
            contentFit="stretch"
          />
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
  },
  columnBottom: {
    position: 'absolute',
    overflow: 'hidden',
  },
  pipeBody: {
    width: '100%',
  },
  pipeCap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});