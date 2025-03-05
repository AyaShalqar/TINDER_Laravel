<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Interest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{

    public function index()
    {
        $users = User::with('userBio', 'images', 'interests')->paginate(10);
        return response()->json($users);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:users'],
            'phone_number' => ['required', 'string', 'unique:users'],
            'email' => ['required', 'email', 'unique:users'],
            'gender' => ['nullable', 'string'],
            'sexual_orientation' => ['nullable', 'string'],
            'birth_date' => ['nullable', 'date'],
        ]);

        $user = User::create($validated);
        return response()->json($user, Response::HTTP_CREATED);
    }


    public function show(User $user)
    {

    
        $user->load('userBio', 'images', 'interests');
        return response()->json($user);
    }


    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone_number' => ['sometimes', 'string', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'gender' => ['nullable', 'string'],
            'sexual_orientation' => ['nullable', 'string'],
            'birth_date' => ['nullable', 'date'],
        ]);

        $user->update($validated);
        return response()->json($user);
    }


    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }


    public function addInterest(User $user, Interest $interest)
    {
    
        $user->interests()->syncWithoutDetaching([$interest->id]);
        return response()->json(['message' => 'Interest added to user']);
    }

    public function removeInterest(User $user, Interest $interest)
    {
        $user->interests()->detach($interest->id);
        return response()->json(['message' => 'Interest removed from user']);
    }
}
