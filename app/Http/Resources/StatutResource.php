<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'etiquette' => $this->etiquette,
            'legende'   => $this->legende,
            'type'      => $this->type_media,
            'media'     => asset('storage/' . $this->media),
            'vehicule'  => $this->vehicule ? new VehiculeResource($this->vehicule) : null,
        ];
    }
}
