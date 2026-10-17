import { resolve } from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Android has its own output and environment directory. In particular, a
// developer's website .env.local must never put localhost API URLs in the APK.
export default async function androidConfig(env: Parameters<ReturnType<typeof defineConfig>>[0]) {
  const androidEnv = loadEnv(env.mode, resolve("mobile"), "ANDROID_");
  const apiUrl = androidEnv.ANDROID_API_BASE_URL || "https://api.yourschool.co.in/api";
  const parsed = new URL(apiUrl);
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error("ANDROID_API_BASE_URL must be an HTTPS API URL without credentials.");
  }

  return defineConfig({
    nitro: false,
    envDefine: false,
    tanstackStart: {
      server: { entry: "server" },
      spa: { enabled: true, prerender: { outputPath: "/index.html" } },
    },
    vite: {
      envDir: resolve("mobile"),
      preview: { host: "127.0.0.1" },
      build: { outDir: "dist-android" },
      define: {
        "import.meta.env.VITE_NATIVE_APP": JSON.stringify("true"),
        "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiUrl.replace(/\/+$/, "")),
        "import.meta.env.VITE_USE_MOCK_AUTH": JSON.stringify("false"),
        "import.meta.env.VITE_USE_MOCK_DATA": JSON.stringify("false"),
        "import.meta.env.VITE_ENABLE_GOOGLE_AUTH": JSON.stringify("false"),
      },
    },
  })(env);
}
