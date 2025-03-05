<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_interested', function (Blueprint $table) {
            $table->id();
            // Foreign keys
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->foreignId('interest_id')
                  ->constrained('interests')
                  ->cascadeOnDelete();

            // Индекс на пару user_id и interest_id, чтобы не было дублей
            $table->unique(['user_id', 'interest_id']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_interested');
    }
};
