<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('vehicules', function (Blueprint $table) {
        $table->unsignedBigInteger('prix')->nullable()->change();
        $table->unsignedBigInteger('prix_min')->nullable()->after('prix');
        $table->unsignedBigInteger('prix_max')->nullable()->after('prix_min');
        $table->boolean('prix_negociable')->default(false)->after('prix_max');
    });
}

public function down(): void
{
    Schema::table('vehicules', function (Blueprint $table) {
        $table->dropColumn(['prix_min', 'prix_max', 'prix_negociable']);
    });
}
};
