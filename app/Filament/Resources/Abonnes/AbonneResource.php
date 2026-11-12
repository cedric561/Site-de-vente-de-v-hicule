<?php

namespace App\Filament\Resources\Abonnes;

use App\Filament\Resources\Abonnes\Pages\CreateAbonne;
use App\Filament\Resources\Abonnes\Pages\EditAbonne;
use App\Filament\Resources\Abonnes\Pages\ListAbonnes;
use App\Filament\Resources\Abonnes\Schemas\AbonneForm;
use App\Filament\Resources\Abonnes\Tables\AbonnesTable;
use App\Models\Abonne;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AbonneResource extends Resource
{
    protected static ?string $model = Abonne::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBell;
    protected static ?string $modelLabel = 'abonné';
    protected static ?string $pluralModelLabel = 'abonnés';
    protected static ?int $navigationSort = 3;
    public static function form(Schema $schema): Schema
    {
        return AbonneForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AbonnesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAbonnes::route('/'),
            'create' => CreateAbonne::route('/create'),
            'edit' => EditAbonne::route('/{record}/edit'),
        ];
    }
}
