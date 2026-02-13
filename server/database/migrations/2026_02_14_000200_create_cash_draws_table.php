<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_draws', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->unsignedInteger('total_items')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_draws');
    }
};

