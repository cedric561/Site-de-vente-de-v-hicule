<?php

namespace App\Filament\Widgets;

use App\Models\Visite;
use Filament\Widgets\ChartWidget;

class VisitesChart extends ChartWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    public ?string $filter = '7';

    public function getHeading(): ?string
    {
        return 'Visiteurs par jour';
    }

    protected function getFilters(): ?array
    {
        return ['7' => '7 derniers jours', '30' => '30 derniers jours', '90' => '90 derniers jours'];
    }

    protected function getData(): array
    {
        $jours = (int) $this->filter;
        $debut = now()->subDays($jours - 1)->startOfDay();

        $parJour = Visite::selectRaw('DATE(created_at) as jour, COUNT(DISTINCT visiteur) as total')
            ->where('created_at', '>=', $debut)
            ->groupBy('jour')
            ->pluck('total', 'jour');

        $labels = [];
        $donnees = [];

        for ($i = 0; $i < $jours; $i++) {
            $date = $debut->copy()->addDays($i);
            $labels[] = $date->format('d/m');
            $donnees[] = (int) ($parJour[$date->toDateString()] ?? 0);
        }

        return [
            'datasets' => [['label' => 'Visiteurs', 'data' => $donnees]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
