<?php

namespace App\Filament\Widgets;

use App\Models\Visite;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class VehiculesPopulairesChart extends ChartWidget
{
    protected static ?int $sort = 4;

    public function getHeading(): ?string
    {
        return 'Véhicules les plus consultés (30 jours)';
    }

    protected function getData(): array
    {
        $lignes = Visite::where('type', 'vehicule')
            ->whereNotNull('vehicule_id')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->select('vehicule_id', DB::raw('COUNT(*) as total'))
            ->groupBy('vehicule_id')
            ->orderByDesc('total')
            ->limit(8)
            ->with('vehicule')
            ->get();

        return [
            'datasets' => [[
                'label' => 'Consultations',
                'data' => $lignes->pluck('total')->map(fn ($v) => (int) $v)->all(),
            ]],
            'labels' => $lignes->map(fn ($l) => $l->vehicule ? $l->vehicule->marque . ' ' . $l->vehicule->modele : 'Supprimé')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
