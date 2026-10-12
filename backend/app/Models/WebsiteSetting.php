<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteSetting extends Model
{
    protected $fillable = [
        'site_name',
        'site_domain',
        'tagline',
        'default_meta_description',
        'open_registration',
        'chapter_comments',
        'maintenance_mode',
    ];

    protected function casts(): array
    {
        return [
            'open_registration' => 'boolean',
            'chapter_comments' => 'boolean',
            'maintenance_mode' => 'boolean',
        ];
    }
}