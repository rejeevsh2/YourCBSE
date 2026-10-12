<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminSupportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SupportTicket::query()
            ->with([
                'requester:id,name,email,role',
                'assignee:id,name,email',
            ]);

        $search = trim((string) $request->query('search', ''));

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('requester_name', 'like', "%{$search}%")
                    ->orWhere('requester_email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $status = $request->query('status');

        if (
            is_string($status)
            && in_array(
                $status,
                [
                    'open',
                    'in_progress',
                    'waiting',
                    'resolved',
                    'closed',
                ],
                true
            )
        ) {
            $query->where('status', $status);
        }

        $priority = $request->query('priority');

        if (
            is_string($priority)
            && in_array(
                $priority,
                [
                    'urgent',
                    'high',
                    'normal',
                    'low',
                ],
                true
            )
        ) {
            $query->where('priority', $priority);
        }

        $tickets = $query
            ->orderByRaw(
                "CASE
                    WHEN status = 'open' THEN 0
                    WHEN status = 'in_progress' THEN 1
                    WHEN status = 'waiting' THEN 2
                    WHEN status = 'resolved' THEN 3
                    ELSE 4
                END"
            )
            ->orderByDesc('updated_at')
            ->get()
            ->map(
                fn (SupportTicket $ticket) =>
                    $this->ticketPayload($ticket)
            )
            ->values();

        return response()->json([
            'tickets' => $tickets,
            'stats' => $this->stats(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $ticket = SupportTicket::query()
            ->with([
                'requester:id,name,email,role',
                'assignee:id,name,email',
                'messages.user:id,name,email,role',
            ])
            ->findOrFail($id);

        return response()->json([
            'ticket' => $this->ticketPayload(
                $ticket,
                true
            ),
        ]);
    }

    public function update(
        Request $request,
        int $id
    ): JsonResponse {
        $ticket = SupportTicket::findOrFail($id);

        $validated = $request->validate([
            'priority' => [
                'sometimes',
                Rule::in([
                    'urgent',
                    'high',
                    'normal',
                    'low',
                ]),
            ],
            'category' => [
                'sometimes',
                Rule::in([
                    'general',
                    'account',
                    'content',
                    'technical',
                    'billing',
                    'school',
                    'other',
                ]),
            ],
            'status' => [
                'sometimes',
                Rule::in([
                    'open',
                    'in_progress',
                    'waiting',
                    'resolved',
                    'closed',
                ]),
            ],
            'assigned_to' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:users,id',
            ],
        ]);

        if (
            array_key_exists(
                'assigned_to',
                $validated
            )
            && $validated['assigned_to'] !== null
        ) {
            $isAdmin = User::query()
                ->whereKey(
                    $validated['assigned_to']
                )
                ->where('role', 'admin')
                ->exists();

            if (!$isAdmin) {
                throw ValidationException::withMessages([
                    'assigned_to' =>
                        'Tickets can only be assigned to an administrator.',
                ]);
            }
        }

        DB::transaction(function () use (
            $ticket,
            $validated
        ) {
            $ticket->fill($validated);

            if (
                array_key_exists(
                    'status',
                    $validated
                )
            ) {
                $status = $validated['status'];

                if ($status === 'resolved') {
                    $ticket->resolved_at = now();
                    $ticket->closed_at = null;
                } elseif ($status === 'closed') {
                    $ticket->closed_at = now();
                } else {
                    $ticket->resolved_at = null;
                    $ticket->closed_at = null;
                }
            }

            $ticket->save();
        });

        $ticket->load([
            'requester:id,name,email,role',
            'assignee:id,name,email',
        ]);

        return response()->json([
            'message' => 'Support ticket updated.',
            'ticket' => $this->ticketPayload($ticket),
        ]);
    }

    public function assignToMe(
        Request $request,
        int $id
    ): JsonResponse {
        $ticket = SupportTicket::findOrFail($id);

        $user = $request->user();

        abort_unless(
            $user && $user->role === 'admin',
            403,
            'Administrator access required.'
        );

        $ticket->assigned_to = $user->id;

        if ($ticket->status === 'open') {
            $ticket->status = 'in_progress';
        }

        $ticket->save();

        $ticket->load([
            'requester:id,name,email,role',
            'assignee:id,name,email',
        ]);

        return response()->json([
            'message' => 'Ticket assigned to you.',
            'ticket' => $this->ticketPayload($ticket),
        ]);
    }

    public function addMessage(
        Request $request,
        int $id
    ): JsonResponse {
        $ticket = SupportTicket::findOrFail($id);

        $validated = $request->validate([
            'message' => [
                'required',
                'string',
                'max:10000',
            ],
            'is_internal' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $user = $request->user();

        abort_unless(
            $user && $user->role === 'admin',
            403,
            'Administrator access required.'
        );

        $isInternal = (bool) (
            $validated['is_internal']
            ?? false
        );

        $message = DB::transaction(
            function () use (
                $ticket,
                $user,
                $validated,
                $isInternal
            ) {
                $message =
                    SupportTicketMessage::create([
                        'support_ticket_id' =>
                            $ticket->id,
                        'user_id' => $user->id,
                        'sender_name' => $user->name,
                        'sender_role' => $user->role,
                        'message' =>
                            $validated['message'],
                        'is_internal' =>
                            $isInternal,
                    ]);

                if (
                    !$isInternal
                    && !$ticket->first_responded_at
                ) {
                    $ticket->first_responded_at =
                        now();
                }

                if (
                    !$isInternal
                    && $ticket->status === 'open'
                ) {
                    $ticket->status =
                        'in_progress';
                }

                if (!$ticket->assigned_to) {
                    $ticket->assigned_to =
                        $user->id;
                }

                $ticket->save();

                return $message;
            }
        );

        return response()->json([
            'message' => 'Reply added.',
            'reply' => [
                'id' => (int) $message->id,
                'sender_name' =>
                    $message->sender_name,
                'sender_role' =>
                    $message->sender_role,
                'message' =>
                    $message->message,
                'is_internal' =>
                    (bool) $message->is_internal,
                'created_at' =>
                    $message->created_at?->toISOString(),
            ],
        ], 201);
    }

    private function stats(): array
    {
        $activeStatuses = [
            'open',
            'in_progress',
            'waiting',
        ];

        $responseMinutes = SupportTicket::query()
            ->whereNotNull('first_responded_at')
            ->get([
                'created_at',
                'first_responded_at',
            ])
            ->map(function (SupportTicket $ticket) {
                if (
                    !$ticket->created_at
                    || !$ticket->first_responded_at
                ) {
                    return null;
                }

                return max(
                    0,
                    $ticket->created_at
                        ->diffInMinutes(
                            $ticket->first_responded_at
                        )
                );
            })
            ->filter(
                fn ($value) => $value !== null
            )
            ->sort()
            ->values();

        $median = null;
        $count = $responseMinutes->count();

        if ($count > 0) {
            $middle = intdiv($count, 2);

            if ($count % 2 === 1) {
                $median =
                    $responseMinutes[$middle];
            } else {
                $median = (
                    $responseMinutes[$middle - 1]
                    + $responseMinutes[$middle]
                ) / 2;
            }
        }

        return [
            'open' => SupportTicket::query()
                ->whereIn(
                    'status',
                    $activeStatuses
                )
                ->count(),

            'unassigned' => SupportTicket::query()
                ->whereIn(
                    'status',
                    $activeStatuses
                )
                ->whereNull('assigned_to')
                ->count(),

            'resolved_this_week' =>
                SupportTicket::query()
                    ->whereNotNull('resolved_at')
                    ->where(
                        'resolved_at',
                        '>=',
                        now()->startOfWeek()
                    )
                    ->count(),

            'median_first_response_minutes' =>
                $median,
        ];
    }

    public function destroy(int $id): JsonResponse
    {
        $ticket = SupportTicket::findOrFail($id);

        $ticketNumber = $ticket->ticket_number;

        $ticket->delete();

        return response()->json([
            'message' => 'Support ticket deleted.',
            'ticket_id' => $id,
            'ticket_number' => $ticketNumber,
        ]);
    }

    private function ticketPayload(
        SupportTicket $ticket,
        bool $includeMessages = false
    ): array {
        $payload = [
            'id' => (int) $ticket->id,
            'ticket_number' =>
                $ticket->ticket_number,
            'requester' => [
                'id' =>
                    $ticket->requester_id
                        ? (int) $ticket->requester_id
                        : null,
                'name' =>
                    $ticket->requester_name,
                'email' =>
                    $ticket->requester_email,
                'role' =>
                    $ticket->requester_role,
            ],
            'subject' => $ticket->subject,
            'message' => $ticket->message,
            'category' => $ticket->category,
            'priority' => $ticket->priority,
            'status' => $ticket->status,
            'assignee' => $ticket->assignee
                ? [
                    'id' =>
                        (int) $ticket->assignee->id,
                    'name' =>
                        $ticket->assignee->name,
                    'email' =>
                        $ticket->assignee->email,
                ]
                : null,
            'first_responded_at' =>
                $ticket->first_responded_at
                    ?->toISOString(),
            'resolved_at' =>
                $ticket->resolved_at
                    ?->toISOString(),
            'closed_at' =>
                $ticket->closed_at
                    ?->toISOString(),
            'created_at' =>
                $ticket->created_at
                    ?->toISOString(),
            'updated_at' =>
                $ticket->updated_at
                    ?->toISOString(),
        ];

        if ($includeMessages) {
            $payload['messages'] =
                $ticket->messages
                    ->map(
                        fn (
                            SupportTicketMessage $message
                        ) => [
                            'id' =>
                                (int) $message->id,
                            'user_id' =>
                                $message->user_id
                                    ? (int) $message->user_id
                                    : null,
                            'sender_name' =>
                                $message->sender_name,
                            'sender_role' =>
                                $message->sender_role,
                            'message' =>
                                $message->message,
                            'is_internal' =>
                                (bool) $message->is_internal,
                            'created_at' =>
                                $message->created_at
                                    ?->toISOString(),
                        ]
                    )
                    ->values();
        }

        return $payload;
    }
}