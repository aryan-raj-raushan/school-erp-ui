import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myesathi.app',
  appName: 'School ERP',
  webDir: 'out',
  server: {
    // Point to your deployed web app for production.
    // For local dev with Android emulator use http://10.0.2.2:3001
    // url: 'https://your-deployed-app.com',
    cleartext: true,
  },
};

export default config;
