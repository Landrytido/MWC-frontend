/// <reference types="vite/client" />
declare global {
  interface Window {
    ENV?: {
      API_URL?: string;
      CLERK_PUBLISHABLE_KEY?: string;
      [key: string]: string | undefined;
    };
  }
}

export {};
