<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_bios', function (Blueprint $table) {
            $table->id();
            $table->text('bio')->nullable();
            $table->integer('height')->nullable();
            $table->string('goals_relation')->nullable();
            $table->json('languages')->nullable();
            $table->string('zodiac_sign')->nullable();
            $table->string('education')->nullable();
            $table->string('children_preference')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_name')->nullable();
            
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_bios');
    }
};
