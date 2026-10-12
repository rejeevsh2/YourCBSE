<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminRoleController extends Controller
{
    private function ensureCanManage(Request $request): void
    {
        $user = $request->user();

        abort_unless(
            $user && $user->role === 'admin',
            403,
            'Access denied.'
        );

        $allowed = DB::table('admin_role_user as aru')
            ->join(
                'admin_roles as ar',
                'ar.id',
                '=',
                'aru.role_id'
            )
            ->leftJoin(
                'admin_role_permission as arp',
                'arp.role_id',
                '=',
                'ar.id'
            )
            ->leftJoin(
                'admin_permissions as ap',
                'ap.id',
                '=',
                'arp.permission_id'
            )
            ->where('aru.user_id', $user->id)
            ->where(function ($query) {
                $query
                    ->where('ar.slug', 'super-admin')
                    ->orWhere('ap.key', 'roles.manage');
            })
            ->exists();

        abort_unless(
            $allowed,
            403,
            'You do not have permission to manage roles.'
        );
    }

    public function index(Request $request)
    {
        $this->ensureCanManage($request);

        $rolePermissions = DB::table(
            'admin_role_permission as arp'
        )
            ->join(
                'admin_permissions as ap',
                'ap.id',
                '=',
                'arp.permission_id'
            )
            ->select([
                'arp.role_id',
                'ap.id',
                'ap.key',
                'ap.label',
                'ap.module',
            ])
            ->orderBy('ap.module')
            ->get()
            ->groupBy('role_id');

        $memberCounts = DB::table('admin_role_user')
            ->select(
                'role_id',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('role_id')
            ->pluck('total', 'role_id');

        $roles = DB::table('admin_roles')
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get()
            ->map(function ($role) use (
                $rolePermissions,
                $memberCounts
            ) {
                $permissions = $rolePermissions
                    ->get($role->id, collect());

                return [
                    'id' => (int) $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                    'description' => $role->description,
                    'is_system' => (bool) $role->is_system,
                    'members' => (int) (
                        $memberCounts[$role->id] ?? 0
                    ),
                    'permission_keys' => $permissions
                        ->pluck('key')
                        ->values()
                        ->all(),
                ];
            })
            ->values();

        $permissions = DB::table('admin_permissions')
            ->orderBy('module')
            ->get([
                'id',
                'key',
                'label',
                'module',
                'description',
            ])
            ->map(fn ($permission) => [
                'id' => (int) $permission->id,
                'key' => $permission->key,
                'label' => $permission->label,
                'module' => $permission->module,
                'description' => $permission->description,
            ])
            ->values();

        $assignedRoles = DB::table(
            'admin_role_user as aru'
        )
            ->join(
                'admin_roles as ar',
                'ar.id',
                '=',
                'aru.role_id'
            )
            ->select([
                'aru.user_id',
                'ar.id as role_id',
                'ar.name as role_name',
                'ar.slug as role_slug',
            ])
            ->orderBy('ar.name')
            ->get()
            ->groupBy('user_id');

        $admins = User::query()
            ->where('role', 'admin')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'created_at',
            ])
            ->map(function (User $admin) use ($assignedRoles) {
                $roles = $assignedRoles
                    ->get($admin->id, collect());

                return [
                    'id' => (int) $admin->id,
                    'name' => $admin->name,
                    'email' => $admin->email,
                    'created_at' => $admin->created_at,
                    'role_ids' => $roles
                        ->pluck('role_id')
                        ->map(fn ($id) => (int) $id)
                        ->values()
                        ->all(),
                    'roles' => $roles
                        ->map(fn ($role) => [
                            'id' => (int) $role->role_id,
                            'name' => $role->role_name,
                            'slug' => $role->role_slug,
                        ])
                        ->values()
                        ->all(),
                ];
            })
            ->values();

        $platformCounts = DB::table('users')
            ->select(
                'role',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('role')
            ->pluck('total', 'role');

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions,
            'admins' => $admins,

            'platform_roles' => [
                [
                    'key' => 'admin',
                    'label' => 'Admin',
                    'members' => (int) (
                        $platformCounts['admin'] ?? 0
                    ),
                ],
                [
                    'key' => 'teacher',
                    'label' => 'Teacher',
                    'members' => (int) (
                        $platformCounts['teacher'] ?? 0
                    ),
                ],
                [
                    'key' => 'student',
                    'label' => 'Student',
                    'members' => (int) (
                        $platformCounts['student'] ?? 0
                    ),
                ],
                [
                    'key' => 'parent',
                    'label' => 'Parent',
                    'members' => (int) (
                        $platformCounts['parent'] ?? 0
                    ),
                ],
            ],
        ]);
    }

    public function storeRole(Request $request)
    {
        $this->ensureCanManage($request);

        $data = $request->validate([
            'name' =>
                'required|string|max:100|unique:admin_roles,name',

            'description' =>
                'nullable|string|max:500',

            'permission_keys' =>
                'nullable|array',

            'permission_keys.*' => [
                'string',
                Rule::exists(
                    'admin_permissions',
                    'key'
                ),
            ],
        ]);

        $roleId = DB::transaction(
            function () use ($data) {
                $baseSlug = Str::slug(
                    $data['name']
                );

                $slug = $baseSlug;
                $suffix = 2;

                while (
                    DB::table('admin_roles')
                        ->where('slug', $slug)
                        ->exists()
                ) {
                    $slug =
                        $baseSlug .
                        '-' .
                        $suffix;

                    $suffix++;
                }

                $roleId = DB::table(
                    'admin_roles'
                )->insertGetId([
                    'name' => $data['name'],
                    'slug' => $slug,
                    'description' =>
                        $data['description']
                            ?? null,
                    'is_system' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $keys =
                    $data['permission_keys']
                        ?? [];

                $permissionIds = DB::table(
                    'admin_permissions'
                )
                    ->whereIn('key', $keys)
                    ->pluck('id');

                foreach (
                    $permissionIds as $permissionId
                ) {
                    DB::table(
                        'admin_role_permission'
                    )->insert([
                        'role_id' =>
                            $roleId,
                        'permission_id' =>
                            $permissionId,
                    ]);
                }

                return $roleId;
            }
        );

        return response()->json([
            'message' =>
                'Admin role created successfully.',
            'role_id' => $roleId,
        ], 201);
    }

    public function updateRole(
        Request $request,
        int $id
    ) {
        $this->ensureCanManage($request);

        $role = DB::table('admin_roles')
            ->where('id', $id)
            ->first();

        abort_unless(
            $role,
            404,
            'Admin role not found.'
        );

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique(
                    'admin_roles',
                    'name'
                )->ignore($id),
            ],

            'description' =>
                'nullable|string|max:500',
        ]);

        if (
            $role->is_system &&
            $data['name'] !== $role->name
        ) {
            throw ValidationException::withMessages([
                'name' =>
                    'System role names cannot be changed.',
            ]);
        }

        DB::table('admin_roles')
            ->where('id', $id)
            ->update([
                'name' => $data['name'],
                'description' =>
                    $data['description']
                        ?? null,
                'updated_at' => now(),
            ]);

        return response()->json([
            'message' =>
                'Admin role updated successfully.',
        ]);
    }

    public function setPermissions(
        Request $request,
        int $id
    ) {
        $this->ensureCanManage($request);

        $role = DB::table('admin_roles')
            ->where('id', $id)
            ->first();

        abort_unless(
            $role,
            404,
            'Admin role not found.'
        );

        $data = $request->validate([
            'permission_keys' =>
                'required|array',

            'permission_keys.*' => [
                'string',
                Rule::exists(
                    'admin_permissions',
                    'key'
                ),
            ],
        ]);

        if (
            $role->slug === 'super-admin'
        ) {
            throw ValidationException::withMessages([
                'permission_keys' =>
                    'Super Admin always has every permission.',
            ]);
        }

        DB::transaction(
            function () use ($id, $data) {
                DB::table(
                    'admin_role_permission'
                )
                    ->where(
                        'role_id',
                        $id
                    )
                    ->delete();

                $permissionIds = DB::table(
                    'admin_permissions'
                )
                    ->whereIn(
                        'key',
                        $data[
                            'permission_keys'
                        ]
                    )
                    ->pluck('id');

                foreach (
                    $permissionIds as $permissionId
                ) {
                    DB::table(
                        'admin_role_permission'
                    )->insert([
                        'role_id' => $id,
                        'permission_id' =>
                            $permissionId,
                    ]);
                }
            }
        );

        return response()->json([
            'message' =>
                'Permissions updated successfully.',
        ]);
    }

    public function assignUserRoles(
        Request $request,
        int $userId
    ) {
        $this->ensureCanManage($request);

        $admin = User::query()
            ->where('role', 'admin')
            ->findOrFail($userId);

        $data = $request->validate([
            'role_ids' =>
                'required|array|min:1',

            'role_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(
                    'admin_roles',
                    'id'
                ),
            ],
        ]);

        $superAdmin = DB::table(
            'admin_roles'
        )
            ->where(
                'slug',
                'super-admin'
            )
            ->first();

        if ($superAdmin) {
            $currentlySuper = DB::table(
                'admin_role_user'
            )
                ->where(
                    'user_id',
                    $admin->id
                )
                ->where(
                    'role_id',
                    $superAdmin->id
                )
                ->exists();

            $willRemainSuper = in_array(
                (int) $superAdmin->id,
                array_map(
                    'intval',
                    $data['role_ids']
                ),
                true
            );

            if (
                $currentlySuper &&
                !$willRemainSuper
            ) {
                $otherSuperAdmins = DB::table(
                    'admin_role_user'
                )
                    ->where(
                        'role_id',
                        $superAdmin->id
                    )
                    ->where(
                        'user_id',
                        '!=',
                        $admin->id
                    )
                    ->count();

                if (
                    $otherSuperAdmins === 0
                ) {
                    throw ValidationException::withMessages([
                        'role_ids' =>
                            'At least one Super Admin must remain assigned.',
                    ]);
                }
            }
        }

        DB::transaction(
            function () use (
                $admin,
                $data
            ) {
                DB::table(
                    'admin_role_user'
                )
                    ->where(
                        'user_id',
                        $admin->id
                    )
                    ->delete();

                foreach (
                    $data['role_ids'] as $roleId
                ) {
                    DB::table(
                        'admin_role_user'
                    )->insert([
                        'role_id' =>
                            (int) $roleId,
                        'user_id' =>
                            $admin->id,
                    ]);
                }
            }
        );

        return response()->json([
            'message' =>
                'Admin role assignments updated successfully.',
        ]);
    }

    public function destroyRole(
        Request $request,
        int $id
    ) {
        $this->ensureCanManage($request);

        $role = DB::table('admin_roles')
            ->where('id', $id)
            ->first();

        abort_unless(
            $role,
            404,
            'Admin role not found.'
        );

        if ($role->is_system) {
            throw ValidationException::withMessages([
                'role' =>
                    'System roles cannot be deleted.',
            ]);
        }

        DB::table('admin_roles')
            ->where('id', $id)
            ->delete();

        return response()->json([
            'message' =>
                'Admin role deleted successfully.',
        ]);
    }
}