<?php

namespace App\Filament\Widgets;

use App\Models\Demande;
use App\Models\Visite;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsVisites extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $debut = now()->subDays(6)->startOfDay();

        return [
            Stat::make('Visiteurs aujourd\'hui', Visite::where('created_at', '>=', now()->startOfDay())->distinct()->count('visiteur')),
            Stat::make('Visiteurs (7 jours)', Visite::where('created_at', '>=', $debut)->distinct()->count('visiteur')),
            Stat::make('Fiches véhicules vues (7 jours)', Visite::where('type', 'vehicule')->where('created_at', '>=', $debut)->count()),
            Stat::make('Demandes reçues (7 jours)', Demande::where('created_at', '>=', $debut)->count()),
        ];
    }
}
