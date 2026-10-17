import { Capacitor, registerPlugin } from "@capacitor/core";

const ImmersivePresentation = registerPlugin<{
  setEnabled(options: { enabled: boolean }): Promise<void>;
}>("ImmersivePresentation");

let pending = Promise.resolve();

// Serialize rapid open/close transitions so an old hide cannot run after exit.
export function setPresentationImmersive(enabled: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve();
  pending = pending
    .catch(() => undefined)
    .then(() => ImmersivePresentation.setEnabled({ enabled }));
  return pending;
}
