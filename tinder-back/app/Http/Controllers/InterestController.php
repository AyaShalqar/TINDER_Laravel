<?php

namespace App\Http\Controllers;

use App\Models\Interest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class InterestController extends Controller
{
    public function index()
    {
        return response()->json(Interest::all(), Response::HTTP_OK);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:interests',
        ]);

        $interest = Interest::create($validated);
        return response()->json($interest, Response::HTTP_CREATED);
    }

    public function show(Interest $interest)
    {
        return response()->json($interest, Response::HTTP_OK);
    }

    public function update(Request $request, Interest $interest)
    {
        $validated = $request->validate([
            'name' => ['required','string', Rule::unique('interests')->ignore($interest->id)],
        ]);

        $interest->update($validated);
        return response()->json($interest, Response::HTTP_OK);
    }

    public function destroy(Interest $interest)
    {
        $interest->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
