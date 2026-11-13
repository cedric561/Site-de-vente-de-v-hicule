<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StatutResource;
use App\Models\Statut;

class StatutController extends Controller
{
    public function index()
    {
        return StatutResource::collection(
            Statut::actifs()->with('vehicule')->orderByDesc('publie_le')->get()
        );
    }

    public function vue(Statut $statut)
    {
        $statut->increment('vues');

        return response()->noContent();
    }

    public function clic(Statut $statut)
    {
        $statut->increment('clics');

        return response()->noContent();
    }
}
