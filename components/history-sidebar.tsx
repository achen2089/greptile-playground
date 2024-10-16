import React from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, BarChart, Search, PlusCircle, Trash2, Clock } from 'lucide-react';
import { HistorySidebarProps, PlaygroundAction } from '@/types';

export default function HistorySidebar({
  history,
  selectedItem,
  onItemClick,
  onDeleteItem,
  onNewRequest
}: HistorySidebarProps) {
  const getActionColor = (action: PlaygroundAction) => {
    switch (action) {
      case 'index': return 'bg-green-500 hover:bg-green-600';
      case 'progress': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'query': return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">History</h2>
        <Button onClick={onNewRequest} className="bg-blue-500 text-white">
          <PlusCircle className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item)}
          className={`mb-2 p-2 rounded cursor-pointer ${
            selectedItem?.id === item.id ? 'bg-blue-200' : 'bg-white'
          }`}
        >
          <div className="flex justify-between items-center" >
            <div className={`${getActionColor(item.action)} text-white text-xs font-bold px-2 py-1 rounded-full mb-1 inline-block flex items-center`}>
              {item.action === 'index' && <GitBranch className="w-3 h-3 mr-1" />}
              {item.action === 'progress' && <BarChart className="w-3 h-3 mr-1" />}
              {item.action === 'query' && <Search className="w-3 h-3 mr-1" />}
              {item.action.toUpperCase()}
            </div>
            <Trash2
              className="w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
            />
          </div>
          <p className="truncate">{item.request}</p>
          <p className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {item.timestamp.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}