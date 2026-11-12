<?php

namespace App\Filament\Resources\Demandes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class DemandesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')->label('Reçue le')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('nom')->searchable(),
                TextColumn::make('telephone')->label('Téléphone')->searchable()->copyable(),
                TextColumn::make('type')->badge(),
                TextColumn::make('vehicule.modele')->label('Véhicule')->placeholder('—'),
                SelectColumn::make('statut')->options([
                    'nouvelle' => 'Nouvelle',
                    'contactee' => 'Contactée',
                    'conclue' => 'Conclue',
                    'perdue' => 'Perdue',
                ]),
            ])
            ->defaultSort('created_at', 'desc')
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
