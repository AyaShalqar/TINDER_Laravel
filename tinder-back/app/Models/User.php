<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'phone_number',
        'email',
        'gender',
        'sexual_orientation',
        'birth_date',
    ];

    public function userBio():HasOne
    {
        return $this->hasOne(UserBio::class);
    }
    public function images():HasMany
    {
        return $this->hasMany(UserImages::class);
    }

    public function userInterested():HasMany
    {
        return $this->hasMany(UserInterested::class);
    }
    public function interests(): BelongsToMany
    {
        return $this->belongsToMany(
            Interest::class,
            'user_interested',
            'user_id',
            'interest_id'
        );
    }
    
}
