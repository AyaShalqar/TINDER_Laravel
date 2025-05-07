<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserBio;
use App\Models\UserImages;
use App\Models\UserInterested;
use App\Models\Swipe;
use Tests\TestCase;

class UserTest extends TestCase
{
    public function test_user_model_has_required_attributes()
    {
        $user = new User();
        
        $this->assertTrue(method_exists($user, 'userBio'));
        $this->assertTrue(method_exists($user, 'images'));
        $this->assertTrue(method_exists($user, 'userInterested'));
        $this->assertTrue(method_exists($user, 'interests'));
        $this->assertTrue(method_exists($user, 'swipes'));
        $this->assertTrue(method_exists($user, 'matches'));
        $this->assertTrue(method_exists($user, 'conversations'));
        $this->assertTrue(method_exists($user, 'messagesSent'));
    }

    public function test_user_relationships_are_defined()
    {
        $user = new User();
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $user->userBio());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->images());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->userInterested());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsToMany::class, $user->interests());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->swipes());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->messagesSent());
    }

    public function test_user_fillable_attributes()
    {
        $user = new User();
        $fillable = $user->getFillable();
        
        $this->assertContains('name', $fillable);
        $this->assertContains('phone_number', $fillable);
        $this->assertContains('email', $fillable);
        $this->assertContains('gender', $fillable);
        $this->assertContains('sexual_orientation', $fillable);
        $this->assertContains('birth_date', $fillable);
        $this->assertContains('password', $fillable);
    }
} 