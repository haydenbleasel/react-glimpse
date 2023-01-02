import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GlimpseState } from '../types';

const defaultData = {
  image: null,
  title: null,
  description: null,
  url: null,
};

const useGlimpseStore = create<GlimpseState>()(
  devtools(
    persist(
      (set) => ({
        data: defaultData,
        setData: (data) => set({ data }),
        // eslint-disable-next-line id-length
        offset: { x: 0, y: 0 },
        setOffset: (offset) => set({ offset }),
        url: null,
        setUrl: (url) => set({ url }),
        cache: {},
        setCache: (cache) => set({ cache }),
        reset: () =>
          // eslint-disable-next-line id-length
          set({ data: defaultData, offset: { x: 0, y: 0 }, url: null }),
      }),
      {
        name: 'glimpse-storage',
      }
    )
  )
);

export default useGlimpseStore;
