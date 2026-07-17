<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('business_name')->nullable();
            $table->string('business_type')->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
