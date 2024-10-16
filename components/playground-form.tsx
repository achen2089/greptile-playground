import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GitBranch, BarChart, Search, Loader, ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react';
import { PlaygroundFormProps, FormErrors, PlaygroundAction, HistoryItem } from '@/types';
import { submitRepositoryForIndexing, checkRepositoryIndexingProgress, queryRepository } from '@/lib/greptile';

export default function PlaygroundForm({
  selectedItem,
  onSubmit,
  action,
  setAction,
  isNewRequest,
}: PlaygroundFormProps) {
  const [repository, setRepository] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [greptileApiKey, setGreptileApiKey] = useState('');
  const [githubAccessToken, setGithubAccessToken] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAuth, setShowAuth] = useState(false);
  const [showBasics, setShowBasics] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [remote, setRemote] = useState('');
  const [branch, setBranch] = useState('');
  const [reload, setReload] = useState(false);
  const [notify, setNotify] = useState(false);
  const [messages, setMessages] = useState<{id: string, content: string, role: string}[]>([]);
  const [repositories, setRepositories] = useState<{remote: string, repository: string, branch: string}[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [stream, setStream] = useState(false);
  const [genius, setGenius] = useState(false);

  useEffect(() => {
    if (isNewRequest) {
      setRepository('');
      setQuery('');
      setErrors({});
      setRemote('');
      setBranch('');
      setReload(false);
      setNotify(false);
      setMessages([]);
      setRepositories([]);
      setSessionId('');
      setStream(false);
      setGenius(false);
    } else if (selectedItem) {
      setRepository(selectedItem.request.split(': ')[0]);
      if (selectedItem.action === 'query') {
        setQuery(selectedItem.request.split(': ')[1]);
      } else {
        setQuery('');
      }
    }
  }, [selectedItem, isNewRequest]);

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
          response = await submitRepositoryForIndexing(repository, remote, branch, greptileApiKey, githubAccessToken, reload, notify);
          break;
        case 'progress':
          response = await checkRepositoryIndexingProgress(repository, remote, branch, greptileApiKey, githubAccessToken);
          break;
        case 'query':
          response = await queryRepository(repository, query, remote, branch, greptileApiKey, githubAccessToken, {
            messages,
            repositories,
            sessionId,
            stream,
            genius
          });
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

  const addMessage = () => {
    setMessages([...messages, { id: Date.now().toString(), content: '', role: 'user' }]);
  };

  const updateMessage = (index: number, field: string, value: string) => {
    const newMessages = [...messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    setMessages(newMessages);
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const addRepository = () => {
    setRepositories([...repositories, { remote: '', repository: '', branch: '' }]);
  };

  const updateRepository = (index: number, field: string, value: string) => {
    const newRepositories = [...repositories];
    newRepositories[index] = { ...newRepositories[index], [field]: value };
    setRepositories(newRepositories);
  };

  const removeRepository = (index: number) => {
    setRepositories(repositories.filter((_, i) => i !== index));
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
        <p className="text-sm text-gray-600">
          {action === 'index' && "Indexing a repository allows Greptile to analyze and prepare the codebase for efficient querying."}
          {action === 'progress' && "Checking indexing progress lets you know the current status of the indexing process for a repository."}
          {action === 'query' && "Querying allows you to ask questions about the indexed codebase and receive relevant information."}
        </p>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center cursor-pointer" onClick={() => setShowAuth(!showAuth)}>
          Authorization {showAuth ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </h3>
        {showAuth && (
          <div className="mt-2 p-4 border rounded">
            <div className="mb-4">
              <label className="block mb-2"><strong>Greptile API Key:</strong></label>
              <p className="text-sm text-gray-600 mb-2">Click <a href="https://app.greptile.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">here</a> to get your Greptile key. You will need to log in via GitHub or Microsoft.</p>
              <input
                value={greptileApiKey}
                onChange={(e) => setGreptileApiKey(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.greptileApiKey && <p className="text-red-500">{errors.greptileApiKey}</p>}
            </div>
            <div className="mb-4">
              <label className="block mb-2"><strong>GitHub Access Token:</strong></label>
              <p className="text-sm text-gray-600 mb-2">Click <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">here</a> to get your GitHub access token.</p>
              <input
                value={githubAccessToken}
                onChange={(e) => setGithubAccessToken(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {errors.githubAccessToken && <p className="text-red-500">{errors.githubAccessToken}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center cursor-pointer" onClick={() => setShowBasics(!showBasics)}>
          Basics {showBasics ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </h3>
        {showBasics && (
          <div className="mt-2 p-4 border rounded">
            <div className="mb-4">
              <label className="block mb-2"><strong>Repository:</strong></label>
              <p className="text-sm text-gray-600 mb-2">Repository identifier in &quot;owner/repository&quot; format.</p>
              <input
                type="text"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="owner/repository name"
              />
              {errors.repository && <p className="text-red-500">{errors.repository}</p>}
            </div>
            {action === 'query' && (
              <div className="mb-4">
                <label className="block mb-2"><strong>Query:</strong></label>
                <p className="text-sm text-gray-600 mb-2">Enter your query here. Be specific and include any relevant context.</p>
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
          </div>
        )}
      </div>
      {action === 'index' && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
            Advanced {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </h3>
          {showAdvanced && (
            <div className="mt-2 p-4 border rounded">
              <div className="mb-4">
                <label className="block mb-2"><strong>Remote:</strong></label>
                <p className="text-sm text-gray-600 mb-2">
                  Supported values are &quot;github&quot; or &quot;gitlab&quot;.
                </p>
                <input
                  type="text"
                  value={remote}
                  onChange={(e) => setRemote(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="github"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2"><strong>Branch:</strong></label>
                <p className="text-sm text-gray-600 mb-2">Branch name. Optional, defaults to repository&apos;s default branch.</p>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="main"
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">If false, won&apos;t reprocess if previously successful. Optional, default true.</p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reload}
                    onChange={(e) => setReload(e.target.checked)}
                    className="mr-2"
                  />
                  <strong>Reload</strong>
                </label>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">If true, will notify you when indexing is complete. Optional, default false.</p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="mr-2"
                  />
                  <strong>Notify</strong>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
      {action === 'query' && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
            Advanced {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </h3>
          {showAdvanced && (
            <div className="mt-2 p-4 border rounded">
              <div className="mb-4">
                <label className="block mb-2"><strong>Messages:</strong></label>
                <p className="text-sm text-gray-600 mb-2">List of chat messages until now. For a single query, include only one entry in the list with a natural language query.</p>
                {messages.map((message, index) => (
                  <div key={message.id} className="mb-2 p-2 border rounded">
                    <input
                      type="text"
                      value={message.id}
                      onChange={(e) => updateMessage(index, 'id', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Message ID"
                    />
                    <textarea
                      value={message.content}
                      onChange={(e) => updateMessage(index, 'content', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      rows={2}
                      placeholder="Message content"
                    />
                    <select
                      value={message.role}
                      onChange={(e) => updateMessage(index, 'role', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    >
                      <option value="user">User</option>
                      <option value="assistant">Assistant</option>
                      <option value="system">System</option>
                    </select>
                    <Button type="button" onClick={() => removeMessage(index)} className="bg-red-500 hover:bg-red-600">
                      <Trash className="w-4 h-4 mr-2" />
                      Remove Message
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addMessage} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Message
                </Button>
              </div>
              <div className="mb-4">
                <label className="block mb-2"><strong>Repositories:</strong></label>
                <p className="text-sm text-gray-600 mb-2">List of repos that Greptile should reference while answering your question.</p>
                {repositories.map((repo, index) => (
                  <div key={index} className="mb-2 p-2 border rounded">
                    <input
                      type="text"
                      value={repo.remote}
                      onChange={(e) => updateRepository(index, 'remote', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Remote"
                    />
                    <input
                      type="text"
                      value={repo.repository}
                      onChange={(e) => updateRepository(index, 'repository', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Repository"
                    />
                    <input
                      type="text"
                      value={repo.branch}
                      onChange={(e) => updateRepository(index, 'branch', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Branch"
                    />
                    <Button type="button" onClick={() => removeRepository(index)} className="bg-red-500 hover:bg-red-600">
                      <Trash className="w-4 h-4 mr-2" />
                      Remove Repository
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addRepository} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Repository
                </Button>
              </div>
              <div className="mb-4">
                <label className="block mb-2"><strong>Session ID:</strong></label>
                <p className="text-sm text-gray-600 mb-2">Optional, defaults to a new session. Only use this if you intend to need to retrieve chat history later.</p>
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter session ID"
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Optional, default false.</p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={stream}
                    onChange={(e) => setStream(e.target.checked)}
                    className="mr-2"
                  />
                  Stream
                </label>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Optional, default false. Genius requests are smarter but 8-10 seconds slower, great for complex usecases like reviewing PR and updating technical docs.</p>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={genius}
                    onChange={(e) => setGenius(e.target.checked)}
                    className="mr-2"
                  />
                  Genius
                </label>
              </div>
            </div>
          )}
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
  );
}
