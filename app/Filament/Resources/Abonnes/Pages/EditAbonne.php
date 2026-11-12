<?php

namespace App\Filament\Resources\Abonnes\Pages;

use App\Filament\Resources\Abonnes\AbonneResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAbonne extends EditRecord
{
    protected static string $resource = AbonneResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
