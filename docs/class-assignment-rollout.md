# YourSchool - Class Assignment Rollout

## Purpose

Prevent existing approved students and teachers from losing
curriculum access when class-based access restrictions are enabled.

## Important

Older installations may not contain an authoritative
user-to-grade mapping.

Do not guess classes or assign every class automatically.

## Deployment procedure

1. Back up the existing database before deployment.

2. Obtain verified class information for existing students
   and teachers from school administration records.

3. Deploy the new approval and class-assignment schema
   in a controlled maintenance or staging window.

4. Run database migrations using:

   php artisan migrate --force

5. Check for missing class assignments using:

   php artisan yourschool:audit-class-assignments

6. If the audit fails, keep affected users from accessing
   class-restricted curriculum until assignments are corrected.

7. Using the administrator interface, navigate to
   Admin > Students or Admin > Teachers.

8. Find accounts showing "Not assigned".

9. Select "Classes", assign the correct class or classes,
   and select "Save classes".

10. Run the audit again:

    php artisan yourschool:audit-class-assignments

11. Confirm that the audit passes before completing
    the rollout of class-restricted access.

## Assignment requirements

Students must have exactly one assigned class.

Teachers must have at least one assigned class.

Never grant access to all classes as a migration shortcut.

## Existing assignments

Preserve existing grade_user records.

Do not truncate or recreate populated assignment data.

## Validation

Run the following automated tests:

php artisan test --filter=AccountApprovalAccessTest

php artisan test --filter=ClassAssignmentAuditCommandTest

## Important limitation

The audit is a read-only deployment safeguard.

It does not reconstruct class assignments absent from
historical databases.

School administrators must verify and assign those
classes using authoritative school records.
## October 2026 - Legacy Access and Deployment Safety

This section takes precedence over earlier rollout steps where they differ.

### Temporary legacy protection

The legacy_class_access migration marks existing approved students
and teachers who have no grade_user assignments.

These accounts temporarily retain previous broad curriculum access.
This is not permanent class-based access or school isolation.

New registrations must remain pending until administrator approval.
Assigning verified classes or rejecting an account clears legacy access.
Do not assign every class as a migration shortcut.

### Required production deployment order

1. Back up the database and verify the recovery procedure.
2. Collect verified class assignments from school records.
3. Confirm backend tests and frontend production build pass.
4. Apply database migrations in the production backend environment
   before deploying the backend that uses the new columns.
5. Deploy the Laravel backend on Railway.
6. Verify login, registration, approval and class assignment APIs.
7. Run php artisan yourschool:audit-class-assignments.
8. Deploy the matching frontend only after backend verification.
9. Test student and teacher access with authorized test accounts.
10. Assign verified classes to all remaining legacy accounts.

### Audit interpretation

FAIL: An approved account has neither assigned classes nor legacy protection.

PASS with LEGACY warning: Existing accounts retain temporary broad
access. Record the count and resolve these accounts promptly.

PASS without LEGACY warning: No approved accounts are missing
assignments, but assignment correctness must still be verified.

The public /api/registration/grades endpoint supports registration.
It should expose only active class catalog data, not private user data.

Do not drop the legacy_class_access column while the running backend
still depends on it. Never reset production data to pass the audit.

### Final validation

Run php artisan test from the backend directory.
Run npm.cmd run build from the project root.
