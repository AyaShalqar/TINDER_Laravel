<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @OA\Schema(
 *     schema="UserInterested",
 *     title="UserInterested",
 *     description="Связь пользователя с интересами",
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="interest_id", type="integer", example=2)
 * )
 */
class UserInterested extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'interest_id',
    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interest(): BelongsTo
    {
        return $this->belongsTo(Interest::class);
    }
}
