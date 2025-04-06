<?php

// database/factories/UserBioFactory.php
namespace Database\Factories;

use App\Models\UserBio;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserBioFactory extends Factory
{
    protected $model = UserBio::class;

    public function definition(): array
    {
        return [
            'bio' => $this->faker->sentence,
            'height' => $this->faker->numberBetween(150, 200),
            'goals_relation' => $this->faker->randomElement(['serious', 'casual', 'friendship']),
            'languages' => [$this->faker->languageCode],
            'zodiac_sign' => $this->faker->randomElement(['Aries', 'Taurus', 'Gemini']),
            'education' => $this->faker->randomElement(['Bachelor', 'Master', 'High School']),
            'children_preference' => $this->faker->randomElement(['yes', 'no', 'maybe']),
            'latitude' => $this->faker->latitude,
            'longitude' => $this->faker->longitude,
            'location_name' => $this->faker->city,
        ];
    }
}
