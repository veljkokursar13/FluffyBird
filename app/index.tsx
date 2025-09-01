import GameLoader from '@/src/components/GameLoader';
import { playSound as playBgm, stopSound as stopBgm } from '@/src/state/sound/fluffy-soundtrack';
import useGameLoading from '@/src/state/gameLoading';
import { useSoundStore } from '@/src/state/sound/sound';
import styles from '@/src/styles/gameStyles';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const { muted, toggle } = useSoundStore();
  const loading = useGameLoading(1000);
  
  // Play background music only on the menu screen and only when not loading
  useEffect(() => {
    if (loading) {
      stopBgm();
      return;
    }
    if (!muted) {
      playBgm();
    } else {
      stopBgm();
    }
    return () => {
      stopBgm();
    };
  }, [muted, loading]);
  
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={styles.container}>
          <GameLoader />
        </View>
      </SafeAreaView>
    );
  }

  const startGame = () => {
    stopBgm();
    router.push('/game');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
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

      <TouchableOpacity
        onPress={startGame}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Start Game"
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


