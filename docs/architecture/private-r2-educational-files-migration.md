# YourSchool private R2 storage — all educational uploads

Status: **approved scope / phased plan; not yet deployed**  
Owner: YourSchool / HRN LMS  
Baseline: production `main` at `1ffc57f`. Bootstrap code is in draft PR #7.

## Decision and scope

Cloudflare R2 bucket `yourschool-presentations` is the **private** destination for all **YourSchool-uploaded educational files**: PPT/PPTX, converted slide WebP images, PDFs, worksheets, documents, images, audio and uploaded videos. The bucket name is historical and need not be renamed. YouTube/Drive links continue as external URLs, not duplicated in R2. Public marketing/logo/website assets are *not* automatically treated as private lessons; assess them separately.

Keep ServerByt for Laravel PHP, authentication, databases and metadata. Students should download bulk bytes from R2, not through Laravel. Keep Railway hosting and its Auto Deploy **off**.

## Current code inventory (October 2026)

| Source | Current format | Safeguard / migration need |
|---|---|---|
| `LessonContentController` | Files uploaded to `public` disk in `lesson-content/`; absolute `file_path` public URL stored in database; delete implementation tied to `/storage/lesson-content/` | Add explicit disk + object key (separate from URLs), authenticated access endpoint, safe delete/replace, opt-in R2 new uploads, zero-public-URL response |
| `PublicContentController::lesson` | Returns serialized `LessonContent` including `file_path` | Ensure R2 keys, bucket name and permanent URLs are not delivered as public file paths; frontend must request a short-lived authorized URL |
| `ResourceLibraryController::file` | Authorizes free/active published lesson + class, but may redirect to a raw existing public file URL | Redirect *only* to server-generated presigned R2 URL for migrated records after auth; never trust arbitrary user-supplied object keys/URLs |
| `MediaAssetController`, `MediaAsset` | Media table already stores `disk` + `path`; public `url` accessor for legacy files | Reuse existing columns, scope private assets to owning lesson/teacher/admin or explicit public designation; do not issue unrestricted access to media ids |
| Interactive HTML/ZIP | Private Laravel local storage, path-scoped HttpOnly cookie, class checked per asset request; multiple linked HTML/JS/CSS resources | Separate rollout. Direct R2 presigned HTML/JS does not preserve per-request revocation or safe origin isolation. Use protected gateway/Worker plus asset manifests or keep local until equally secure. No public `r2.dev` |
| YouTube/Drive links | External references | Stay external, subject to provider permissions |
| Blog and website assets | May be intentionally public | Independent public-asset policy, outside private educational-file migration |

## Security contract (must pass before every phase)

1. **Private bucket**, no custom public domain, no public development URL, scoped R2 credentials in ServerByt `backend/.env`, never in GitHub, frontend, APK, mobile build variables or logs. `FILESYSTEM_DISK` remains unchanged during rollout.
2. An authenticated Laravel endpoint checks *current* user state (not only cached token): account not paused; student/teacher approved; grade/class assignment via `Lesson::accessibleTo`; lesson and ancestors published/active; content active and correct association. Admin/author exceptions must be explicit and tested.
3. For an approved file, the backend returns a **short-lived, read-only, object-specific URL** (e.g. 60–180 seconds for slide/image/PDF; tailor video playback with Range expiry). Direct download travels from R2. A URL is a temporary bearer capability: cannot be revoked before expiry, may be copied and shared until expiry. Use `Cache-Control: no-store` on URL responses, `Referrer-Policy: no-referrer`, narrow TTL, content disposition, no secrets in application JSON, and no user-provided keys.
4. Configure restrictive R2 CORS origins if cross-origin fetch is needed: `https://www.yourschool.co.in`, `https://yourschool.co.in`, and only documented Android origins. Test iframe, PDF, image, video and HTTP Range on real browser + Android WebView. Avoid wildcard origins and credentialed CORS.
5. Use server-generated opaque object keys organized as `lessons/{id}/files/{uuid}.{ext}`, `media/{uuid}`, `presentations/{id}/slides/{version}/slide-0001.webp`. Validate MIME, extension, size and authorization. Never use unsanitized client filenames as keys.
6. Write metadata and content changes **only after** successful R2 object upload; on database failure delete orphan upload. Replacements upload new object first, commit new pointer, then queue removal of old object after verification/retention grace. Deletions must be constrained to own storage namespace; never accept arbitrary URLs or disks.
7. Secure file URLs must be generated per request, not persisted or published in lesson API. Avoid exposing internal credentials, full R2 prefixes, and private objects via old `/storage/` URLs. Browser and APK must use authenticated API to acquire URL.
8. Use bandwidth-efficient delivery (R2 direct, `GET`/Range). PDFs/images can be optimized; uploaded video can be large and will consume free-tier **storage** quickly. Monitor R2 object count, requests, bytes, availability and costs; budget alerts are *notifications*, not spending caps. Add upload limits.

## Phased work and acceptance gates

### Phase 1 — Foundation (draft PR #7)
- [x] Private R2 disk defined separately from `public` and `local`.
- [x] Backend environment placeholders; S3 Flysystem dependency and locked security patches.
- [x] `yourschool:r2-check` command with readonly mode, optional write/read/delete.
- [x] GitHub PHP and frontend CI checks green, Composer audit clean.
- [ ] Merge only after review; install production dependencies from lockfile and run read-only + write R2 connectivity test privately. **No cutover yet.**

### Phase 2 — New lesson uploads behind feature flag (R2 OFF by default)
- [ ] Add `lesson_contents.file_disk`, `file_object_key`, `mime_type`, `file_size_bytes` and migration with nullable columns. Keep legacy `file_path` read-only for older records.
- [ ] Laravel API for temporary file URL and secure download, with current-user lesson/class authorization, paused/pending/unpublished tests.
- [ ] Update the student, teacher and admin frontend to request authorized URLs for inline PDF/audio/image/video and download buttons.
- [ ] Implement R2 write/replacement/delete with transactional safety and test via `Storage::fake('r2')`; keep feature flag OFF until browser + APK checks pass.
- [ ] Pilot one class/lesson and compare functionality + bytes served. Enable R2 for *new* uploaded educational files after end-to-end checks.
- [ ] Do not redirect anonymous `file_path` consumers to inaccessible R2 URLs.

### Phase 3 — Presentations
- [ ] Determine reliable server-independent PPTX conversion pipeline (offline/batch or separate worker; ServerByt shared hosting cannot be assumed to run LibreOffice).
- [ ] Generate optimized WebP slides, preserve slide order/numbers and fallback original PPTX; target small total size where legible rather than impose a rigid 5MB cap.
- [ ] Browser/Android view one slide at a time; Previous, Next, fullscreen, prefetch one adjacent image. Authorize manifest and slide requests, use short-lived R2 GETs.

### Phase 4 — Media library and rich educational content
- [ ] R2 upload for images/audio/video/PDF/worksheets/documents in `media_assets`; ensure referenced educational assets are class-restricted. Legacy public media URLs still work during migration.
- [ ] Distinguish public promotional/website assets from private lesson assets: their sharing and caching policies differ. No automatic private->public or public->private conversion.
- [ ] Audit all lesson-rich-text, markdown and external URL references before rewriting links.

### Phase 5 — Interactive HTML/ZIP apps
- [ ] Preserve current ticket/cookie and per-asset permission checks. Choose approved protected edge gateway/Worker/manifest design; test HTML imports, linked JS/CSS/media, same-origin, CSP, and revoked sessions.
- [ ] Keep interactive apps on existing secure ServerByt implementation until edge protection matches current security.

### Phase 6 — Backfill and cutover
- [ ] Generate **read-only inventory** for lesson attachments, media assets, interactive apps, public image links and sizes. Include orphan/missing and active/inactive records.
- [ ] Copy by stable record id/key, checksum + length verify, restartable/idempotent batches with checkpoint log. Do not delete source on copy.
- [ ] Shadow-read R2; compare side-by-side; switch metadata in controlled batches; user-visible functional checks. Collect error rates and R2 requests/bandwidth.
- [ ] Keep rollback metadata plus backups, then remove old publicly readable copies **only after** verified cutover and an approved retention window. Revocation must include legacy URLs.
- [ ] Confirm browser, Android APK, student class restrictions and teacher/admin editing. Investigate caching and access revocation before wider rollout.

## Rollback

- Disable R2 new-upload feature flag, not `FILESYSTEM_DISK`.
- Restore previous metadata for the affected batch; original ServerByt objects stay intact until cutover verified. Preserve immutable migration journal.
- Stop serving pre-signed URLs for deactivated/revoked accounts (previously issued URLs remain usable until their TTL expires).
- Do not roll back security/approval checks or make the bucket public as a workaround.

## Next decision before production cutover

Confirm a real test of the R2 API from ServerByt; decide operational limits (per-file maximum, max uploads/month, user upload role, account budgets), and an approach for conversion + interactive apps. Do not promise that all content has moved until the source inventory, secure viewer and migration verification are complete.
