'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { submitRepositoryForIndexing, checkRepositoryIndexingProgress, queryRepository } from '@/lib/greptile';
import { GitBranch, BarChart, Search, PlusCircle, Trash2, Clock, Loader } from 'lucide-react';

interface HistoryItem {
  id: number;
  action: 'index' | 'progress' | 'query';
  request: string;
  response: string;
  error?: string;
  timestamp: Date;
}

export default function PlaygroundComponent() {
  const [repository, setRepository] = useState('');
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<'index' | 'progress' | 'query'>('index');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [greptileApiKey, setGreptileApiKey] = useState('');
  const [githubAccessToken, setGithubAccessToken] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateInputs = () => {
    const newErrors: {[key: string]: string} = {};

    if (!greptileApiKey.trim()) {
      newErrors.greptileApiKey = 'Greptile API Key is required';
    }

    if (!githubAccessToken.trim()) {
      newErrors.githubAccessToken = 'GitHub Access Token is required';
    }

    if (!repository.trim()) {
      newErrors.repository = 'Repository is required';
    } else if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository.trim())) {
      newErrors.repository = 'Invalid repository format. Use username/repo';
    }

    if (action === 'query' && !query.trim()) {
      newErrors.query = 'Query is required for query action';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      let response;

      switch (action) {
        case 'index':
          response = await submitRepositoryForIndexing(repository, 'github', 'main', greptileApiKey, githubAccessToken);
          break;
        case 'progress':
          response = await checkRepositoryIndexingProgress(repository, 'github', 'main', greptileApiKey, githubAccessToken);
          break;
        case 'query':
          response = await queryRepository(repository, query, 'github', 'main', greptileApiKey, githubAccessToken);
          break;
      }

      const newItem: HistoryItem = {
        id: Date.now(),
        action,
        request: action === 'query' ? `${repository}: ${query}` : repository,
        response: JSON.stringify(response, null, 2),
        timestamp: new Date()
      };

      setHistory([newItem, ...history]);
      setSelectedItem(newItem);
    } catch (error) {
      console.error('Error:', error);
      const newItem: HistoryItem = {
        id: Date.now(),
        action,
        request: action === 'query' ? `${repository}: ${query}` : repository,
        response: '',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      };
      setHistory([newItem, ...history]);
      setSelectedItem(newItem);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item: HistoryItem) => {
    setSelectedItem(item);
    setRepository(item.action === 'query' ? item.request.split(':')[0].trim() : item.request);
    if (item.action === 'query') {
      setQuery(item.request.split(':')[1].trim());
    }
    setAction(item.action);
  };

  const getActionColor = (action: 'index' | 'progress' | 'query') => {
    switch (action) {
      case 'index':
        return 'bg-green-500';
      case 'progress':
        return 'bg-yellow-500';
      case 'query':
        return 'bg-blue-500';
    }
  };

  const handleNewRequest = () => {
    setSelectedItem(null);
    setRepository('');
    setQuery('');
    setAction('index');
    setErrors({});
  };

  const handleActionChange = (newAction: 'index' | 'progress' | 'query') => {
    setAction(newAction);
    setErrors({});
  };

  const handleDeleteHistoryItem = (id: number) => {
    setHistory(history.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="flex h-screen">
      {/* History Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">History</h2>
          <Button onClick={handleNewRequest} className="bg-blue-500 text-white">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
        {history.map((item) => (
          <div
            key={item.id}
            className={`mb-2 p-2 rounded cursor-pointer ${
              selectedItem?.id === item.id ? 'bg-blue-200' : 'bg-white'
            }`}
          >
            <div 
                className="flex justify-between items-center" 
                onClick={() => handleHistoryItemClick(item)}
            >
              <div className={`${getActionColor(item.action)} text-white text-xs font-bold px-2 py-1 rounded-full mb-1 inline-block flex items-center`}>
                {item.action === 'index' && <GitBranch className="w-3 h-3 mr-1" />}
                {item.action === 'progress' && <BarChart className="w-3 h-3 mr-1" />}
                {item.action === 'query' && <Search className="w-3 h-3 mr-1" />}
                {item.action.toUpperCase()}
              </div>
              <Trash2
                className="w-4 h-4 text-gray-500 hover:text-red-500 cursor-pointer transition-colors duration-200"
                onClick={() => handleDeleteHistoryItem(item.id)}
              />
            </div>
            <p className="truncate" onClick={() => handleHistoryItemClick(item)}>{item.request}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {item.timestamp.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Main Playground Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-2 mb-6">
            <Button
              type="button"
              onClick={() => handleActionChange('index')}
              className={`flex-1 ${action === 'index' ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Index
            </Button>
            <Button
              type="button"
              onClick={() => handleActionChange('progress')}
              className={`flex-1 ${action === 'progress' ? 'bg-yellow-500' : 'bg-gray-300'}`}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Progress
            </Button>
            <Button
              type="button"
              onClick={() => handleActionChange('query')}
              className={`flex-1 ${action === 'query' ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <Search className="w-4 h-4 mr-2" />
              Query
            </Button>
          </div>
          <h3 className="text-lg font-semibold mb-4">Request Details</h3>
          <div className="mb-4">
            <input
              type="text"
              value={greptileApiKey}
              onChange={(e) => setGreptileApiKey(e.target.value)}
              className={`w-full p-2 border rounded ${errors.greptileApiKey ? 'border-red-500' : ''}`}
              placeholder="Enter Greptile API Key"
            />
            {errors.greptileApiKey && <p className="text-red-500 text-sm mt-1">{errors.greptileApiKey}</p>}
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={githubAccessToken}
              onChange={(e) => setGithubAccessToken(e.target.value)}
              className={`w-full p-2 border rounded ${errors.githubAccessToken ? 'border-red-500' : ''}`}
              placeholder="Enter GitHub Access Token"
            />
            {errors.githubAccessToken && <p className="text-red-500 text-sm mt-1">{errors.githubAccessToken}</p>}
          </div>
          <div className="mb-4">
            <input
              type="text"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              className={`w-full p-2 border rounded ${errors.repository ? 'border-red-500' : ''}`}
              placeholder="Enter repository (e.g., username/repo)"
            />
            {errors.repository && <p className="text-red-500 text-sm mt-1">{errors.repository}</p>}
          </div>
          {action === 'query' && (
            <div className="mb-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full p-2 border rounded ${errors.query ? 'border-red-500' : ''}`}
                rows={5}
                placeholder="Enter query"
              />
              {errors.query && <p className="text-red-500 text-sm mt-1">{errors.query}</p>}
            </div>
          )}
          <Button type="submit" disabled={isLoading} className={getActionColor(action)}>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {action === 'index' && <GitBranch className="w-4 h-4 mr-2" />}
                {action === 'progress' && <BarChart className="w-4 h-4 mr-2" />}
                {action === 'query' && <Search className="w-4 h-4 mr-2" />}
                {`Send ${action.charAt(0).toUpperCase() + action.slice(1)} Request`}
              </>
            )}
          </Button>
        </form>

        {selectedItem && selectedItem.action === action && (
          <div className="border rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Response</h3>
            {selectedItem.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{selectedItem.error}</span>
              </div>
            ) : (
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{selectedItem.response}</pre>
            )}
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Timestamp: {selectedItem.timestamp.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}