<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoPage extends Model
{
    protected $fillable = [
        'path',
        'title',
        'meta_description',
        'canonical_url',
        'is_indexed',
    ];

    protected function casts(): array
    {
        return [
            'is_indexed' => 'boolean',
        ];
    }
}