<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained('matches')->onDelete('cascade');
            $table->foreignId('user1_id')->constrained('users')->onDelete('cascade'); // User who initiated or is listed first
            $table->foreignId('user2_id')->constrained('users')->onDelete('cascade'); // The other user
            $table->timestamp('last_message_at')->nullable(); // For sorting conversations
            $table->timestamps();

            $table->unique(['user1_id', 'user2_id']); // Ensure unique conversation between two users
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
