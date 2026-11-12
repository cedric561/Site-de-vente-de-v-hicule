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
        Schema::create('vehicules', function (Blueprint $table) {
            $table->id();
             $table->string('marque');
                $table->string('modele');
                $table->unsignedSmallInteger('annee');
                $table->unsignedBigInteger('prix');
                $table->unsignedInteger('kilometrage')->default(0);
                $table->string('carburant');
                $table->string('transmission');
                $table->string('etat')->default('Occasion');
                $table->string('couleur')->nullable();
                $table->unsignedTinyInteger('portes')->default(5);
                $table->text('description')->nullable();
                $table->string('image')->nullable();
                $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicules');
    }
};
