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