<?php

namespace App\Filament\Resources\Abonnes\Pages;

use App\Filament\Resources\Abonnes\AbonneResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAbonnes extends ListRecords
{
    protected static string $resource = AbonneResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
