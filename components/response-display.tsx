import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ResponseDisplayProps } from '@/types';

export default function ResponseDisplay({ item }: ResponseDisplayProps) {
  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status >= 400 && status < 500) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (status >= 500) return <XCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-700 bg-green-100';
    if (status >= 400 && status < 500) return 'text-yellow-700 bg-yellow-100';
    if (status >= 500) return 'text-red-700 bg-red-100';
    return 'text-gray-700 bg-gray-100';
  };

  const response = item.error ? { error: item.error } : JSON.parse(item.response);
  const status = response.status || (item.error ? 500 : 200);

  return (
    <div className="border rounded p-4">
      <div className={`flex items-center justify-between mb-4 p-2 rounded ${getStatusColor(status)}`}>
        <h3 className="text-lg font-semibold">Response</h3>
        <div className="flex items-center">
          {getStatusIcon(status)}
          <span className="ml-2 font-semibold">Status: {status}</span>
        </div>
      </div>
      {item.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{item.error}</span>
        </div>
      ) : (
        <div>
          <h4 className="text-md font-semibold mb-1">Response:</h4>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            <code className="language-json">{JSON.stringify(response, null, 2)}</code>
          </pre>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-2 flex items-center">
        <Clock className="w-3 h-3 mr-1" />
        Timestamp: {item.timestamp.toLocaleString()}
      </p>
    </div>
  );
}