import React from 'react';
import { Clock } from 'lucide-react';
import { ResponseDisplayProps } from '@/types';

export default function ResponseDisplay({ item }: ResponseDisplayProps) {
  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Response</h3>
      {item.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{item.error}</span>
        </div>
      ) : (
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{item.response}</pre>
      )}
      <p className="text-xs text-gray-500 mt-2 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Timestamp: {item.timestamp.toLocaleString()}
      </p>
    </div>
  );
}