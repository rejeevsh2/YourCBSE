import { Capacitor } from "@capacitor/core";

export async function openExternalResource(value: string): Promise<void> {
  const url = new URL(value, window.location.href);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("This resource needs an HTTP or HTTPS link.");
  }

  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: url.href });
  } else {
    window.open(url.href, "_blank", "noopener,noreferrer");
  }
}

// Android WebView cannot save a blob using an <a download> link. Keep private
// API files on the device and use Android's share/save sheet instead.
export async function shareNativeFile(blob: Blob, filename: string): Promise<void> {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this file."));
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(blob);
  });
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "") || "resource";
  const path = `shared-resources/${Date.now()}-${safeName}`;
  const file = await Filesystem.writeFile({
    path,
    data,
    directory: Directory.Cache,
    recursive: true,
  });
  // The OS may read the file after the sheet closes, so leave it in its
  // disposable cache rather than deleting it before the recipient can read it.
  await Share.share({ files: [file.uri], title: filename, dialogTitle: "Save or share notes" });
}
