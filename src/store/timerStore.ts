import { create } from 'zustand';

export interface Timer {
  id: string;
  name: string;
  mode: 'countdown' | 'countup' | 'elapsed';
  targetSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  showOnStage: boolean;
}

interface TimerStore {
  timers: Timer[];

  // Actions
  updateTimer: (timer: Timer) => void;
  setTimers: (timers: Timer[]) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  timers: [
    { id: '1', name: 'Service Countdown', mode: 'countdown', targetSeconds: 300, elapsedSeconds: 0, isRunning: false, showOnStage: true },
    { id: '2', name: 'Sermon', mode: 'countup', targetSeconds: 2400, elapsedSeconds: 0, isRunning: false, showOnStage: false },
  ], // Initial mock states for layout building

  updateTimer: (timer) => set((state) => ({
    timers: state.timers.map(t => t.id === timer.id ? timer : t)
  })),

  setTimers: (timers) => set({ timers }),
}));
