import { StyleProp, Text, View, ViewStyle } from 'react-native';
import useBestScore from '../hooks/useBestScore';
import styles from '../styles/gameStyles';

type HudProps = {
  score: number;
  style?: StyleProp<ViewStyle>;
};

export default function Hud({ score, style }: HudProps) {
  const { bestScore } = useBestScore({ score });
  return (
    <View style={[styles.scoreContainer, style]}>
      <Text style={styles.score}>Score: {score}</Text>
      <Text style={styles.score}>Best: {bestScore}</Text>
    </View>
  );
}


