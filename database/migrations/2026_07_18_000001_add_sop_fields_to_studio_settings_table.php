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
        Schema::table('studio_settings', function (Blueprint $table) {
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_phone', 32)->nullable();
            $table->string('location_url')->nullable();
            $table->unsignedSmallInteger('minimum_booking_minutes')->default(120);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('studio_settings', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'description',
                'contact_phone',
                'location_url',
                'minimum_booking_minutes',
            ]);
        });
    }
};
