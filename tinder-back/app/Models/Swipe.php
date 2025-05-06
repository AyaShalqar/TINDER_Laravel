<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Swipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'target_user_id',
        'action'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function targetUser() {
        return $this->belongsTo(User::class, 'target_user_id');
    }
}
