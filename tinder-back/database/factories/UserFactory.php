<?php

// database/factories/UserFactory.php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        $genders = ['male', 'female', 'other'];
        $orientations = ['straight', 'gay', 'bisexual'];

        return [
            'name' => $this->faker->unique()->firstName,
            'phone_number' => $this->faker->unique()->phoneNumber,
            'email' => $this->faker->unique()->safeEmail,
            'gender' => $this->faker->randomElement($genders),
            'sexual_orientation' => $this->faker->randomElement($orientations),
            'birth_date' => $this->faker->date('Y-m-d', '-18 years'),
            'password' => Hash::make('password'), // hashed
        ];
    }
}
