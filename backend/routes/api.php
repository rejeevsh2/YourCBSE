<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InteractiveAppController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PublicContentController;
use App\Http\Controllers\Api\LessonProgressController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\PracticeController;
use App\Http\Controllers\Api\RevisionController;
use App\Http\Controllers\Api\InteractiveRevisionController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonContentController;
use App\Http\Controllers\BlogPostController;

/*
|--------------------------------------------------------------------------
| API Status
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return response()->json([
        'message' => 'YourSchool API is running successfully.',
        'version' => '1.0'
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Student Notifications
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [
        NotificationController::class,
        'index'
    ]);

    Route::patch('/notifications/read-all', [
        NotificationController::class,
        'markAllAsRead'
    ]);

    Route::patch('/notifications/{notificationId}/read', [
        NotificationController::class,
        'markAsRead'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [
        AuthController::class,
        'logout'
    ]);

    Route::get('/me', [
        AuthController::class,
        'me'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Student Lesson Progress
    |--------------------------------------------------------------------------
    */

    Route::get('/lesson-progress/continue', [
        LessonProgressController::class,
        'continueLearning'
    ]);

    Route::get('/dashboard/stats', [
        LessonProgressController::class,
        'dashboardStats'
    ]);

    Route::get('/my-courses', [
    LessonProgressController::class,
    'myCourses'
    ]);

    Route::get('/learning-path', [
    LessonProgressController::class,
    'learningPath'
    ]);

    Route::get('/recent-chapters', [
        LessonProgressController::class,
        'recentChapters'
    ]);

    Route::get('/recent-activity', [
        LessonProgressController::class,
        'recentActivity'
    ]);

    Route::get('/chapters/{chapter}/progress', [
        LessonProgressController::class,
        'chapterProgress'
    ]);

    Route::get('/lessons/{lesson}/progress', [
        LessonProgressController::class,
        'show'
    ]);

    Route::post('/lessons/{lesson}/progress/open', [
        LessonProgressController::class,
        'open'
    ]);

    Route::post('/lessons/{lesson}/progress/complete', [
        LessonProgressController::class,
        'complete'
    ]);

    Route::post('/lessons/{lesson}/progress/incomplete', [
        LessonProgressController::class,
        'incomplete'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Student Bookmarks
    |--------------------------------------------------------------------------
    */

    Route::get('/bookmarks', [
        BookmarkController::class,
        'index'
    ]);

    Route::get('/lessons/{lesson}/bookmark', [
        BookmarkController::class,
        'status'
    ]);

    Route::post('/lessons/{lesson}/bookmark', [
        BookmarkController::class,
        'store'
    ]);

    Route::delete('/lessons/{lesson}/bookmark', [
        BookmarkController::class,
        'destroy'
    ]);

        /*
    |--------------------------------------------------------------------------
    | Student Practice Center
    |--------------------------------------------------------------------------
    */

    Route::get('/practice-sets', [
        PracticeController::class,
        'index'
    ]);

    Route::get('/practice-sets/{practiceSet}', [
    PracticeController::class,
    'show'

    
]);



Route::post('/practice-sets/{practiceSet}/start', [
    PracticeController::class,
    'start'
]);

Route::get('/practice-attempts/history', [
    PracticeController::class,
    'history'
]);

Route::post('/practice-attempts/{attempt}/submit', [
    PracticeController::class,
    'submit'
]);

Route::get('/practice-attempts/{attempt}/review', [
    PracticeController::class,
    'review'
]);

/*
|--------------------------------------------------------------------------
| Student Revision Hub
|--------------------------------------------------------------------------
*/

Route::get('/interactive-revision', [
    InteractiveRevisionController::class,
    'index'
]);

Route::post('/interactive-revision/start', [
    InteractiveRevisionController::class,
    'start'
]);

Route::get('/interactive-revision/{sessionId}', [
    InteractiveRevisionController::class,
    'show'
]);

Route::post('/interactive-revision/{sessionId}/finish', [
    InteractiveRevisionController::class,
    'finish'
]);

Route::post('/interactive-revision/{sessionId}/review', [InteractiveRevisionController::class, 'review']);

Route::post('/lessons/{lesson}/revision-cards', [InteractiveRevisionController::class, 'storeCard']);

Route::get('/revision', [
    RevisionController::class,
    'index'
]);

});




/*
|--------------------------------------------------------------------------
| Public Content API
|--------------------------------------------------------------------------
|
| No admin authentication required.
| Students and website visitors can read published content.
|
*/

Route::prefix('public')->middleware('auth:sanctum')->group(function () {

    Route::get('/boards', [
        PublicContentController::class,
        'boards'
    ]);

    Route::get('/boards/{boardId}/grades', [
        PublicContentController::class,
        'grades'
    ]);

    Route::get('/grades/{gradeId}/subjects', [
        PublicContentController::class,
        'subjects'
    ]);

    Route::get('/subjects/{subjectId}/units', [
        PublicContentController::class,
        'units'
    ]);

    Route::get('/units/{unitId}/chapters', [
        PublicContentController::class,
        'chapters'
    ]);

    Route::get('/chapters/{chapterId}/lessons', [
        PublicContentController::class,
        'lessons'
    ]);

    Route::get('/lessons/{id}', [
        PublicContentController::class,
        'lesson'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Public Blog
    |--------------------------------------------------------------------------
    */

    Route::get('/blog', [
        BlogPostController::class,
        'publicIndex'
    ]);

    Route::get('/blog/{slug}', [
        BlogPostController::class,
        'publicShow'
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Content API
|--------------------------------------------------------------------------
|
| Authentication + admin role required.
|
*/

Route::middleware([
    'auth:sanctum',
    'role:admin', 'permission'
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Blog Posts
    |--------------------------------------------------------------------------
    */

    Route::get('/blog-posts', [
        BlogPostController::class,
        'index'
    ]);

    Route::get('/blog-posts/{id}', [
        BlogPostController::class,
        'show'
    ]);

    Route::post('/blog-posts', [
        BlogPostController::class,
        'store'
    ]);

    Route::put('/blog-posts/{id}', [
        BlogPostController::class,
        'update'
    ]);

    Route::delete('/blog-posts/{id}', [
        BlogPostController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Interactive Apps
    |--------------------------------------------------------------------------
    */

    Route::get('/interactive-apps', [
        InteractiveAppController::class,
        'index'
    ]);

    Route::get('/interactive-apps/{id}', [
        InteractiveAppController::class,
        'show'
    ]);

    Route::post('/interactive-apps', [
        InteractiveAppController::class,
        'store'
    ]);

    Route::put('/interactive-apps/{id}', [
        InteractiveAppController::class,
        'update'
    ]);

    Route::delete('/interactive-apps/{id}', [
        InteractiveAppController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Boards
    |--------------------------------------------------------------------------
    */

    Route::get('/boards', [
        BoardController::class,
        'index'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Grades
    |--------------------------------------------------------------------------
    */

    Route::get('/grades', [
        GradeController::class,
        'index'
    ]);

    Route::get('/grades/{id}', [
        GradeController::class,
        'show'
    ]);

    Route::post('/grades', [
        GradeController::class,
        'store'
    ]);

    Route::put('/grades/{id}', [
        GradeController::class,
        'update'
    ]);

    Route::delete('/grades/{id}', [
        GradeController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Subjects
    |--------------------------------------------------------------------------
    */

    Route::get('/subjects', [
        SubjectController::class,
        'index'
    ]);

    Route::get('/subjects/{id}', [
        SubjectController::class,
        'show'
    ]);

    Route::post('/subjects', [
        SubjectController::class,
        'store'
    ]);

    Route::put('/subjects/{id}', [
        SubjectController::class,
        'update'
    ]);

    Route::delete('/subjects/{id}', [
        SubjectController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Units
    |--------------------------------------------------------------------------
    */

    Route::get('/units', [
        UnitController::class,
        'index'
    ]);

    Route::get('/units/{id}', [
        UnitController::class,
        'show'
    ]);

    Route::post('/units', [
        UnitController::class,
        'store'
    ]);

    Route::put('/units/{id}', [
        UnitController::class,
        'update'
    ]);

    Route::delete('/units/{id}', [
        UnitController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Chapters
    |--------------------------------------------------------------------------
    */

    Route::get('/chapters', [
        ChapterController::class,
        'index'
    ]);

    Route::get('/chapters/{id}', [
        ChapterController::class,
        'show'
    ]);

    Route::post('/chapters', [
        ChapterController::class,
        'store'
    ]);

    Route::put('/chapters/{id}', [
        ChapterController::class,
        'update'
    ]);

    Route::delete('/chapters/{id}', [
        ChapterController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Lessons
    |--------------------------------------------------------------------------
    */

    Route::get('/lessons', [
        LessonController::class,
        'index'
    ]);

    Route::get('/lessons/{id}', [
        LessonController::class,
        'show'
    ]);

    Route::post('/lessons', [
        LessonController::class,
        'store'
    ]);

    Route::put('/lessons/{id}', [
        LessonController::class,
        'update'
    ]);

    Route::delete('/lessons/{id}', [
        LessonController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Lesson Contents
    |--------------------------------------------------------------------------
    */

    Route::get('/lesson-contents', [
        LessonContentController::class,
        'index'
    ]);

    Route::get('/lesson-contents/{id}', [
        LessonContentController::class,
        'show'
    ]);

    Route::post('/lesson-contents', [
        LessonContentController::class,
        'store'
    ]);

    Route::put('/lesson-contents/{id}', [
        LessonContentController::class,
        'update'
    ]);

    Route::delete('/lesson-contents/{id}', [
        LessonContentController::class,
        'destroy'
    ]);

    /*
    |--------------------------------------------------------------------------
    | Flashcard Decks
    |--------------------------------------------------------------------------
    */

    Route::get('/flashcard-decks', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'index'
    ]);

    Route::get('/flashcard-decks/{id}', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'show'
    ]);

    Route::post('/flashcard-decks', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'store'
    ]);

    Route::put('/flashcard-decks/{id}', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'update'
    ]);

    Route::delete('/flashcard-decks/{id}', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'destroy'
    ]);

    Route::post('/flashcard-decks/{deckId}/cards', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'storeCard'
    ]);

    Route::put('/flashcard-decks/{deckId}/cards/{cardId}', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'updateCard'
    ]);

    Route::delete('/flashcard-decks/{deckId}/cards/{cardId}', [
        \App\Http\Controllers\FlashcardDeckController::class,
        'destroyCard'
    ]);

});
Route::middleware(['auth:sanctum', 'role:teacher'])->prefix('teacher')->group(function () {
    $controller = \App\Http\Controllers\Api\TeacherContentController::class;
    Route::get('/chapters', [$controller, 'chapters']);
    Route::get('/lessons', [$controller, 'index']);
    Route::post('/lessons', [$controller, 'store']);
    Route::put('/lessons/{id}', [$controller, 'update']);
    Route::post('/lessons/{id}/contents', [$controller, 'addContent']);
    Route::delete('/lessons/{id}/contents/{contentId}', [$controller, 'removeContent']);
});

Route::middleware(['auth:sanctum', 'role:admin', 'permission'])->prefix('admin')->group(function () {
    $controller = \App\Http\Controllers\Api\AdminWorkspaceController::class;
    Route::get('/stats', [$controller, 'stats']);
    Route::get('/users', [$controller, 'users']);
    Route::post('/users', [$controller, 'storeUser']);
    Route::get('/practice-sets', [$controller, 'practiceSets']);
    Route::post('/practice-sets', [$controller, 'storePracticeSet']);
    Route::patch('/practice-sets/{id}', [$controller, 'publishPracticeSet']);
});

Route::get('/library/catalog', [\App\Http\Controllers\Api\ResourceLibraryController::class,'index'])
    ->middleware('auth:sanctum');

Route::get('/library/resources/{id}/file', [\App\Http\Controllers\Api\ResourceLibraryController::class,'file'])
    ->middleware('auth:sanctum');

Route::get('/library/resources/{id}', [\App\Http\Controllers\Api\ResourceLibraryController::class,'show'])
    ->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->group(function(){
    $tools=\App\Http\Controllers\Api\StudentToolsController::class;
    Route::get('/profile',[$tools,'profile']);Route::put('/profile',[$tools,'updateProfile']);
    Route::put('/profile/password',[$tools,'password'])->middleware('throttle:5,1');
    Route::get('/student/planner/tasks',[$tools,'tasks']);Route::post('/student/planner/tasks',[$tools,'storeTask']);
    Route::patch('/student/planner/tasks/{id}',[$tools,'updateTask']);Route::delete('/student/planner/tasks/{id}',[$tools,'deleteTask']);
    Route::get('/library/account-state',[\App\Http\Controllers\Api\ResourceLibraryController::class,'state']);
    Route::patch('/library/resources/{id}/state',[\App\Http\Controllers\Api\ResourceLibraryController::class,'update']);
});

Route::middleware('auth:sanctum')->group(function(){
 $c=\App\Http\Controllers\Api\NotificationExtrasController::class;
 Route::get('/notifications/center',[$c,'center']);Route::delete('/notifications/{id}',[$c,'delete']);
 Route::get('/notifications/preferences',[$c,'preferences']);Route::patch('/notifications/preferences',[$c,'updatePreference']);
 Route::get('/notifications/reminders',[$c,'reminders']);Route::get('/notifications/achievements',[$c,'achievements']);
});
Route::post('/admin/announcements',[\App\Http\Controllers\Api\NotificationExtrasController::class,'announce'])->middleware(['auth:sanctum','role:admin', 'permission','throttle:5,1']);

/*
|--------------------------------------------------------------------------
| Blog API
|--------------------------------------------------------------------------
|
| Public visitors may read published posts.
| Admin users may manage all blog posts.
|
*/

Route::prefix('public')->middleware('auth:sanctum')->group(function () {

    Route::get('/blog', [
        \App\Http\Controllers\BlogPostController::class,
        'publicIndex'
    ]);

    Route::get('/blog/{slug}', [
        \App\Http\Controllers\BlogPostController::class,
        'publicShow'
    ]);
});

Route::middleware([
    'auth:sanctum',
    'role:admin', 'permission'
])->group(function () {

    Route::get('/blog-posts', [
        \App\Http\Controllers\BlogPostController::class,
        'index'
    ]);

    Route::get('/blog-posts/{id}', [
        \App\Http\Controllers\BlogPostController::class,
        'show'
    ]);

    Route::post('/blog-posts', [
        \App\Http\Controllers\BlogPostController::class,
        'store'
    ]);

    Route::put('/blog-posts/{id}', [
        \App\Http\Controllers\BlogPostController::class,
        'update'
    ]);

    Route::delete('/blog-posts/{id}', [
        \App\Http\Controllers\BlogPostController::class,
        'destroy'
    ]);
});

/*
|--------------------------------------------------------------------------
| Media Library API
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin', 'permission'
])->group(function () {

    Route::get('/media-assets', [
        \App\Http\Controllers\MediaAssetController::class,
        'index'
    ]);

    Route::get('/media-assets/{id}', [
        \App\Http\Controllers\MediaAssetController::class,
        'show'
    ]);

    Route::post('/media-assets', [
        \App\Http\Controllers\MediaAssetController::class,
        'store'
    ]);

    Route::put('/media-assets/{id}', [
        \App\Http\Controllers\MediaAssetController::class,
        'update'
    ]);

    Route::post('/media-assets/{id}/replace', [
        \App\Http\Controllers\MediaAssetController::class,
        'replace'
    ]);

    Route::delete('/media-assets/{id}', [
        \App\Http\Controllers\MediaAssetController::class,
        'destroy'
    ]);
});

/*
|--------------------------------------------------------------------------
| Media Library API
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin', 'permission'
])->group(function () {

    Route::get('/media-assets', [
        \App\Http\Controllers\MediaAssetController::class,
        'index'
    ]);

    Route::get('/media-assets/{id}', [
        \App\Http\Controllers\MediaAssetController::class,
        'show'
    ]);

    Route::post('/media-assets', [
        \App\Http\Controllers\MediaAssetController::class,
        'store'
    ]);

    Route::put('/media-assets/{id}', [
        \App\Http\Controllers\MediaAssetController::class,
        'update'
    ]);

    Route::post('/media-assets/{id}/replace', [
        \App\Http\Controllers\MediaAssetController::class,
        'replace'
    ]);

    Route::delete('/media-assets/{id}', [
        \App\Http\Controllers\MediaAssetController::class,
        'destroy'
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Parent / Guardian Management
|--------------------------------------------------------------------------
|
| Administrator-only parent accounts and parent-to-student relationships.
|
*/

Route::middleware([
    'auth:sanctum',
    'role:admin', 'permission',
])->group(function () {
    Route::get(
        '/admin/parents',
        [
            \App\Http\Controllers\Api\ParentAdminController::class,
            'index'
        ]
    );

    Route::post(
        '/admin/parents',
        [
            \App\Http\Controllers\Api\ParentAdminController::class,
            'store'
        ]
    );

    Route::put(
        '/admin/parents/{id}',
        [
            \App\Http\Controllers\Api\ParentAdminController::class,
            'update'
        ]
    );

    Route::delete(
        '/admin/parents/{id}',
        [
            \App\Http\Controllers\Api\ParentAdminController::class,
            'destroy'
        ]
    );

    Route::post(
        '/admin/parents/{parentId}/students',
        [
            \App\Http\Controllers\Api\ParentAdminController::class,
            'linkStudent'
        ]
    );

    Route::delete(
        '/admin/parents/{parentId}/students/{studentId}',
        [
            \App\Http\Controllers\Api\ParentAdminController::class,
            'unlinkStudent'
        ]
    );
});

/*
|--------------------------------------------------------------------------
| Admin Roles & Permissions
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin', 'permission',
])->group(function () {
    Route::get(
        '/admin/rbac',
        [
            \App\Http\Controllers\Api\AdminRoleController::class,
            'index'
        ]
    );

    Route::post(
        '/admin/rbac/roles',
        [
            \App\Http\Controllers\Api\AdminRoleController::class,
            'storeRole'
        ]
    );

    Route::put(
        '/admin/rbac/roles/{id}',
        [
            \App\Http\Controllers\Api\AdminRoleController::class,
            'updateRole'
        ]
    );

    Route::put(
        '/admin/rbac/roles/{id}/permissions',
        [
            \App\Http\Controllers\Api\AdminRoleController::class,
            'setPermissions'
        ]
    );

    Route::delete(
        '/admin/rbac/roles/{id}',
        [
            \App\Http\Controllers\Api\AdminRoleController::class,
            'destroyRole'
        ]
    );

    Route::put(
        '/admin/rbac/users/{userId}/roles',
        [
            \App\Http\Controllers\Api\AdminRoleController::class,
            'assignUserRoles'
        ]
    );
});

/*
|--------------------------------------------------------------------------
| Approval Workflow
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:approvals.manage',
])->group(function () {

    Route::get(
        '/admin/approvals',
        [
            \App\Http\Controllers\Api\AdminApprovalController::class,
            'index'
        ]
    );

    Route::patch(
        '/admin/approvals/{id}',
        [
            \App\Http\Controllers\Api\AdminApprovalController::class,
            'review'
        ]
    );
});

Route::middleware([
    'auth:sanctum',
    'role:teacher',
])->group(function () {

    Route::post(
        '/teacher/lessons/{id}/submit-for-approval',
        [
            \App\Http\Controllers\Api\TeacherApprovalController::class,
            'submitLesson'
        ]
    );
});

/*
|--------------------------------------------------------------------------
| Admin Support
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:support.manage',
])->group(function () {

    Route::get(
        '/admin/support',
        [
            \App\Http\Controllers\Api\AdminSupportController::class,
            'index'
        ]
    );

    Route::get(
        '/admin/support/{id}',
        [
            \App\Http\Controllers\Api\AdminSupportController::class,
            'show'
        ]
    );

    Route::patch(
        '/admin/support/{id}',
        [
            \App\Http\Controllers\Api\AdminSupportController::class,
            'update'
        ]
    );

    Route::delete(
        '/admin/support/{id}',
        [
            \App\Http\Controllers\Api\AdminSupportController::class,
            'destroy'
        ]
    );

    Route::post(
        '/admin/support/{id}/assign-to-me',
        [
            \App\Http\Controllers\Api\AdminSupportController::class,
            'assignToMe'
        ]
    );

    Route::post(
        '/admin/support/{id}/messages',
        [
            \App\Http\Controllers\Api\AdminSupportController::class,
            'addMessage'
        ]
    );
});

/*
|--------------------------------------------------------------------------
| Admin Integrations
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:integrations.manage',
])->group(function () {

    Route::get(
        '/admin/integrations',
        [
            \App\Http\Controllers\Api\AdminIntegrationController::class,
            'index'
        ]
    );

    Route::get(
        '/admin/integrations/{id}',
        [
            \App\Http\Controllers\Api\AdminIntegrationController::class,
            'show'
        ]
    );

    Route::patch(
        '/admin/integrations/{id}',
        [
            \App\Http\Controllers\Api\AdminIntegrationController::class,
            'update'
        ]
    );

    Route::post(
        '/admin/integrations/{id}/test',
        [
            \App\Http\Controllers\Api\AdminIntegrationController::class,
            'test'
        ]
    );

    Route::patch(
        '/admin/integrations/{id}/toggle',
        [
            \App\Http\Controllers\Api\AdminIntegrationController::class,
            'toggle'
        ]
    );
});

/*
|--------------------------------------------------------------------------
| Admin Security Center
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:security.manage',
])->group(function () {
    Route::get('/admin/security', [
        \App\Http\Controllers\Api\AdminSecurityController::class,
        'index',
    ]);

    Route::patch('/admin/security/settings', [
        \App\Http\Controllers\Api\AdminSecurityController::class,
        'updateSettings',
    ]);

    Route::patch('/admin/security/alerts/{id}/resolve', [
        \App\Http\Controllers\Api\AdminSecurityController::class,
        'resolveAlert',
    ]);

    Route::post('/admin/security/blocked-ips', [
        \App\Http\Controllers\Api\AdminSecurityController::class,
        'blockIp',
    ]);

    Route::patch('/admin/security/blocked-ips/{id}/unblock', [
        \App\Http\Controllers\Api\AdminSecurityController::class,
        'unblockIp',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin System Logs
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:logs.view',
])->group(function () {
    Route::get('/admin/system-logs', [
        \App\Http\Controllers\Api\AdminSystemLogController::class,
        'index',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Audit Logs
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:audit.view',
])->group(function () {
    Route::get('/admin/audit-logs', [
        \App\Http\Controllers\Api\AdminAuditLogController::class,
        'index',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Website Settings
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:settings.manage',
])->group(function () {
    Route::get('/admin/website-settings', [
        \App\Http\Controllers\Api\AdminWebsiteSettingController::class,
        'index',
    ]);

    Route::patch('/admin/website-settings', [
        \App\Http\Controllers\Api\AdminWebsiteSettingController::class,
        'update',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin SEO Manager
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:seo.manage',
])->group(function () {
    Route::get('/admin/seo-pages', [
        \App\Http\Controllers\Api\AdminSeoPageController::class,
        'index',
    ]);

    Route::post('/admin/seo-pages', [
        \App\Http\Controllers\Api\AdminSeoPageController::class,
        'store',
    ]);

    Route::patch('/admin/seo-pages/{seoPage}', [
        \App\Http\Controllers\Api\AdminSeoPageController::class,
        'update',
    ]);

    Route::delete('/admin/seo-pages/{seoPage}', [
        \App\Http\Controllers\Api\AdminSeoPageController::class,
        'destroy',
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin User Account Updates
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    'role:admin',
    'permission:users.manage',
])->group(function () {
    Route::patch('/admin/users/{user}', [
        \App\Http\Controllers\Api\AdminWorkspaceController::class,
        'updateUser',
    ]);
});

/*
|--------------------------------------------------------------------------
| Teacher Lesson Content Update
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    'role:teacher',
])->group(function () {
    Route::put('/teacher/lessons/{id}/contents/{contentId}', [
        \App\Http\Controllers\Api\TeacherContentController::class,
        'updateContent',
    ]);
});

/*
|--------------------------------------------------------------------------
| Teacher Flashcards
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    'role:teacher',
])->group(function () {
    Route::get('/teacher/flashcard-decks', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'index',
    ]);

    Route::post('/teacher/flashcard-decks', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'store',
    ]);

    Route::get('/teacher/flashcard-decks/{id}', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'show',
    ]);

    Route::put('/teacher/flashcard-decks/{id}', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'update',
    ]);

    Route::delete('/teacher/flashcard-decks/{id}', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'destroy',
    ]);

    Route::post('/teacher/flashcard-decks/{deckId}/cards', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'storeCard',
    ]);

    Route::put('/teacher/flashcard-decks/{deckId}/cards/{cardId}', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'updateCard',
    ]);

    Route::delete('/teacher/flashcard-decks/{deckId}/cards/{cardId}', [
        \App\Http\Controllers\Api\TeacherFlashcardController::class,
        'destroyCard',
    ]);
});

/*
|--------------------------------------------------------------------------
| Teacher Interactive Apps
|--------------------------------------------------------------------------
|
| Teacher access is scoped through lesson.created_by.
| Teacher-created apps remain drafts until publication is handled
| through the administrative workflow.
|
*/

Route::middleware([
    'auth:sanctum',
    'role:teacher',
])->group(function () {

    Route::get(
        '/teacher/interactive-apps',
        [
            \App\Http\Controllers\Api\TeacherInteractiveAppController::class,
            'index'
        ]
    );

    Route::post(
        '/teacher/interactive-apps',
        [
            \App\Http\Controllers\Api\TeacherInteractiveAppController::class,
            'store'
        ]
    );

    Route::get(
        '/teacher/interactive-apps/{id}',
        [
            \App\Http\Controllers\Api\TeacherInteractiveAppController::class,
            'show'
        ]
    );

    Route::put(
        '/teacher/interactive-apps/{id}',
        [
            \App\Http\Controllers\Api\TeacherInteractiveAppController::class,
            'update'
        ]
    );

    Route::delete(
        '/teacher/interactive-apps/{id}',
        [
            \App\Http\Controllers\Api\TeacherInteractiveAppController::class,
            'destroy'
        ]
    );
});

/*
|--------------------------------------------------------------------------
| Public Contact
|--------------------------------------------------------------------------
| Public visitors can submit a support request.
| Requests are stored in the existing Admin Support ticket system.
|--------------------------------------------------------------------------
*/

Route::post(
    '/public/contact',
    [
        \App\Http\Controllers\Api\PublicContactController::class,
        'store'
    ]
)->middleware(['auth:sanctum', 'throttle:5,1']);
