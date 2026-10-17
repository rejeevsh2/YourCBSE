// Keep YourSchool launcher links inside the APK so they can use its login.
// The authenticated launcher then opens the backend's one-use ticket in a tab.
export function localInteractiveAppPath(url: URL): string | undefined {
  if (
    !["https://yourschool.co.in", "https://www.yourschool.co.in"].includes(url.origin) ||
    url.username ||
    url.password
  ) {
    return undefined;
  }

  const match = /^\/interactive-app\/([1-9][0-9]*)\/?$/.exec(url.pathname);
  return match ? `/interactive-app/${match[1]}` : undefined;
}
