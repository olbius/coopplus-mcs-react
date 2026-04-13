import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

interface UIStore {
  sidebarOpen: boolean;
  selectedModuleId: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSelectedModule: (moduleId: string | null) => void;
  saveModuleToServer: (moduleId: string | null) => void;
  loadModuleFromServer: () => Promise<void>;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      selectedModuleId: null,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSelectedModule: (moduleId) => set({ selectedModuleId: moduleId }),

      saveModuleToServer: async (moduleId) => {
        try {
          await apiClient.post('/services/setUserPreference', {
            userPrefTypeId: 'LAST_MODULE',
            userPrefValue: moduleId || '',
          });
        } catch {
          // Non-critical — UI still works
        }
      },

      loadModuleFromServer: async () => {
        try {
          const response = await apiClient.post('/services/getUserPreference', {
            userPrefTypeId: 'LAST_MODULE',
          });
          const value = response.data?.data?.userPrefValue || response.data?.userPrefValue;
          if (value) {
            set({ selectedModuleId: value });
          }
        } catch {
          // Non-critical
        }
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        selectedModuleId: state.selectedModuleId,
      }),
    }
  )
);
