# YourSchool Phase 2 — private R2 lesson attachment rollout

**State:** Draft PR #8; not deployed, not merged.  
**Depends on:** Phase 1 (`5af51e3`) already deployed and private R2 read/write check completed.

## What Phase 2 adds

- Nullable `lesson_contents` metadata columns for disk, opaque R2 key, MIME and length. Historical `file_path` URLs are untouched.
- Feature-gated new admin lesson uploads to private `lessons/{lessonId}/files/{uuid}.{extension}` objects.
- Account- and class-restricted Laravel endpoint `GET /api/lesson-attachments/{content}/temporary-url`, returning an expiring R2 URL on demand. No permanent R2 URL in public lesson JSON.
- Student lesson page, teacher preview, admin lesson contents and admin resource listing can request a URL for a private attachment. Existing ServerByt and external links still work.
- Resource Library JSON download responds with signed R2 links (rather than streaming file bytes from PHP), guarded by published/free lesson class access.
- Automated tests check approval, class assignments, pause, inactive/unpublished records, student restrictions, replacement/move, resource library and legacy fallback.

**Not included:** Migration of existing lesson files; admin Media Library files, interactive HTML/ZIP apps, external YouTube/Drive files, PDF/slide optimization or PPTX-to-WebP slide rendering. Those are later phases.

## Release sequence — each gate must be satisfied

1. Review PR #8 and green CI (Laravel tests + TypeScript + frontend build). Make a database backup and record existing deploy SHAs. Keep Railway Auto Deploy disabled.
2. Deploy **backend first**, with `EDUCATIONAL_R2_UPLOADS_ENABLED=false` and `EDUCATIONAL_R2_READS_ENABLED=false` (unset defaults are also false). Run `php artisan migrate --force` and `php artisan optimize:clear` using ServerByt's PHP 8.4, verify API health; do not migrate or delete old files. Production R2 credentials remain only in backend `.env`.
3. Deploy matching **frontend commit**, pinned/manually to Railway only after backend health is confirmed. Verify student lesson page, teacher previews, admin attachments and Resource Library using existing legacy public files. Verify Android APK/WebView points to the same API and handles the updated UI.
4. Configure R2 browser behavior and restrictive CORS if needed for programmatic requests; verify actual presigned GET on a production-like browser and Android WebView. Test PDF iframe, image, audio, download; assess large/long-video Range requests and 120-second link expiry separately.
5. For a **supervised pilot only**, enable `EDUCATIONAL_R2_READS_ENABLED=true` then `EDUCATIONAL_R2_UPLOADS_ENABLED=true` after compatible viewers are live. Run `php artisan optimize:clear` after editing environment. Create one disposable test lesson attachment, confirm new R2 object with no permanent public URL, verify authorized user viewing, denied access for an unassigned or paused user, and file replacement/removal. Do not test by deleting existing content.
6. Monitor 4xx/5xx, storage requests, bandwidth, upload errors and lesson viewing before any wider release.

## Rollback contract

- If new R2 uploads have begun, **do not disable R2 reads**: the new records have no public `file_path` and would become unavailable. Turn off only `EDUCATIONAL_R2_UPLOADS_ENABLED` to stop further new R2 objects, and keep `EDUCATIONAL_R2_READS_ENABLED=true` until every private record has been moved or a fixed viewer deployed.
- Keep the backend `file_disk` and `file_object_key` migration columns while private records exist. Do not roll back those columns automatically.
- Previous ServerByt public files are unchanged. No automated bulk migration or deletion in Phase 2.
- A signed URL is a time-limited bearer capability: revoking a user's class removes ability to **issue another URL**, but previously issued ones can work until expiration. Keep TTL short. Large video needs separate tested Range/expiry strategy.
- This PR never adjusts Railway's Auto Deploy setting.

## Outstanding checks before user-facing rollout

- [ ] Manual browser + Android WebView smoke test using a **real** signed R2 URL and R2 CORS/origin behavior.
- [ ] Validate credentials, MIME, file-size limit and content disposition for representative file types.
- [ ] Confirm whether non-free materials need a separate entitlement layer (students are denied private `is_free=false` files in this release).
- [ ] Confirm any student/teacher UI routes not covered by current automated frontend checks.
- [ ] Separate later-phase strategy for global Media Library and protected multi-file interactive apps.
