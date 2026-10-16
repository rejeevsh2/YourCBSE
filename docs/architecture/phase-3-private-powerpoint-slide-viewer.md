# YourSchool Phase 3 — private PowerPoint slide viewer

**Status:** development only. No merge, no ServerByt migration and no Railway converter deployment yet.

## User experience

- Admin uploads a PowerPoint (.ppt or .pptx) normally; the original is private in Cloudflare R2.
- When preview conversion is enabled, the backend requests an isolated Railway conversion service.
- The converter downloads the original through its private R2 credentials, uses LibreOffice and Poppler to render numbered JPEG slides, and uploads those slides to private R2.
- The converter writes `manifest.json` only after every slide uploads. No public URLs or permanent presentation links are created.
- Students see a responsive slide viewer with next/previous, keyboard arrows, fullscreen and Refresh access. The browser fetches temporary signed slide links from Laravel, **never the original PPTX**.
- Teachers and admins retain the original-file actions in admin/teacher tooling.
- Restricted / unpublished / unassigned / paused users are still denied by the same Laravel lesson-attachment authorization as Phase 2.
- When previews are disabled (the default), existing PPTX open/download behavior remains available.

## Infrastructure and settings

**Backend ServerByt `backend/.env`:**
```env
PRESENTATION_PREVIEWS_ENABLED=false
PRESENTATION_CONVERTER_URL=
PRESENTATION_CONVERTER_TOKEN=
```

**New isolated Railway service:** deploy `services/presentation-converter/Dockerfile`, using the Dockerfile in that subdirectory as its build context, with one replica initially. This is a **separate service**, not the frontend Railway service.

Set these environment variables **only on that worker**, using Railway secrets / environment settings:

```env
R2_ENDPOINT=<private endpoint>
R2_REGION=auto
R2_ACCESS_KEY_ID=<worker-specific scoped key>
R2_SECRET_ACCESS_KEY=<worker-specific secret>
R2_BUCKET=yourschool-presentations
PRESENTATION_CONVERTER_TOKEN=<shared random >=32 character secret>
```

Give the worker R2 permissions only for the designated presentation bucket as narrowly as Cloudflare allows. Never put these values in VITE_* variables, GitHub, build logs or exposed client configuration. Restrict ingress to Laravel server addresses or a private network where available, and authenticate every conversion POST with the shared bearer token. The public /health endpoint is intentionally non-sensitive.

Set `PRESENTATION_CONVERTER_URL` on the backend to the Railway worker's **HTTPS** origin, and `PRESENTATION_CONVERTER_TOKEN` to the same randomly generated value. Do not turn on `PRESENTATION_PREVIEWS_ENABLED` until an isolated real-PPTX test succeeds. New lesson uploads already use R2 when the separate Phase 2 upload flag is enabled.

**Converter launch:** Install system packages in the Dockerfile; start one Uvicorn process. It accepts `POST /convert`, authenticates the bearer token, validates server-generated R2 object namespaces and returns 202 before performing conversion. Supports up to 100 MB inputs and 80 slides, with per-step timeouts. Synchronous PHP requests time out after 8 seconds, without failing an otherwise successful upload.

**Caution:** The current prototype uses an in-process background task and only one active conversion at a time. Railway restarts can interrupt a job, and busy workers return 429; the admin **Retry slides** action can submit again. Before high-volume production use, migrate to a durable queue, add capacity limits / alerts and retry backoff. Do not upload all courses during the supervised pilot.

## Feature rollout

1. Keep `PRESENTATION_PREVIEWS_ENABLED=false` during the backend and frontend code rollout; CI must pass. Existing PDFs and legacy PPT files must continue opening normally.
2. Create an isolated Railway worker service using the Dockerfile, configure secrets, verify `GET /health` and validate the authentication rejection of a conversion request with no token.
3. Upload a disposable PPTX in the admin lesson content page (or use an existing small R2 PPTX), with the preview feature still OFF. Confirm R2 storage succeeds.
4. Enable `PRESENTATION_PREVIEWS_ENABLED=true` on ServerByt and clear Laravel config. Click **Retry slides** on that disposable PPTX. Check the worker's logs for successful slide count; do not share secrets.
5. Log in with an approved, class-assigned student on a published Free lesson. Confirm inline slide 1, Next, Previous, fullscreen, refresh, mobile/Android WebView. Confirm the original `/temporary-url` route returns **403** to that student, while signed JPG previews load.
6. Confirm unassigned, pending/paused, restricted, unpublished and inactive access is denied. Test a 10+-slide presentation for correct numeric slide ordering, image quality and 120-second expiry.
7. Test replacement and removal: the old file/preview namespace is no longer served. Monitor worker restarts, failures, R2 growth and 4xx/5xx responses. Then consider controlled availability to more lessons.

## Troubleshooting

- **Viewer says preparing indefinitely:** Worker did not finish, worker secrets/HTTPS endpoint are incorrect, file exceeds limits or worker restarted. See backend logs (warnings only) and worker logs; click Retry slides when stable.
- **403 for students:** Ensure lesson published/active, class assigned, account approved/unpaused, content active and Free. Under Phase 3 student access to the original PPTX is intentionally forbidden.
- **404 for slides:** Phase 3 previews are still disabled; UI preserves previous PowerPoint behavior.
- **Existing PowerPoint only downloads:** Conversion is not yet enabled or that attachment has no R2 preview. New feature does **not** convert legacy public files.
- **Expired JPEG link:** Click Refresh access to request a new batch of signed URLs. Do not make R2 objects public.
- **Resource Library:** With slide previews enabled, student original PPTX links are deliberately denied; students should use the lesson's slide viewer.

## Rollback rules

1. **Never turn off `EDUCATIONAL_R2_READS_ENABLED` while private attachments exist.**
2. If the worker has problems, set `PRESENTATION_PREVIEWS_ENABLED=false` and clear Laravel config. This restores Phase 2 original-PowerPoint behavior (downloads) until conversion is healthy; it does not delete converted preview objects.
3. Existing PDFs, original R2 PPT files, lesson records and the existing Phase 2 feature flags remain intact.
4. No new database migration is required for Phase 3. Preview paths are a deterministic private sidecar of the original R2 object key and content ID, and manifests are validated strictly by Laravel before signing any slide images.
5. HTML/ZIP interactive apps, admin Media Library and bulk migration are out of scope.

## Privacy limitations

Students do not receive the **PPTX file** once previews are enabled; they do receive short-lived JPEG image URLs, and screenshots or network saves of those slide images remain technically possible. A browser-only viewer cannot absolutely prevent copying displayed information.
