<?php

namespace App\Filament\Widgets;

use App\Models\Visite;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class RepartitionChart extends ChartWidget
{
    protected static ?int $sort = 3;

    public ?string $filter = 'source';

    public function getHeading(): ?string
    {
        return 'Répartition des visiteurs (30 jours)';
    }

    protected function getFilters(): ?array
    {
        return ['source' => 'Sources de trafic', 'appareil' => 'Appareils', 'pays' => 'Pays'];
    }

    protected function getData(): array
    {
        $colonne = in_array($this->filter, ['source', 'appareil', 'pays'], true) ? $this->filter : 'source';

        $lignes = Visite::select($colonne, DB::raw('COUNT(DISTINCT visiteur) as total'))
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy($colonne)
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        return [
            'datasets' => [[
                'label' => 'Visiteurs',
                'data' => $lignes->pluck('total')->map(fn ($v) => (int) $v)->all(),
                'backgroundColor' => ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'],
            ]],
            'labels' => $lignes->pluck($colonne)->map(fn ($v) => $v ?: 'Inconnu')->all(),
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
