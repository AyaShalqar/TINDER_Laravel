<?php

namespace App\Http\Controllers;

use App\Models\UserImages;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserImagesController extends Controller
{
    public function index()
    {

    
        return response()->json(UserImages::paginate(10));
    }

    public function store(Request $request)
    {
    
        $validated = $request->validate([
            'image_path' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);

        $image = UserImages::create($validated);
        return response()->json($image, Response::HTTP_CREATED);
    }

    public function show(UserImages $userImage)
    {
        return response()->json($userImage);
    }

    public function update(Request $request, UserImages $userImage)
    {
        $validated = $request->validate([
            'image_path' => 'sometimes|string',
            'user_id' => 'sometimes|exists:users,id',
        ]);

        $userImage->update($validated);
        return response()->json($userImage);
    }

    public function destroy(UserImages $userImage)
    {
        $userImage->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
