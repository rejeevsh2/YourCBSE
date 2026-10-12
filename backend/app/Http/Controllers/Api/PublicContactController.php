<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublicContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'category' => [
                'required',
                Rule::in([
                    'general',
                    'account',
                    'content',
                    'technical',
                    'school',
                    'other',
                ]),
            ],
            'subject' => [
                'required',
                'string',
                'max:255',
            ],
            'message' => [
                'required',
                'string',
                'max:10000',
            ],
        ]);

        $ticket = SupportTicket::create([
            'requester_id' => null,
            'requester_name' => trim($validated['name']),
            'requester_email' => strtolower(
                trim($validated['email'])
            ),
            'requester_role' => 'public',
            'subject' => trim($validated['subject']),
            'message' => trim($validated['message']),
            'category' => $validated['category'],
            'priority' => 'normal',
            'status' => 'open',
            'assigned_to' => null,
        ]);

        return response()->json([
            'message' =>
                'Your message has been received.',
            'ticket_number' =>
                $ticket->ticket_number,
        ], 201);
    }
}