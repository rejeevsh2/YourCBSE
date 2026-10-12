# Implementation status — 18 September 2026

## Added in the latest update

- Connected public Resources and all Library browse/search/detail/saved/recent/
  download-history pages to published, active, free lesson content.
- Added resource state persistence and real file/text download or external-link
  endpoints. Removed misleading offline-storage success claims from these pages.
- Added private planner CRUD and a dated calendar agenda.
- Connected profile name/mobile/bio saving and current-password-verified password
  changes, with revocation of other token sessions.
- Fixed Notification Center response/request mismatches; added deletion, persistent
  preferences, planner reminders and completed-lesson milestone data.
- Implemented admin announcement review/send screens and backend opt-out handling.
  No messages were sent during development.
- Added StudentToolsTest covering planner ownership, role/email protection,
  resource visibility/state, file responses, notification privacy/preferences and
  password-token revocation. These PHP tests are not yet executed.
- Latest TypeScript and focused lint checks passed. The build retry still failed
  at the absent Linux Rolldown native dependency. PHP/Composer remain unavailable.

## Earlier implemented work

- Registration now sends the `name` field Laravel validates, retains the mobile
  number, creates a student and directs them to sign in. Teacher accounts are
  created by administrators. Registration no longer issues an unused API token.
- Added password-reset endpoints, email link creation and token handling in the
  reset form; reset revokes existing tokens. Added login/reset/registration limits.
- Removed hard-coded local API addresses from active pages and centralised their
  base URL. CORS reads the frontend origin from configuration.
- Student dashboard now displays backend lesson statistics, continue-learning,
  recent activity and notifications instead of sample school/streak/XP figures.
- Interactive revision is accessible to authenticated students. Sessions are
  private to the owner; start/resume, cards, reveal, recall ratings, history,
  completion and review scheduling are implemented. Duplicate reviews do not
  increment counts twice. New cards can be created on lesson pages.
- Teacher workspace persists authored lesson drafts and resources. Other teachers
  cannot edit them, and teachers cannot publish their own drafts. Existing admin
  lesson controls perform publication.
- Admin dashboard uses actual counts. Admin Users/Teachers/Students support
  search and account creation. Question Bank creates MCQ practice sets with four
  options and one correct answer, with publish/unpublish controls.
- Published lesson visibility checks include active ancestors. Lesson progress
  writes and bookmarks reject unavailable lessons. Student statistics exclude
  unpublished lessons. Practice submission locks the attempt against duplicates.
- Removed backup `.before-*` pages from the live router and regenerated its tree.
  Archived source is retained in `docs/archived-routes`.
- Repaired the npm lockfile and added a `typecheck` script. Added safe fresh-install
  curriculum seeding and an interactive admin-creation command.
- The first update added three additive migrations for revision-session card state, lesson
  authorship and user mobile numbers. Existing data is not reset.

## Checks performed

- Full frontend TypeScript check: passed after route regeneration.
- Focused lint check on the newly implemented screens: passed after fixing the
  hook dependency warning.
- npm clean-install dry run: passed using the repaired lockfile. A full clean
  installation was not performed after repair.
- Production build: attempted but **not completed**. The uploaded dependencies
  were for Windows; the execution environment lacks the Linux Rolldown native
  binding. Run `npm ci` and `npm run build` on the target machine.
- Laravel feature tests: added, **not executed** because PHP and Composer are
  unavailable in this environment. Run `php artisan test` before deployment.
- No browser end-to-end run, visual QA, real email delivery or deployment was
  completed. Existing database content and hosted resource URLs were not tested.

The feature tests cover registration privilege restrictions, inactive curriculum
visibility, revision ownership/idempotence, teacher draft isolation and practice
answer secrecy. Test failures must be resolved before treating this update as
production-ready.

## Remaining original-project work

The full agreed shared chat could not be fetched. Prior context recovered the
core curriculum and portal plan, including optional resource sections and
keeping rihanstudio.com independent. AI Teacher was explicitly deferred until
the core learning structure stabilises.

This update does not finish every screen in the original application. Remaining
work includes advanced analytics/reports, teacher classes/assignments/student
tracking/messages, general media management, dedicated flashcard and mind map
authoring beyond personal lesson cards, and the wider platform settings/roles/
backup/integration screens. Several still import demonstration
data or use placeholder actions. See `remaining-static-pages.txt` for an audit
of admin/teacher route files that still import their static data modules; this
is an indicator, not an exhaustive feature audit.

Existing verification/OTP screens and Google OAuth are not connected. Email
transport, hosting, TLS, database backups and final deployment require the actual
server configuration. Subject/chapter/lesson educational content must be entered
and checked by the owner/teachers; it was not invented in this update.

## Acceptance check before launch

Run the setup and learning workflow in README with separate admin, teacher and
student accounts. Confirm a teacher cannot edit another teacher's lesson, a
student cannot read another student's revision session, unpublished lessons
cannot be opened directly, and practice answer keys stay hidden until submission.
Run the production build and Laravel tests, check browser console/network errors,
then complete the remaining sections before describing the whole site as complete.
