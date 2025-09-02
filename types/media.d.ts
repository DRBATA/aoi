// Global type augmentation for iOS Safari voiceIsolation support
declare global {
  interface MediaTrackConstraints {
    /** Experimental / Safari-specific voice isolation feature */
    voiceIsolation?: boolean;
  }
}

export {};
