import { create } from 'zustand';

// helper to persist to localStorage (simple)
const persistKey = 'gc_state_v1';
function loadState() {
  try {
    const raw = localStorage.getItem(persistKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
function saveState(s) {
  try {
    localStorage.setItem(persistKey, JSON.stringify(s));
  } catch (e) {}
}

const initial = {
  user: null,
  dark: false,
  chatrooms: [], // each: {id, title, createdAt, messages: [{id, sender, text, imageUrl, createdAt}]}
  activeRoomId: null,
};

const persisted = typeof window !== 'undefined' ? loadState() : null;
const startState = persisted ? { ...initial, ...persisted } : initial;

const useStore = create((set, get) => ({
  ...startState,

  // set user and persist
  setUser: (u) => {
    set({ user: u });
    saveState({ ...get(), user: u });
  },

  toggleDark: () => {
    set((s) => {
      const next = { ...s, dark: !s.dark };
      saveState({ ...next, user: next.user }); // minimal persist
      return { dark: next.dark };
    });
  },

  addRoom: (room) => {
    set((s) => {
      const nextRooms = [room, ...s.chatrooms];
      saveState({ ...s, chatrooms: nextRooms });
      return { chatrooms: nextRooms };
    });
  },

  deleteRoom: (id) => {
    set((s) => {
      const nextRooms = s.chatrooms.filter((r) => r.id !== id);
      const nextActive = s.activeRoomId === id ? (nextRooms[0]?.id || null) : s.activeRoomId;
      const next = { ...s, chatrooms: nextRooms, activeRoomId: nextActive };
      saveState(next);
      return { chatrooms: nextRooms, activeRoomId: nextActive };
    });
  },

  setActive: (id) => {
    set((s) => {
      const next = { ...s, activeRoomId: id };
      saveState({ ...next, user: next.user });
      return { activeRoomId: id };
    });
  },

  // add message to a room
  addMessage: (roomId, message) => {
    set((s) => {
      const nextRooms = s.chatrooms.map((r) =>
        r.id === roomId ? { ...r, messages: [...(r.messages || []), message] } : r
      );
      const next = { ...s, chatrooms: nextRooms };
      saveState({ ...next, user: next.user });
      return { chatrooms: nextRooms };
    });
  },

  // replace messages (useful for pagination simulation)
  saveMessages: (roomId, messages) => {
    set((s) => {
      const nextRooms = s.chatrooms.map((r) => (r.id === roomId ? { ...r, messages } : r));
      saveState({ ...s, chatrooms: nextRooms });
      return { chatrooms: nextRooms };
    });
  },
}));

export default useStore;
