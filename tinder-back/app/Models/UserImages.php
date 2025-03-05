<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserImages extends Model
{
    use HasFactory;

    protected $table = 'user_images';

    protected $fillable = [
        'image_path',
        'user_id',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
