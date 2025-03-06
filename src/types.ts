export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Project {
  language: string;
  files: ProjectFile[];
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  lastModified: number;
}

export interface UserData {
  name: string;
  conversations: {
    id: string;
    messages: Message[];
    timestamp: number;
  }[];
  savedCodes: {
    id: string;
    language: string;
    code: string;
    timestamp: number;
  }[];
}