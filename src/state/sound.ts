import { create } from 'zustand';

type SoundState = {
	muted: boolean;
	setMuted: (muted: boolean) => void;
	toggle: () => void;
};

export const useSoundStore = create<SoundState>((set, get) => ({
	muted: false,
	setMuted: (muted: boolean) => set({ muted }),
	toggle: () => set({ muted: !get().muted }),
}));


