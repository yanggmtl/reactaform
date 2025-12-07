// Type declarations for non-TS assets imported in the app (picked up by TypeScript via `include: ["src"]`)

declare module '*.css';
declare module '*.scss';
declare module '*.sass';

declare module '*.svg';
declare module '*.png';
declare module '*.jpeg';
declare module '*.gif';

// Vite-specific import query types and runtime env
declare module '*?raw';
declare module '*.css?raw';

interface ImportMetaEnv {
	readonly BASE_URL?: string;
	// add other env vars here if you use them
	readonly [key: string]: unknown;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
