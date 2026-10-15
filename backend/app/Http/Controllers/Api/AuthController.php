<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\LoginEvent;
use App\Models\SecurityAlert;
use App\Models\SecuritySetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * List active grades that may be requested during registration.
     */
    public function registrationGrades()
    {
        return response()->json([
            'grades' => DB::table('grades')
                ->where('is_active', true)
                ->orderBy('grade_number')
                ->get([
                    'id',
                    'name',
                    'grade_number',
                ]),
        ]);
    }

    /**
     * Register a new student or teacher.
     *
     * Public registrations are always pending until an administrator reviews
     * the account. Students receive their single class during approval.
     * Teachers may request one or more classes while registering.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'mobile' => 'nullable|string|max:30',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => [
                'required',
                Rule::in([
                    'student',
                    'teacher',
                ]),
            ],
            'grade_ids' => [
                'prohibited_if:role,student',
                'required_if:role,teacher',
                'array',
                'min:1',
                'max:12',
            ],
            'grade_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(
                    'grades',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'is_active',
                            true
                        )
                ),
            ],
        ]);

        $user = DB::transaction(
            function () use ($validated) {
                $user = new User([
                    'name' => $validated['name'],
                    'mobile' => $validated['mobile'] ?? null,
                    'email' => $validated['email'],
                    'role' => $validated['role'],
                    'password' => $validated['password'],
                ]);

                $user->approval_status = 'pending';
                $user->approved_at = null;
                $user->approved_by = null;
                $user->save();

                if ($user->role === 'teacher') {
                    $user->grades()->sync(
                        $validated['grade_ids']
                    );
                }

                return $user->load(
                    'grades:id,name,grade_number'
                );
            }
        );

        return response()->json([
            'message' =>
                'Registration submitted. An administrator must approve your account before you can sign in.',
            'user' => $user,
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials['email'] = trim($credentials['email']);

        $email = $credentials['email'];
        $ipAddress = $request->ip();
        $settings = SecuritySetting::current();

        $candidateUser = User::query()
            ->where('email', $email)
            ->first();

        /*
        |--------------------------------------------------------------------------
        | Existing IP block
        |--------------------------------------------------------------------------
        */
        if ($ipAddress !== null) {
            $blockedIp = $this->currentIpBlock($ipAddress);

            if ($blockedIp !== null) {
                $this->recordLoginEvent(
                    $request,
                    $email,
                    'failed',
                    'blocked_ip',
                    $candidateUser
                );

                return response()->json([
                    'message' => 'Too many failed login attempts. Please try again later.',
                ], 429);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Admin IP restriction
        |--------------------------------------------------------------------------
        |
        | This is checked only for known admin accounts.
        |
        */
        if (
            $candidateUser !== null
            && $this->isAdminUser($candidateUser)
            && $settings->admin_ip_restriction_enabled
            && !$this->adminIpIsAllowed($settings, $ipAddress)
        ) {
            $event = $this->recordLoginEvent(
                $request,
                $email,
                'failed',
                'admin_ip_restricted',
                $candidateUser
            );

            $this->createSecurityAlertIfNeeded(
                $settings,
                [
                    'type' => 'admin_ip_restricted',
                    'title' => 'Admin login blocked by IP policy',
                    'severity' => 'high',
                    'detail' => 'An admin login was rejected because the source IP is not on the allowed list.',
                    'ip_address' => $ipAddress,
                    'user_id' => $candidateUser->id,
                    'login_event_id' => $event->id,
                    'metadata' => [
                        'email' => $email,
                    ],
                ]
            );

            return response()->json([
                'message' => 'Access from this IP address is not allowed for this admin account.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Credential verification
        |--------------------------------------------------------------------------
        */
        if (!auth()->attempt($credentials)) {
            $event = $this->recordLoginEvent(
                $request,
                $email,
                'failed',
                'invalid_credentials',
                $candidateUser
            );

            if (
                $settings->failed_login_lockout_enabled
                && $ipAddress !== null
            ) {
                $this->applyFailedLoginProtection(
                    $settings,
                    $ipAddress,
                    $email,
                    $candidateUser,
                    $event
                );
            }

            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        /** @var User $user */
        $user = auth()->user();

        if ($user->paused_at !== null) {
            auth()->logout();

            $this->recordLoginEvent(
                $request,
                $email,
                'failed',
                'account_paused',
                $user
            );

            return response()->json([
                'message' => 'This account is temporarily paused. Please contact your school administrator.',
                'code' => 'account-paused',
            ], 403);
        }

        if (
            in_array(
                $user->role,
                ['student', 'teacher'],
                true
            )
        ) {
            if ($user->approval_status === 'pending') {
                auth()->logout();
    
                $this->recordLoginEvent(
                    $request,
                    $email,
                    'failed',
                    'pending_approval',
                    $user
                );
    
                return response()->json([
                    'message' =>
                        'Your account is waiting for administrator approval.',
                    'code' => 'account-pending-approval',
                ], 403);
            }
    
            if ($user->approval_status === 'rejected') {
                auth()->logout();
    
                $this->recordLoginEvent(
                    $request,
                    $email,
                    'failed',
                    'account_rejected',
                    $user
                );
    
                return response()->json([
                    'message' =>
                        'This account was not approved. Please contact the YourSchool administrator.',
                    'code' => 'account-rejected',
                ], 403);
            }
    
            if ($user->approval_status !== 'approved') {
                auth()->logout();
    
                $this->recordLoginEvent(
                    $request,
                    $email,
                    'failed',
                    'approval_status_invalid',
                    $user
                );
    
                return response()->json([
                    'message' =>
                        'This account is not available for sign in.',
                ], 403);
            }
        }

        $this->recordLoginEvent(
            $request,
            $email,
            'success',
            null,
            $user
        );

        $user->load(
            'grades:id,name,grade_number'
        );

        $token = $user
            ->createToken('YourSchool')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    /**
     * Current authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink(
            $request->only('email')
        );

        return response()->json([
            'message' => 'If this email is registered, a reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only(
                'email',
                'password',
                'password_confirmation',
                'token'
            ),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete();
            }
        );

        return response()->json(
            [
                'message' => __($status),
            ],
            $status === Password::PasswordReset ? 200 : 422
        );
    }

    /**
     * Record an authentication attempt without storing passwords or tokens.
     */
    private function recordLoginEvent(
        Request $request,
        string $email,
        string $status,
        ?string $failureReason = null,
        ?User $user = null
    ): LoginEvent {
        return LoginEvent::create([
            'user_id' => $user?->id,
            'email' => $email,
            'status' => $status,
            'failure_reason' => $failureReason,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'occurred_at' => now(),
        ]);
    }

    /**
     * Return an active block, while automatically expiring old blocks.
     */
    private function currentIpBlock(string $ipAddress): ?BlockedIp
    {
        $block = BlockedIp::query()
            ->where('ip_address', $ipAddress)
            ->where('is_active', true)
            ->first();

        if ($block === null) {
            return null;
        }

        if (
            $block->blocked_until !== null
            && $block->blocked_until->isPast()
        ) {
            $block->update([
                'is_active' => false,
            ]);

            return null;
        }

        return $block;
    }

    /**
     * Enforce failed-login protection by source IP.
     */
    private function applyFailedLoginProtection(
        SecuritySetting $settings,
        string $ipAddress,
        string $email,
        ?User $user,
        LoginEvent $event
    ): void {
        $windowStart = now()->subMinutes(
            $settings->failed_login_window_minutes
        );

        $failedAttempts = LoginEvent::query()
            ->where('ip_address', $ipAddress)
            ->where('status', 'failed')
            ->where('failure_reason', 'invalid_credentials')
            ->where('occurred_at', '>=', $windowStart)
            ->count();

        if (
            $failedAttempts
            < $settings->failed_login_max_attempts
        ) {
            return;
        }

        $blockedUntil = now()->addMinutes(
            $settings->failed_login_lockout_minutes
        );

        BlockedIp::updateOrCreate(
            [
                'ip_address' => $ipAddress,
            ],
            [
                'source' => 'automatic',
                'reason' => sprintf(
                    '%d failed login attempts within %d minutes.',
                    $failedAttempts,
                    $settings->failed_login_window_minutes
                ),
                'is_active' => true,
                'blocked_until' => $blockedUntil,
                'created_by' => null,
            ]
        );

        $this->createSecurityAlertIfNeeded(
            $settings,
            [
                'type' => 'repeated_failed_logins',
                'title' => 'Repeated failed login attempts',
                'severity' => 'high',
                'detail' => sprintf(
                    '%d failed login attempts were detected from the same IP within %d minutes. The IP was temporarily blocked.',
                    $failedAttempts,
                    $settings->failed_login_window_minutes
                ),
                'ip_address' => $ipAddress,
                'user_id' => $user?->id,
                'login_event_id' => $event->id,
                'metadata' => [
                    'email' => $email,
                    'failed_attempts' => $failedAttempts,
                    'window_minutes' => $settings->failed_login_window_minutes,
                    'blocked_until' => $blockedUntil->toIso8601String(),
                ],
            ]
        );
    }

    /**
     * Prevent repetitive copies of the same open alert.
     */
    private function createSecurityAlertIfNeeded(
        SecuritySetting $settings,
        array $attributes
    ): void {
        if (!$settings->security_alerts_enabled) {
            return;
        }

        $existing = SecurityAlert::query()
            ->where('type', $attributes['type'])
            ->where('status', 'open')
            ->when(
                $attributes['ip_address'] ?? null,
                fn ($query, $ip) => $query->where('ip_address', $ip)
            )
            ->when(
                $attributes['user_id'] ?? null,
                fn ($query, $userId) => $query->where('user_id', $userId)
            )
            ->where(
                'created_at',
                '>=',
                now()->subMinutes(30)
            )
            ->exists();

        if ($existing) {
            return;
        }

        SecurityAlert::create($attributes);
    }

    private function isAdminUser(User $user): bool
    {
        return in_array(
            $user->role,
            ['admin', 'super_admin'],
            true
        );
    }

    private function adminIpIsAllowed(
        SecuritySetting $settings,
        ?string $ipAddress
    ): bool {
        if ($ipAddress === null) {
            return false;
        }

        $allowedIps = collect(
            $settings->allowed_admin_ips ?? []
        )
            ->filter(
                fn ($value) =>
                    is_string($value)
                    && trim($value) !== ''
            )
            ->map(
                fn ($value) => trim($value)
            )
            ->values()
            ->all();

        return in_array(
            $ipAddress,
            $allowedIps,
            true
        );
    }
}