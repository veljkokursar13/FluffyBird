import styles from '@/src/styles/gameStyles';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function MenuScreen() {
  const startGame = () => {
    router.push('/GameScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Flappy Bird
      </Text>

      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}


