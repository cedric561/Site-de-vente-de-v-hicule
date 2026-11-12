<?php

use App\Http\Controllers\Api\DemandeController;
use App\Http\Controllers\Api\VehiculeController;
use App\Http\Controllers\Api\VisiteController;
use App\Http\Controllers\Api\AbonneController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/vehicules', [VehiculeController::class, 'index']);
Route::get('/marques', [VehiculeController::class, 'marques']);
Route::post('/demandes', [DemandeController::class, 'store'])->middleware('throttle:10,1');
Route::post('/visites', [VisiteController::class, 'store'])->middleware('throttle:60,1');
Route::post('/abonnes', [AbonneController::class, 'store'])->middleware('throttle:10,1');
