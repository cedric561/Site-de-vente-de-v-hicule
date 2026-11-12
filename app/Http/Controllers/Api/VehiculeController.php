<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicule;
use App\Http\Resources\VehiculeResource;
use Illuminate\Http\Request;

class VehiculeController extends Controller
{
     public function index(Request $request)
    {
        $query = Vehicule::query()->where('actif', true);

        $query->when($request->q, function ($q, $v) {
            $q->where(function ($w) use ($v) {
                $w->where('marque', 'like', "%{$v}%")
                  ->orWhere('modele', 'like', "%{$v}%")
                  ->orWhere('description', 'like', "%{$v}%");
            });
        });
        $query->when($request->marque, fn ($q, $v) => $q->where('marque', $v));
        $query->when($request->carburant, fn ($q, $v) => $q->where('carburant', $v));
        $query->when($request->prix_max, fn ($q, $v) => $q->where('prix', '<=', (int) $v));
        $query->when($request->annee_min, fn ($q, $v) => $q->where('annee', '>=', (int) $v));

        match ($request->tri) {
            'prix_asc'  => $query->orderBy('prix'),
            'prix_desc' => $query->orderByDesc('prix'),
            'km_asc'    => $query->orderBy('kilometrage'),
            default     => $query->orderByDesc('annee')->orderByDesc('id'),
        };

        return VehiculeResource::collection($query->paginate(6)->withQueryString());
    }

    public function marques()
    {
        return Vehicule::where('actif', true)->orderBy('marque')->distinct()->pluck('marque');
    }
}
