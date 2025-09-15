'use client';

import React, { useEffect, useRef, useState } from 'react';
import useStore from '../store/useStore';
import { uid, nowISO } from '../utils/helpers';
import ComposeBar from './ComposeBar';

export default function Chatroom({ roomId, push }) {
  const { chatrooms, addMessage } = useStore();
  const room = chatrooms.find((r) => r.id === roomId);

  const [loadingOlder, setLoadingOlder] = useState(false);
  const [page, setPage] = useState(1);
  const [typing, setTyping] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const bottomRef = useRef(null);
  const messages = room?.messages.slice(-page * 20) || [];

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = (e) => {
    const el = e.target;
    const isAtBottom =
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 5;
    setAutoScroll(isAtBottom);
  };

  const handleSend = async (text, image) => {
    if (!text && !image) return;

    const userMsg = {
      id: uid('msg'),
      sender: 'user',
      text,
      image,
      createdAt: nowISO(),
    };
    addMessage(roomId, userMsg);
    push('Message sent');

    if (text) {
      setTyping(true);
      try {
        const res = await fetch('/api/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
        const data = await res.json();

        const aiMsg = {
          id: uid('msg'),
          sender: 'ai',
          text: data.reply || 'Bot did not respond',
          createdAt: nowISO(),
        };
        addMessage(roomId, aiMsg);
        push('AI replied');
      } catch (err) {
        const aiMsg = {
          id: uid('msg'),
          sender: 'ai',
          text: 'Bot error, try again',
          createdAt: nowISO(),
        };
        addMessage(roomId, aiMsg);
      } finally {
        setTyping(false);
      }
    } else if (image) {
      const aiMsg = {
        id: uid('msg'),
        sender: 'ai',
        text: 'Nice image!',
        createdAt: nowISO(),
      };
      addMessage(roomId, aiMsg);
    }
  };

  const loadOlder = () => {
    setLoadingOlder(true);
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingOlder(false);
      push('Loaded older messages');
    }, 800);
  };

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a chatroom to start chatting 💬
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="p-4 border-b  bg-blue-600 text-white font-semibold shadow">
        {room.title}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        <div className="text-center">
          <button
            className="px-3 py-1 text-xs rounded-full bg-gray-300 dark:bg-gray-700 hover:opacity-80"
            onClick={loadOlder}
          >
            {loadingOlder ? 'Loading...' : 'Load older'}
          </button>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-2xl shadow text-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'
              }`}
            >
              {msg.text && <div>{msg.text}</div>}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="mt-2 max-h-40 rounded-xl shadow-sm"
                />
              )}
              <div className="text-[10px] opacity-70 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-2xl text-sm flex space-x-1 items-center">
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-200"></span>
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce delay-400"></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Compose bar */}
      <div className="border-t bg-white dark:bg-gray-900">
        <ComposeBar onSend={handleSend} />
      </div>
    </div>
  );
}
