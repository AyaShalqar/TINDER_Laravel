<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\UserInterested;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;


class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $fillable = [
        'name',
        'phone_number',
        'email',
        'gender',
        'sexual_orientation',
        'birth_date',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Получить всех пользователей с их полными данными
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getAllUsersWithData()
    {
        return self::with(['userBio', 'images', 'interests'])->get();
    }

    public function userBio():HasOne
    {
        return $this->hasOne(UserBio::class);
    }
    public function images(): HasMany
    {
        return $this->hasMany(UserImages::class);
    }
    public function userInterested():HasMany
    {
        return $this->hasMany(UserInterested::class);
    }
    public function interests()
    {
        return $this->belongsToMany(
            Interest::class,
            'user_interested',
            'user_id',
            'interest_id'
        );
    }
    
    public function swipes() {
        return $this->hasMany(Swipe::class);
    }

    public function matches() {
        return $this->hasMany(Matches::class, 'user1_id')->orWhere('user2_id', $this->id);
    }

    public function conversations()
    {
        // A user can be either user1 or user2 in a conversation
        return $this->hasMany(Conversation::class, 'user1_id')
                    ->orWhere('user2_id', $this->id);
    }

    public function messagesSent(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    // You might also want a direct way to get all messages a user is part of
    public function allMessages(): HasManyThrough
    {
        return $this->hasManyThrough(Message::class, Conversation::class,
            function ($query) { // Closure for Conversation model join
                $query->where('user1_id', $this->id)->orWhere('user2_id', $this->id);
            },
            'id', // Foreign key on messages table (should be conversation_id)
            'id', // Local key on users table (id)
            'id' // Local key on conversations table (id)
        )->where(function ($query) { // Ensure the conversation FK is correctly referenced
            $query->on('messages.conversation_id', '=', 'conversations.id');
        });
    }


}
