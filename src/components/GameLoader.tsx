import { Image as ExpoImage } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';

export default function GameLoader() {
  const [boxW, setBoxW] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onBoxLayout = (e: LayoutChangeEvent) => {
    setBoxW(Math.round(e.nativeEvent.layout.width));
  };

  useEffect(() => {
    if (!boxW) return;
    scrollX.setValue(0);
    const anim = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -boxW,
        duration: 1700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [boxW, scrollX]);

  const soil = require('../../assets/images/soil-with-grass.svg');
  const loaderImg = require('../../assets/images/bird.svg');
  const imgSize = Math.max(64, Math.min(112, boxW ? boxW - 24 : 96));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.box} onLayout={onBoxLayout}>
        <View style={styles.centerArea}>
          <ExpoImage
            source={loaderImg}
            style={{ width: imgSize, height: imgSize }}
            contentFit="contain"
          />
        </View>

        <ActivityIndicator size="small" color="#0b1020" style={styles.spinner} />

        <View style={styles.soilBand}>
          {boxW > 0 ? (
            <Animated.View
              style={{
                flexDirection: 'row',
                width: boxW * 2,
                height: '100%',
                transform: [{ translateX: scrollX }],
              }}
            >
              <ExpoImage source={soil} style={{ width: boxW, height: '100%' }} contentFit="cover" />
              <ExpoImage source={soil} style={{ width: boxW, height: '100%' }} contentFit="cover" />
            </Animated.View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const BOX_SIZE = 160;
const SOIL_H = 44;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 50,
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: '#ffffffee',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6e8ef',
    overflow: 'hidden',
    alignItems: 'center',
  },
  centerArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  spinner: {
    marginBottom: 6,
  },
  soilBand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SOIL_H,
  },
});