
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  query: string;
  status: 'Success' | 'Warning' | 'Error';
}
