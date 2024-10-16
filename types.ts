// Define the possible actions for the playground
export type PlaygroundAction = 'index' | 'progress' | 'query';

// Define the structure of a history item
export interface HistoryItem {
  id: number;
  action: PlaygroundAction;
  request: string;
  response: string;
  error?: string;
  timestamp: Date;
}

// Define the structure for form input errors
export interface FormErrors {
  repository?: string;
  query?: string;
  greptileApiKey?: string;
  githubAccessToken?: string;
}

// Define the props for the HistorySidebar component
export interface HistorySidebarProps {
  history: HistoryItem[];
  selectedItem: HistoryItem | null;
  onItemClick: (item: HistoryItem) => void;
  onDeleteItem: (id: number) => void;
  onNewRequest: () => void;
}

// Define the props for the PlaygroundForm component
export interface PlaygroundFormProps {
  selectedItem: HistoryItem | null;
  onSubmit: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  action: PlaygroundAction;
  setAction: (action: PlaygroundAction) => void;
  isNewRequest: boolean;
}

// Define the props for the ResponseDisplay component
export interface ResponseDisplayProps {
  item: HistoryItem;
}