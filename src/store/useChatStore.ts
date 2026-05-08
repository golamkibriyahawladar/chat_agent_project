import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { UserRole } from '@/types'

interface ChatState {
  activeChatId: string | null;
  isAiEnabled: boolean;
  userRole: UserRole | null;
  userId: string | null;
  companyId: string | null;
  userName: string | null;
  isMobileChatOpen: boolean;
  
  // Actions
  setActiveChat: (id: string | null) => void;
  toggleAiMode: () => void;
  setAiMode: (enabled: boolean) => void;
  setUserRole: (role: UserRole) => void;
  setUserId: (id: string) => void;
  setCompanyId: (id: string) => void;
  setMobileChatOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      activeChatId: null,
      isAiEnabled: true,
      userRole: null,
      userId: null,
      companyId: null,
      userName: null,
      isMobileChatOpen: false,

      setActiveChat: (id) => set({ activeChatId: id }),
      toggleAiMode: () => set((state) => ({ isAiEnabled: !state.isAiEnabled })),
      setAiMode: (enabled) => set({ isAiEnabled: enabled }),
      setUserRole: (role) => set({ userRole: role }),
      setUserId: (id) => set({ userId: id }),
      setCompanyId: (id) => set({ companyId: id }),
      setMobileChatOpen: (open) => set({ isMobileChatOpen: open }),
    }),
    {
      name: 'chat-storage', // secure unique key in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeChatId: state.activeChatId }), // only persist the Active Chat ID
    }
  )
)
