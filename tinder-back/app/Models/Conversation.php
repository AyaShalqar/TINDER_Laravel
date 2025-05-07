<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne; // Make sure this is imported
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

    public function lastMessage(): HasOne // Corrected return type
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    // Helper to get the other participant in the conversation
    public function getOtherParticipantAttribute()
    {
        if (!Auth::check()) {
            return null; // Or throw an exception
        }
        $currentUser = Auth::user();
        if ($this->user1_id === $currentUser->id) {
            return $this->user2()->withDefault(); // Eager load or provide default to prevent N+1 if user2 might be null
        } elseif ($this->user2_id === $currentUser->id) {
            return $this->user1()->withDefault(); // Eager load or provide default
        }
        return null; // Should not happen if the user is part of the conversation
    }

    // Append it to model serialization
    protected $appends = ['other_participant'];

    // Hide individual user relations if 'other_participant' is preferred
    protected $hidden = ['user1', 'user2'];
}