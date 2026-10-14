# YourSchool Android app

This is the first Android test version of the existing YourSchool application.
It packages the React screens on the phone and connects to
`https://api.yourschool.co.in/api`. Website accounts, permissions, lessons and
saved progress are reused. Internet access is required for lessons and saving
changes; offline syncing and phone push notifications are not included.

## Build on Windows

Install Node.js 22 or newer and Android Studio 2025.2.1 or newer. In Android
Studio's SDK Manager install Android SDK Platform 36 and Build Tools 36.0.0.
Use the bundled JDK 21 for Gradle.

Keep your existing working folder intact. For a fresh Android checkout, run:

```powershell
git clone --branch codex/yourschool-android --single-branch https://github.com/rejeevsh2/YourCBSE.git C:\Projects\YourSchoolAndroid
cd C:\Projects\YourSchoolAndroid
npm.cmd ci
npm.cmd run android:sync
npm.cmd run android:open
```

In Android Studio, allow Gradle to finish syncing. Connect your Android phone,
enable Developer options and USB debugging, and accept the phone's USB debugging
prompt. Select that device and click Run. An emulator also works.

To create an installable debug APK, use Android Studio's APK build action, or
run the following after configuring the SDK/JDK:

```powershell
cd C:\Projects\YourSchoolAndroid\android
.\gradlew.bat assembleDebug
```

The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. This debug build
is for testing. Google Play publication needs a separately signed release app
bundle, store preparation and a device test pass.

The **Android test APK** GitHub Actions workflow also builds a downloadable
`YourSchool-Android-test` artifact on matching pull requests. After this branch
is merged, it can be started manually from Actions. It never deploys the website
or uploads an app to Google Play.

## What is separate from the website

- `npm run build` and `vite.config.ts` remain the website build.
- `npm run build:android` uses `vite.android.config.ts` and writes a static
  TanStack Start shell to `dist-android/client/index.html`.
- `capacitor.config.ts` packages that directory. It does not load the website
  through a remote `server.url`.
- The phone uses Capacitor's native HTTP transport and the existing API tokens.
  No production CORS changes, database migrations or backend deployment are
  required by this branch.
- Only the Android build enables Android back-button handling, external-link
  browser tabs and the offline connection message.
- YouTube videos open through the Open video button. PDF notes and external
  interactive activities open separately, leaving the lesson in the app.
  API-served library files use Android's save/share sheet. Large files should
  remain external links, as planned.
- Activity scores from external applications still need an integration before
  they can be recorded here.

The package ID is `in.co.yourschool.app`; the display name is YourSchool. The
icon is derived from the website's existing graduation-cap SVG. Different
school branding and tenant isolation are later work, not part of this APK.

## Optional staging API

Copy `mobile/.env.example` to `mobile/.env.local`, set `ANDROID_API_BASE_URL` to
your staging HTTPS API, and rebuild with `npm.cmd run android:sync`.
The Android build intentionally ignores the website's root `.env.local` and
disables mock login/data. Do not put secrets in any frontend build variable.

## First phone test

1. Sign in with a test student account; check the dashboard.
2. Open a class, subject, chapter and lesson.
3. Open a YouTube video, a PDF and an interactive activity; return to the lesson.
4. Save progress or a bookmark in the app, then reload the website and check it.
5. Check Android Back, menus, keyboard, screen rotation, and a network disconnect.
6. Sign out, relaunch, and confirm that private pages require sign-in again.

Any actions in an APK using the default production API update the real account.
Use a dedicated test account. Phone testing is required before distributing to
students; a successful compile does not prove native login or playback works.

After changing app code, run `npm.cmd run android:sync` again before rebuilding.
Published lesson/link changes are fetched from the API; packaged screen or
native-feature changes require a new APK/app release.

References: [Capacitor setup](https://capacitorjs.com/docs/getting-started),
[native HTTP](https://capacitorjs.com/docs/apis/http), and
[TanStack Start SPA mode](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode).
