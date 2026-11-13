<?php

namespace App\Filament\Resources\Statuts;

use App\Filament\Resources\Statuts\Pages\CreateStatut;
use App\Filament\Resources\Statuts\Pages\EditStatut;
use App\Filament\Resources\Statuts\Pages\ListStatuts;
use App\Filament\Resources\Statuts\Schemas\StatutForm;
use App\Filament\Resources\Statuts\Tables\StatutsTable;
use App\Models\Statut;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class StatutResource extends Resource
{
    protected static ?string $model = Statut::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPlayCircle;
    protected static ?string $modelLabel = 'statut';
    protected static ?string $pluralModelLabel = 'statuts';
    protected static ?int $navigationSort = 4;
    public static function form(Schema $schema): Schema
    {
        return StatutForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StatutsTable::configure($table);
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
            'index' => ListStatuts::route('/'),
            'create' => CreateStatut::route('/create'),
            'edit' => EditStatut::route('/{record}/edit'),
        ];
    }
}
