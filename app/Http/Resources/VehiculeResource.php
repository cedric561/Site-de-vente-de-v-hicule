<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehiculeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $photos = collect($this->photos ?? [])
            ->map(fn ($chemin) => asset('storage/' . $chemin))
            ->values();

        return [
            'id' => $this->id,
            'marque' => $this->marque,
            'modele' => $this->modele,
            'annee' => $this->annee,
            'prix' => $this->prix,
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
