<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class RecommendationService
{
    protected float $weightInterests = 0.5;
    protected float $weightBio = 0.3;
    protected float $weightLocation = 0.2;

    public function recommendForUser(User $user): Collection
    {
        $userInterests = $user->interests->pluck('id')->toArray();
        $userBio = $user->userBio;

        return User::with(['interests', 'userBio', 'images'])
            ->where('id', '!=', $user->id)
            ->get()
            ->filter(function ($otherUser) use ($user) {

                return $this->isCompatible($user, $otherUser);
            })
            ->map(function ($otherUser) use ($userInterests, $userBio) {
                $score = 0;


                $otherInterests = $otherUser->interests->pluck('id')->toArray();
                $common = array_intersect($userInterests, $otherInterests);
                $interestScore = count($userInterests) > 0
                    ? count($common) / count($userInterests)
                    : 0;


                $bioScore = 0;
                if ($userBio && $otherUser->userBio) {
                    if ($userBio->children_preference === $otherUser->userBio->children_preference) {
                        $bioScore += 0.5;
                    }
                    if ($userBio->goals_relation === $otherUser->userBio->goals_relation) {
                        $bioScore += 0.5;
                    }
                }


                $locationScore = 0;
                if ($userBio && $otherUser->userBio) {
                    $distance = $this->calculateDistance(
                        $userBio->latitude,
                        $userBio->longitude,
                        $otherUser->userBio->latitude,
                        $otherUser->userBio->longitude
                    );

 
                    $locationScore = max(0, 1 - ($distance / 50)); 
                }

                $totalScore = $interestScore * $this->weightInterests
                            + $bioScore * $this->weightBio
                            + $locationScore * $this->weightLocation;

                $otherUser->match_score = $totalScore;

                return $otherUser;
            })
            ->sortByDesc('match_score')
            ->values();
    }


    private function calculateDistance($lat1, $lon1, $lat2, $lon2): float
    {
        if (!$lat1 || !$lon1 || !$lat2 || !$lon2) return 1000;

        $earthRadius = 6371; 
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta/2) * sin($latDelta/2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta/2) * sin($lonDelta/2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

        private function isCompatible(User $user, User $otherUser): bool
    {


        if (!$user->gender || !$user->sexual_orientation || !$otherUser->gender || !$otherUser->sexual_orientation) {
            return true; 
        }


        $userAttractedTo = $this->getAttractedGenders($user->gender, $user->sexual_orientation);
        $otherAttractedTo = $this->getAttractedGenders($otherUser->gender, $otherUser->sexual_orientation);

        return in_array($otherUser->gender, $userAttractedTo)
            && in_array($user->gender, $otherAttractedTo);
    }

    private function getAttractedGenders(string $gender, string $orientation): array
    {
        return match ($orientation) {
            'straight' => $gender === 'male' ? ['female'] : ['male'],
            'gay' => [$gender],
            'bisexual' => ['male', 'female'],
            default => ['male', 'female'], 
        };
    }
}

