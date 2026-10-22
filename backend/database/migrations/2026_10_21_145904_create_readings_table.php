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
        Schema::create('readings', function (Blueprint $table) {
            $table->id();
            #costrained collega le tabelle esterne
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); #cascade elimina letture se utente o libro vengono cancellati
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['to_read', 'reading', 'read'])->default('to_read');
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('review')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'book_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('readings');
    }
};
