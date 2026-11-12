<?php

namespace App\Filament\Resources\Vehicules\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class VehiculesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photos')->label('Photos')->disk('public')->stacked()->limit(3),
                TextColumn::make('marque')->searchable()->sortable(),
                TextColumn::make('modele')->label('Modèle')->searchable(),
                TextColumn::make('annee')->label('Année')->sortable(),
                TextColumn::make('prix')->sortable()
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', ' ') . ' FCFA'),
                TextColumn::make('etat')->label('État')->badge(),
                IconColumn::make('actif')->label('Visible')->boolean(),
            ])
            ->filters([
                SelectFilter::make('etat')->label('État')->options([
                    'Neuf' => 'Neuf',
                    'Occasion' => 'Occasion',
                ]),
                SelectFilter::make('carburant')->options([
                    'Essence' => 'Essence',
                    'Diesel' => 'Diesel',
                    'Hybride' => 'Hybride',
                    'Électrique' => 'Électrique',
                ]),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
