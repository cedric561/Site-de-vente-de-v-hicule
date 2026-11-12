<?php

namespace Database\Seeders;

use App\Models\Vehicule;
use Illuminate\Database\Seeder;

class VehiculeSeeder extends Seeder
{
    public function run(): void
    {
        $vehicules = [
            ['Toyota', 'Corolla', 2021, 9800000, 42000, 'Essence', 'Automatique', 'Occasion', 'Gris', 4, 'Berline économique et fiable, entretien suivi en concession.'],
            ['Toyota', 'Land Cruiser Prado', 2022, 38500000, 28000, 'Diesel', 'Automatique', 'Occasion', 'Blanc', 5, '4x4 7 places, intérieur cuir, caméra de recul.'],
            ['Hyundai', 'Tucson', 2023, 21500000, 0, 'Essence', 'Automatique', 'Neuf', 'Noir', 5, 'SUV compact neuf, garantie constructeur 5 ans.'],
            ['Peugeot', '3008', 2020, 11900000, 61000, 'Diesel', 'Manuelle', 'Occasion', 'Bleu', 5, 'SUV familial, faible consommation, première main.'],
            ['Kia', 'Sportage', 2022, 17200000, 19000, 'Hybride', 'Automatique', 'Occasion', 'Rouge', 5, 'Motorisation hybride, écran tactile, aides à la conduite.'],
            ['Mercedes-Benz', 'Classe C', 2019, 18900000, 74000, 'Diesel', 'Automatique', 'Occasion', 'Noir', 4, 'Finition AMG Line, toit ouvrant, historique complet.'],
            ['Renault', 'Duster', 2021, 7400000, 53000, 'Essence', 'Manuelle', 'Occasion', 'Orange', 5, 'Robuste et polyvalent, idéal route et piste.'],
            ['Tesla', 'Model 3', 2023, 29900000, 8000, 'Électrique', 'Automatique', 'Occasion', 'Blanc', 4, 'Autonomie 500 km, mises à jour à distance.'],
        ];

        foreach ($vehicules as [$marque, $modele, $annee, $prix, $km, $carburant, $transmission, $etat, $couleur, $portes, $description]) {
            Vehicule::create([
                'marque' => $marque, 'modele' => $modele, 'annee' => $annee, 'prix' => $prix,
                'kilometrage' => $km, 'carburant' => $carburant, 'transmission' => $transmission,
                'etat' => $etat, 'couleur' => $couleur, 'portes' => $portes, 'description' => $description,
            ]);
        }
    }
}
