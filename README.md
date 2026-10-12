# yourschool.co.in

React 19 / TypeScript / TanStack Start frontend with a Laravel 13 API.
This source update continues the existing YourCBSE project. Keep the Windows
folder name `C:\Projects\YourCBSE`; the public brand is yourschool.co.in.

## Read this first

This is a **core-workflow implementation update**, not a certification that the
whole original website is finished or production-ready. See
[implementation-status.md](docs/implementation-status.md) for implemented work,
remaining demonstration screens, and verification limits.

The source package excludes installed dependencies, local environment secrets,
existing databases, logs, generated output and Git internals. Preserve your
existing database, backend `.env`, frontend `.env.local`, and uploaded files.
Apply this update to a copy of your project before using your live installation.
Do not run `migrate:fresh` against your existing database.

## Existing installation — Windows PowerShell

1. Back up your current project and database. Extract this ZIP to a separate
   folder, then copy the updated source over your project copy. Keep your
   current environment files and database connection settings.
2. Install the frontend dependencies and check it:

```powershell
cd C:\Projects\YourCBSE
npm.cmd ci
npm.cmd run typecheck
npm.cmd run build
```

3. Install the backend dependencies and apply the new migrations:

```powershell
cd C:\Projects\YourCBSE\backend
composer install
php artisan optimize:clear
php artisan migrate
php artisan test
php artisan serve --host=127.0.0.1 --port=8000
```

Leave that terminal running. In a second PowerShell window:

```powershell
cd C:\Projects\YourCBSE
npm.cmd run dev -- --port 8080
```

Open `http://localhost:8080`. In frontend `.env.local`, use:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_USE_MOCK_AUTH=false
VITE_USE_MOCK_DATA=false
```

Restart Vite after editing environment variables. The code defaults to real
accounts and real student services. Demo mode requires an explicit `true`.

## Fresh installation

Install Node 24 and PHP 8.3 or newer (PHP 8.4+ for the bundled PHPUnit 12 test
dependencies), Composer, and the PHP extensions required by `composer.lock`.
Use MySQL for your intended deployment or SQLite for local development.

```powershell
cd C:\Projects\YourCBSE
Copy-Item .env.example .env.local
npm.cmd ci
cd backend
Copy-Item .env.example .env
composer install
php artisan key:generate
```

Set the database connection in `backend\.env`. Then:

```powershell
cd C:\Projects\YourCBSE\backend
php artisan migrate
php artisan db:seed
php artisan yourschool:admin your-email@example.com
```

The seed creates the CBSE board and Classes 1–12 without a shared-password
account. The administrator command asks for your name and a hidden password;
it refuses to overwrite an existing account. Existing accounts remain valid.
Create teacher accounts from Admin → Users. Public registration creates students.

## First complete learning workflow

1. Admin: create a grade/subject/unit/chapter using the curriculum screens.
2. Admin: create a teacher account in Users.
3. Teacher: open the lesson workspace, choose a chapter, save a draft, and add
   notes or video/PDF/image/audio/worksheet/activity resource URLs.
4. Admin: open Lessons, inspect the draft and resources, and publish it.
5. Student: register, sign in, browse the learning hub and open the lesson.
   Check completion, bookmarks and the notification read count.
6. Student: add a question-and-answer revision card at the bottom of a lesson.
   Open Interactive Revision, start, reveal, rate and finish. Reload and resume
   an unfinished session to confirm persistence.
7. Admin: create a practice set in Question Bank, choose the correct options,
   save its draft and publish it. Student: open Practice, answer and submit,
   then review the attempt.

Empty optional lesson-resource sections remain hidden by the existing player.
Teacher resources use already-hosted URLs; file upload management is still
separate work. Published lessons are locked for teacher editing until an admin
unpublishes them.

## Password reset

Set a working mail transport in `backend\.env` (MAIL_MAILER, MAIL_HOST,
MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD and MAIL_FROM_ADDRESS as appropriate).
Set `FRONTEND_URL=http://localhost:8080` locally. The reset email contains the
email and token; the full link is required. Resetting a password revokes existing
API tokens. Local Laravel log mail does not send a real email.

Google sign-in remains hidden unless explicitly enabled; OAuth integration and
credentials are not included. Email verification/OTP is not required by the
implemented registration flow and the old verification screens are not wired.

## Deployment target

Vite now selects Nitro's `node-server` preset outside Lovable. This application
requires a Node service for the frontend and a PHP/Laravel service for the API;
it is not a static HTML-only upload.

Use your server's actual frontend and API addresses. Set an **absolute HTTPS**
`VITE_API_BASE_URL` before building so server-rendered loaders can reach the
API. Configure `FRONTEND_URL=https://yourschool.co.in` in Laravel (comma-separated
origins are supported if both www and non-www are served). Set `APP_ENV=production`
and `APP_DEBUG=false`. Point the PHP web root at `backend/public`, run migrations,
and configure the web server and TLS. Run the built Node entry under a process
manager according to the generated output. Do not use `vite dev` in production.

Keep rihanstudio.com on its own files, database, email and deployment.
No deployment or changes to an external repository were performed by this update.


## Additional features — 18 September update

The following now have database-backed screens and APIs:

- Resource library: published free lesson resources, search and type filtering,
  saved resources, recent views and file-opening history. File links return the
  stored public file, open a validated external URL, or download textual notes.
  The history records that a link was opened; it does not certify that a browser
  finished downloading a file and does not provide an offline website cache.
- Planner/calendar: create, edit, complete, filter and delete dated tasks. Each
  user's tasks are private. Calendar currently presents a dated agenda.
- Profile and password: save your own name/mobile/bio; change password after
  checking the current password; invalidate other token sessions.
- Notification Center: read/delete actions and saved lesson/announcement
  preferences. Reminders come from the planner; achievements come from completed
  lessons. Email, SMS and push-notification channels are not implemented.
- Admin announcements: review the audience/title/message, then explicitly send
  an in-app message to opted-in student or teacher accounts. No announcements
  were sent during development.

After copying this source update, run the normal install and `php artisan migrate`
steps above. The two additional migrations create planner/resource state and
notification preferences. Run `php artisan storage:link` if public lesson files
are served from Laravel's public disk; preserve existing files on that disk.

Check with two different student accounts that saved resources, tasks and profile
changes remain private. A resource in an unpublished lesson must disappear from
both library search and direct resource URLs. Use Notification Center → Settings
to opt out, then verify an admin announcement is not delivered to that account.
