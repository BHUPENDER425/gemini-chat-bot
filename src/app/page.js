"use client";

import React, { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import Chatroom from "./components/Chatroom";
import Toasts from "./components/Toasts";
import useStore from "./store/useStore";
import { uid } from "./utils/helpers";

export default function Page() {
  // ✅ Zustand store
  const { user, setUser, dark, toggleDark } = useStore();

  // ✅ hooks always at top
  const [openRoom, setOpenRoom] = useState(
    useStore.getState().activeRoomId || null
  );
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState(() => []);

  // ✅ effects
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const t = setInterval(() => {
      setToasts((s) => s.filter((x) => Date.now() - x._t < 4000));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }, [dark]);
  useEffect(() => {
    const unsub = useStore.subscribe(
      (s) => s.activeRoomId,
      (v) => setOpenRoom(v)
    );
    return unsub;
  }, []);

  // ✅ helper
  const push = (text) =>
    setToasts((s) => [...s, { id: uid("t"), text, _t: Date.now() }]);

  // ✅ render
  if (!mounted) return null; // hydration safe
  if (!user) return <AuthForm onDone={(u) => setUser(u)} push={push} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 bg-cover bg-center bg-no-repeat bg-[url('/images/backgroundimg.jpg')] to-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl  mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {/* Sidebar */}
        <div className="col-span-1 bg-white dark:bg-gray-800 rounded shadow h-[80vh] overflow-auto">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-bold">Gemini Chat</div>
            <button className="btn ghost mr-2" onClick={toggleDark}>
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <Dashboard onOpenRoom={(id) => setOpenRoom(id)} push={push} />
        </div>

        {/* Chatroom */}
        <div className="col-span-2 md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded shadow h-[80vh] flex flex-col overflow-hidden">
          <Chatroom roomId={openRoom} push={push} />
        </div>
      </div>

      {/* Toasts */}
      <Toasts items={toasts} />
    </div>
  );
}
