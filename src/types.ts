export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Project {
  language: string;
  files: ProjectFile[];
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
}