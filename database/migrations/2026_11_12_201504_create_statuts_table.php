<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('statuts', function (Blueprint $table) {
            $table->id();
             $table->string('etiquette', 20)->default('nouveau');
            $table->string('legende', 140)->nullable();
            $table->string('media');
            $table->string('type_media', 10)->default('image');
            $table->foreignId('vehicule_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('duree_heures')->default(24);
            $table->timestamp('publie_le')->nullable();
            $table->timestamp('expire_at')->nullable()->index();
            $table->unsignedInteger('vues')->default(0);
            $table->unsignedInteger('clics')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('statuts');
    }
};
