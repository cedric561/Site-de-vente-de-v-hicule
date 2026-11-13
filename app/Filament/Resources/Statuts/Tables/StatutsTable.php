<?php

namespace App\Filament\Resources\Statuts\Tables;

use App\Models\Statut;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StatutsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('media')->label('Aperçu')->disk('public')->circular()
                    ->state(fn ($record) => $record->type_media === 'image' ? $record->media : null),
                TextColumn::make('type_media')->label('Type')->badge()
                    ->formatStateUsing(fn ($state) => $state === 'video' ? 'Vidéo' : 'Image'),
                TextColumn::make('etiquette')->label('Étiquette')->badge()
                    ->formatStateUsing(fn ($state) => Statut::ETIQUETTES[$state] ?? $state),
                TextColumn::make('legende')->label('Légende')->limit(35)->placeholder('—'),
                TextColumn::make('vehicule.modele')->label('Véhicule')->placeholder('—'),
                TextColumn::make('etat')->label('État')->badge()
                    ->state(fn ($record) => $record->publie_le?->isFuture() ? 'Programmé' : ($record->expire_at?->isPast() ? 'Expiré' : 'En ligne'))
                    ->color(fn ($state) => match ($state) {
                        'En ligne' => 'success',
                        'Programmé' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('expire_at')->label('Fin')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('vues')->label('Vues')->sortable(),
                TextColumn::make('clics')->label('Clics')->sortable(),
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
