<?php

// database/seeders/UserSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Interest;
use App\Models\UserBio;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure interests exist
        if (Interest::count() < 11) {
            $interestNames = [
                'Sports', 'Anime', 'Volleyball', 'Music', 'Travel', 'Cooking',
                'Reading', 'Gaming', 'Art', 'Movies', 'Dancing'
            ];
            foreach ($interestNames as $name) {
                Interest::firstOrCreate(['name' => $name]);
            }
        }

        $interests = Interest::all();

        User::factory(100)->create()->each(function ($user) use ($interests) {
            // Attach UserBio
            $user->userBio()->create(UserBio::factory()->make()->toArray());

            // Random Interests (1 to 4)
            $user->interests()->attach(
                $interests->random(rand(1, 4))->pluck('id')->toArray()
            );
        });
    }
}
