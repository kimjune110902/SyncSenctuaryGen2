import { create } from 'zustand';

export interface Slide {
  id: string;
  name: string;
  index: number;
}

interface PresentationStore {
  selectedSlideIds: Set<string>;
  lastSelectedSlideId: string | null;
  liveSlideId: string | null;
  cuedSlideId: string | null;

  // Actions
  setSelectedSlideIds: (ids: Set<string>) => void;
  setLastSelectedSlideId: (id: string | null) => void;
  setLiveSlideId: (id: string | null) => void;
  setCuedSlideId: (id: string | null) => void;
}

export const usePresentationStore = create<PresentationStore>((set) => ({
  selectedSlideIds: new Set(),
  lastSelectedSlideId: null,
  liveSlideId: null,
  cuedSlideId: null,

  setSelectedSlideIds: (ids: Set<string>) => set({ selectedSlideIds: ids }),
  setLastSelectedSlideId: (id: string | null) => set({ lastSelectedSlideId: id }),
  setLiveSlideId: (id: string | null) => set({ liveSlideId: id }),
  setCuedSlideId: (id: string | null) => set({ cuedSlideId: id }),
}));
