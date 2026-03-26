import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteObfuscateFile } from 'vite-plugin-obfuscator';

export default defineConfig({
  plugins: [
    react(),
    viteObfuscateFile({
      include: ["src/**/*.tsx", "src/**/*.ts", "은퇴계산기.tsx", "은퇴계산기Modal.tsx"],
      apply: "build",
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        stringArrayThreshold: 0.5,
        renameGlobals: false,
        selfDefending: true,
        debugProtection: true,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,
      },
    }),
  ],
  server: {
    port: 3001,
    open: true,
  },
});
