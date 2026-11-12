<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model
{
    protected $fillable = [
        'marque', 'modele', 'annee', 'prix', 'kilometrage', 'carburant',
        'transmission', 'etat', 'couleur', 'portes', 'description', 'image', 'photos', 'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'photos' => 'array',
    ];
}
