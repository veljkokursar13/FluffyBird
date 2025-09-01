import { useSoundStore } from '@/src/state/sound/sound';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';

let tapSound: Audio.Sound | null = null;

export async function playSound(loop: boolean = false): Promise<void> {
	try {
		if (useSoundStore.getState().muted) return;
		if (!tapSound) {
			const { sound } = await Audio.Sound.createAsync(
                                require('../../../assets/audio/gameplaysound.mp3')
			);
			tapSound = sound;
		}
		await tapSound.setIsLoopingAsync(loop);
		// replayAsync ensures it plays even if it just finished
		await tapSound.replayAsync();
	} catch (error) {
		console.warn('Failed to play tap sound', error);
	}
}

export async function stopSound(): Promise<void> {
	try {
		if (tapSound) {
			const status = (await tapSound.getStatusAsync()) as AVPlaybackStatusSuccess | undefined;
			if (status && status.isPlaying) {
				await tapSound.stopAsync();
			}
		}
	} catch (error) {
		console.warn('Failed to stop tap sound', error);
	}
}

export async function unloadSound(): Promise<void> {
	try {
		if (tapSound) {
			await tapSound.unloadAsync();
			tapSound = null;
		}
	} catch (error) {
		console.warn('Failed to unload tap sound', error);
	}
}

// Preload tap sound without playing
export async function preloadTapSound(): Promise<void> {
	try {
		if (!tapSound) {
			const { sound } = await Audio.Sound.createAsync(
                                require('../../../assets/audio/gameplaysound.mp3')
			);
			tapSound = sound;
		}
	} catch (error) {
		console.warn('Failed to preload tap sound', error);
	}
}


