<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Interest;

class InterestController extends Controller
{
    
    public function index()
    {
        $interests = Interest::all();
        return response()->json(['interests' => $interests]);
    }
    
    
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
    

    public function show($id)
    {
        $interest = Interest::findOrFail($id);
        return response()->json(['interest' => $interest]);
    }
    

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
    

    public function destroy($id)
    {
        $interest = Interest::findOrFail($id);
        $interest->delete();
        
        return response()->json([
            'message' => 'Interest deleted successfully'
        ]);
    }
} 