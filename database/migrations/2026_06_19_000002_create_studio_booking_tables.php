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
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_phone', 32)->nullable();
            $table->string('location_url')->nullable();
            $table->unsignedSmallInteger('minimum_booking_minutes')->default(120);
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

        Schema::create('equipments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->default('instrument');
            $table->unsignedSmallInteger('stock')->default(1);
            $table->unsignedInteger('additional_price')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            $table->date('booking_date');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->unsignedInteger('base_price')->default(0);
            $table->unsignedInteger('additional_price')->default(0);
            $table->unsignedInteger('total_price')->default(0);
            $table->string('status')->default(BookingStatus::Pending->value);
            $table->string('payment_status')->default(PaymentStatus::Unpaid->value);
            $table->text('notes')->nullable();
            $table->text('customer_equipment_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('held_until')->nullable();
            $table->timestamps();

            $table->index(['booking_date', 'starts_at', 'ends_at']);
            $table->index(['status', 'payment_status']);
            $table->index(['booking_date', 'held_until']);
        });

        Schema::create('booking_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('equipment_id')->constrained('equipments')->cascadeOnDelete();
            $table->unsignedSmallInteger('quantity')->default(1);
            $table->unsignedInteger('unit_price')->default(0);
            $table->timestamps();

            $table->unique(['booking_id', 'equipment_id']);
        });

        Schema::create('slot_blocks', function (Blueprint $table) {
            $table->id();
            $table->date('booking_date');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->string('reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['booking_date', 'starts_at', 'ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slot_blocks');
        Schema::dropIfExists('booking_equipment');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('equipments');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('studio_settings');
    }
};
