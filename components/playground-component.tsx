'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface HistoryItem {
  id: number;
  request: string;
  response: string;
  timestamp: Date;
}

export default function PlaygroundComponent() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call
    // For this example, we'll just echo the input
    const response = `Response for: ${input}`;
    const newItem = { id: Date.now(), request: input, response, timestamp: new Date() };
    setHistory([newItem, ...history]);
    setSelectedItem(newItem);
    setInput('');
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedItem(item);
    setInput(item.request);
  };

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* History Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        {history.map((item) => (
          <div
            key={item.id}
            className={`mb-2 p-2 rounded cursor-pointer ${
              selectedItem?.id === item.id ? 'bg-blue-200' : 'bg-white'
            }`}
            onClick={() => handleHistoryItemClick(item)}
          >
            <p className="truncate">{item.request}</p>
            <p className="text-xs text-gray-500">{item.timestamp.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Main Playground Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            rows={5}
            placeholder="Enter API request"
          />
          <Button type="submit">Send</Button>
        </form>

        {selectedItem && (
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            <pre className="bg-gray-100 p-2 rounded">{selectedItem.response}</pre>
            <p className="text-xs text-gray-500 mt-2">Timestamp: {selectedItem.timestamp.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}