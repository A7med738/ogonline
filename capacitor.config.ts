import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3e2213cabd164ff28f6945d0069c6783',
  appName: 'ogonline',
  webDir: 'dist',
  server: {
    url: 'https://3e2213ca-bd16-4ff2-8f69-45d0069c6783.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true,
    appendUserAgent: 'ogonline-app',
    webContentsDebuggingEnabled: true
  },
  ios: {
    allowsLinkPreview: false,
    scrollEnabled: true
  },
  // Deep Link configuration
  app: {
    customUrlScheme: 'ogonline'
  }
};

export default config;