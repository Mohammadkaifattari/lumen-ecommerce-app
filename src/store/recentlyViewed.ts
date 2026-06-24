import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  add: (id: string) => void;
  clear: () => void;
}

const MAX_ITEMS = 8;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const current = get().ids.filter((existing) => existing !== id);
        set({ ids: [id, ...current].slice(0, MAX_ITEMS) });
      },
      clear: () => set({ ids: [] }),
    }),
    { name: "lumen-recently-viewed" }
  )
);