import styles from '@/src/styles/gameStyles';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const startGame = () => {
    router.push('/GameScreen');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1020' }}>
      <View style={styles.container}>
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


