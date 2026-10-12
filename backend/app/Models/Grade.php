<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    protected $fillable = [
        'board_id',
        'name',
        'code',
        'grade_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}
