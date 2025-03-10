export const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
export const API_KEY = "AIzaSyCXZu1FqQ04yzMzRCRk78nzUtEtGkWp7zc";

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c++',
  'go',
  'rust',
  'php'
];

export const DEFAULT_PROJECT_STRUCTURE: Record<string, string[]> = {
  javascript: ['src/', 'public/', 'package.json', 'README.md'],
  typescript: ['src/', 'public/', 'tsconfig.json', 'package.json', 'README.md'],
  python: ['src/', 'tests/', 'requirements.txt', 'README.md'],
  java: ['src/main/java/', 'src/test/java/', 'pom.xml', 'README.md'],
  'c++': ['src/', 'include/', 'CMakeLists.txt', 'README.md'],
  go: ['cmd/', 'internal/', 'pkg/', 'go.mod', 'README.md'],
  rust: ['src/', 'Cargo.toml', 'README.md'],
  php: ['src/', 'composer.json', 'README.md']
};

// Funções do Bolt
export const boltFunctions = {
  async getDeploymentStatus(id: string) {
    try {
      const response = await fetch(`/api/deploy/status?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to get deployment status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting deployment status:', error);
      return null;
    }
  },

  async deploy(provider: string, buildCommand: string, outputDir: string) {
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          buildCommand,
          outputDir,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to deploy');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deploying:', error);
      return null;
    }
  },

  async executeCommand(command: string) {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute command');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing command:', error);
      return null;
    }
  }
};

// Hook para usar as funções do Bolt
export function useBolt() {
  return {
    ...boltFunctions,
    isDeploying: false, // Você pode expandir isso para gerenciar o estado
    deployError: null,
  };
}