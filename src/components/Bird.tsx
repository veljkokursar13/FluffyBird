import { Image as ExpoImage } from 'expo-image';
import { ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useWingFlap } from '../game/bird';

type BirdProps = {
	style?: StyleProp<ViewStyle>;
	source?: ImageSourcePropType;
	width?: number;
	height?: number;
	flapping?: boolean;
	rotationDeg?: number;
};

function Bird({ style, source, width, height, flapping = false, rotationDeg = 0 }: BirdProps) {
	const imgSource = source ?? require('../../assets/images/bird.svg');
	const sizeStyle = width && height ? { width, height } : undefined;
	const flap = useWingFlap({ trigger: flapping, liftPx: 5, maxLiftPx: 8, decayPerSec: 100 });

	return (
		<View style={[localStyles.container, style, sizeStyle, { transform: [{ rotate: `${rotationDeg}deg` }] }]}>
			<ExpoImage
				source={imgSource}
				style={[localStyles.image, sizeStyle]}
				contentFit="contain"
			/>
			{width && height ? (
				<ExpoImage
					source={require('../../assets/images/wing-mid.svg')}
					style={{
						position: 'absolute',
						// wing size ~44% of bird
						width: Math.round(width * 0.44),
						height: Math.round(height * 0.44),
						// anchor further left and lower
						left: Math.round((width - Math.round(width * 0.44)) * 0.38),
						top: Math.round((height - Math.round(height * 0.44)) * 0.70) + Math.round(flap.offsetPx),
						transform: [{ rotate: `${flap.offsetPx * 2}deg` }],
					}}
					contentFit="contain"
				/>
			) : null}
		</View>

	);
}

export default Bird;

const localStyles = StyleSheet.create({
	container: {
		position: 'absolute',
	},
	image: {
		width: '100%',
		height: '100%',
	},
});