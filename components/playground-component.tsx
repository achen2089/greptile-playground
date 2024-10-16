'use client'

import React, { useState } from 'react';
import HistorySidebar from '@/components/history-sidebar';
import PlaygroundForm from '@/components/playground-form';
import ResponseDisplay from '@/components/response-display';
import { HistoryItem, PlaygroundAction } from '@/types';

export default function PlaygroundComponent() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [action, setAction] = useState<PlaygroundAction>('index');
  const [lastResponses, setLastResponses] = useState<{[key in PlaygroundAction]?: HistoryItem}>({});
  const [isNewRequest, setIsNewRequest] = useState(true);

  const handleSubmit = (newItem: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const item: HistoryItem = {
      ...newItem,
      id: Date.now(),
      timestamp: new Date()
    };
    setHistory([item, ...history]);
    setSelectedItem(item);
    setAction(item.action);
    setLastResponses(prev => ({...prev, [item.action]: item}));
    setIsNewRequest(false);
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedItem(item);
    setAction(item.action);
    setLastResponses(prev => ({...prev, [item.action]: item}));
    setIsNewRequest(false);
  };

  const handleDeleteHistoryItem = (id: number) => {
    setHistory(history.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleNewRequest = () => {
    setSelectedItem(null);
    setAction('index');
    setLastResponses({});
    setIsNewRequest(true);
  };

  const handleActionChange = (newAction: PlaygroundAction) => {
    setAction(newAction);
    setSelectedItem(lastResponses[newAction] || null);
    setIsNewRequest(!lastResponses[newAction]);
  };

  return (
    <div className="flex h-screen">
      <HistorySidebar
        history={history}
        selectedItem={selectedItem}
        onItemClick={handleHistoryItemClick}
        onDeleteItem={handleDeleteHistoryItem}
        onNewRequest={handleNewRequest}
      />
      <div className="flex-1 p-4 overflow-y-auto">
        <PlaygroundForm
          selectedItem={selectedItem}
          onSubmit={handleSubmit}
          action={action}
          setAction={handleActionChange}
          isNewRequest={isNewRequest}
        />
        {selectedItem && !isNewRequest && <ResponseDisplay item={selectedItem} />}
      </div>
    </div>
  );
}
