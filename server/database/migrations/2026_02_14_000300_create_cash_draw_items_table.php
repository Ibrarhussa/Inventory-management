<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_draw_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_draw_id')->constrained('cash_draws')->cascadeOnDelete();
            $table->string('product_id');
            $table->string('product_name');
            $table->unsignedInteger('quantity')->default(0);
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->timestamps();
            $table->unique(['cash_draw_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_draw_items');
    }
};

