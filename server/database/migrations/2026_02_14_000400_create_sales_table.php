<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('period');
            $table->date('date');
            $table->decimal('revenue', 12, 2)->default(0);
            $table->unsignedInteger('items')->default(0);
            $table->timestamps();
            $table->unique(['period', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};

