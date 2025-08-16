import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Shared container used by both menu and game screens
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    backgroundColor: '#0b1020',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  // Game screen overlay to get a sky-like background while retaining base layout
  gameContainer: {
    backgroundColor: '#87CEEB',
  },

  // Menu screen styles
  title: {
    fontSize: 48,
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 220,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },

  // Game screen styles
  
  // pipe styles removed; Pipe.tsx fully styles itself now
  score: {
    color: '#B8860B',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.75,
    textTransform: 'uppercase',
  },
  scoreContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
});

export default styles;

