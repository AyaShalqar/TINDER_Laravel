<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function store(Request $request) {
        $validator = Validator::make($request->all(),[
            'user_id'   => 'required|exists:users,id|unique:profiles,user_id',
            'name'      => 'required|string|max:255',
            'age'       => 'nullable|integer|min:18|max:99',
            'bio'       => 'nullable|string',
            'interests' => 'nullable|array',
            'photo'     => 'nullable|string',
        ]);

        if($validator->fails()){
            return response()->json(['errors' => $validator->errors()], 422);
        };
        $profile = Profile::create($request->all()); 
        
        return response()->json([
            'message' => 'Профиль создан успешно!',
            'profile' => $profile
        ], 201);
    }
    
    public function show($id){
        $profile = Profile::find($id);
        if (!$profile){
            return response()->json(['message' => 'Профиль не найден'], 404);
        }

        return response()->json($profile);
    }

    public function update(Request $request,$id){
        $profile = Profile::find($id);

        if (!$profile){
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validator = Validator::make($request->all(), [
            'name'      => 'nullable|string|max:255',
            'age'       => 'nullable|integer|min:18|max:99',
            'bio'       => 'nullable|string',
            'interests' => 'nullable|array',
            'photo'     => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profile->update($request()->all());
        return response()->json([
            'message' => 'Профиль обновлён!',
            'profile' => $profile
        ]);
    }
    public function destroy($id)
    {
        $profile = Profile::find($id);

        if (!$profile) {
            return response()->json(['message' => 'Профиль не найден'], 404);
        }

        $profile->delete();

        return response()->json(['message' => 'Профиль удалён!']);
    }
}
