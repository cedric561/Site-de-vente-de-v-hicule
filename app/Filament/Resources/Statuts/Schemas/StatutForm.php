<?php

namespace App\Filament\Resources\Statuts\Schemas;

use App\Models\Statut;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class StatutForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            FileUpload::make('media')
                ->label('Image ou vidéo (10 Mo maximum)')
                ->required()
                ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
                ->maxSize(10240)
                ->disk('public')
                ->visibility('public')
                ->columnSpanFull(),
            Select::make('etiquette')->label('Étiquette')->options(Statut::ETIQUETTES)->default('nouveau')->required(),
            Select::make('duree_heures')->label('Durée de visibilité')->required()->default(24)->options([
                6 => '6 heures',
                12 => '12 heures',
                24 => '24 heures',
                48 => '48 heures',
                72 => '3 jours',
                168 => '7 jours',
            ]),
            Select::make('vehicule_id')
                ->label('Véhicule lié (facultatif)')
                ->relationship('vehicule', 'modele')
                ->getOptionLabelFromRecordUsing(fn ($record) => "{$record->marque} {$record->modele} {$record->annee}")
                ->searchable()
                ->preload(),
            DateTimePicker::make('publie_le')->label('Publier le')->default(now())->required()->seconds(false),
            Textarea::make('legende')->label('Légende (140 caractères)')->rows(2)->maxLength(140)->columnSpanFull(),
        ]);
    }
}
