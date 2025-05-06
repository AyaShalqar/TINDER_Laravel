@extends('layouts.app')

@section('title', 'Welcome')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-8 text-center">
        <h1 class="display-4 mb-4">Welcome to Our Dating App</h1>
        <p class="lead mb-5">Find your perfect match today!</p>
        
        <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
            @guest
            <a href="/register" class="btn btn-primary btn-lg px-4 gap-3">Sign Up</a>
            <a href="/login" class="btn btn-outline-secondary btn-lg px-4">Login</a>
            @else
            <a href="/profile" class="btn btn-primary btn-lg px-4 gap-3">View Profile</a>
            <a href="/recommendations" class="btn btn-success btn-lg px-4">Find Matches</a>
            @endguest
        </div>
    </div>
</div>

<div class="row mt-5">
    <div class="col-md-4 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Smart Matching</h5>
                <p class="card-text">Our advanced algorithm finds compatible partners based on your preferences.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Secure Platform</h5>
                <p class="card-text">Your privacy and security are our top priorities.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-4">
        <div class="card h-100">
            <div class="card-body text-center">
                <h5 class="card-title">Real Connections</h5>
                <p class="card-text">Meet genuine people looking for meaningful relationships.</p>
            </div>
        </div>
    </div>
</div>
@endsection