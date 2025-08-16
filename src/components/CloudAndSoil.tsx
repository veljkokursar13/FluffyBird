import { Image as ExpoImage } from 'expo-image';
import { StyleSheet } from 'react-native';
import type { Cloud, Soil as SoilType } from '../game/environmentCreation';

type CloudProps = {
  cloud: Cloud;
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
};

const cloudAssets = {
  close: require('../../assets/images/cloud-close-1.svg'),
  far1: require('../../assets/images/cloud-far-1.svg'),
  far2: require('../../assets/images/cloud-far-2.svg'),
};

export function Cloud({ cloud, x, y, width, height }: CloudProps) {
  const opacity = cloud.type === 'close' ? 0.8 : cloud.type === 'far1' ? 0.6 : 0.4;
  
  return (
    <ExpoImage
      source={cloudAssets[cloud.type]}
      style={[
        stylesCloud.cloud,
        {
          left: x,
          top: y,
          width,
          height,
          opacity,
        },
      ]}
      contentFit="contain"
    />
  );
}

const stylesCloud = StyleSheet.create({
  cloud: {
    position: 'absolute',
    zIndex: -1, // Behind pipes and bird
  },
});



type SoilProps = {
  soil: SoilType;
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
};

const soilAsset = require('../../assets/images/soil-with-grass.svg');

export function Soil({ soil, x, y, width, height }: SoilProps) {
  return (
    <ExpoImage
      source={soilAsset}
      style={[
        stylesSoil.soil,
        {
          left: x,
          top: y,
          width,
          height,
        },
      ]}
      contentFit="fill" // Stretch to fill the ground area
    />
  );
}

const stylesSoil = StyleSheet.create({
  soil: {
    position: 'absolute',
    zIndex: 1,
  },
});