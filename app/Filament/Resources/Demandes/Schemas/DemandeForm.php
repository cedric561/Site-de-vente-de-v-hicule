<?php

namespace App\Filament\Resources\Demandes\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class DemandeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('nom')->disabled(),
            TextInput::make('telephone')->label('Téléphone')->disabled(),
            TextInput::make('email')->disabled(),
            Select::make('type')->disabled()->options([
                'information' => 'Information',
                'essai' => 'Essai',
                'reservation' => 'Réservation',
                'achat' => 'Achat',
            ]),
            Select::make('vehicule_id')->label('Véhicule')->relationship('vehicule', 'modele')->disabled(),
            Textarea::make('message')->disabled()->columnSpanFull(),
            Select::make('statut')->required()->options([
                'nouvelle' => 'Nouvelle',
                'contactee' => 'Contactée',
                'conclue' => 'Conclue',
                'perdue' => 'Perdue',
            ]),
        ]);
    }
}
