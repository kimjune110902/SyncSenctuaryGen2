import { create } from 'zustand';

export interface StreamHealth {
  bitrate: number;
  droppedFrames: number;
  rtt: number;
  status: 'excellent' | 'good' | 'poor' | 'offline';
}

interface StreamingStore {
  isStreaming: boolean;
  isRecording: boolean;
  streamHealth: StreamHealth | null;
  recordingDurationSeconds: number;

  // Actions
  setStreamingState: (isStreaming: boolean) => void;
  setRecordingState: (isRecording: boolean) => void;
  updateHealth: (health: StreamHealth | null) => void;
  setRecordingDurationSeconds: (seconds: number) => void;
}

export const useStreamingStore = create<StreamingStore>((set) => ({
  isStreaming: false,
  isRecording: false,
  streamHealth: null,
  recordingDurationSeconds: 0,

  setStreamingState: (isStreaming: boolean) => set({ isStreaming }),
  setRecordingState: (isRecording: boolean) => set({ isRecording }),
  updateHealth: (health: StreamHealth | null) => set({ streamHealth: health }),
  setRecordingDurationSeconds: (seconds: number) => set({ recordingDurationSeconds: seconds }),
}));
