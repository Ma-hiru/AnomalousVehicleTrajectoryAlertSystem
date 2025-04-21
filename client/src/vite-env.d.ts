/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_URL: string;
  readonly VITE_WS: string;
  readonly VITE_BASE: string;
  readonly VITE_TITLE: string;
  readonly VITE_MAP_SECURITY_CODE: string;
  readonly VITE_MAP_KEY: string;
  readonly VITE_WEATHER_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
