<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'age',
        'bio',
        'interests',
        'photo'
    ];
    
    protected $casts = [
        'interests' => 'array', 
    ];

}
