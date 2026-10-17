# YourSchool Android app

This is an Android test version of the existing YourSchool application.
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
- YouTube videos play inside student lessons and teacher previews, with the
  official player controls and fullscreen. Open in YouTube remains available.
  PDF notes and external interactive activities open separately, leaving the
  lesson in the app.
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

Version 0.1.5 adds embedded YouTube playback using existing lesson URLs (watch,
short links, Shorts, live and embed URLs). The Android-only wrapper is served
from a local HTTPS origin matching the installed package ID; this supplies
YouTube's required app identity in the Referer/origin without changing the
main app origin, sign-in storage, or backend. It is not a remotely hosted page.
The player uses the official IFrame API, retains YouTube branding/controls,
does not autoplay, and pauses when the app is backgrounded. Loading errors have
Retry video and Open in YouTube alternatives outside the player.

Android's WebChromeClient now handles video fullscreen: it displays the custom
view, hides the phone bars, keeps the screen awake, and restores prior window
state on exit. Fullscreen survives rotation; Android Back exits the player
before navigating the lesson. The normal Capacitor client remains in use for
permissions, file selection, and main-frame navigation. No extra permissions,
YouTube credentials or API keys are required for these lesson embeds.

Phone checks for 0.1.5: play a channel video inside the lesson; seek and pause;
enter/exit fullscreen using both the player button and Android Back; rotate
both ways without losing the playback position; background/reopen the app;
try another lesson; test a private/embedding-disabled video and an offline retry;
check the Open in YouTube fallback and a teacher preview. Recheck slide pinch
and swipe, login, PDFs and interactive links. Passing a build does not prove
that a real phone's YouTube playback or fullscreen works.

YouTube settings: videos must permit embedding and be playable by the viewer.
Public/unlisted videos are appropriate for normal student playback. Unlisted
links can be shared outside YourSchool; they are not student-only protection.


Version 0.1.4 adds an immersive slide viewer. A local Android plugin hides the
status and navigation bars, uses black surroundings, re-applies immersion after
rotation/resume, and restores the prior bar state when the viewer closes.
Slides keep their proportions and use the whole available area; small controls
overlay the image and hide after three seconds.

- Swipe left/right at normal zoom to change slides.
- Pinch with two fingers to zoom from 1x to 5x; drag with one finger while zoomed.
- Double-tap to zoom in or return to the whole slide. The percentage button also
  resets zoom; plus/minus buttons provide an alternative to pinching.
- Tap the image to show/hide controls. Exit fullscreen or Android Back returns
  to the same lesson and selected slide. System edge swipes can reveal the
  phone bars temporarily, as required by Android.
- Rotate the phone for wide slides. No orientation lock is forced.

Retest on a phone: status/navigation bars hide; both orientations maximize the
slide; pinch never changes slides; panning stops at image edges; slide changes
reset zoom; Exit/Back and switching away/returning restore the expected bars.
Automated gesture and DOM checks do not replace this device test.

Version 0.1.3 incorporates main commit `203119f`: private R2 lesson attachments,
the in-page PowerPoint slide viewer, Resource Library links to that viewer, and
the Fullscreen / Exit fullscreen toggle. Its viewport-only fullscreen has been
replaced by v0.1.4's immersive viewer. Private PDFs and original-file actions use Android browser tabs
instead of desktop popup windows; slide images stay inside the lesson.

Open a converted presentation from both a lesson and the Resource Library.
Check Previous/Next, Fullscreen/Exit fullscreen, Android Back, and Refresh access
after a slide link expires. Verify private PDF access separately. The API still
enforces account approval, pause status, class access and publication rules.

Version 0.1.2 added protected uploaded interactive apps and account pause
controls. School launcher links use the APK's login;
the API issues a short-lived, one-use ticket that opens the activity in a
separate browser tab. The bearer token stays out of the browser URL.

Test an uploaded HTML/ZIP activity from an assigned lesson, return with Android
Back, and verify paused/unapproved accounts are denied by the server.

Version 0.1.1 includes the current administrator-approval registration flow.
New accounts wait for administrator approval and class assignment; this flow
does not send an email OTP. Pending/rejected responses and other HTTP 403 errors
must not send users to the unconnected email-verification screens.

Test new student/teacher registration and the pending-approval screen, then
approve the test account with its class access in the admin portal before login.
GitHub test APKs use a temporary debug signing key. If Android rejects an update
because the signatures differ, uninstall the old test app and install the new
APK. This clears local app data; account data saved on the server is retained.

1. Sign in with a test student account; check the dashboard.
2. Open a class, subject, chapter and lesson.
3. Play a YouTube video inside a lesson, including fullscreen; open a PDF and
   an interactive activity separately and return to the lesson.
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

YouTube references: [embedded player identity](https://developers.google.com/youtube/terms/required-minimum-functionality#api-client-identity-and-credentials),
[IFrame API](https://developers.google.com/youtube/iframe_api_reference), and
[Android fullscreen custom views](https://developer.android.com/reference/android/webkit/WebChromeClient#onShowCustomView(android.view.View,%20android.webkit.WebChromeClient.CustomViewCallback)).
