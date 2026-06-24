import { create } from 'zustand';

interface OrderNotif { orderId: string; total: number; }
interface ChatNotif { roomId: string; message: any; }
interface UserNotif { name: string; email: string; }

interface NotificationStore {
  orderNotifs: OrderNotif[];
  chatNotifs: ChatNotif[];
  userNotifs: UserNotif[];
  addOrder: (n: OrderNotif) => void;
  addChat: (n: ChatNotif) => void;
  addUser: (n: UserNotif) => void;
  clearAll: () => void;
  clearOrders: () => void;
  clearChat: () => void;
  clearUsers: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  orderNotifs: [],
  chatNotifs: [],
  userNotifs: [],
  addOrder: (n) => set((s) => ({ orderNotifs: [n, ...s.orderNotifs] })),
  addChat: (n) => set((s) => ({ chatNotifs: [...s.chatNotifs, n] })),
  addUser: (n) => set((s) => ({ userNotifs: [n, ...s.userNotifs] })),
  clearAll: () => set({ orderNotifs: [], chatNotifs: [], userNotifs: [] }),
  clearOrders: () => set({ orderNotifs: [] }),
  clearChat: () => set({ chatNotifs: [] }),
  clearUsers: () => set({ userNotifs: [] }),
}));