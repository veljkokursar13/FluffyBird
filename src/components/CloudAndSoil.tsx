import { Image as ExpoImage } from 'expo-image';
import { StyleSheet } from 'react-native';
import bushesFar from '../../assets/images/bushes-far.svg';
import bushesNear from '../../assets/images/bushes-near.svg';
import cloudClose from '../../assets/images/cloud-close-1.svg';
import cloudFar1 from '../../assets/images/cloud-far-1.svg';
import cloudFar2 from '../../assets/images/cloud-far-2.svg';
import skylineImg from '../../assets/images/skyline.svg';
import soilWithGrass from '../../assets/images/soil-with-grass.svg';
import type { Bush as BushType, Cloud, Soil as SoilType } from '../game/environmentCreation';

type CloudProps = {
  cloud: Cloud;
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
};

const cloudAssets = {
  close: cloudClose,
  far1: cloudFar1,
  far2: cloudFar2,
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
    zIndex: -3,
  },
});



type SoilProps = {
  soil: SoilType;
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
};

const soilAsset = soilWithGrass;

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
    zIndex: 0,
  },
});

// Bushes
type BushProps = {
  bush: BushType;
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
};

const bushAssets = {
  near: bushesNear,
  far: bushesFar,
};

export function Bush({ bush, x, y, width, height }: BushProps) {
  const opacity = bush.type === 'far' ? 0.85 : 1;
  return (
    <ExpoImage
      source={bushAssets[bush.type]}
      style={[
        stylesBush.bush,
        { left: x, top: y, width, height, opacity },
      ]}
      contentFit="contain"
    />
  );
}

const stylesBush = StyleSheet.create({
  bush: {
    position: 'absolute',
    zIndex: 0, // between clouds and soil
  },
});

// Full-width bushes layers: far behind near, far slightly taller
export function BushesFull({ x, y, width, nearHeightPx, farHeightPx }: { x: number; y: number; width: number; nearHeightPx: number; farHeightPx: number; }) {
  return (
    <>
      <ExpoImage
        source={bushesFar}
        style={[stylesBush.bush, { left: x, top: y - (farHeightPx - nearHeightPx), width, height: farHeightPx, zIndex: 1 }]}
        contentFit="cover"
      />
      <ExpoImage
        source={bushesNear}
        style={[stylesBush.bush, { left: x, top: y, width, height: nearHeightPx, zIndex: 2 }]}
        contentFit="cover"
      />
    </>
  );
}

// Skyline
type SkylineProps = {
  x: number; // px
  y: number; // px
  width: number; // px
  height: number; // px
};

export function Skyline({ x, y, width, height }: SkylineProps) {
  return (
    <ExpoImage
      source={skylineImg}
      style={[
        stylesSkyline.skyline,
        { left: x, top: y, width, height },
      ]}
      contentFit="fill"
    />
  );
}

const stylesSkyline = StyleSheet.create({
  skyline: {
    position: 'absolute',
    zIndex: -2,
    opacity: 0.95,
  },
});