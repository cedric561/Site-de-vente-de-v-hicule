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
        Schema::create('visites', function (Blueprint $table) {
            $table->id();
            $table->string('visiteur', 64)->index();
            $table->string('type', 20);
            $table->foreignId('vehicule_id')->nullable()->constrained()->nullOnDelete();
            $table->string('appareil', 20);
            $table->string('source', 40);
            $table->string('pays', 80)->nullable();
            $table->timestamp('created_at')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visites');
    }
};
