import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, BarChart, Search, Loader } from 'lucide-react';
import { PlaygroundFormProps, FormErrors, PlaygroundAction, HistoryItem } from '@/types';
import { submitRepositoryForIndexing, checkRepositoryIndexingProgress, queryRepository } from '@/lib/greptile';

export default function PlaygroundForm({
  selectedItem,
  onSubmit,
  action,
  setAction,
}: PlaygroundFormProps) {
  const [repository, setRepository] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [greptileApiKey, setGreptileApiKey] = useState('');
  const [githubAccessToken, setGithubAccessToken] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (selectedItem) {
      setRepository(selectedItem.request.split(': ')[0]);
      if (selectedItem.action === 'query') {
        setQuery(selectedItem.request.split(': ')[1]);
      }
    }
  }, [selectedItem]);

  const validateInputs = (): boolean => {
    const newErrors: FormErrors = {};

    if (!repository) newErrors.repository = 'Repository is required';
    if (action === 'query' && !query) newErrors.query = 'Query is required';
    if (!greptileApiKey) newErrors.greptileApiKey = 'Greptile API Key is required';
    if (!githubAccessToken) newErrors.githubAccessToken = 'GitHub Access Token is required';

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

      const newItem: Omit<HistoryItem, 'id' | 'timestamp'> = {
        action,
        request: action === 'query' ? `${repository}: ${query}` : repository,
        response: JSON.stringify(response, null, 2),
      };

      onSubmit(newItem);
    } catch (error) {
      console.error('Error:', error);
      const newItem: Omit<HistoryItem, 'id' | 'timestamp'> = {
        action,
        request: action === 'query' ? `${repository}: ${query}` : repository,
        response: '',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
      onSubmit(newItem);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (actionType: PlaygroundAction) => {
    switch (actionType) {
      case 'index':
        return 'bg-green-500 hover:bg-green-600';
      case 'progress':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'query':
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const handleActionChange = (newAction: PlaygroundAction) => {
    setAction(newAction);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex space-x-2 mb-6">
        <Button
          type="button"
          onClick={() => handleActionChange('index')}
          className={`flex-1 ${action === 'index' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 hover:bg-green-600'}`}
        >
          <GitBranch className="w-4 h-4 mr-2" />
          Index
        </Button>
        <Button
          type="button"
          onClick={() => handleActionChange('progress')}
          className={`flex-1 ${action === 'progress' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300  hover:bg-yellow-600'}`}
        >
          <BarChart className="w-4 h-4 mr-2" />
          Progress
        </Button>
        <Button
          type="button"
          onClick={() => handleActionChange('query')}
          className={`flex-1 ${action === 'query' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-blue-600'}`}
        >
          <Search className="w-4 h-4 mr-2" />
          Query
        </Button>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Repository:</label>
        <input
          type="text"
          value={repository}
          onChange={(e) => setRepository(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="owner/repo"
        />
        {errors.repository && <p className="text-red-500">{errors.repository}</p>}
      </div>
      {action === 'query' && (
        <div className="mb-4">
          <label className="block mb-2">Query:</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Enter your query here"
          />
          {errors.query && <p className="text-red-500">{errors.query}</p>}
        </div>
      )}
      <div className="mb-4">
        <label className="block mb-2">Greptile API Key:</label>
        <input
          value={greptileApiKey}
          onChange={(e) => setGreptileApiKey(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {errors.greptileApiKey && <p className="text-red-500">{errors.greptileApiKey}</p>}
      </div>
      <div className="mb-4">
        <label className="block mb-2">GitHub Access Token:</label>
        <input
          value={githubAccessToken}
          onChange={(e) => setGithubAccessToken(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {errors.githubAccessToken && <p className="text-red-500">{errors.githubAccessToken}</p>}
      </div>
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
  );
}
