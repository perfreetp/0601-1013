import { create } from 'zustand';
import type { Material, MaterialType } from '@/types';
import { materials as defaultMaterials } from '@/mock/materials';

const STORAGE_KEY = 'club-video-materials';

interface PersistedState {
  materials: Material[];
  searchQuery: string;
  filterType: 'all' | MaterialType;
}

function loadFromStorage(): PersistedState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        materials: parsed.materials || defaultMaterials,
        searchQuery: parsed.searchQuery || '',
        filterType: parsed.filterType || 'all',
      };
    }
  } catch (e) {
    console.error('Failed to load materials from localStorage:', e);
  }
  return {
    materials: defaultMaterials,
    searchQuery: '',
    filterType: 'all',
  };
}

function saveToStorage(state: PersistedState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        materials: state.materials,
        searchQuery: state.searchQuery,
        filterType: state.filterType,
      })
    );
  } catch (e) {
    console.error('Failed to save materials to localStorage:', e);
  }
}

interface MaterialState extends PersistedState {
  addMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  setSearch: (query: string) => void;
  setFilter: (type: 'all' | MaterialType) => void;
  addTagsToMaterials: (ids: string[], tags: string[]) => void;
  setMaterialsTags: (ids: string[], tags: string[]) => void;
  batchDeleteMaterials: (ids: string[]) => void;
}

const initialState = loadFromStorage();

export const useMaterialStore = create<MaterialState>((set) => ({
  ...initialState,
  addMaterial: (material) =>
    set((state) => {
      const newMaterial = {
        ...material,
        id: material.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
      const newState = {
        materials: [newMaterial, ...state.materials],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
  deleteMaterial: (id) =>
    set((state) => {
      const newState = {
        materials: state.materials.filter((m) => m.id !== id),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
  setSearch: (query) =>
    set((state) => {
      const newState = { searchQuery: query };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
  setFilter: (type) =>
    set((state) => {
      const newState = { filterType: type };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
  addTagsToMaterials: (ids, tags) =>
    set((state) => {
      const idSet = new Set(ids);
      const newState = {
        materials: state.materials.map((m) =>
          idSet.has(m.id)
            ? {
                ...m,
                tags: Array.from(new Set([...m.tags, ...tags])),
              }
            : m
        ),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
  setMaterialsTags: (ids, tags) =>
    set((state) => {
      const idSet = new Set(ids);
      const newState = {
        materials: state.materials.map((m) =>
          idSet.has(m.id) ? { ...m, tags: [...tags] } : m
        ),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
  batchDeleteMaterials: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      const newState = {
        materials: state.materials.filter((m) => !idSet.has(m.id)),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    }),
}));
