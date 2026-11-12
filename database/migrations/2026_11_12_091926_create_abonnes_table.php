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
        Schema::create('abonnes', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 80)->nullable();
            $table->string('whatsapp', 20)->unique();
            $table->string('marque', 80)->nullable();
            $table->unsignedBigInteger('budget_max')->nullable();
            $table->timestamp('consentement_at')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('abonnes');
    }
};
