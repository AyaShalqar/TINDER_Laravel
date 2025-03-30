<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Interest;

/**
 * @OA\Tag(name="Interests")
 */
class InterestController extends Controller
{
        /**
     * @OA\Get(
     *     path="/interests",
     *     summary="Get all interests",
     *     tags={"Interests"},
     *     @OA\Response(response=200, description="List of interests")
     * )
     */
    public function index()
    {
        $interests = Interest::all();
        return response()->json(['interests' => $interests]);
    }
    
        /**
     * @OA\Post(
     *     path="/interests",
     *     summary="Create a new interest",
     *     tags={"Interests"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Sports")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Interest created successfully"),
     *     @OA\Response(response=422, description="Validation errors")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:interests',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $interest = Interest::create([
            'name' => $request->name,
        ]);
        
        return response()->json([
            'message' => 'Interest created successfully',
            'interest' => $interest
        ], 201);
    }
    
    /**
     * @OA\Get(
     *     path="/interests/{id}",
     *     summary="Get a specific interest",
     *     tags={"Interests"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Interest details"),
     *     @OA\Response(response=404, description="Interest not found")
     * )
     */
    public function show($id)
    {
        $interest = Interest::findOrFail($id);
        return response()->json(['interest' => $interest]);
    }
    
    /**
     * @OA\Put(
     *     path="/interests/{id}",
     *     summary="Update an interest",
     *     tags={"Interests"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Music")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Interest updated successfully"),
     *     @OA\Response(response=422, description="Validation errors"),
     *     @OA\Response(response=404, description="Interest not found")
     * )
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:interests,name,'.$id,
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $interest = Interest::findOrFail($id);
        $interest->update([
            'name' => $request->name,
        ]);
        
        return response()->json([
            'message' => 'Interest updated successfully',
            'interest' => $interest
        ]);
    }
    
    /**
     * @OA\Delete(
     *     path="/interests/{id}",
     *     summary="Delete an interest",
     *     tags={"Interests"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Interest deleted successfully"),
     *     @OA\Response(response=404, description="Interest not found")
     * )
     */
    public function destroy($id)
    {
        $interest = Interest::findOrFail($id);
        $interest->delete();
        
        return response()->json([
            'message' => 'Interest deleted successfully'
        ]);
    }
} 