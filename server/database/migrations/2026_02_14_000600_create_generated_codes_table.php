<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generated_codes', function (Blueprint $table) {
            $table->id();
            $table->string('type', 20);
            $table->text('code_value');
            $table->string('item_name')->nullable();
            $table->decimal('item_price', 12, 2)->default(0);
            $table->unsignedInteger('item_quantity')->default(1);
            $table->json('payload')->nullable();
            $table->timestamps();
            $table->index(['type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generated_codes');
    }
};

