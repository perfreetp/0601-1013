import { create } from 'zustand';
import type { Template, TemplateCategory } from '@/types';
import { templates } from '@/mock/templates';
import { useEditorStore } from './useEditorStore';

interface TemplateState {
  templates: Template[];
  selectedCategory: TemplateCategory | 'all';
  setCategory: (category: TemplateCategory | 'all') => void;
  applyTemplate: (template: Template) => void;
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates,
  selectedCategory: 'all',
  setCategory: (category) => set({ selectedCategory: category }),
  applyTemplate: (template) => {
    const loadProject = useEditorStore.getState().loadProject;
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    loadProject({
      id: `p_${Date.now()}`,
      title: template.name,
      cover: template.thumbnail,
      status: 'draft',
      clips: [],
      stickers: [],
      templateId: template.id,
      createdAt: now,
      updatedAt: now,
    });
  },
}));
