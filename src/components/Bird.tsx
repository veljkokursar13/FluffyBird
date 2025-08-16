import { Image as ExpoImage } from 'expo-image';
import { ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';
import { useWingFlap } from '../game/bird';
import styles from '../styles/gameStyles';

type BirdProps = {
	style?: StyleProp<ViewStyle>;
	source?: ImageSourcePropType;
	width?: number;
	height?: number;
	flapping?: boolean;
	rotationDeg?: number;
};

function Bird({ style, source, width, height, flapping = true, rotationDeg = 0 }: BirdProps) {
	const imgSource = source ?? require('../../assets/images/bird.svg');
	const sizeStyle = width && height ? { width, height } : undefined;
	const flap = useWingFlap({ trigger: flapping, liftPx: 5, maxLiftPx: 8, decayPerSec: 100 });

	// Single wing asset; rotate it for a natural flap
	const wingSrc = require('../../assets/images/wing-mid.svg');

	// Wing sizing/position relative to bird (small and a bit lower)
	const wingW = width ? Math.round(width * 0.44) : undefined;
	const wingH = height ? Math.round(height * 0.44) : undefined;
	const wingLeft = width && wingW ? Math.round((width - wingW) * 0.50) : 0; // shift a bit left
	const wingBaseTop = height && wingH ? Math.round((height - wingH) * 0.58) : 0; // lower on body
	const wingTopPos = wingBaseTop + Math.round(flap.offsetPx);

	return (
		<View style={[style, sizeStyle, { transform: [{ rotate: `${rotationDeg}deg` }] }]}>
			{/* Bird body */}
			<ExpoImage
				source={imgSource}
				style={[styles.birdImage, sizeStyle]}
				contentFit="contain"
			/>
			
			{/* Wing - positioned relative to bird body */}
			<View style={[
				styles.wing,
				{
					position: 'absolute',
					left: wingLeft,
					top: wingTopPos,
					width: wingW,
					height: wingH,
					transform: [{ rotate: `${flap.offsetPx * 2}deg` }] // Convert offset to rotation
				}
			]}>
				<ExpoImage
					source={wingSrc}
					style={{ width: '100%', height: '100%' }}
					contentFit="contain"
				/>
			</View>
		</View>
	);
}

export default Bird;