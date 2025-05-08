<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'user1_id',
        'user2_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function match(): BelongsTo
    {
        return $this->belongsTo(Matches::class, 'match_id');
    }

    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function lastMessage(): HasOne 
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    
    public function getOtherParticipantAttribute()
    {
        if (!Auth::check()) {
            return null; 
        }
        $currentUser = Auth::user();
        if ($this->user1_id === $currentUser->id) {
            return $this->user2()->withDefault(); 
        } elseif ($this->user2_id === $currentUser->id) {
            return $this->user1()->withDefault();
        }
        return null; 
    }

    
    protected $appends = ['other_participant'];

   
    protected $hidden = ['user1', 'user2'];
}