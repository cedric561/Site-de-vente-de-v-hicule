<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicule extends Model
{
    protected $fillable = [
        'marque', 'modele', 'annee', 'prix', 'prix_min', 'prix_max', 'prix_negociable',
        'kilometrage', 'carburant', 'transmission', 'etat', 'couleur', 'portes',
        'description', 'image', 'photos', 'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'photos' => 'array',
        'prix_negociable' => 'boolean',
    ];

    public function getPrixAfficheAttribute(): string
    {
        $f = fn ($n) => number_format($n, 0, ',', ' ');

        if ($this->prix) {
            return $f($this->prix) . ' FCFA';
        }

        if ($this->prix_min && $this->prix_max) {
            return 'De ' . $f($this->prix_min) . ' à ' . $f($this->prix_max) . ' FCFA';
        }

        if ($this->prix_min) {
            return 'À partir de ' . $f($this->prix_min) . ' FCFA';
        }

        if ($this->prix_max) {
            return "Jusqu'à " . $f($this->prix_max) . ' FCFA';
        }

        return 'Prix sur demande';
    }
}
