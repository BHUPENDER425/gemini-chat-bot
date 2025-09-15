'use client';

import React, { useRef, useState } from 'react';
import { Paperclip, Send, Image as ImageIcon } from 'lucide-react'; // icons

/**
 * Props:
 * - onSend(text, imageFile | null)  -> called when user sends a message or image
 * - onTyping(optional) -> (optional) called while user typing (not required)
 */
export default function ComposeBar({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const fileRef = useRef();

  // Submit text message
  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, null);
    setText('');
  };

  // When user picks an image file
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onSend('', f);
    fileRef.current.value = ""; // ✅ fix: reset with empty string
  };

  return (
    <div className="p-3 border-t bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        {/* hidden file input for image upload */}
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          className="hidden"
          onChange={handleFile}
        />

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          aria-label="Upload image"
        >
          <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Input field */}
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (onTyping) onTyping(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Message input"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition text-white"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
