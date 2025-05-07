@extends('layouts.app')

@section('title', 'Пользователи')

@section('content')
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Список пользователей</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach ($users as $user)
            <div class="bg-white shadow rounded-lg p-4">
                <h2 class="text-xl font-semibold">{{ $user->name }}</h2>
                <p class="text-gray-600 text-sm mb-2">{{ $user->email }}</p>

                @if($user->profile)
                    <p><strong>Возраст:</strong> {{ $user->profile->age }}</p>
                    <p><strong>О себе:</strong> {{ $user->profile->bio }}</p>
                    <p><strong>Локация:</strong> {{ $user->profile->location_name }}</p>
                @endif

                @if($user->interests && count($user->interests))
                    <div class="mt-2">
                        <strong>Интересы:</strong>
                        <ul class="list-disc list-inside text-sm text-gray-700">
                            @foreach ($user->interests as $interest)
                                <li>{{ $interest->name }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @if($user->images && count($user->images))
                    <div class="mt-3 grid grid-cols-3 gap-1">
                        @foreach ($user->images as $image)
                            <img src="{{ asset('storage/' . $image->image_path) }}" alt="Фото пользователя" class="rounded-md w-full h-24 object-cover">
                        @endforeach
                    </div>
                @endif
            </div>
        @endforeach
    </div>
</div>
@endsection
