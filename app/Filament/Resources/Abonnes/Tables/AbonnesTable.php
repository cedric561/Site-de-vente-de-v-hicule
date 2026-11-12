<?php

namespace App\Filament\Resources\Abonnes\Tables;

use App\Models\Vehicule;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class AbonnesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('created_at')->label('Inscrit le')->dateTime('d/m/Y H:i')->sortable(),
                TextColumn::make('nom')->searchable()->placeholder('—'),
                TextColumn::make('whatsapp')->label('WhatsApp')->searchable()->copyable(),
                TextColumn::make('marque')->placeholder('Toutes'),
                TextColumn::make('budget_max')->label('Budget max')->placeholder('—')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', ' ') . ' FCFA'),
                ToggleColumn::make('actif')->label('Actif'),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('marque')->options(
                    fn () => Vehicule::orderBy('marque')->distinct()->pluck('marque', 'marque')->all()
                ),
            ])
            ->recordActions([
                Action::make('whatsapp')
                    ->label('WhatsApp')
                    ->icon(Heroicon::OutlinedChatBubbleLeftRight)
                    ->color('success')
                    ->openUrlInNewTab()
                    ->url(function ($record) {

                        $v = Vehicule::where('actif', true)->latest('id')->first();
                        $lien = rtrim(config('app.url'), '/') . '/site-auto/catalogue.html';
                        $salut = $record->nom ? "Bonjour {$record->nom}" : 'Bonjour';
                        $texte = $v
                            ? "{$salut}, nouveau véhicule disponible : {$v->marque} {$v->modele} {$v->annee}, " . number_format($v->prix, 0, ',', ' ') . " FCFA.\nVoir le catalogue : {$lien}"
                            : "{$salut}, de nouveaux véhicules sont disponibles.\nVoir le catalogue : {$lien}";

                        return 'https://wa.me/' . $record->whatsapp . '?text=' . rawurlencode($texte . "\n\nPour ne plus recevoir de messages, répondez STOP.");

                    }),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
