<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'unit_id',
        'title',
        'code',
        'chapter_number',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'chapter_number' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }
}
