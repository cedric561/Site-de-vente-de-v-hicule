<?php

namespace App\Filament\Resources\Statuts\Pages;

use App\Filament\Resources\Statuts\StatutResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStatuts extends ListRecords
{
    protected static string $resource = StatutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
