<?php

use App\Enums\BookingStatus;
use App\Enums\PaymentMethodType;
use App\Enums\PaymentStatus;
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
        Schema::create('studio_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Rhapsody Studio');
            $table->time('opens_at')->default('09:00');
            $table->time('closes_at')->default('21:00');
            $table->unsignedSmallInteger('slot_duration_minutes')->default(120);
            $table->unsignedInteger('hourly_rate')->default(150000);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default(PaymentMethodType::Qris->value);
            $table->string('name');
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->date('booking_date');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->unsignedInteger('total_price')->default(0);
            $table->string('status')->default(BookingStatus::Pending->value);
            $table->string('payment_status')->default(PaymentStatus::Unpaid->value);
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['booking_date', 'starts_at', 'ends_at']);
            $table->index(['status', 'payment_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('studio_settings');
    }
};
