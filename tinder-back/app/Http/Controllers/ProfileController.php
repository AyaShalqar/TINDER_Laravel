<?php
namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()->profile;
        
        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }
        
        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $request->validate([
            'gender' => 'required|string',
            'age' => 'required|integer|min:18|max:99',
            'bio' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $profile = $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->only(['gender', 'age', 'bio', 'location'])
        );

        return response()->json($profile);
    }
}
