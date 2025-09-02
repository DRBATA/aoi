// Shared AudioContext singleton to prevent multiple instances on iOS Safari
let sharedAudioContext: AudioContext | null = null;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContext();
  }
  
  return sharedAudioContext;
};

export const resumeAudioContext = async (): Promise<void> => {
  const ac = getAudioContext();
  if (ac && ac.state === 'suspended') {
    await ac.resume();
  }
};
