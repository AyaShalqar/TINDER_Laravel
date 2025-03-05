<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserBio;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserBioController extends Controller
{

    public function show(User $user)
    {

        $bio = $user->userBio; 
        if (!$bio) {
            return response()->json(['message' => 'UserBio not found'], Response::HTTP_NOT_FOUND);
        }
        return response()->json($bio);
    }

    
    public function storeOrUpdate(Request $request, User $user)
    {
        $validated = $request->validate([
            'bio' => 'nullable|string',
            'height' => 'nullable|integer',
            'goals_relation' => 'nullable|string',
            'languages' => 'nullable|array', 
            'zodiac_sign' => 'nullable|string',
            'education' => 'nullable|string',
            'children_preference' => 'nullable|string',
        ]);

 
        $bio = UserBio::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json($bio, Response::HTTP_OK);
    }
}
