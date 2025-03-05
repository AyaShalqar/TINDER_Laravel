<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class UserBio extends Model 
{
    use HasFactory;
    protected $fillable = [
        'bio',
        'height',
        'goals_relation',
        'languages',
        'zodiac_sign',
        'education',
        'children_preference',
        'user_id',
    ];

    protected $casts = [
        'languages' => 'array', // или 'json'
    ];
    public function user(): BelongsTo{
        return $this->belongsTo(User::class);
    }
}