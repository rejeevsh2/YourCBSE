<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->string('description', 500)->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        Schema::create('admin_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120)->unique();
            $table->string('label', 150);
            $table->string('module', 100);
            $table->string('description', 500)->nullable();
            $table->timestamps();

            $table->index('module');
        });

        Schema::create('admin_role_permission', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->constrained('admin_roles')
                ->cascadeOnDelete();

            $table->foreignId('permission_id')
                ->constrained('admin_permissions')
                ->cascadeOnDelete();

            $table->primary([
                'role_id',
                'permission_id',
            ]);
        });

        Schema::create('admin_role_user', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->constrained('admin_roles')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->primary([
                'role_id',
                'user_id',
            ]);

            $table->index('user_id');
        });

        $now = now();

        $permissions = [
            [
                'key' => 'dashboard.view',
                'label' => 'Dashboard',
                'module' => 'Dashboard',
                'description' => 'View the Admin dashboard.',
            ],
            [
                'key' => 'users.manage',
                'label' => 'User management',
                'module' => 'User management',
                'description' => 'Manage student, teacher and admin accounts.',
            ],
            [
                'key' => 'curriculum.manage',
                'label' => 'Curriculum',
                'module' => 'Curriculum',
                'description' => 'Manage grades, subjects, units, chapters and lessons.',
            ],
            [
                'key' => 'content.manage',
                'label' => 'Content authoring',
                'module' => 'Content authoring',
                'description' => 'Manage lesson resources and learning content.',
            ],
            [
                'key' => 'approvals.manage',
                'label' => 'Approvals',
                'module' => 'Approvals',
                'description' => 'Review and manage approval workflows.',
            ],
            [
                'key' => 'media.manage',
                'label' => 'Media library',
                'module' => 'Media library',
                'description' => 'Upload, edit and delete media assets.',
            ],
            [
                'key' => 'blog.manage',
                'label' => 'Blog',
                'module' => 'Blog',
                'description' => 'Create, edit and publish blog posts.',
            ],
            [
                'key' => 'practice.manage',
                'label' => 'Question bank & practice',
                'module' => 'Question bank & practice',
                'description' => 'Manage questions and practice sets.',
            ],
            [
                'key' => 'analytics.view',
                'label' => 'Analytics',
                'module' => 'Analytics',
                'description' => 'View platform analytics.',
            ],
            [
                'key' => 'reports.view',
                'label' => 'Reports',
                'module' => 'Reports',
                'description' => 'View and download administrative reports.',
            ],
            [
                'key' => 'parents.manage',
                'label' => 'Parents',
                'module' => 'Parents',
                'description' => 'Manage parent accounts and student links.',
            ],
            [
                'key' => 'roles.manage',
                'label' => 'Roles & permissions',
                'module' => 'Roles & permissions',
                'description' => 'Create roles, assign permissions and assign admin roles.',
            ],
            [
                'key' => 'notifications.manage',
                'label' => 'Notifications',
                'module' => 'Notifications',
                'description' => 'Manage administrative notifications and announcements.',
            ],
            [
                'key' => 'support.manage',
                'label' => 'Support',
                'module' => 'Support',
                'description' => 'Manage support requests.',
            ],
            [
                'key' => 'integrations.manage',
                'label' => 'Integrations',
                'module' => 'Integrations',
                'description' => 'Manage external service integrations.',
            ],
            [
                'key' => 'security.manage',
                'label' => 'Security',
                'module' => 'Security',
                'description' => 'Manage security configuration and alerts.',
            ],
            [
                'key' => 'logs.view',
                'label' => 'System logs',
                'module' => 'System logs',
                'description' => 'View application and system logs.',
            ],
            [
                'key' => 'audit.view',
                'label' => 'Audit logs',
                'module' => 'Audit logs',
                'description' => 'View administrative audit history.',
            ],
            [
                'key' => 'seo.manage',
                'label' => 'SEO manager',
                'module' => 'SEO manager',
                'description' => 'Manage SEO settings.',
            ],
            [
                'key' => 'settings.manage',
                'label' => 'System settings',
                'module' => 'System settings',
                'description' => 'Change system-wide settings.',
            ],
            [
                'key' => 'backup.manage',
                'label' => 'Backups',
                'module' => 'Backups',
                'description' => 'Create and manage backups.',
            ],
        ];

        foreach ($permissions as &$permission) {
            $permission['created_at'] = $now;
            $permission['updated_at'] = $now;
        }

        unset($permission);

        DB::table('admin_permissions')->insert($permissions);

        $superAdminId = DB::table('admin_roles')->insertGetId([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Unrestricted access to every administrative module.',
            'is_system' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $adminId = DB::table('admin_roles')->insertGetId([
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'General administration without critical system controls.',
            'is_system' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $allPermissionIds = DB::table('admin_permissions')
            ->pluck('id');

        foreach ($allPermissionIds as $permissionId) {
            DB::table('admin_role_permission')->insert([
                'role_id' => $superAdminId,
                'permission_id' => $permissionId,
            ]);
        }

        $standardAdminPermissions = [
            'dashboard.view',
            'users.manage',
            'curriculum.manage',
            'content.manage',
            'approvals.manage',
            'media.manage',
            'blog.manage',
            'practice.manage',
            'analytics.view',
            'reports.view',
            'parents.manage',
            'notifications.manage',
            'support.manage',
            'integrations.manage',
            'logs.view',
            'audit.view',
            'seo.manage',
        ];

        $standardPermissionIds = DB::table('admin_permissions')
            ->whereIn('key', $standardAdminPermissions)
            ->pluck('id');

        foreach ($standardPermissionIds as $permissionId) {
            DB::table('admin_role_permission')->insert([
                'role_id' => $adminId,
                'permission_id' => $permissionId,
            ]);
        }

        $existingAdminIds = DB::table('users')
            ->where('role', 'admin')
            ->pluck('id');

        foreach ($existingAdminIds as $userId) {
            DB::table('admin_role_user')->insert([
                'role_id' => $superAdminId,
                'user_id' => $userId,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_role_user');
        Schema::dropIfExists('admin_role_permission');
        Schema::dropIfExists('admin_permissions');
        Schema::dropIfExists('admin_roles');
    }
};