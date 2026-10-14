import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myesathi.app',
  appName: 'MyESathi',
  webDir: 'out',
  server: {
    // Point to your deployed web app for production.
    // For local dev with Android emulator use http://10.0.2.2:3001
    // url: 'https://your-deployed-app.com',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
};

export default config;
