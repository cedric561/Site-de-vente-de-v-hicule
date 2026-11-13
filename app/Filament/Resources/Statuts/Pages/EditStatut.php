<?php

namespace App\Filament\Resources\Statuts\Pages;

use App\Filament\Resources\Statuts\StatutResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditStatut extends EditRecord
{
    protected static string $resource = StatutResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
