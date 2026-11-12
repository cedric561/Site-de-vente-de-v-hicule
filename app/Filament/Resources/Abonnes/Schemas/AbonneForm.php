<?php

namespace App\Filament\Resources\Abonnes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AbonneForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('nom')->maxLength(80),
            TextInput::make('whatsapp')->label('Numéro WhatsApp')->required()->maxLength(20),
            TextInput::make('marque')->label('Marque souhaitée'),
            TextInput::make('budget_max')->label('Budget max (FCFA)')->numeric(),
            Toggle::make('actif')->label('Accepte les messages')->default(true),
        ]);
    }
}
