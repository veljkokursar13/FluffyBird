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
    <View style={[styles.hudContainer, style]}>
      <View style={styles.hudRow}>
        <Text style={styles.hudLabel}>Score</Text>
        <Text style={styles.hudValue}>{score}</Text>
      </View>
      <View style={styles.hudRow}>
        <Text style={styles.hudLabel}>Best</Text>
        <Text style={styles.hudValue}>{bestScore}</Text>
      </View>
    </View>
  );
}
