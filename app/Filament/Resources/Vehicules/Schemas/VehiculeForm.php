<?php

namespace App\Filament\Resources\Vehicules\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class VehiculeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('marque')->required()->maxLength(80),
            TextInput::make('modele')->label('Modèle')->required()->maxLength(80),
            TextInput::make('annee')->label('Année')->numeric()->required()->minValue(1990)->maxValue(2035),
            TextInput::make('prix')->label('Prix (FCFA)')->numeric()->required()->minValue(0),
            TextInput::make('kilometrage')->label('Kilométrage')->numeric()->default(0)->suffix('km'),
            Select::make('carburant')->required()->options([
                'Essence' => 'Essence',
                'Diesel' => 'Diesel',
                'Hybride' => 'Hybride',
                'Électrique' => 'Électrique',
            ]),
            Select::make('transmission')->required()->options([
                'Automatique' => 'Automatique',
                'Manuelle' => 'Manuelle',
            ]),
            Select::make('etat')->label('État')->required()->default('Occasion')->options([
                'Neuf' => 'Neuf',
                'Occasion' => 'Occasion',
            ]),
            TextInput::make('couleur'),
            TextInput::make('portes')->numeric()->default(5),
            Textarea::make('description')->rows(4)->columnSpanFull(),
            FileUpload::make('photos')
                ->label('Photos (la première sert de couverture)')
                ->image()
                ->multiple()
                ->reorderable()
                ->maxFiles(10)
                ->maxSize(4096)
                ->disk('public')
                ->visibility('public')
                ->columnSpanFull(),
            Toggle::make('actif')->label('Visible sur le site')->default(true),
        ]);
    }
}
