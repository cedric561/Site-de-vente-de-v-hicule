<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class VehiculeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
    $photos = collect($this->photos ?? [])
    ->map(fn ($chemin) =>
        env('SUPABASE_PUBLIC_URL') .
        '/publicc/' .
        $chemin
    )
    ->values();

        return [
            'id' => $this->id,
            'marque' => $this->marque,
            'modele' => $this->modele,
            'annee' => $this->annee,
            'prix' => $this->prix,
            'prix_affiche' => $this->prix_affiche,
            'prix_min' => $this->prix_min,
            'prix_max' => $this->prix_max,
            'prix_negociable' => $this->prix_negociable,
            'kilometrage' => $this->kilometrage,
            'carburant' => $this->carburant,
            'transmission' => $this->transmission,
            'etat' => $this->etat,
            'couleur' => $this->couleur,
            'portes' => $this->portes,
            'description' => $this->description,
            'image' => $photos->first(),
            'images' => $photos,
        ];
    }
}
