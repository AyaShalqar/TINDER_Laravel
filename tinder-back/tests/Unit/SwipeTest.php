<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Swipe;
use Tests\TestCase;

class SwipeTest extends TestCase
{
    public function test_swipe_model_has_required_attributes()
    {
        $swipe = new Swipe();
        
        $this->assertTrue(method_exists($swipe, 'user'));
        $this->assertTrue(method_exists($swipe, 'targetUser'));
    }

    public function test_swipe_relationships_are_defined()
    {
        $swipe = new Swipe();
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $swipe->user());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $swipe->targetUser());
    }

    public function test_swipe_has_fillable_fields()
    {
        $swipe = new Swipe();
        $fillable = $swipe->getFillable();
        
        $this->assertContains('user_id', $fillable);
        $this->assertContains('target_user_id', $fillable);
        $this->assertContains('action', $fillable);
    }
} 