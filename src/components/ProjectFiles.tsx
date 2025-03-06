import React from 'react';
import { Folder, File, ChevronRight } from 'lucide-react';

interface ProjectFile {
  name: string;
  content: string;
}

interface ProjectFilesProps {
  files: ProjectFile[];
  onFileClick: (file: ProjectFile) => void;
}

export default function ProjectFiles({ files, onFileClick }: ProjectFilesProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Folder className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold">Arquivos do Projeto</h2>
      </div>
      
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum arquivo salvo ainda
          </p>
        ) : (
          files.map((file, index) => (
            <button
              key={index}
              onClick={() => onFileClick(file)}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <File className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-left text-sm text-gray-700">{file.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}