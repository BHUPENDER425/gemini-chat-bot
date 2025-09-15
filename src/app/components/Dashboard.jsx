'use client';

import React, { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { uid, nowISO } from '../utils/helpers';
import { Plus, Search, Trash2 } from 'lucide-react';

export default function Dashboard({ onOpenRoom, push }) {
  const { chatrooms, addRoom, deleteRoom, setActive, activeRoomId } = useStore();

  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = chatrooms.filter((r) =>
    r.title.toLowerCase().includes(debounced.toLowerCase())
  );

  const create = () => {
    if (!title.trim()) return push('Title required');
    const room = {
      id: uid('room'),
      title: title.trim(),
      createdAt: nowISO(),
      messages: [],
    };
    addRoom(room);
    setActive(room.id);
    push('Chatroom created');
    setTitle('');
    setCreating(false);
    onOpenRoom?.(room.id);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chatrooms..."
            className="flex-1 bg-transparent outline-none text-sm dark:text-gray-200"
          />
        </div>
        <button
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          onClick={() => setCreating((s) => !s)}
        >
          {creating ? '×' : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* New chatroom form */}
      {creating && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-inner">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chat title"
            className="w-full p-2 border rounded-lg mb-2 bg-white dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-2">
            <button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              onClick={create}
            >
              Create
            </button>
            <button
              className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 rounded-lg transition"
              onClick={() => {
                setCreating(false);
                setTitle('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chatrooms list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            No chatrooms yet
          </div>
        )}
        {filtered.map((r) => (
          <div
            key={r.id}
            onClick={() => {
              setActive(r.id);
              onOpenRoom?.(r.id);
            }}
            className={`p-3 rounded-lg shadow-sm flex items-center justify-between cursor-pointer transition ${
              activeRoomId === r.id
                ? 'bg-blue-50 dark:bg-gray-700 border border-blue-300'
                : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-200">
                {r.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition"
              onClick={(e) => {
                e.stopPropagation();
                deleteRoom(r.id);
                push('Chatroom deleted');
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
