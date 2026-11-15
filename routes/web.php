<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->file(public_path('site-auto/index.html')));
Route::get('/catalogue', fn () => response()->file(public_path('site-auto/catalogue.html')));
