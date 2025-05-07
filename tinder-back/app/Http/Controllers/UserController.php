<?php

namespace App\Http\Controllers;

use App\Models\Matches;
use App\Models\Swipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\RecommendationService;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\UserBio;
use App\Models\UserImages;
use App\Models\Interest;


/**
 * @OA\Tag(name="Users")
 */
class UserController extends Controller
{
/**
 * @OA\Post(
 *     path="/register",
 *     summary="Register a new user",
 *     tags={"Users"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\JsonContent(
 *             required={"name", "email", "password", "phone_number", "gender", "birth_date", "sexual_orientation"},
 *             @OA\Property(property="name", type="string", example="Иван Петров"),
 *             @OA\Property(property="email", type="string", format="email", example="iva2n@example.com"),
 *             @OA\Property(property="phone_number", type="string", example="+7 (989) 123-45-67"),
 *             @OA\Property(property="gender", type="string", example="male"),
 *             @OA\Property(property="sexual_orientation", type="string", example="straight"),
 *             @OA\Property(property="birth_date", type="string", format="date", example="1995-06-15"),
 *             @OA\Property(property="password", type="string", format="password", example="password123"),
 *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123")
 *         )
 *     ),
 *     @OA\Response(response=201, description="User registered successfully"),
 *     @OA\Response(response=422, description="Validation errors")
 * )
 */

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
        
        // Auth::login($user);
        // return redirect('/login');

        return response()->json([
            'message' => 'User registered successfully!', 
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/login",
     *     summary="User login",
     *     tags={"Users"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *             @OA\Property(property="email", type="string", format="email", example="johndoe@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="securepassword")
     *         )
     *     ),
     *     @OA\Response(response=200, description="User logged in successfully"),
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
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

    /**
    * @OA\Put(
    *     path="/profile",
    *     summary="Update user profile",
    *     tags={"Users"},
    *     security={{"bearerAuth":{}}},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             @OA\Property(property="name", type="string", example="Нk"),
    *             @OA\Property(property="gender", type="string", example="female"),
    *             @OA\Property(property="sexual_orientation", type="string", example="straight")
    *         )
    *     ),
    *     @OA\Response(response=200, description="Profile updated successfully"),
    *     @OA\Response(response=401, description="Unauthorized"),
    *     @OA\Response(response=422, description="Validation errors")
    * )
    */
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
    
    /**
     * @OA\Post(
     *     path="/profile/bio",
     *     summary="Update or create user bio",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="bio", type="string", example="I love coding!"),
     *             @OA\Property(property="height", type="integer", example=180),
     *             @OA\Property(property="goals_relation", type="string", example="Serious relationship"),
     *             @OA\Property(property="languages", type="array", @OA\Items(type="string"), example={"English", "French"}),
     *             @OA\Property(property="zodiac_sign", type="string", example="Leo"),
     *             @OA\Property(property="education", type="string", example="Master's Degree"),
     *             @OA\Property(property="children_preference", type="string", example="No preference"),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="location_name", type="string", example="Paris, France")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bio updated successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
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
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location_name' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $bio = $user->userBio()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only([
                'bio', 'height', 'goals_relation', 'languages', 
                'zodiac_sign', 'education', 'children_preference',
                'latitude', 'longitude', 'location_name'
            ])
        );
        
        return response()->json([
            'message' => 'Bio updated successfully',
            'bio' => $bio
        ]);
    }
    
    /**
     * @OA\Post(
     *     path="/profile/location",
     *     summary="Update user location",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="latitude", type="number", format="float", example=37.7749),
     *             @OA\Property(property="longitude", type="number", format="float", example=-122.4194),
     *             @OA\Property(property="location_name", type="string", example="San Francisco, USA")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Location updated successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
    public function updateLocation(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'location_name' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $bio = $user->userBio()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only(['latitude', 'longitude', 'location_name'])
        );
        
        return response()->json([
            'message' => 'Location updated successfully',
            'location' => [
                'latitude' => $bio->latitude,
                'longitude' => $bio->longitude,
                'location_name' => $bio->location_name
            ]
        ]);
    }
    
    /**
     * @OA\Post(
     *     path="/profile/images",
     *     summary="Upload user image to S3",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="image", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Image uploaded successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
    public function uploadImage(Request $request)
    {
        Log::info('UploadImage method called');  // Лог начала работы метода
    
        $user = Auth::user();
        Log::info('Authenticated User: ', ['user' => $user]);
    
        if (!$user) {
            Log::warning('Unauthorized access attempt');
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        Log::info('Validating request data');
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
    
        if ($validator->fails()) {
            Log::warning('Validation failed', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        $imageFile = $request->file('image');
        Log::info('Image file received', ['file' => $imageFile]);
    
        if ($imageFile) {
            $imageName = time() . '.' . $imageFile->getClientOriginalExtension();
            $filePath = "user_photos/{$imageName}";
            Log::info('Generated image name and file path', [
                'imageName' => $imageName,
                'filePath' => $filePath
            ]);
    
            try {
                Log::info('Attempting to move file to public storage path');
                // Save the image to the local storage (public folder)
                $imageFile->move(public_path('storage/user_photos'), $imageName);
                Log::info('Image successfully saved to public storage');
    
            } catch (\Exception $e) {
                Log::error("Local storage upload error: " . $e->getMessage(), [
                    'stack_trace' => $e->getTraceAsString()
                ]);
                return response()->json(['message' => 'Failed to upload image. Exception: ' . $e->getMessage()], 500);
            }
    
            $imageUrl = asset("storage/user_photos/{$imageName}");
            Log::info('Generated image URL', ['url' => $imageUrl]);
    
            $userImage = $user->images()->create([
                'image_path' => $imageUrl,
                'user_id' => $user->id
            ]);
            Log::info('Image record successfully created in database', ['userImage' => $userImage]);
    
            return response()->json([
                'message' => 'Image uploaded successfully',
                'image' => $userImage
            ]);
        }
    
        Log::warning('No image uploaded');
        return response()->json(['message' => 'No image uploaded'], 400);
    }
    
    
    /**
     * @OA\Delete(
     *     path="/profile/image/{id}",
     *     summary="Delete user image from S3",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Image deleted successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=404, description="Image not found")
     * )
     */
    public function deleteImage($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $image = $user->images()->findOrFail($id);
        

        $filePath = parse_url($image->image_path, PHP_URL_PATH);
        $filePath = ltrim($filePath, '/');

        Storage::disk('s3')->delete($filePath);
        
        $image->delete();
        
        return response()->json(['message' => 'Image deleted successfully']);
    }
    
    /**
     * @OA\Post(
     *     path="/profile/interests",
     *     summary="Add user interests",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="interests", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Interests added successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
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
    
    /**
     * @OA\Delete(
     *     path="/profile/interests",
     *     summary="Remove user interests",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="interests", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Interests removed successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
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
    
    /**
     * @OA\Get(
     *     path="/profile",
     *     summary="Get user profile",
     *     tags={"Users"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="User profile retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
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


    /**
     * @OA\Get(
     *     path="/users",
     *     summary="Get all users",
     *     tags={"Users"},
     *     @OA\Response(response=200, description="Users retrieved successfully")
     * )
 */
    public function getAllUsers()
    {
        $users = User::getAllUsersWithData();
        
        return response()->json([
            'users' => $users
        ]);
    }


        /**
     * @OA\Get(
     *     path="/recommendations",
     *     summary="Get recomendations",
     *     tags={"Recomendations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Users retrieved successfully")
     * )
 */
    public function getRecommendations(RecommendationService $service)
    {
        $user = auth()->user(); // или другой способ
        $recommendations = $service->recommendForUser($user);

        return response()->json($recommendations);
    }


        /**
     * @OA\Post(
     *     path="/swipe",
     *     summary="Register a swipe action",
     *     tags={"Matching"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"target_user_id", "action"},
     *             @OA\Property(property="target_user_id", type="integer", example=123),
     *             @OA\Property(property="action", type="string", enum={"like", "dislike"}, example="like")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Swipe recorded successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
    public function swipe(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $validator = Validator::make($request->all(), [
            'target_user_id' => 'required|integer|exists:users,id',
            'action' => 'required|string|in:like,dislike'
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Check if swipe already exists
        $existingSwipe = $user->swipes()
            ->where('target_user_id', $request->target_user_id)
            ->first();
        
        if ($existingSwipe) {
            return response()->json(['message' => 'You have already swiped on this user'], 409);
        }
        
        // Record the swipe
        $swipe = $user->swipes()->create([
            'target_user_id' => $request->target_user_id,
            'action' => $request->action
        ]);
        
        // Check for a match
        if ($request->action === 'like') {
            $mutualLike = Swipe::where('user_id', $request->target_user_id)
                ->where('target_user_id', $user->id)
                ->where('action', 'like')
                ->first();
            
            if ($mutualLike) {
                // Create a match
                Matches::create([
                    'user1_id' => $user->id,
                    'user2_id' => $request->target_user_id
                ]);
                
                return response()->json([
                    'message' => 'It\'s a match!',
                    'match' => true,
                    'matched_user_id' => $request->target_user_id
                ]);
            }
        }
        
        return response()->json([
            'message' => 'Swipe recorded successfully',
            'match' => false
        ]);
    }

    /**
     * @OA\Get(
     *     path="/matches",
     *     summary="Get user's matches",
     *     tags={"Matching"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Matches retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function getMatches()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        $matches = $user->matches()->with(['user1', 'user2'])->get();
        
        // Format the matches to always show the other user
        $formattedMatches = $matches->map(function($match) use ($user) {
            $otherUser = $match->user1_id === $user->id ? $match->user2 : $match->user1;
            return [
                'match_id' => $match->id,
                'user' => $otherUser,
                'created_at' => $match->created_at
            ];
        });
        
        return response()->json([
            'matches' => $formattedMatches
        ]);
    }

/**
     * @OA\Delete(
     *     path="/matches/{match_id}",
     *     summary="Unmatch with a user and delete conversation",
     *     tags={"Matching"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="match_id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Unmatched successfully"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=404, description="Match not found")
     * )
     */
    public function unmatch($matchId)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // Find the match ensuring the current user is part of it
        $match = Matches::where('id', $matchId)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->first();
        
        if (!$match) {
            return response()->json(['message' => 'Match not found or you are not part of this match'], 404);
        }
        
        // Delete associated conversation if it exists
        // The conversation model has match_id, so we can find it this way
        // Or using the relationship if you defined it on Matches model
        if ($match->conversation) {
            $match->conversation->delete(); // This will also delete messages due to onDelete('cascade')
        }
        
        $match->delete(); // Delete the match itself
        
        return response()->json(['message' => 'Unmatched successfully. Conversation deleted.']);
    }


    /**
     * @OA\Get(
     *     path="/conversations",
     *     summary="Get all conversations for the authenticated user",
     *     tags={"Chat"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of conversations",
     *         
     *     ),
     *     @OA\Response(response=401, description="Unauthorized")
     * )
     */
    public function getConversations()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Eager load necessary relations for efficiency and context
        $conversations = Conversation::where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                      ->orWhere('user2_id', $user->id);
            })
            ->with(['user1:id,name', 'user2:id,name', 'lastMessage' => function ($query) {
                $query->select('id', 'conversation_id', 'sender_id', 'content', 'created_at')
                      ->with('sender:id,name');
            }])
            ->orderBy('last_message_at', 'desc') // Sort by most recent activity
            ->paginate(15);


        // The 'other_participant' accessor will be automatically called if Conversation model is set up
        // We can transform the collection if needed, but the accessor should handle it.
        // Make sure 'other_participant' is in $appends array of Conversation model
        // and that 'user1' and 'user2' are in $hidden if you don't want them.

        return response()->json($conversations);
    }

    /**
     * @OA\Get(
     *     path="/conversations/{conversation_id}/messages",
     *     summary="Get messages for a specific conversation",
     *     tags={"Chat"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="conversation_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="List of messages",
     *         
     *     ),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Not part of this conversation"),
     *     @OA\Response(response=404, description="Conversation not found")
     * )
     */
    public function getMessages(Request $request, $conversation_id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $conversation = Conversation::find($conversation_id);

        if (!$conversation) {
            return response()->json(['message' => 'Conversation not found'], 404);
        }

        // Authorize: Check if the current user is part of this conversation
        if ($conversation->user1_id !== $user->id && $conversation->user2_id !== $user->id) {
            return response()->json(['message' => 'Forbidden. You are not part of this conversation.'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender:id,name') // Eager load sender details
            ->orderBy('created_at', 'asc')
            ->paginate(20); // Paginate messages

        return response()->json($messages);
    }

    /**
     * @OA\Post(
     *     path="/matches/{match_id}/messages",
     *     summary="Send a message in a match's conversation",
     *     tags={"Chat"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="match_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"content"},
     *             @OA\Property(property="content", type="string", example="Hello there!")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Message sent successfully",),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=403, description="Forbidden - Not part of this match"),
     *     @OA\Response(response=404, description="Match not found"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
    public function sendMessage(Request $request, $match_id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $match = Matches::find($match_id);

        if (!$match) {
            return response()->json(['message' => 'Match not found'], 404);
        }

        // Authorize: Check if the current user is part of this match
        if ($match->user1_id !== $user->id && $match->user2_id !== $user->id) {
            return response()->json(['message' => 'Forbidden. You are not part of this match.'], 403);
        }

        // Determine user1_id and user2_id consistently for conversation uniqueness
        // Smaller ID first is a common convention
        $u1_id = min($match->user1_id, $match->user2_id);
        $u2_id = max($match->user1_id, $match->user2_id);

        // Find or create the conversation
        $conversation = Conversation::firstOrCreate(
            [
                'match_id' => $match->id, // Link to the match
                'user1_id' => $u1_id,
                'user2_id' => $u2_id,
            ]
        );

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'content' => $request->content,
        ]);
        
        // Update last_message_at on conversation for sorting
        $conversation->last_message_at = $message->created_at;
        $conversation->save();

        $message->load('sender:id,name'); // Eager load sender for the response

        // Here you would typically broadcast an event for real-time chat
        // event(new NewMessageSent($message));

        return response()->json($message, 201);
    }
}
