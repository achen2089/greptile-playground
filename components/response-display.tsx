import React from 'react';
import { Clock } from 'lucide-react';
import { ResponseDisplayProps } from '@/types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function ResponseDisplay({ item }: ResponseDisplayProps) {
  
  const response = item.error ? { error: item.error } : JSON.parse(item.response);

  return (
    <div className="border rounded p-4">
      {item.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{item.error}</span>
        </div>
      ) : (
        <div>
          <h4 className="text-md font-semibold mb-1">Response:</h4>
          <div className="bg-gray-100 rounded overflow-hidden">
            <SyntaxHighlighter language="json" style={docco} customStyle={{padding: '1rem'}}>
              {JSON.stringify(response, null, 2)}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Timestamp: {item.timestamp.toLocaleString()}
      </p>
    </div>
  );
}