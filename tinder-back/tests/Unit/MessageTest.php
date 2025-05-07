<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;
use Tests\TestCase;

class MessageTest extends TestCase
{
    public function test_message_model_has_required_attributes()
    {
        $message = new Message();
        
        $this->assertTrue(method_exists($message, 'conversation'));
        $this->assertTrue(method_exists($message, 'sender'));
    }

    public function test_message_relationships_are_defined()
    {
        $message = new Message();
        
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $message->conversation());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\BelongsTo::class, $message->sender());
    }

    public function test_message_has_fillable_fields()
    {
        $message = new Message();
        $fillable = $message->getFillable();
        
        $this->assertContains('conversation_id', $fillable);
        $this->assertContains('sender_id', $fillable);
        $this->assertContains('content', $fillable);
        $this->assertContains('read_at', $fillable);
    }

    public function test_message_has_datetime_casts()
    {
        $message = new Message();
        $casts = $message->getCasts();
        
        $this->assertArrayHasKey('read_at', $casts);
        $this->assertEquals('datetime', $casts['read_at']);
    }
} 