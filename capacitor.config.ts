import type { CapacitorConfig } from '@capacitor/cli';

const devUrl = process.env.CAP_DEV_URL;

const config: CapacitorConfig = {
  appId: 'com.myesathi.app',
  appName: 'MyESathi',
  webDir: 'out',
  server: {
    // Point to your deployed web app for production.
    // For local dev with Android emulator use http://10.0.2.2:3001
    // url: 'https://your-deployed-app.com',
    cleartext: true,
    ...(devUrl ? { url: devUrl } : {}),
  },
  plugins: {
    // 'native' shrinks the whole WebView above the keyboard (iOS + Android), so
    // fixed/bottom-anchored UI always sits directly on top of the keyboard.
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
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
