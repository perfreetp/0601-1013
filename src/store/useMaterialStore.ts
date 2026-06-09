import { create } from 'zustand';
import type { Material, MaterialType } from '@/types';
import { materials } from '@/mock/materials';

interface MaterialState {
  materials: Material[];
  searchQuery: string;
  filterType: 'all' | MaterialType;
  addMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  setSearch: (query: string) => void;
  setFilter: (type: 'all' | MaterialType) => void;
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials,
  searchQuery: '',
  filterType: 'all',
  addMaterial: (material) =>
    set((state) => ({
      materials: [material, ...state.materials],
    })),
  deleteMaterial: (id) =>
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    })),
  setSearch: (query) => set({ searchQuery: query }),
  setFilter: (type) => set({ filterType: type }),
}));
