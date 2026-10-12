<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentNotification extends Notification
{
    use Queueable;

    /**
     * Create a new student notification.
     */
    public function __construct(
        public string $title,
        public string $message,
        public string $type = 'general',
        public ?string $link = null,
    ) {
    }

    /**
     * Store the notification in the database.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Data stored in the notifications table.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'link' => $this->link,
        ];
    }
}