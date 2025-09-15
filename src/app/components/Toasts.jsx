'use client';

import React from 'react';

/**
 * items: [{ id, text }]
 * This component is purely presentational. Toast lifecycle (auto-remove) handled by parent.
 */
export default function Toasts({ items = [] }) {
  return (
    <div className="fixed right-4 bottom-6 space-y-2 z-50">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className="bg-black text-white px-3 py-2 rounded shadow"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
