import { Slot } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={[
          'rgb(135, 206, 250)',
          'rgb(176, 224, 255)',
          'rgb(212, 241, 255)',
          'rgb(254, 250, 224)'
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <Slot />
      </LinearGradient>
    </SafeAreaView>
  );
}
