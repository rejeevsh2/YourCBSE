import { Capacitor, registerPlugin } from "@capacitor/core";

const NativeVideo = registerPlugin<{
  exitFullscreen(): Promise<{ exited: boolean }>;
}>("NativeVideo");

export async function exitNativeVideoFullscreen(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  return (await NativeVideo.exitFullscreen()).exited;
}
