declare module '*.css';
declare module '*.scss';
declare module '*.module.css';
declare module '*.module.scss';
declare module '*.svg';

// Minimal ambient types for cross-bundler compatibility
// (without requiring full @types/node in browser-targeted library)
declare const process: { env: Record<string, string | undefined> } | undefined;
