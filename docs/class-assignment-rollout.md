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