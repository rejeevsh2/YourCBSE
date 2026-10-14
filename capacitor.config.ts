import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.co.yourschool.app",
  appName: "YourSchool",
  webDir: "dist-android/client",
  server: { androidScheme: "https" },
  android: { allowMixedContent: false },
  plugins: {
    // Use the existing Laravel bearer-token APIs from the native app. This
    // patches fetch/XHR on the phone, without changing the website's CORS policy.
    CapacitorHttp: { enabled: true },
  },
};

export default config;
