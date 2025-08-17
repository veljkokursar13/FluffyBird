import { playSound as playBgm, stopSound as stopBgm } from '@/src/state/fluffy-soundtrack';
import { useSoundStore } from '@/src/state/sound';
import styles from '@/src/styles/gameStyles';
import { useLoading } from '@/src/utils/rand';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const { muted, toggle } = useSoundStore();
  const loading = useLoading();
  
  // Play background music only on the menu screen
  useEffect(() => {
    if (!muted) {
      playBgm();
    } else {
      stopBgm();
    }
    return () => {
      stopBgm();
    };
  }, [muted]);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  const startGame = () => {
    stopBgm();
    router.push('/GameScreen');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1020' }}>
      <View style={styles.container}>
      <TouchableOpacity
        onPress={toggle}
        style={{ position: 'absolute', top: 12, right: 12, padding: 8 }}
        accessibilityRole="button"
        accessibilityLabel={muted ? 'Unmute sound' : 'Mute sound'}
      >
        <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>
        Flappy Bird
      </Text>

      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


