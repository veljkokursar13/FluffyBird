import { useSoundStore } from '@/src/state/sound';
import { Audio, AVPlaybackStatusSuccess } from 'expo-av';

let bgm: Audio.Sound | null = null;

// Background soundtrack; loops by default
export async function playSound(loop: boolean = true): Promise<void> {
	try {
		if (useSoundStore.getState().muted) return;
		if (!bgm) {
			const { sound } = await Audio.Sound.createAsync(
				require('../../assets/audio/fluffy-soundtrack.wav'),
				{ isLooping: loop, volume: 0.6 }
			);
			bgm = sound;
		} else {
			await bgm.setIsLoopingAsync(loop);
		}
		const status = (await bgm.getStatusAsync()) as AVPlaybackStatusSuccess | undefined;
		if (!status || !status.isPlaying) {
			await bgm.playAsync();
		}
	} catch (error) {
		console.warn('Failed to play background music', error);
	}
}

export async function pauseSound(): Promise<void> {
	try {
		if (bgm) {
			const status = (await bgm.getStatusAsync()) as AVPlaybackStatusSuccess | undefined;
			if (status && status.isPlaying) {
				await bgm.pauseAsync();
			}
		}
	} catch (error) {
		console.warn('Failed to pause background music', error);
	}
}

export async function stopSound(): Promise<void> {
	try {
		if (bgm) {
			await bgm.stopAsync();
		}
	} catch (error) {
		console.warn('Failed to stop background music', error);
	}
}

export async function unloadSound(): Promise<void> {
	try {
		if (bgm) {
			await bgm.unloadAsync();
			bgm = null;
		}
	} catch (error) {
		console.warn('Failed to unload background music', error);
	}
}

// Preload soundtrack without playing
export async function preloadSoundtrack(): Promise<void> {
	try {
		if (!bgm) {
			const { sound } = await Audio.Sound.createAsync(
				require('../../assets/audio/fluffy-soundtrack.wav'),
				{ isLooping: true, volume: 0.6 }
			);
			bgm = sound;
		}
	} catch (error) {
		console.warn('Failed to preload background music', error);
	}
}


