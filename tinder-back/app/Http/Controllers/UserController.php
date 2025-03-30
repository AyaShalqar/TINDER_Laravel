<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\UserBio;
use App\Models\UserImages;
use App\Models\Interest;

class UserController extends Controller
{
    public function register(Request $request ){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|unique:users,phone_number',
            'email' => 'required|string|email|max:255|unique:users,email',
            'gender' => 'required|string',
            'sexual_orientation' => 'nullable|string',
            'birth_date' => 'required|date',
            'password' => 'required|string|min:6|confirmed',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $user = User::create([
            'name' => $request->name,
            'phone_number' => $request->phone_number,
            'email' => $request->email,
            'gender' => $request->gender,
            'sexual_orientation' => $request->sexual_orientation,
            'birth_date' => $request->birth_date,
            'password' => Hash::make($request->password),
        ]);
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'message' => 'User registered successfully!', 
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');
        
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'message' => 'Login successful',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $user
            ]);
        }
        
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
    
    // Обновление основной информации профиля
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'phone_number' => 'string|unique:users,phone_number,'.$user->id,
            'email' => 'string|email|max:255|unique:users,email,'.$user->id,
            'gender' => 'string',
            'sexual_orientation' => 'nullable|string',
            'birth_date' => 'date',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user->update($request->only([
            'name', 'phone_number', 'email', 'gender', 'sexual_orientation', 'birth_date'
        ]));
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
    
    // Обновление/создание био
    public function updateBio(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'bio' => 'nullable|string',
            'height' => 'nullable|integer',
            'goals_relation' => 'nullable|string',
            'languages' => 'nullable|array',
            'zodiac_sign' => 'nullable|string',
            'education' => 'nullable|string',
            'children_preference' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $bio = $user->userBio()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only([
                'bio', 'height', 'goals_relation', 'languages', 
                'zodiac_sign', 'education', 'children_preference'
            ])
        );
        
        return response()->json([
            'message' => 'Bio updated successfully',
            'bio' => $bio
        ]);
    }
    
    // Загрузка фото
    public function uploadImage(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'image' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'images' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $imageFile = $request->file('image') ?: $request->file('images');
        
        if ($imageFile) {
            $imageName = time() . '.' . $imageFile->getClientOriginalExtension();
            $imageFile->storeAs('public/user_images', $imageName);
            
            $userImage = $user->images()->create([
                'image_path' => 'storage/user_images/' . $imageName,
                'user_id' => $user->id
            ]);
            
            return response()->json([
                'message' => 'Image uploaded successfully',
                'image' => $userImage
            ]);
        }
        
        return response()->json(['message' => 'No image uploaded'], 400);
    }
    
    // Удаление фото
    public function deleteImage($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $image = $user->images()->findOrFail($id);
        
        // Удаление файла из хранилища
        $filePath = str_replace('storage/', 'public/', $image->image_path);
        Storage::delete($filePath);
        
        $image->delete();
        
        return response()->json(['message' => 'Image deleted successfully']);
    }
    
    // Добавление интересов
    public function addInterests(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'interests' => 'required|array',
            'interests.*' => 'exists:interests,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user->interests()->attach($request->interests);
        
        return response()->json([
            'message' => 'Interests added successfully',
            'interests' => $user->interests
        ]);
    }
    
    // Удаление интересов
    public function removeInterests(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'interests' => 'required|array',
            'interests.*' => 'exists:interests,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user->interests()->detach($request->interests);
        
        return response()->json([
            'message' => 'Interests removed successfully',
            'interests' => $user->interests
        ]);
    }
    
    // Получение профиля пользователя со всеми данными
    public function getProfile()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $user->load('userBio', 'images', 'interests');
        
        return response()->json([
            'user' => $user
        ]);
    }
}
