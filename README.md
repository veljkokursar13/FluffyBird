Fluffy Bird

Fluffy Bird is a modern reimagining of the classic side-scrolling arcade game. Built with React Native and Expo, this project focuses on clean code architecture, scalable asset management, and a smooth, polished gameplay experience.

This repository represents an evolving game project, designed not just as a clone, but as a platform for experimentation with rendering techniques, asset optimization, and adaptive AI-driven difficulty scaling.

⸻

Features
	•	Cross-Platform Support: Runs seamlessly on iOS, Android, and web through Expo.
	•	Modular Architecture: Organized into clearly defined modules for components, state management, game logic, and assets.
	•	Custom Game Physics: Bird mechanics, collision detection, and pipe spawning are implemented from scratch for complete control.
	•	Optimized Asset Pipeline: Planned transition from SVG to high-resolution PNG sprites, followed by Skia-based rendering for performance.
	•	Scalable Difficulty System: Future versions will include adaptive AI to dynamically adjust gameplay difficulty based on player performance.

⸻

Tech Stack
	•	Framework: React Native with Expo
	•	Language: TypeScript
	•	Rendering: Expo Linear Gradient, custom components (future upgrade: Skia)
	•	State Management: Lightweight Zustand store
	•	Sound: Custom soundtracks and effects with Expo AV
	•	Build & Tooling: Babel module resolver, TypeScript path aliases, NativeWind styling

⸻

Roadmap
	1.	MVP (Current)
	•	Core gameplay loop
	•	Functional UI with Game Over, Pause, and Restart
	•	Basic collision and scoring
	2.	Asset Optimization
	•	Replace SVGs with optimized PNG sprites
	•	Introduce Skia-based rendering for better performance
	3.	Gameplay Enhancements
	•	Polished UI with retro-inspired visual effects
	•	Multiple themes and environments
	4.	AI-Powered Difficulty
	•	Dynamic pipe spawning
	•	Real-time difficulty adjustments based on player stats
	5.	Deployment
	•	iOS and Android store releases
	•	Web version for demo purposes

Project Structure
FluffyBird/
├── app/                # Screens and layouts
├── assets/             # Images, fonts, and sounds
├── src/
│   ├── components/     # Reusable UI components
│   ├── constants/      # Game constants and config
│   ├── game/           # Core game logic and physics
│   ├── hooks/          # Custom React hooks
│   ├── renderers/      # Visual branches
│   │   ├── classic/        # Original renderer
│   │   └── current_model/  # Placeholder for the current model branch
│   ├── state/          # Zustand store and sound state
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions

This structure prioritizes scalability, making it easy to add features or swap rendering engines in the future.

Installation

Clone the repository and install dependencies:

git clone https://github.com/veljkokursar13/FluffyBird.git
cd FluffyBird
npm install

Run the app:
npx expo start

License

This project is proprietary software.
All rights are reserved by the author. You may not copy, modify, distribute, or use this code without explicit written permission.

